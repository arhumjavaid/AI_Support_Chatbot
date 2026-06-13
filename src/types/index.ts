// ----------------------------------------------------------------------------
// Shared TypeScript interfaces used across the backend.
// (The frontend keeps a mirror copy in client/src/types.ts so the two stay
//  decoupled — neither imports across the project boundary.)
// ----------------------------------------------------------------------------

/** A single frequently-asked question and its answer. */
export interface FAQ {
  question: string;
  answer: string;
}

/**
 * Everything the business owner provides about their business.
 * This is the raw material the system prompt is built from.
 */
export interface BusinessProfile {
  /** e.g. "Bella's Coffee House" */
  businessName: string;
  /** What the business sells / does, in the owner's own words. */
  description: string;
  /** 5–10 FAQs that form the bot's knowledge base. */
  faqs: FAQ[];
}

/** Who sent a chat message. We never persist these server-side. */
export type ChatRole = "user" | "assistant";

/** One message in the conversation. */
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/**
 * Request body for POST /api/chat.
 * The client sends the full profile + conversation history every time,
 * which keeps the backend completely stateless (no DB needed).
 */
export interface ChatRequest {
  profile: BusinessProfile;
  messages: ChatMessage[];
}

/** Response body for POST /api/chat. */
export interface ChatResponse {
  reply: string;
}

/** Standard error shape returned by the API. */
export interface ApiError {
  error: string;
}
