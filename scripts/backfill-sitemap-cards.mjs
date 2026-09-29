import { spawnSync } from "node:child_process";

const deploymentArgs = process.argv.includes("--prod")
  ? ["--prod"]
  : process.argv.includes("--deployment")
    ? ["--deployment", process.argv[process.argv.indexOf("--deployment") + 1]]
    : null;

if (!deploymentArgs || !deploymentArgs.at(-1)) {
  throw new Error("Pass --prod or --deployment <name> to select the deployed backend.");
}

for (const kind of ["category", "family", "product"]) {
  let cursor = null;
  let total = 0;
  while (true) {
    const command = spawnSync("./node_modules/.bin/convex", [
      "run",
      "mutations/admin/sitemapCards:backfillSitemapCards",
      JSON.stringify({
        kind,
        paginationOpts: {
          cursor,
          numItems: 50,
          maximumRowsRead: 50,
          maximumBytesRead: 2 * 1024 * 1024,
        },
      }),
      ...deploymentArgs,
      "--codegen", "disable",
      "--typecheck", "disable",
    ], { encoding: "utf8" });
    if (command.status !== 0) {
      throw new Error(command.stderr || command.stdout || `Backfill failed for ${kind}`);
    }
    const result = JSON.parse(command.stdout);
    total += result.count;
    if (result.isDone) break;
    cursor = result.continueCursor;
  }
  process.stdout.write(`${kind}: ${total} records synchronized\n`);
}

process.stdout.write("Sitemap cards are enabled.\n");
