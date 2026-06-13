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

export function createApp(): Application {
  const app = express();

  // Allow the frontend (different origin in dev) to call the API.
  app.use(cors());
  // Parse JSON bodies; cap size — chat payloads are tiny.
  app.use(express.json({ limit: "1mb" }));

  // Lightweight health check — handy for uptime pings and Vercel sanity tests.
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Mount the chat routes under /api.
  app.use("/api", chatRouter);

  return app;
}
