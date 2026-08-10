import { defineConfig } from "vitest/config";
import path from "path";

// Separate from vitest.config.mts (the fast, DB-free unit suite run by
// `npm test`) since these tests need a real running Postgres — see
// test/integration-global-setup.ts. Run via `npm run test:integration`.
export default defineConfig({
  test: {
    include: ["src/**/*.integration.test.ts"],
    globalSetup: ["./test/integration-global-setup.ts"],
    setupFiles: ["./test/integration-setup-env.ts"],
    // These hit a real (if local) Postgres per test — safer to serialize
    // than to risk cross-test interference from Prisma connection-pool limits.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "server-only": path.resolve(import.meta.dirname, "./test/server-only-stub.ts"),
    },
  },
});
