import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // vite.config.js - Proxy target mismatch
    proxy: {
      "/api": {
        target: "http://localhost:5000", // ✅ Correct
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
