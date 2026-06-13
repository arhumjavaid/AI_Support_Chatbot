// ----------------------------------------------------------------------------
// Express router for the "Auto-fill with AI" endpoint.
//
// Validates the pasted text, hands it to the extractor agent, and returns a
// structured BusinessProfile for the frontend to drop into the form. Like
// chatRouter, it only adapts HTTP <-> the domain layer.
// ----------------------------------------------------------------------------

import { Router, type Request, type Response } from "express";
import { extractBusinessProfile } from "../agents/businessExtractor.js";

export const extractRouter = Router();

// POST /api/extract — { text: string } -> { profile: BusinessProfile }
extractRouter.post("/extract", async (req: Request, res: Response) => {
  try {
    const text = (req.body as { text?: unknown })?.text;

    if (typeof text !== "string" || text.trim().length < 10) {
      res.status(400).json({
        error: "Please paste a bit more text about your business (at least a sentence or two).",
      });
      return;
    }

    const profile = await extractBusinessProfile(text);
    res.json({ profile });
  } catch (err) {
    console.error("[/api/extract] error:", err);
    res.status(500).json({
      error:
        err instanceof Error && err.message
          ? err.message
          : "Couldn't read that text. Please try again.",
    });
  }
});
