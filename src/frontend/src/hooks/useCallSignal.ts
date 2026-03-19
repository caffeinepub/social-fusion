import { useEffect, useRef, useState } from "react";

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

export function useCallSignal(myPrincipal?: string) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const handledCallIds = useRef<Set<string>>(new Set());

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

  const broadcastAccept = (callId: string) => {
    handledCallIds.current.add(callId);
    if (myPrincipal) {
      localStorage.removeItem(`sf_call_signal_${myPrincipal}`);
    }
    channelRef.current?.postMessage({
      type: "accepted",
      callId,
    } satisfies CallSignal);
  };

  const broadcastReject = (callId: string) => {
    handledCallIds.current.add(callId);
    if (myPrincipal) {
      localStorage.removeItem(`sf_call_signal_${myPrincipal}`);
    }
    channelRef.current?.postMessage({
      type: "rejected",
      callId,
    } satisfies CallSignal);
    setIncomingCall(null);
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
    broadcastAccept,
    broadcastReject,
    broadcastEnd,
    clearIncoming,
  };
}
