import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = process.cwd();
const configPath = resolve(root, ".convex/local/default/config.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));
if (typeof config.adminKey !== "string" || !config.adminKey) {
  throw new Error("Local Convex admin key is unavailable for E2E tests.");
}

const client = new ConvexHttpClient("http://127.0.0.1:3210");
const sitemapPage = makeFunctionReference("frontend:listSitemapContentPage");
const deadline = Date.now() + 90_000;
let ready = false;
while (Date.now() < deadline) {
  try {
    await client.query(sitemapPage, {
      kind: "category",
      paginationOpts: { cursor: null, numItems: 1 },
    });
    ready = true;
    break;
  } catch {
    await new Promise((done) => setTimeout(done, 500));
  }
}
if (!ready) throw new Error("Local Convex functions were not ready for E2E tests.");

const child = spawn(resolve(root, "node_modules/.bin/next"), ["start", "-p", "3100"], {
  cwd: root,
  env: {
    ...process.env,
    CONVEX_SERVER_URL: "http://127.0.0.1:3210",
    NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:3210",
    NEXT_PUBLIC_CONVEX_SITE_URL: "http://127.0.0.1:3211",
    CONVEX_ADMIN_KEY: config.adminKey,
  },
  stdio: "inherit",
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
