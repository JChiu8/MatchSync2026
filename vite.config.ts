import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project from /MatchSync2026/, while local
  // development and other hosts serve it from the domain root.
  base: process.env.GITHUB_ACTIONS ? "/MatchSync2026/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`,
    },
  },
});
