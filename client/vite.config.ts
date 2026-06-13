import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for the React frontend.
// During local dev, requests to /api are proxied to the Express server on
// port 3001 so the frontend can call the backend without CORS headaches.
// In production (Vercel) this proxy is irrelevant — vercel.json routes /api.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  build: {
    outDir: "dist",
  },
});
