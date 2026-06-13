// ----------------------------------------------------------------------------
// Thin fetch wrapper for talking to the backend.
// Centralising it here keeps components free of fetch/JSON boilerplate.
// ----------------------------------------------------------------------------

import type { BusinessProfile, ChatMessage } from "./types";

/**
 * Sends the business profile + conversation history to the backend and
 * returns the assistant's reply text.
 *
 * @throws Error with a user-friendly message if the request fails.
 */
export async function sendChat(
  profile: BusinessProfile,
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, messages }),
  });

  if (!res.ok) {
    // Try to surface the server's error message; fall back to a generic one.
    const data = (await res.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(data?.error || "Failed to reach the support bot.");
  }

  const data = (await res.json()) as { reply: string };
  return data.reply;
}
