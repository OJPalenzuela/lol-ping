import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    // RTL auto-cleanup requires a global afterEach.
    globals: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
