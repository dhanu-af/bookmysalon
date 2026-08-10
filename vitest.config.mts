import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // Integration tests need a real Postgres + their own env/global-setup
    // (vitest.integration.config.mts, run via `npm run test:integration`) —
    // excluded here so the fast unit suite never tries to run them against
    // whatever DATABASE_URL happens to be set.
    exclude: ["src/**/*.integration.test.ts", "**/node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "server-only": path.resolve(import.meta.dirname, "./test/server-only-stub.ts"),
    },
  },
});
