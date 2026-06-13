// ----------------------------------------------------------------------------
// Turns a free-form blob of text (whatever the business owner pastes) into a
// structured BusinessProfile — name, description, and a set of FAQs.
//
// This powers the "Auto-fill with AI" button: instead of typing every field by
// hand, the owner pastes everything they know about their business and the
// model organises it into the shape the app expects.
//
// Framework-agnostic (no Express here) — same Clean Architecture split as
// supportAgent.ts.
// ----------------------------------------------------------------------------

import { getModelName, getOpenAIClient } from "./openaiClient.js";
import type { BusinessProfile, FAQ } from "../types/index.js";

const EXTRACTION_SYSTEM_PROMPT = `You convert a business owner's free-form notes into structured data for a customer-support chatbot.

Return ONLY a JSON object with exactly this shape:
{
  "businessName": string,   // the business's name
  "description": string,    // a concise 1-2 sentence summary of what they sell or do
  "faqs": [                 // 5 to 8 useful customer FAQs
    { "question": string, "answer": string }
  ]
}

Rules:
- Base everything on the provided text. Where the text directly states facts (hours, prices, policies), use them verbatim in the answers.
- You may add a few sensible, common FAQs a customer would ask, but never invent specific facts (prices, hours, addresses) that aren't supported by the text — keep invented answers generic or omit them.
- Keep answers short and friendly, as a support agent would reply.
- If the business name isn't clear, use a short sensible placeholder.
- Output JSON only. No markdown, no commentary.`;

/** Coerces unknown JSON into a safe BusinessProfile, dropping bad entries. */
function coerceProfile(raw: unknown): BusinessProfile {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;

  const businessName =
    typeof obj.businessName === "string" ? obj.businessName.trim() : "";
  const description =
    typeof obj.description === "string" ? obj.description.trim() : "";

  const faqsInput = Array.isArray(obj.faqs) ? obj.faqs : [];
  const faqs: FAQ[] = faqsInput
    .map((f) => {
      const faq = (typeof f === "object" && f !== null ? f : {}) as Record<
        string,
        unknown
      >;
      return {
        question: typeof faq.question === "string" ? faq.question.trim() : "",
        answer: typeof faq.answer === "string" ? faq.answer.trim() : "",
      };
    })
    .filter((f) => f.question && f.answer)
    .slice(0, 10); // respect the 10-FAQ cap used elsewhere

  return { businessName, description, faqs };
}

/**
 * Extracts a structured BusinessProfile from raw pasted text.
 *
 * @param rawText Whatever the owner pasted about their business.
 * @returns A best-effort structured profile for the user to review and edit.
 */
export async function extractBusinessProfile(
  rawText: string
): Promise<BusinessProfile> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: getModelName(),
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: rawText },
    ],
    temperature: 0.3, // mostly faithful extraction, low creativity
    // Ask the model for a JSON object so we can parse it reliably.
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Very rare with response_format=json_object, but guard anyway: try to
    // salvage the first {...} block from the text.
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("The AI could not structure that text. Try adding more detail.");
    }
    parsed = JSON.parse(match[0]);
  }

  return coerceProfile(parsed);
}
