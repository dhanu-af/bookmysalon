import { config } from "dotenv";

// Loads .env.test's DATABASE_URL into process.env before any test file
// imports src/lib/db.ts — that module builds its PrismaPg adapter from
// process.env.DATABASE_URL at import time, so this has to run first.
process.env.DOTENV_CONFIG_QUIET = "true";
config({ path: ".env.test", override: true });
