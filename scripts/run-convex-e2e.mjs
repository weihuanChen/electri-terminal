import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const envPath = resolve(root, ".env.local");
const backupPath = "/tmp/electri-pro-source-e2e-env-backup";
const originalEnv = existsSync(envPath) ? readFileSync(envPath) : null;
let restored = false;

if (originalEnv !== null) {
  writeFileSync(backupPath, originalEnv, { mode: 0o600 });
}

function restoreEnvironment() {
  if (restored || originalEnv === null) return;
  restored = true;
  writeFileSync(envPath, originalEnv);
}

const child = spawn(
  resolve(root, "node_modules/.bin/convex"),
  ["dev", "--tail-logs", "disable"],
  {
    cwd: root,
    env: {
      ...process.env,
      CONVEX_DEPLOYMENT:
        "local:local-ngammr_bi-electri_pro_source_e2e",
      NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:3210",
      NEXT_PUBLIC_CONVEX_SITE_URL: "http://127.0.0.1:3211",
    },
    stdio: "inherit",
  }
);

function stop(signal) {
  child.kill(signal);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
process.on("exit", restoreEnvironment);

child.on("exit", (code, signal) => {
  restoreEnvironment();
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
