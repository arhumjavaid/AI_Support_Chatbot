// ----------------------------------------------------------------------------
// Configures the OpenAI SDK client.
//
// We use the official `openai` npm package, but point its baseURL at Google's
// OpenAI-compatible endpoint. This means we can use a free Gemini API key while
// keeping all the ergonomics of the OpenAI SDK (chat.completions, etc.).
// Swapping back to real OpenAI later is just a baseURL + key change.
// ----------------------------------------------------------------------------

import OpenAI from "openai";
import { loadConfig } from "../config/env.js";

// Lazily create a single shared client. We don't build it at import-time so
// that importing this module never crashes when the key is absent (useful for
// type-checking / tooling); it's only constructed on first real use.
let client: OpenAI | null = null;

/** Returns a singleton OpenAI client wired up to the Gemini endpoint. */
export function getOpenAIClient(): OpenAI {
  if (client) return client;

  const config = loadConfig();
  client = new OpenAI({
    apiKey: config.geminiApiKey,
    baseURL: config.geminiBaseUrl,
  });
  return client;
}

/** Convenience accessor for the configured model name. */
export function getModelName(): string {
  return loadConfig().geminiModel;
}
