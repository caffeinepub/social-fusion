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

export function useCallSignal() {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("social-fusion-calls");
    channelRef.current = channel;

    channel.onmessage = (evt: MessageEvent<CallSignal>) => {
      const signal = evt.data;
      if (signal.type === "incoming") {
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

  const broadcastCall = (
    callerPrincipal: string,
    mode: "voice" | "video",
  ): string => {
    const callId = `call-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    channelRef.current?.postMessage({
      type: "incoming",
      callId,
      callerPrincipal,
      mode,
    } satisfies CallSignal);
    return callId;
  };

  const broadcastAccept = (callId: string) => {
    channelRef.current?.postMessage({
      type: "accepted",
      callId,
    } satisfies CallSignal);
  };

  const broadcastReject = (callId: string) => {
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

  const clearIncoming = () => setIncomingCall(null);

  return {
    incomingCall,
    broadcastCall,
    broadcastAccept,
    broadcastReject,
    broadcastEnd,
    clearIncoming,
  };
}
