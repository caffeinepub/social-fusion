import type { Principal } from "@icp-sdk/core/principal";
import { useEffect, useRef, useState } from "react";
import type { backendInterface } from "../backend";

type CallSignal =
  | {
      type: "incoming";
      callId: string;
      callerPrincipal: string;
      mode: "voice" | "video";
    }
  | { type: "accepted"; callId: string }
  | { type: "rejected"; callId: string }
  | { type: "ended"; callId: string };

export interface IncomingCall {
  callId: string;
  callerPrincipal: string;
  mode: "voice" | "video";
}

export function useCallSignal(
  myPrincipal?: string,
  recentContacts?: Principal[],
  actor?: backendInterface | null,
) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const handledCallIds = useRef<Set<string>>(new Set());
  const actorRef = useRef<backendInterface | null | undefined>(actor);
  actorRef.current = actor;

  // BroadcastChannel fallback for same-browser tab signaling
  useEffect(() => {
    const channel = new BroadcastChannel("social-fusion-calls");
    channelRef.current = channel;

    channel.onmessage = (evt: MessageEvent<CallSignal>) => {
      const signal = evt.data;
      if (signal.type === "incoming") {
        if (handledCallIds.current.has(signal.callId)) return;
        setIncomingCall({
          callId: signal.callId,
          callerPrincipal: signal.callerPrincipal,
          mode: signal.mode,
        });
      } else if (signal.type === "rejected" || signal.type === "ended") {
        setIncomingCall(null);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  // localStorage polling — allows cross-window signaling
  useEffect(() => {
    if (!myPrincipal) return;

    const poll = () => {
      try {
        const raw = localStorage.getItem(`sf_call_signal_${myPrincipal}`);
        if (!raw) return;
        const signal = JSON.parse(raw) as {
          callId: string;
          callerPrincipal: string;
          mode: "voice" | "video";
          ts: number;
        };
        const age = Date.now() - signal.ts;
        if (age > 60_000) {
          localStorage.removeItem(`sf_call_signal_${myPrincipal}`);
          return;
        }
        if (handledCallIds.current.has(signal.callId)) return;
        setIncomingCall({
          callId: signal.callId,
          callerPrincipal: signal.callerPrincipal,
          mode: signal.mode,
        });
      } catch {}
    };

    poll();
    const timer = setInterval(poll, 2000);
    return () => clearInterval(timer);
  }, [myPrincipal]);

  // Backend message polling for cross-device real calls
  useEffect(() => {
    if (!myPrincipal || !recentContacts || recentContacts.length === 0) return;

    const pollBackend = async () => {
      const currentActor = actorRef.current;
      if (!currentActor) return;
      try {
        for (const contact of recentContacts) {
          const msgs = await currentActor.getMessages(contact);
          if (!msgs || msgs.length === 0) continue;
          // Check last few messages for call signals sent TO us
          const recent = [...msgs]
            .sort((a, b) => Number(b.timestamp - a.timestamp))
            .slice(0, 5);
          for (const msg of recent) {
            // Only process messages FROM this contact TO us
            if (msg.from.toString() !== contact.toString()) continue;
            if (msg.to.toString() !== myPrincipal) continue;
            if (!msg.content.startsWith("__SF_CALL_OFFER__|")) continue;
            const parts = msg.content.split("|");
            if (parts.length < 4) continue;
            const callId = parts[1];
            const mode = parts[2] as "voice" | "video";
            const callerPrincipal = parts[3];
            // Check age: timestamp is in nanoseconds
            const msgMs = Number(msg.timestamp / 1_000_000n);
            const age = Date.now() - msgMs;
            if (age > 60_000) continue;
            if (handledCallIds.current.has(callId)) continue;
            setIncomingCall({ callId, callerPrincipal, mode });
          }
        }
      } catch {}
    };

    const timer = setInterval(pollBackend, 3000);
    pollBackend();
    return () => clearInterval(timer);
  }, [myPrincipal, recentContacts]);

  const broadcastCall = (
    calleePrincipal: string,
    mode: "voice" | "video",
    callerPrincipal?: string,
  ): string => {
    const callId = `call-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Write to callee's localStorage key so their tab picks it up
    const signal = {
      callId,
      callerPrincipal: callerPrincipal ?? "unknown",
      mode,
      ts: Date.now(),
    };
    localStorage.setItem(
      `sf_call_signal_${calleePrincipal}`,
      JSON.stringify(signal),
    );

    // Also broadcast via BroadcastChannel for same-tab testing
    channelRef.current?.postMessage({
      type: "incoming",
      callId,
      callerPrincipal: callerPrincipal ?? "unknown",
      mode,
    } satisfies CallSignal);

    return callId;
  };

  const broadcastCallViaBackend = async (
    calleePrincipal: Principal,
    mode: "voice" | "video",
    callerPrincipal?: string,
  ): Promise<string> => {
    const callId = `call-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const currentActor = actorRef.current;
    if (!currentActor) return callId;
    try {
      await currentActor.sendMessage(
        calleePrincipal,
        `__SF_CALL_OFFER__|${callId}|${mode}|${callerPrincipal ?? "unknown"}`,
      );
    } catch {}
    return callId;
  };

  const broadcastAccept = (callId: string, callerPrincipal?: Principal) => {
    handledCallIds.current.add(callId);
    if (myPrincipal) {
      localStorage.removeItem(`sf_call_signal_${myPrincipal}`);
    }
    channelRef.current?.postMessage({
      type: "accepted",
      callId,
    } satisfies CallSignal);
    // Also send via backend if we know the caller
    if (callerPrincipal) {
      actorRef.current
        ?.sendMessage(callerPrincipal, `__SF_CALL_ANSWER__|${callId}`)
        .catch(() => {});
    }
  };

  const broadcastReject = (callId: string, callerPrincipal?: Principal) => {
    handledCallIds.current.add(callId);
    if (myPrincipal) {
      localStorage.removeItem(`sf_call_signal_${myPrincipal}`);
    }
    channelRef.current?.postMessage({
      type: "rejected",
      callId,
    } satisfies CallSignal);
    setIncomingCall(null);
    // Also send via backend if we know the caller
    if (callerPrincipal) {
      actorRef.current
        ?.sendMessage(callerPrincipal, `__SF_CALL_REJECT__|${callId}`)
        .catch(() => {});
    }
  };

  const broadcastEnd = (callId: string) => {
    channelRef.current?.postMessage({
      type: "ended",
      callId,
    } satisfies CallSignal);
  };

  const clearIncoming = () => {
    if (incomingCall) {
      handledCallIds.current.add(incomingCall.callId);
      if (myPrincipal) {
        localStorage.removeItem(`sf_call_signal_${myPrincipal}`);
      }
    }
    setIncomingCall(null);
  };

  return {
    incomingCall,
    broadcastCall,
    broadcastCallViaBackend,
    broadcastAccept,
    broadcastReject,
    broadcastEnd,
    clearIncoming,
  };
}
