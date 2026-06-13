// ----------------------------------------------------------------------------
// A single chat bubble. Customer (user) messages sit on the right in green;
// bot (assistant) messages sit on the left in white — classic WhatsApp.
// ----------------------------------------------------------------------------

import type { ChatMessage } from "../types";

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  return (
    <div className={`bubble-row ${isUser ? "from-user" : "from-bot"}`}>
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-bot"}`}>
        {message.content}
      </div>
    </div>
  );
}
