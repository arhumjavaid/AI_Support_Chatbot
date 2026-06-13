// ----------------------------------------------------------------------------
// Centralised environment-variable loading & validation.
// Importing this module once (at startup) gives the rest of the app a typed,
// validated config object instead of reaching into process.env everywhere.
// ----------------------------------------------------------------------------

import "dotenv/config"; // loads variables from .env into process.env

/** Google's OpenAI-compatible endpoint — lets the openai SDK talk to Gemini. */
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/";

export interface AppConfig {
  geminiApiKey: string;
  geminiModel: string;
  geminiBaseUrl: string;
  port: number;
}

/**
 * Reads and validates config from the environment.
 * Throws a clear error if the API key is missing so misconfiguration is
 * obvious at startup rather than failing mysteriously on the first request.
 */
export function loadConfig(): AppConfig {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

  if (!geminiApiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY. Copy .env.example to .env and add your key " +
        "(get one free at https://aistudio.google.com/apikey)."
    );
  }

  return {
    geminiApiKey,
    geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
    geminiBaseUrl: GEMINI_BASE_URL,
    port: Number(process.env.PORT) || 3001,
  };
}
