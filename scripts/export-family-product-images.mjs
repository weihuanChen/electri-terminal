#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ConvexHttpClient } from "convex/browser";

const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");
const DEFAULT_OUTPUT_DIR = path.join(ROOT, "exports", "catalog-content");

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

function normalizeStatusArg(status) {
  if (!status || status === "all") return undefined;
  if (["draft", "published", "archived"].includes(status)) return status;
  throw new Error(`Invalid --status value: ${status}`);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function slugifyStatus(status) {
  return status ?? "all";
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeMediaItems(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item.url === "string" && item.url.trim())
    .map((item) => ({
      type: item.type ?? null,
      url: item.url.trim(),
      alt: typeof item.alt === "string" ? item.alt : null,
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : null,
    }));
}

function dedupeUrls(urls) {
  return Array.from(new Set(urls.filter(Boolean)));
}

function extractImageBundle({ primaryUrl, gallery, mediaItems }) {
  const normalizedPrimary = typeof primaryUrl === "string" && primaryUrl.trim() ? primaryUrl.trim() : null;
  const normalizedGallery = asStringArray(gallery);
  const normalizedMediaItems = normalizeMediaItems(mediaItems);
  const allUrls = dedupeUrls([
    normalizedPrimary,
    ...normalizedGallery,
    ...normalizedMediaItems.map((item) => item.url),
  ]);

  return {
    primary: normalizedPrimary,
    gallery: normalizedGallery,
    mediaItems: normalizedMediaItems,
    allUrls,
    count: allUrls.length,
  };
}

const showHelp = hasFlag("--help");

if (showHelp) {
  console.log(`Usage: node scripts/export-family-product-images.mjs [--status <status>] [--out <file>]

Options:
  --status <status>  Filter by status: all, published, draft, archived (default: published)
  --out <file>       Output JSON path (default: exports/catalog-content/family-product-images.<status>.json)
  --help             Show help
`);
  process.exit(0);
}

loadEnvFile(ENV_FILE);

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Checked process env and .env.local.");
}

const status = normalizeStatusArg(getArg("--status") ?? "published");
const statusSlug = slugifyStatus(status);
const outputPath = path.resolve(
  getArg("--out") ?? path.join(DEFAULT_OUTPUT_DIR, `family-product-images.${statusSlug}.json`)
);

const client = new ConvexHttpClient(convexUrl);

async function main() {
  const queryArgs = status ? { status } : {};
  const [families, products] = await Promise.all([
    client.query("queries/modules/products:exportProductFamiliesForContent", queryArgs),
    client.query("queries/modules/products:listProducts", {
      ...queryArgs,
      limit: 200,
    }),
  ]);

  const productsByFamilyId = new Map();
  for (const product of products) {
    const list = productsByFamilyId.get(product.familyId) ?? [];
    list.push(product);
    productsByFamilyId.set(product.familyId, list);
  }

  const exportedFamilies = families.map((family) => {
    const familyProducts = (productsByFamilyId.get(family._id) ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

    const productsWithImages = familyProducts.map((product) => ({
      _id: product._id,
      slug: product.slug,
      title: product.title,
      skuCode: product.skuCode,
      model: product.model ?? null,
      status: product.status,
      sortOrder: product.sortOrder,
      images: extractImageBundle({
        primaryUrl: product.mainImage,
        gallery: product.gallery,
        mediaItems: product.mediaItems,
      }),
    }));

    return {
      _id: family._id,
      slug: family.slug,
      name: family.name,
      status: family.status,
      sortOrder: family.sortOrder,
      imageResources: extractImageBundle({
        primaryUrl: family.heroImage,
        gallery: family.gallery,
        mediaItems: family.mediaItems,
      }),
      products: productsWithImages,
      productCount: productsWithImages.length,
      productImageCount: productsWithImages.reduce((sum, item) => sum + item.images.count, 0),
    };
  });

  const output = {
    generatedAt: new Date().toISOString(),
    status: status ?? "all",
    totals: {
      families: exportedFamilies.length,
      products: exportedFamilies.reduce((sum, family) => sum + family.productCount, 0),
      familyImages: exportedFamilies.reduce((sum, family) => sum + family.imageResources.count, 0),
      productImages: exportedFamilies.reduce((sum, family) => sum + family.productImageCount, 0),
    },
    families: exportedFamilies,
  };

  ensureDir(path.dirname(outputPath));
  writeJson(outputPath, output);
  console.log(`Exported ${output.totals.families} families with ${output.totals.products} products -> ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
