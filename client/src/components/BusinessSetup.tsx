// ----------------------------------------------------------------------------
// The "prompt builder" screen.
// The business owner enters their business name, what they sell, and a list of
// FAQs. On submit, this becomes the BusinessProfile that powers the bot.
// ----------------------------------------------------------------------------

import { useState } from "react";
import { extractProfile } from "../api";
import type { BusinessProfile, FAQ } from "../types";

interface Props {
  onStart: (profile: BusinessProfile) => void;
}

/** A pre-filled example so the demo is one click away from working. */
const EXAMPLE: BusinessProfile = {
  businessName: "Bella's Coffee House",
  description:
    "A cozy neighborhood cafe serving specialty coffee, fresh pastries, and light lunches. We roast our own beans.",
  faqs: [
    { question: "What are your opening hours?", answer: "We're open 7am–7pm Monday to Saturday, and 8am–4pm on Sundays." },
    { question: "Do you have oat milk?", answer: "Yes! We offer oat, almond, and soy milk at no extra charge." },
    { question: "Do you take reservations?", answer: "We don't take reservations, but we always keep seats free for walk-ins." },
    { question: "Is there parking?", answer: "There's free street parking out front and a public lot one block away." },
    { question: "Do you sell beans to take home?", answer: "Absolutely — we sell 250g and 1kg bags of our house-roasted beans." },
  ],
};

export function BusinessSetup({ onStart }: Props) {
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  // Start with 5 blank FAQ rows — the brief asks for 5–10.
  const [faqs, setFaqs] = useState<FAQ[]>(
    Array.from({ length: 5 }, () => ({ question: "", answer: "" }))
  );

  // "Auto-fill with AI": the owner pastes a blob of text and we ask the model
  // to structure it into the fields below (which stay editable for review).
  const [rawText, setRawText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  async function handleAutoFill() {
    if (!rawText.trim() || isExtracting) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const profile = await extractProfile(rawText);
      // Populate the form; pad FAQs out to at least one editable row.
      setBusinessName(profile.businessName);
      setDescription(profile.description);
      setFaqs(
        profile.faqs.length > 0
          ? profile.faqs
          : [{ question: "", answer: "" }]
      );
    } catch (err) {
      setExtractError(
        err instanceof Error ? err.message : "Couldn't auto-fill from that text."
      );
    } finally {
      setIsExtracting(false);
    }
  }

  function updateFaq(index: number, field: keyof FAQ, value: string) {
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
    );
  }

  function addFaq() {
    if (faqs.length >= 10) return; // cap at 10 per the brief
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  }

  function removeFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  }

  function loadExample() {
    setBusinessName(EXAMPLE.businessName);
    setDescription(EXAMPLE.description);
    setFaqs(EXAMPLE.faqs);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Keep only FAQs that actually have content.
    const cleanedFaqs = faqs.filter(
      (f) => f.question.trim() && f.answer.trim()
    );
    onStart({
      businessName: businessName.trim(),
      description: description.trim(),
      faqs: cleanedFaqs,
    });
  }

  // Require a name and at least one complete FAQ before starting.
  const canStart =
    businessName.trim().length > 0 &&
    faqs.some((f) => f.question.trim() && f.answer.trim());

  return (
    <div className="setup">
      <div className="setup-card">
        <header className="setup-header">
          <h1>🤖 AI Support Bot Builder</h1>
          <p>
            Set up your business below, then chat with your very own AI customer
            support agent.
          </p>
          <button type="button" className="link-btn" onClick={loadExample}>
            ✨ Load example business
          </button>
        </header>

        {/* Auto-fill: paste everything once, let the AI organise the fields. */}
        <section className="autofill">
          <label className="field-label" htmlFor="autofill-text">
            ⚡ Quick start — paste anything about your business
          </label>
          <textarea
            id="autofill-text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your business info, website copy, or rough notes here — name, what you sell, hours, prices, policies... The AI will fill in the fields below for you to review."
            rows={4}
          />
          <button
            type="button"
            className="autofill-btn"
            onClick={handleAutoFill}
            disabled={isExtracting || rawText.trim().length < 10}
          >
            {isExtracting ? "✨ Filling in the fields…" : "✨ Auto-fill with AI"}
          </button>
          {extractError && <div className="inline-error">{extractError}</div>}
          <div className="autofill-divider">
            <span>or fill in manually</span>
          </div>
        </section>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Business name</span>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Bella's Coffee House"
            />
          </label>

          <label className="field">
            <span>What do you sell / do?</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your products or services in a sentence or two."
              rows={3}
            />
          </label>

          <div className="faq-section">
            <span className="field-label">
              Frequently asked questions ({faqs.length})
            </span>
            {faqs.map((faq, i) => (
              <div className="faq-row" key={i}>
                <div className="faq-inputs">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                    placeholder={`Question ${i + 1}`}
                  />
                  <input
                    type="text"
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                    placeholder={`Answer ${i + 1}`}
                  />
                </div>
                {faqs.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeFaq(i)}
                    aria-label="Remove FAQ"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {faqs.length < 10 && (
              <button type="button" className="add-btn" onClick={addFaq}>
                + Add another FAQ
              </button>
            )}
          </div>

          <button type="submit" className="primary-btn" disabled={!canStart}>
            Start chatting →
          </button>
        </form>
      </div>
    </div>
  );
}
