// ----------------------------------------------------------------------------
// Rate limiting for the chat endpoint.
//
// The chat route calls the AI model on every request, which costs API quota.
// This middleware caps how many requests a single IP can make in a time window,
// protecting your key from abuse / runaway loops on a public demo URL.
//
// NOTE on serverless: this uses an in-memory store, which is per-instance.
// On Vercel each warm function instance counts independently and the count
// resets on cold starts. That's plenty for a portfolio demo. For strict,
// globally-consistent limits you'd plug in a shared store (e.g. Upstash Redis)
// via the `store` option below — the rest of this file stays the same.
// ----------------------------------------------------------------------------

import rateLimit from "express-rate-limit";

// Configurable via env, with sensible demo defaults.
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000; // 1 minute
const maxRequests = Number(process.env.RATE_LIMIT_MAX) || 20; // per IP per window

/** Limits POST /api/chat to `maxRequests` per IP per `windowMs`. */
export const chatLimiter = rateLimit({
  windowMs,
  limit: maxRequests,
  standardHeaders: "draft-7", // adds RateLimit-* response headers
  legacyHeaders: false, // drop the old X-RateLimit-* headers
  // Returned as JSON (matches our ApiError shape) with a 429 status.
  message: {
    error: "Too many messages. Please slow down and try again in a minute.",
  },
});
