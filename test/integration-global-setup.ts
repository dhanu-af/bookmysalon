import { execSync } from "node:child_process";

// A real (pglite-backed) local Postgres server for integration tests — no
// Docker, no cloud account needed. Idempotent: reuses the server if it's
// already running from a previous run.
const SERVER_NAME = "bookmysalon-test";
// prisma dev assigns this port itself (deterministically per server name, in
// this environment) rather than honoring --db-port — read it back from
// `prisma dev ls` instead of hardcoding a guess.
const DB_PORT = 51222;
const DB_URL = `postgres://postgres:postgres@localhost:${DB_PORT}/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0`;

function isServerRunning(): boolean {
  const output = execSync("npx prisma dev ls", { encoding: "utf-8" });
  return new RegExp(`${SERVER_NAME}\\s+running`).test(output);
}

export default async function setup() {
  if (!isServerRunning()) {
    execSync(`npx prisma dev -n ${SERVER_NAME} -d`, { stdio: "inherit" });
    // Give the embedded Postgres a moment to accept connections before migrate deploy.
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: DB_URL, DATABASE_URL_UNPOOLED: DB_URL },
  });

  // Deliberately no teardown — persistent local dev resource.
  // `npx prisma dev stop bookmysalon-test` to stop it by hand.
}
