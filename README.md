# 🤖 WhatsApp AI Customer Support Bot — Demo

A portfolio demo that turns any small business's FAQs into a live, WhatsApp-style AI support chat.

A business owner pastes their business name, what they sell, and 5–10 FAQs. That instantly becomes the knowledge base for an AI agent that answers customer questions in a clean, mobile-friendly chat that looks like WhatsApp.

> Built with **Node.js + TypeScript + Express** on the backend and **React + Vite** on the frontend. The AI runs on the **OpenAI SDK** pointed at Google's free **Gemini** endpoint, so you can demo it at zero cost. Stateless by design (no database) and **one-click deployable to Vercel**.

---

## ✨ Features

- **Prompt builder** — enter your business name, description, and FAQs; it becomes the AI's knowledge base.
- **⚡ Auto-fill with AI** — paste any blob of text (website copy, rough notes) and the AI structures it into the name, description, and FAQs for you to review — no manual typing.
- **WhatsApp-style chat UI** — green outgoing bubbles, white incoming bubbles, mobile-first.
- **Smart support agent** — answers from your FAQs and politely declines to invent facts it doesn't know.
- **Typing indicator** — animated "…" while the AI is thinking.
- **Reset / Change Business** — instantly reconfigure to demo a different business.

---

## 🧱 Architecture

Clean separation of concerns — each layer has one job:

```
src/
  agents/        ← AI logic (no HTTP knowledge)
    openaiClient.ts   configures the OpenAI SDK against Gemini
    promptBuilder.ts  builds the system prompt from the business profile
    supportAgent.ts   profile + history → AI reply
  api/           ← HTTP layer (no AI knowledge)
    app.ts            Express app factory (reused by dev + Vercel)
    chatRouter.ts     validates input, calls the agent, shapes the response
  config/
    env.ts            loads & validates environment variables
  types/
    index.ts          shared TypeScript interfaces
  server.ts      ← local dev entry (app.listen)

api/
  index.ts       ← Vercel serverless entry (exports the Express app)

client/          ← React + Vite frontend (the chat UI)
  src/
    App.tsx           owns the setup↔chat screens + chat state
    components/        BusinessSetup, ChatWindow, MessageBubble, TypingIndicator, ChatInput
    api.ts            fetch wrapper for POST /api/chat

vercel.json      ← build + routing config for Vercel
```

**Why it's stateless:** the frontend keeps the conversation history and sends it with every request, so the backend never needs a database. Perfect for serverless.

---

## 🚀 Getting started (local)

### 1. Prerequisites

- Node.js 18+ (this repo was developed on Node 22)
- A free **Gemini API key** → https://aistudio.google.com/apikey

### 2. Install dependencies

```bash
npm install          # backend deps
npm install --prefix client   # frontend deps
```

### 3. Add your API key

```bash
cp .env.example .env
```

Then open `.env` and paste your key:

```
GEMINI_API_KEY=your_real_key_here
```

> ⚠️ `.env` is gitignored — never commit your real key. `.env.example` only contains placeholders.

### 4. Run it

```bash
npm run dev
```

This starts both servers together:

- **Backend API** → http://localhost:3001
- **Frontend (Vite)** → http://localhost:5173

Open **http://localhost:5173**, click **"Load example business"**, hit **Start chatting**, and ask a question.

---

## 🧪 Quick API test (without the UI)

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "businessName": "Bella'\''s Coffee House",
      "description": "A cozy cafe serving specialty coffee.",
      "faqs": [{ "question": "Opening hours?", "answer": "7am-7pm daily." }]
    },
    "messages": [{ "role": "user", "content": "When do you open?" }]
  }'
```

Expected response:

```json
{ "reply": "We open at 7am every day! ☕" }
```

---

## ☁️ Deploying to Vercel

This repo is Vercel-ready.

1. Push it to a GitHub repo.
2. In Vercel, **Import** the repo (no special settings needed — `vercel.json` handles the rest).
3. Add an **Environment Variable**:
   - `GEMINI_API_KEY` = your key
   - *(optional)* `GEMINI_MODEL` = `gemini-2.0-flash`
4. Deploy. 🎉

**How the routing works:** `vercel.json` builds the React app to `client/dist` (served as static files) and rewrites every `/api/*` request to the Express serverless function in `api/index.ts`.

---

## ⚙️ Configuration

| Variable         | Required | Default            | Description                                    |
| ---------------- | -------- | ------------------ | ---------------------------------------------- |
| `GEMINI_API_KEY` | ✅ Yes   | —                  | Your Google Gemini API key.                    |
| `GEMINI_MODEL`   | No       | `gemini-2.0-flash` | Which Gemini model to use.                      |
| `PORT`           | No       | `3001`             | Local backend port (frontend proxy expects 3001). |
| `RATE_LIMIT_MAX` | No       | `20`               | Max chat requests per IP per window.            |
| `RATE_LIMIT_WINDOW_MS` | No | `60000`            | Rate-limit window in milliseconds (1 min).      |

---

## 🛠️ Useful scripts

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Run backend + frontend together (dev).        |
| `npm run dev:server`| Run only the Express API (with hot reload).   |
| `npm run dev:client`| Run only the Vite frontend.                   |
| `npm run typecheck` | Type-check the backend (strict mode).         |
| `npm run build`     | Build the frontend for production.            |

---

## 📝 Notes

- This is a **portfolio demo**, intentionally kept simple — no auth, no database.
- **Rate limiting** is enabled on `/api/chat` (per-IP, in-memory) to protect your API quota on a public URL. Tune it with `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`. The in-memory store is per serverless instance — fine for a demo; swap in Upstash Redis (`store` option in `src/api/rateLimit.ts`) if you need globally-consistent limits.
- Swapping from Gemini to real OpenAI is a one-line change in `src/config/env.ts` (base URL) plus the key.
- The whole AI personality lives in `src/agents/promptBuilder.ts` — a great place to tweak tone and guardrails.
# AI_Support_Chatbot
