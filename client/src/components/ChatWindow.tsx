// ----------------------------------------------------------------------------
// The chat screen: WhatsApp-style header, scrolling message list, typing
// indicator, error banner, and the input composer.
// ----------------------------------------------------------------------------

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import type { BusinessProfile, ChatMessage } from "../types";

interface Props {
  profile: BusinessProfile;
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onReset: () => void;
}

export function ChatWindow({
  profile,
  messages,
  isTyping,
  error,
  onSend,
  onReset,
}: Props) {
  // Auto-scroll to the newest message whenever the list or typing state changes.
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Use the first letter of the business name as a simple avatar.
  const initial = profile.businessName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="chat">
      {/* Header — mimics a WhatsApp contact bar. */}
      <header className="chat-header">
        <div className="avatar">{initial}</div>
        <div className="chat-header-info">
          <strong>{profile.businessName}</strong>
          <span className="status">{isTyping ? "typing…" : "online"}</span>
        </div>
        <button type="button" className="reset-btn" onClick={onReset}>
          Reset
        </button>
      </header>

      {/* Message list. */}
      <div className="messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        {error && <div className="error-banner">{error}</div>}
        <div ref={endRef} />
      </div>

      {/* Composer — disabled while the bot is replying. */}
      <ChatInput onSend={onSend} disabled={isTyping} />
    </div>
  );
}
