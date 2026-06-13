// ----------------------------------------------------------------------------
// Frontend mirror of the backend's API types.
// Kept as a small standalone copy so the client and server stay decoupled
// (neither imports across the project boundary).
// ----------------------------------------------------------------------------

export interface FAQ {
  question: string;
  answer: string;
}

export interface BusinessProfile {
  businessName: string;
  description: string;
  faqs: FAQ[];
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
