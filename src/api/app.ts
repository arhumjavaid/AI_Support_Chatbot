// ----------------------------------------------------------------------------
// Express application factory.
//
// Building the app in a function (rather than as a side-effecting module) lets
// us reuse the exact same app for:
//   - local development  (src/server.ts calls app.listen)
//   - Vercel serverless  (api/index.ts exports the app as a handler)
// ----------------------------------------------------------------------------

import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { chatRouter } from "./chatRouter.js";
import { chatLimiter } from "./rateLimit.js";

export function createApp(): Application {
  const app = express();

  // Behind Vercel (and most hosts) the app sits behind a single proxy, so the
  // real client IP arrives in X-Forwarded-For. Trusting the first hop lets
  // express (and the rate limiter) read the correct IP. We use `1` rather than
  // `true` so the limiter can't be fooled by a spoofed header.
  app.set("trust proxy", 1);

  // Allow the frontend (different origin in dev) to call the API.
  app.use(cors());
  // Parse JSON bodies; cap size — chat payloads are tiny.
  app.use(express.json({ limit: "1mb" }));

  // Lightweight health check — handy for uptime pings and Vercel sanity tests.
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Rate-limit the expensive AI route (protects your API quota). Must run
  // before the router so it can reject early.
  app.use("/api/chat", chatLimiter);

  // Mount the chat routes under /api.
  app.use("/api", chatRouter);

  return app;
}
