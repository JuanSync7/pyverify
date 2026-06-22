import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build straight into the FastAPI package so `pyverify serve` ships the UI.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/ws": { target: "ws://127.0.0.1:8000", ws: true },
    },
  },
  build: {
    outDir: "../src/pyverify/server/static",
    emptyOutDir: true,
  },
});
