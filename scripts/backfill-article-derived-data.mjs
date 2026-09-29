import { spawnSync } from "node:child_process";

const deploymentArgs = process.argv.includes("--prod")
  ? ["--prod"]
  : process.argv.includes("--deployment")
    ? ["--deployment", process.argv[process.argv.indexOf("--deployment") + 1]]
    : null;

if (!deploymentArgs || !deploymentArgs.at(-1)) {
  throw new Error("Pass --prod or --deployment <name> to select the deployed backend.");
}

let cursor = null;
let total = 0;
while (true) {
  const command = spawnSync("./node_modules/.bin/convex", [
    "run",
    "mutations/admin/articles:backfillArticleDerivedData",
    JSON.stringify({
      paginationOpts: {
        cursor,
        numItems: 10,
        maximumRowsRead: 10,
        maximumBytesRead: 2 * 1024 * 1024,
      },
    }),
    ...deploymentArgs,
    "--codegen", "disable",
    "--typecheck", "disable",
  ], { encoding: "utf8" });
  if (command.status !== 0) {
    throw new Error(command.stderr || command.stdout || "Article backfill failed");
  }
  const result = JSON.parse(command.stdout);
  total += result.synced;
  if (result.isDone) break;
  cursor = result.continueCursor;
}

process.stdout.write(`article: ${total} records synchronized\n`);
