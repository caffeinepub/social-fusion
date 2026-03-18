import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Phone,
  Send,
  Video,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Profile } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useFormatTimestamp,
  useGetAllProfiles,
  useGetMessages,
  useSendMessage,
} from "../../hooks/useQueries";
import CallScreen from "../CallScreen";

export default function MessagesTab() {
  const [selectedUser, setSelectedUser] = useState<{
    principal: Principal;
    profile: Profile;
  } | null>(null);

  if (selectedUser) {
    return (
      <ConversationView
        otherUser={selectedUser.principal}
        otherProfile={selectedUser.profile}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return <ConversationList onSelect={setSelectedUser} />;
}

function ConversationList({
  onSelect,
}: {
  onSelect: (u: { principal: Principal; profile: Profile }) => void;
}) {
  const { data: profiles, isLoading } = useGetAllProfiles();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();

  const otherUsers =
    profiles?.filter(([p]) => p.toString() !== myPrincipal?.toString()) ?? [];

  return (
    <div data-ocid="messages.page" className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-border shrink-0">
        <h1 className="text-xl font-bold font-display">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="p-3 flex flex-col gap-3">
            {["s1", "s2", "s3", "s4"].map((sk) => (
              <div
                key={sk}
                data-ocid="messages.loading_state"
                className="flex items-center gap-3 p-3"
              >
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="w-32 h-3" />
                  <Skeleton className="w-24 h-2" />
                </div>
              </div>
            ))}
          </div>
        ) : otherUsers.length > 0 ? (
          <div className="flex flex-col">
            {otherUsers.map(([principal, profile]: [Principal, Profile], i) => (
              <button
                key={principal.toString()}
                type="button"
                data-ocid={`messages.item.${i + 1}`}
                onClick={() => onSelect({ principal, profile })}
                className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <Avatar className="w-12 h-12 shrink-0">
                  {profile.avatar && (
                    <AvatarImage src={profile.avatar.getDirectURL()} />
                  )}
                  <AvatarFallback className="bg-muted">
                    {profile.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left min-w-0">
                  <p className="font-semibold text-sm">{profile.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {profile.bio || "Tap to chat"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div
            data-ocid="messages.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center gap-3"
          >
            <MessageCircle className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">No users to message yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationView({
  otherUser,
  otherProfile,
  onBack,
}: {
  otherUser: Principal;
  otherProfile: Profile;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const [activeCall, setActiveCall] = useState<"voice" | "video" | null>(null);
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const { data: messages, isLoading } = useGetMessages(otherUser);
  const sendMessage = useSendMessage();
  const formatTs = useFormatTimestamp();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await sendMessage.mutateAsync({ to: otherUser, content: text.trim() });
      setText("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  return (
    <div data-ocid="messages.dialog" className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border shrink-0">
        <button
          type="button"
          data-ocid="messages.close_button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Avatar className="w-9 h-9 shrink-0">
          {otherProfile.avatar && (
            <AvatarImage src={otherProfile.avatar.getDirectURL()} />
          )}
          <AvatarFallback className="bg-muted text-sm">
            {otherProfile.displayName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="font-semibold flex-1 truncate">
          {otherProfile.displayName}
        </p>
        {/* Call buttons */}
        <button
          type="button"
          data-ocid="messages.secondary_button"
          onClick={() => setActiveCall("voice")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          title="Voice call"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          type="button"
          data-ocid="messages.secondary_button"
          onClick={() => setActiveCall("video")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          title="Video call"
        >
          <Video className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col-reverse gap-2">
        {isLoading ? (
          <div
            data-ocid="messages.loading_state"
            className="flex justify-center py-8"
          >
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages && messages.length > 0 ? (
          [...messages].reverse().map((msg, i) => {
            const isMe = msg.from.toString() === myPrincipal?.toString();
            return (
              <div
                key={msg.timestamp.toString() + String(i)}
                data-ocid={`messages.row.${i + 1}`}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm"
                      : "bg-card text-foreground rounded-bl-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-[10px] mt-0.5 ${isMe ? "text-white/60" : "text-muted-foreground"}`}
                  >
                    {formatTs(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div
            data-ocid="messages.empty_state"
            className="flex flex-col items-center justify-center py-8 text-center gap-2"
          >
            <p className="text-muted-foreground text-sm">
              No messages yet. Say hi!
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-3 py-3 border-t border-border shrink-0 pb-20"
      >
        <Input
          data-ocid="messages.input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-input border-border h-10"
        />
        <Button
          type="submit"
          data-ocid="messages.submit_button"
          size="sm"
          disabled={sendMessage.isPending || !text.trim()}
          className="h-10 w-10 p-0 bg-gradient-to-br from-primary to-secondary shrink-0"
        >
          {sendMessage.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* Call overlay */}
      <AnimatePresence>
        {activeCall && (
          <CallScreen
            mode={activeCall}
            otherProfile={otherProfile}
            onEnd={() => setActiveCall(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
