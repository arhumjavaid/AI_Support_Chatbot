// ----------------------------------------------------------------------------
// The core agent logic.
//
// Given a business profile and the conversation so far, it asks the model for
// the next support reply. This file is deliberately framework-agnostic: it
// knows nothing about Express or HTTP, so it can be reused or tested in
// isolation. (Clean Architecture: business logic stays in the domain layer.)
// ----------------------------------------------------------------------------

import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getModelName, getOpenAIClient } from "./openaiClient.js";
import { buildSystemPrompt } from "./promptBuilder.js";
import type { BusinessProfile, ChatMessage } from "../types/index.js";

/**
 * Generates the assistant's next reply.
 *
 * @param profile  The business knowledge base (becomes the system prompt).
 * @param messages The full conversation history sent by the client. The last
 *                 entry should be the new user message.
 * @returns The assistant's reply text.
 */
export async function getSupportReply(
  profile: BusinessProfile,
  messages: ChatMessage[]
): Promise<string> {
  const client = getOpenAIClient();

  // System prompt first, then the running conversation. We trust the client's
  // history but only pass through the role/content fields we expect.
  const chatMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(profile) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await client.chat.completions.create({
    model: getModelName(),
    messages: chatMessages,
    temperature: 0.7, // friendly but not wildly creative
    max_tokens: 500,
  });

  const reply = completion.choices[0]?.message?.content?.trim();

  // Defensive fallback — the model should always return content, but we never
  // want to hand the UI an empty bubble.
  return (
    reply ||
    "Sorry, I'm having trouble responding right now. Please try again in a moment."
  );
}
