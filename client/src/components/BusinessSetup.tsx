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

/** A pre-filled example used by the "Load example business" link (fills the form). */
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

/**
 * One-click demo businesses. Clicking a button jumps STRAIGHT into a live chat
 * with this profile, so a client can see the value with zero typing.
 */
interface DemoExample {
  emoji: string;
  label: string;
  profile: BusinessProfile;
}

const DEMO_EXAMPLES: DemoExample[] = [
  {
    emoji: "👕",
    label: "Clothing store",
    profile: {
      businessName: "Thread & Co.",
      description:
        "A modern clothing boutique selling everyday apparel for men and women — tops, denim, dresses, and accessories — both online and in-store.",
      faqs: [
        { question: "What's your return policy?", answer: "You can return unworn items with tags within 30 days for a full refund, no questions asked." },
        { question: "Do you offer free shipping?", answer: "Yes — free standard shipping on all orders over $50. Under that it's a flat $5." },
        { question: "How do I find my size?", answer: "Every product page has a size chart. If you're between sizes, we recommend sizing up for a relaxed fit." },
        { question: "Do you have a physical store?", answer: "We do! Our flagship store is downtown, open 10am–8pm daily." },
        { question: "How long does delivery take?", answer: "Standard delivery is 3–5 business days; express (1–2 days) is available at checkout." },
        { question: "Do you restock sold-out items?", answer: "Popular items are usually restocked within 2–3 weeks. Tap 'Notify me' on the product page to get an alert." },
      ],
    },
  },
  {
    emoji: "🍽️",
    label: "Restaurant",
    profile: {
      businessName: "Olive & Vine",
      description:
        "A family-run Mediterranean restaurant serving fresh mezze, grilled seafood, and wood-fired flatbreads, with vegetarian and vegan options.",
      faqs: [
        { question: "What are your opening hours?", answer: "We're open Tuesday–Sunday, 12pm–10pm. Closed Mondays." },
        { question: "Do you take reservations?", answer: "Yes, we recommend booking for groups of 4 or more — you can reserve by phone or on our website." },
        { question: "Do you have vegan options?", answer: "Plenty! Most of our mezze are vegan, and we clearly mark vegan and vegetarian dishes on the menu." },
        { question: "Do you offer delivery or takeout?", answer: "We offer takeout directly and delivery through the major apps within a 5-mile radius." },
        { question: "Is the restaurant kid-friendly?", answer: "Absolutely — we have a kids' menu and high chairs available." },
        { question: "Can you accommodate allergies?", answer: "Yes, just let your server know. We can adjust most dishes for gluten, nut, and dairy allergies." },
      ],
    },
  },
  {
    emoji: "📚",
    label: "Tutoring centre",
    profile: {
      businessName: "BrightMinds Tutoring",
      description:
        "A tutoring centre offering one-on-one and small-group lessons in maths, science, and English for primary and high school students, in-person and online.",
      faqs: [
        { question: "What subjects do you tutor?", answer: "Maths, physics, chemistry, biology, and English, from primary level up to final-year high school." },
        { question: "How much do lessons cost?", answer: "One-on-one sessions are $40/hour and small-group sessions are $25/hour per student." },
        { question: "Do you offer online tutoring?", answer: "Yes — we offer both in-person sessions at our centre and live online lessons over video." },
        { question: "How long is each session?", answer: "Standard sessions are 60 minutes, but we also offer 90-minute sessions for exam preparation." },
        { question: "Can we do a trial lesson?", answer: "Of course! Your first session is a discounted trial so you can make sure it's the right fit." },
        { question: "Do you help with exam prep?", answer: "Yes, we run focused exam-prep programs with past papers and practice tests before major exams." },
      ],
    },
  },
];

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

  // Fill the form fields from a profile so the user can review/edit before
  // starting the chat (used by both the example link and the demo buttons).
  function fillForm(profile: BusinessProfile) {
    setBusinessName(profile.businessName);
    setDescription(profile.description);
    setFaqs(profile.faqs.length > 0 ? profile.faqs : [{ question: "", answer: "" }]);
    // Bring the now-filled fields into view (helpful on small screens).
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function loadExample() {
    fillForm(EXAMPLE);
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

        {/* One-click demos — pre-fill the form so the user can review, then
            hit "Start chatting" to enter the chat. */}
        <section className="try-demos">
          <span className="try-demos-label">
            👀 Try a sample business — fills the form below:
          </span>
          <div className="try-demos-buttons">
            {DEMO_EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                className="try-btn"
                onClick={() => fillForm(ex.profile)}
              >
                <span className="try-emoji">{ex.emoji}</span>
                {ex.label}
              </button>
            ))}
          </div>
        </section>

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
