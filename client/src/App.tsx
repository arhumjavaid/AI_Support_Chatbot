// ----------------------------------------------------------------------------
// Top-level component. Owns the two "screens" of the demo and all chat state.
//
//   Screen 1: BusinessSetup  — owner enters business name, description, FAQs.
//   Screen 2: ChatWindow     — customers chat with the configured bot.
//
// Chat history lives here in React state and is sent to the backend on every
// request, so the server stays stateless (no database).
// ----------------------------------------------------------------------------

import { useState } from "react";
import { BusinessSetup } from "./components/BusinessSetup";
import { ChatWindow } from "./components/ChatWindow";
import { sendChat } from "./api";
import type { BusinessProfile, ChatMessage } from "./types";

export function App() {
  // When null, show the setup screen; once set, show the chat.
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Owner finished the setup form → switch to the chat screen.
  function handleStart(newProfile: BusinessProfile) {
    setProfile(newProfile);
    // Friendly opening message so the chat never starts empty.
    setMessages([
      {
        role: "assistant",
        content: `Hi! 👋 Welcome to ${newProfile.businessName}. How can I help you today?`,
      },
    ]);
  }

  // "Reset / Change Business" → wipe everything and return to setup.
  function handleReset() {
    setProfile(null);
    setMessages([]);
    setError(null);
    setIsTyping(false);
  }

  // Customer sent a message.
  async function handleSend(text: string) {
    if (!profile) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    // Optimistically show the user's message right away.
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setError(null);
    setIsTyping(true);

    try {
      const reply = await sendChat(profile, nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="app">
      {profile === null ? (
        <BusinessSetup onStart={handleStart} />
      ) : (
        <ChatWindow
          profile={profile}
          messages={messages}
          isTyping={isTyping}
          error={error}
          onSend={handleSend}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
