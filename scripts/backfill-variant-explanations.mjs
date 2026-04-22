#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ConvexHttpClient } from "convex/browser";

const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");
const DEFAULT_OUTPUT_PATH = path.join(
  ROOT,
  "exports",
  "variant-explanation-translation-report.json"
);
const DEFAULT_MAP_PATH =
  "/Users/yinglian/webproject/python/b2b-products-model/output/v3/explanation_translation_map.json";

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

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function containsChinese(value) {
  return /[\u3400-\u9fff]/u.test(String(value));
}

function normalizeLookupKey(value) {
  return String(value)
    .normalize("NFKC")
    .replace(/[：]/g, ":")
    .replace(/[；]/g, ";")
    .replace(/[，]/g, ",")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function buildNormalizedMap(rawMap) {
  const entries = Object.entries(rawMap).map(([source, target]) => [
    normalizeLookupKey(source),
    target,
  ]);
  return new Map(entries);
}

function formatEnglishExplanation({ wireRange, awg, maxCurrent }) {
  const parts = [];
  if (wireRange) parts.push(`Wire range: ${wireRange}`);
  if (awg) parts.push(`AWG: ${awg}`);
  if (maxCurrent) parts.push(`Max. current: Imax=${maxCurrent}`);
  return parts.join("; ");
}

function normalizeWireRange(raw) {
  const value = String(raw).trim();
  if (!value) return "";
  const normalized = value
    .replace(/MM²/gi, "mm²")
    .replace(/MM2/gi, "mm²")
    .replace(/mm2/gi, "mm²")
    .replace(/mm\^2/gi, "mm²")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ");
  return normalized.replace(/(\d)(mm²)/gi, "$1 $2");
}

function normalizeAwg(raw) {
  return String(raw)
    .trim()
    .replace(/[()]/g, "")
    .replace(/~/g, "-")
    .replace(/\s+/g, "");
}

function normalizeCurrent(raw) {
  return String(raw).trim().replace(/\s+/g, "").replace(/^I?MAX=/i, "").replace(/^=/, "");
}

function translateByPattern(input) {
  const value = String(input).normalize("NFKC");
  const wireRangeMatch =
    value.match(/(?:导线截面|Wir(?:e|e)\s*Range)\s*[:：]?\s*([0-9./*~-]+\s*mm(?:²|2)?)/i) ??
    value.match(/Wire\s*range\s*[:：]?\s*([0-9./*~-]+\s*mm(?:²|2)?)/i);
  const awgMatch =
    value.match(/(?:美国线规|美国导线|A\.?\s*W\.?\s*G\.?)\s*[:：]?\s*\(?([0-9/~-]+(?:MCM)?)\)?/i) ??
    value.match(/A\.?\s*W\.?\s*G\.?\s*[:：]?\s*\(?([0-9/~-]+(?:MCM)?)\)?/i);
  const currentMatch =
    value.match(/(?:最大电流|Max\.?\s*Current)\s*[:：]?\s*(?:I\s*max|IMAX)?\s*=?\s*([0-9.]+\s*A)/i) ??
    value.match(/(?:I\s*max|IMAX)\s*=?\s*([0-9.]+\s*A)/i);

  const wireRange = wireRangeMatch ? normalizeWireRange(wireRangeMatch[1]) : "";
  const awg = awgMatch ? normalizeAwg(awgMatch[1]) : "";
  const maxCurrent = currentMatch ? normalizeCurrent(currentMatch[1]) : "";
  const translated = formatEnglishExplanation({ wireRange, awg, maxCurrent });

  return translated || null;
}

function resolveTranslation(value, translationMap, normalizedTranslationMap) {
  if (!containsChinese(value)) {
    return {
      translated: String(value),
      method: "already-english",
    };
  }

  if (translationMap[value]) {
    return {
      translated: translationMap[value],
      method: "exact-map",
    };
  }

  const normalized = normalizedTranslationMap.get(normalizeLookupKey(value));
  if (normalized) {
    return {
      translated: normalized,
      method: "normalized-map",
    };
  }

  const patternTranslated = translateByPattern(value);
  if (patternTranslated) {
    return {
      translated: patternTranslated,
      method: "pattern-fallback",
    };
  }

  return {
    translated: null,
    method: "unresolved",
  };
}

function printUsage() {
  console.log(`Usage: node scripts/backfill-variant-explanations.mjs [options]

Options:
  --apply              Write translated Explanation values back to Convex.
  --out <file>         Report output path (default: exports/variant-explanation-translation-report.json)
  --map <file>         Translation map path (default: ${DEFAULT_MAP_PATH})
  --limit <number>     Product scan limit (default: 200)
  --help               Show help
`);
}

loadEnvFile(ENV_FILE);

const showHelp = hasFlag("--help");
if (showHelp) {
  printUsage();
  process.exit(0);
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Checked process env and .env.local.");
}

const outputPath = getArg("--out") ?? DEFAULT_OUTPUT_PATH;
const mapPath = getArg("--map") ?? DEFAULT_MAP_PATH;
const limit = Math.min(Number(getArg("--limit") ?? 200) || 200, 200);
const apply = hasFlag("--apply");

if (!fs.existsSync(mapPath)) {
  throw new Error(`Translation map not found: ${mapPath}`);
}

const translationMap = readJson(mapPath);
const normalizedTranslationMap = buildNormalizedMap(translationMap);
const client = new ConvexHttpClient(convexUrl);

async function main() {
  const products = await client.query("queries/modules/products:listProducts", {
    limit,
  });

  const reportItems = [];
  let translatedCount = 0;
  let unresolvedCount = 0;
  let updatedCount = 0;

  for (const product of products) {
    const detail = await client.query("queries/modules/products:getProductAdminDetailById", {
      id: product._id,
    });

    if (!detail) continue;

    for (const variant of detail.variants ?? []) {
      const explanation = variant.attributes?.explanation;
      if (typeof explanation !== "string" || !containsChinese(explanation)) {
        continue;
      }

      const { translated, method } = resolveTranslation(
        explanation,
        translationMap,
        normalizedTranslationMap
      );

      if (translated) {
        translatedCount += 1;
      } else {
        unresolvedCount += 1;
      }

      const reportItem = {
        productId: String(detail.product._id),
        productSlug: detail.product.slug,
        productTitle: detail.product.title,
        variantId: String(variant._id),
        skuCode: variant.skuCode,
        itemNo: variant.itemNo,
        sourceExplanation: explanation,
        translatedExplanation: translated,
        method,
      };
      reportItems.push(reportItem);

      if (!apply || !translated || translated === explanation) {
        continue;
      }

      await client.mutation("mutations/admin/productVariants:updateProductVariant", {
        id: variant._id,
        attributes: {
          ...(variant.attributes ?? {}),
          explanation: translated,
        },
      });
      updatedCount += 1;
    }
  }

  const summary = {
    scannedAt: new Date().toISOString(),
    productCount: products.length,
    matchedVariantCount: reportItems.length,
    translatedCount,
    unresolvedCount,
    updatedCount,
    apply,
    mapPath,
    items: reportItems,
  };

  writeJson(outputPath, summary);

  console.log(`Scanned products: ${products.length}`);
  console.log(`Matched variants with Chinese explanation: ${reportItems.length}`);
  console.log(`Resolved translations: ${translatedCount}`);
  console.log(`Unresolved translations: ${unresolvedCount}`);
  console.log(`Updated variants: ${updatedCount}`);
  console.log(`Report written to: ${outputPath}`);

  if (products.length === limit) {
    console.log(`Warning: query limit ${limit} reached. Increase query capability if total products may exceed this cap.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
