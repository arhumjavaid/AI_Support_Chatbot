// ----------------------------------------------------------------------------
// Local development entry point.
//
// Starts the Express app on the configured port. On Vercel this file is NOT
// used — api/index.ts is the serverless entry instead.
// ----------------------------------------------------------------------------

import { createApp } from "./api/app.js";
import { loadConfig } from "./config/env.js";

const config = loadConfig();
const app = createApp();

app.listen(config.port, () => {
  console.log(`\n🟢 Support bot API running at http://localhost:${config.port}`);
  console.log(`   Model: ${config.geminiModel}`);
  console.log(`   POST /api/chat to talk to the bot.\n`);
});
