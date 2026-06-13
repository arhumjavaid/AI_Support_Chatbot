// ----------------------------------------------------------------------------
// Vercel serverless entry point.
//
// Vercel turns each file in /api into a serverless function. An Express app is
// itself a valid (req, res) handler, so we just build the app and export it as
// the default export. All routes are defined inside the app under /api.
// ----------------------------------------------------------------------------

import { createApp } from "../src/api/app.js";

const app = createApp();

export default app;
