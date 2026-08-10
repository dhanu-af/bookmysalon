import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Neon provisions DATABASE_URL_UNPOOLED alongside the pooled DATABASE_URL —
    // migrations need the unpooled one (pgbouncer transaction mode can hang on DDL).
    // Runtime uses the pooled DATABASE_URL via src/lib/db.ts.
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
