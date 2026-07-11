import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const seedFixtures = makeFunctionReference<
  "mutation",
  Record<string, never>,
  {
    publishedProductSlug: string;
  }
>("e2eFixtures:seed");

export default async function globalSetup() {
  if (process.env.E2E_CONVEX_LOCAL !== "1") return;

  const envPath = resolve(process.cwd(), ".env.local");
  const backupPath = "/tmp/electri-pro-source-e2e-env-backup";
  const restoreEnvironment = () => {
    if (existsSync(backupPath)) {
      writeFileSync(envPath, readFileSync(backupPath));
    }
  };

  const client = new ConvexHttpClient("http://127.0.0.1:3210");
  const deadline = Date.now() + 60_000;
  let fixtures: { publishedProductSlug: string } | undefined;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      fixtures = await client.mutation(seedFixtures, {});
      break;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!fixtures) {
    restoreEnvironment();
    throw new Error("Local Convex E2E fixtures were not available in time.", {
      cause: lastError,
    });
  }

  if (fixtures.publishedProductSlug !== "e2e-published-terminal") {
    restoreEnvironment();
    throw new Error("Local Convex E2E fixtures did not seed correctly.");
  }

  return async () => {
    restoreEnvironment();
  };
}
