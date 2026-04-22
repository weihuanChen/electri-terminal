#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ConvexHttpClient } from "convex/browser";

const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function printUsage() {
  console.log(`Usage: node scripts/migrate-family-page-content.mjs [options]

Options:
  --apply       Run the migration against Convex. Without this flag, the script performs a dry run.
  --overwrite   Rebuild structured sections from legacy flat fields when possible.
  --help        Show help
`);
}

loadEnvFile(ENV_FILE);

if (hasFlag("--help")) {
  printUsage();
  process.exit(0);
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Checked process env and .env.local.");
}

const apply = hasFlag("--apply");
const overwrite = hasFlag("--overwrite");
const client = new ConvexHttpClient(convexUrl);

async function main() {
  const families = await client.query("queries/modules/products:exportProductFamiliesForContent", {});
  const total = families.length;

  let familiesWithLegacyContent = 0;
  let familiesWithNestedOverview = 0;
  let familiesWithLongform = 0;

  for (const family of families) {
    const pageConfig = family.pageConfig ?? {};
    const content = pageConfig.content ?? {};

    if (
      family.content ||
      content.overviewText ||
      content.featuresIntro ||
      (Array.isArray(content.featuresList) && content.featuresList.length > 0) ||
      content.applicationsIntro ||
      (Array.isArray(content.applicationsList) && content.applicationsList.length > 0) ||
      content.selectionGuide ||
      content.technicalNote
    ) {
      familiesWithLegacyContent += 1;
    }

    if (content.overview || content.features || content.applications || content.technicalNotes) {
      familiesWithNestedOverview += 1;
    }

    if (pageConfig.longform?.markdown) {
      familiesWithLongform += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        overwrite,
        totals: {
          families: total,
          familiesWithLegacyContent,
          familiesWithStructuredContent: familiesWithNestedOverview,
          familiesWithLongform,
        },
      },
      null,
      2
    )
  );

  if (!apply) return;

  const result = await client.mutation(
    "mutations/admin/productFamilies:migrateFamilyPageContentStructure",
    { overwrite }
  );

  console.log(JSON.stringify({ result }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
