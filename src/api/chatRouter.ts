// ----------------------------------------------------------------------------
// Express router for the chat endpoint.
//
// Responsibility: validate the incoming HTTP request, hand off to the agent,
// and shape the HTTP response. No AI/business logic lives here — it just
// adapts HTTP <-> the domain layer (Clean Architecture: interface adapter).
// ----------------------------------------------------------------------------

import { Router, type Request, type Response } from "express";
import { getSupportReply } from "../agents/supportAgent.js";
import type {
  BusinessProfile,
  ChatMessage,
  ChatRequest,
} from "../types/index.js";

export const chatRouter = Router();

/** Narrow, runtime-safe validation of the request body. */
function parseChatRequest(body: unknown): ChatRequest {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const { profile, messages } = body as Record<string, unknown>;

  // --- profile ---
  if (typeof profile !== "object" || profile === null) {
    throw new ValidationError("`profile` is required.");
  }
  const p = profile as Record<string, unknown>;
  if (typeof p.businessName !== "string" || typeof p.description !== "string") {
    throw new ValidationError(
      "`profile.businessName` and `profile.description` must be strings."
    );
  }
  if (!Array.isArray(p.faqs)) {
    throw new ValidationError("`profile.faqs` must be an array.");
  }
  const faqs = p.faqs.map((f, i) => {
    const faq = f as Record<string, unknown>;
    if (typeof faq?.question !== "string" || typeof faq?.answer !== "string") {
      throw new ValidationError(
        `FAQ #${i + 1} must have string \`question\` and \`answer\`.`
      );
    }
    return { question: faq.question, answer: faq.answer };
  });

  // --- messages ---
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ValidationError("`messages` must be a non-empty array.");
  }
  const parsedMessages: ChatMessage[] = messages.map((m, i) => {
    const msg = m as Record<string, unknown>;
    if (msg?.role !== "user" && msg?.role !== "assistant") {
      throw new ValidationError(
        `Message #${i + 1} has an invalid role (expected "user" or "assistant").`
      );
    }
    if (typeof msg.content !== "string") {
      throw new ValidationError(`Message #${i + 1} content must be a string.`);
    }
    return { role: msg.role, content: msg.content };
  });

  const validProfile: BusinessProfile = {
    businessName: p.businessName,
    description: p.description,
    faqs,
  };

  return { profile: validProfile, messages: parsedMessages };
}

/** Thrown for bad input — mapped to HTTP 400 below. */
class ValidationError extends Error {}

// POST /api/chat — main (and only) endpoint.
chatRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    const { profile, messages } = parseChatRequest(req.body);
    const reply = await getSupportReply(profile, messages);
    res.json({ reply });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    // Anything else (e.g. upstream model error) — log server-side, return a
    // safe generic message so we never leak keys or internals to the client.
    console.error("[/api/chat] error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong generating a reply. Please try again." });
  }
});
