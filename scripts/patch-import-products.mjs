#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ConvexHttpClient } from "convex/browser";

const ROOT = process.cwd();
const DEFAULT_DATA_DIR = path.join(ROOT, "data", "final_import_primary");
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

function normalizeModel(model) {
  return String(model ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function getImportProductCode(product) {
  return product.productCode ?? product.productKey ?? product.skuCode;
}

function getImportSeriesCode(product) {
  return product.seriesCode ?? product.model ?? getImportProductCode(product);
}

function getPrimaryMediaUrl(mediaItems) {
  const productMedia = (mediaItems ?? []).find((item) => item?.type === "product" && item?.url);
  return productMedia?.url;
}

function parseRangeString(rawValue, fieldKey) {
  const value = String(rawValue).trim();
  if (!value) return undefined;

  const between = value.match(/^(-?\d+(?:\.\d+)?)\s*[-~]\s*(-?\d+(?:\.\d+)?)$/);
  if (between) {
    const left = Number(between[1]);
    const right = Number(between[2]);
    if (Number.isFinite(left) && Number.isFinite(right)) {
      return [Math.min(left, right), Math.max(left, right)];
    }
  }

  const single = value.match(/^(-?\d+(?:\.\d+)?)$/);
  if (single) {
    const numeric = Number(single[1]);
    if (Number.isFinite(numeric)) {
      return [numeric, numeric];
    }
  }

  if (fieldKey === "awg_range") {
    // Values like "4/0" are valid catalog labels but cannot be represented
    // in the current numeric tuple schema without introducing a lossy mapping.
    return undefined;
  }

  return undefined;
}

function normalizeAttributeValue(rawValue, field) {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return undefined;
  }

  switch (field.fieldType) {
    case "string":
    case "enum":
      return String(rawValue).trim() || undefined;
    case "number": {
      const numeric =
        typeof rawValue === "number" ? rawValue : Number(String(rawValue).trim());
      return Number.isFinite(numeric) ? numeric : undefined;
    }
    case "boolean":
      if (typeof rawValue === "boolean") return rawValue;
      if (typeof rawValue === "string") {
        const normalized = rawValue.trim().toLowerCase();
        if (["true", "yes", "y", "1"].includes(normalized)) return true;
        if (["false", "no", "n", "0"].includes(normalized)) return false;
      }
      return undefined;
    case "array":
      if (Array.isArray(rawValue)) {
        const items = rawValue.map((item) => String(item).trim()).filter(Boolean);
        return items.length ? items : undefined;
      }
      if (typeof rawValue === "string") {
        const items = rawValue
          .split(/[;,]/)
          .map((item) => item.trim())
          .filter(Boolean);
        return items.length ? items : undefined;
      }
      return undefined;
    case "range":
      if (
        Array.isArray(rawValue) &&
        rawValue.length === 2 &&
        rawValue.every((item) => typeof item === "number" && Number.isFinite(item))
      ) {
        return [Math.min(rawValue[0], rawValue[1]), Math.max(rawValue[0], rawValue[1])];
      }
      if (typeof rawValue === "string") {
        return parseRangeString(rawValue, field.fieldKey);
      }
      return undefined;
    default:
      return undefined;
  }
}

function sanitizeAttributes(attributes, fieldMap) {
  if (!attributes || typeof attributes !== "object") {
    return undefined;
  }

  const sanitizedEntries = Object.entries(attributes).flatMap(([key, value]) => {
    const field = fieldMap.get(key);
    if (!field) return [];
    const normalized = normalizeAttributeValue(value, field);
    return normalized === undefined ? [] : [[key, normalized]];
  });

  if (!sanitizedEntries.length) {
    return undefined;
  }

  return Object.fromEntries(sanitizedEntries);
}

function chunk(items, size) {
  const output = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
}

function makeProductCode(product) {
  return getImportProductCode(product);
}

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

loadEnvFile(ENV_FILE);

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Checked process env and .env.local.");
}

const dataDir = getArg("--data-dir") ?? DEFAULT_DATA_DIR;
const skuArg = getArg("--products") ?? getArg("--skus");
const apply = hasFlag("--apply");
const allowIdentityUpdates = hasFlag("--allow-identity-updates");
const includeMedia = hasFlag("--include-media");
const showHelp = hasFlag("--help");

if (showHelp || !skuArg) {
  console.log(`Usage: node scripts/patch-import-products.mjs --products <product-code-1,product-code-2,...> [options]

Options:
  --apply                   Execute mutations. Without this flag the script is dry-run only.
  --allow-identity-updates  Allow patching slug, title, shortTitle, series/model, family/category linkage.
  --include-media           Allow patching mainImage, gallery, mediaItems from import payload.
  --data-dir <dir>          Override input directory (default: data/final_import_primary)
  --help                    Show this help text
`);
  process.exit(showHelp ? 0 : 1);
}

const requestedProducts = skuArg
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const client = new ConvexHttpClient(convexUrl);
const callQuery = (name, args = {}) => client.query(name, args);
const callMutation = (name, args = {}) => client.mutation(name, args);

async function main() {
  const products = readJson(path.join(dataDir, "products.json"));
  const variants = readJson(path.join(dataDir, "product-variants.json"));

  const importProductByCode = new Map(
    products.map((product) => [makeProductCode(product), product])
  );
  const importVariantsBySlug = new Map();
  for (const variant of variants) {
    const list = importVariantsBySlug.get(variant.productSlug) ?? [];
    list.push(variant);
    importVariantsBySlug.set(variant.productSlug, list);
  }

  const existingProducts = await callQuery("queries/modules/products:listProducts", { limit: 200 });
  const existingFamilies = await callQuery("queries/modules/products:listProductFamilies", { limit: 200 });
  const existingCategories = await callQuery("queries/modules/categories:listCategories", { limit: 200 });

  const existingProductBySku = new Map(existingProducts.map((product) => [product.skuCode, product]));
  const existingProductBySlug = new Map(existingProducts.map((product) => [product.slug, product]));
  const existingFamilyBySlug = new Map(existingFamilies.map((family) => [family.slug, family]));
  const existingCategoryBySlug = new Map(existingCategories.map((category) => [category.slug, category]));
  const templateFieldMapByCategoryId = new Map();

  const report = [];

  for (const productCode of requestedProducts) {
    const importProduct = importProductByCode.get(productCode);
    const existingProduct =
      existingProductBySku.get(productCode) ??
      (importProduct ? existingProductBySlug.get(importProduct.slug) : undefined);

    if (!importProduct) {
      report.push({
        productCode,
        status: "missing-import-product",
      });
      continue;
    }

    if (!existingProduct) {
      report.push({
        productCode,
        status: "missing-existing-product",
        importSlug: importProduct.slug,
      });
      continue;
    }

    const importFamily = existingFamilyBySlug.get(importProduct.familySlug);
    const importCategory = existingCategoryBySlug.get(importProduct.categorySlug);
    const existingDetail = await callQuery("queries/modules/products:getProductAdminDetailById", {
      id: existingProduct._id,
    });
    const warnings = [];
    const resolveFieldMap = async () => {
      const targetCategoryId =
        allowIdentityUpdates && importCategory?._id ? importCategory._id : existingProduct.categoryId;

      if (!targetCategoryId || targetCategoryId === existingProduct.categoryId) {
        return new Map((existingDetail?.templateFields ?? []).map((field) => [field.fieldKey, field]));
      }

      if (templateFieldMapByCategoryId.has(targetCategoryId)) {
        return templateFieldMapByCategoryId.get(targetCategoryId);
      }

      const categoryProducts = await callQuery("queries/modules/products:listProducts", {
        categoryId: targetCategoryId,
        limit: 1,
      });
      const sampleProduct = categoryProducts.find((product) => product._id !== existingProduct._id);
      if (!sampleProduct) {
        warnings.push(`unable to resolve template fields for target category: ${targetCategoryId}`);
        return new Map((existingDetail?.templateFields ?? []).map((field) => [field.fieldKey, field]));
      }

      const sampleDetail = await callQuery("queries/modules/products:getProductAdminDetailById", {
        id: sampleProduct._id,
      });
      const nextFieldMap = new Map(
        (sampleDetail?.templateFields ?? []).map((field) => [field.fieldKey, field])
      );
      templateFieldMapByCategoryId.set(targetCategoryId, nextFieldMap);
      return nextFieldMap;
    };

    const currentVariants = (existingDetail?.variants ?? []).filter(
      (variant) => variant.status === "published" || variant.status === "draft"
    );
    const nextVariants = importVariantsBySlug.get(importProduct.slug) ?? [];
    const fieldMap = await resolveFieldMap();

    if (importProduct.slug !== existingProduct.slug) {
      warnings.push(`slug mismatch: current=${existingProduct.slug} import=${importProduct.slug}`);
    }
    if (importProduct.title !== existingProduct.title) {
      warnings.push(`title mismatch: current=${existingProduct.title} import=${importProduct.title}`);
    }
    if (getImportSeriesCode(importProduct) !== existingProduct.model) {
      warnings.push(
        `series/model mismatch: current=${existingProduct.model} import=${getImportSeriesCode(importProduct)}`
      );
    }
    if (!importFamily) {
      warnings.push(`missing family slug in current db: ${importProduct.familySlug}`);
    }
    if (!importCategory) {
      warnings.push(`missing category slug in current db: ${importProduct.categorySlug}`);
    }
    if (nextVariants.length === 0) {
      warnings.push("import variants empty");
    }

    const productPatch = {
      id: existingProduct._id,
      brand: importProduct.brand,
      summary: importProduct.summary,
      content: importProduct.content,
      attributes: sanitizeAttributes(importProduct.attributes, fieldMap),
      featureBullets: importProduct.featureBullets,
      status: importProduct.status,
      isFeatured: importProduct.isFeatured,
      moq: importProduct.moq,
      packageInfo: importProduct.packageInfo,
      leadTime: importProduct.leadTime,
      origin: importProduct.origin,
      searchKeywords: importProduct.searchKeywords,
      sortOrder: importProduct.sortOrder,
      seoTitle: importProduct.seoTitle,
      seoDescription: importProduct.seoDescription,
      canonical: importProduct.canonical,
      productKey: importProduct.productKey,
      seriesCode: getImportSeriesCode(importProduct),
      ...(allowIdentityUpdates
        ? {
            slug: importProduct.slug,
            title: importProduct.title,
            shortTitle: importProduct.shortTitle,
            model: getImportSeriesCode(importProduct),
            normalizedModel: normalizeModel(getImportSeriesCode(importProduct)),
            familyId: importFamily?._id,
            categoryId: importCategory?._id,
          }
        : {}),
      ...(includeMedia
        ? {
            mainImage: importProduct.mainImage ?? getPrimaryMediaUrl(importProduct.mediaItems),
            gallery: importProduct.gallery,
            mediaItems: importProduct.mediaItems,
          }
        : {}),
    };

    const createVariantItems = nextVariants.map((variant) => ({
      productId: existingProduct._id,
      skuCode: variant.skuCode,
      itemNo: variant.itemNo,
      attributes: sanitizeAttributes(variant.attributes, fieldMap),
      status: variant.status,
      moq: variant.moq,
      packageInfo: variant.packageInfo,
      leadTime: variant.leadTime,
      origin: variant.origin,
      sortOrder: variant.sortOrder,
    }));

    report.push({
      productCode,
      status: warnings.length ? "ready-with-warnings" : "ready",
      currentProductId: existingProduct._id,
      currentSlug: existingProduct.slug,
      importSlug: importProduct.slug,
      currentVariantCount: currentVariants.length,
      importVariantCount: nextVariants.length,
      warnings,
      deleteVariantIds: currentVariants.map((variant) => variant._id),
      patchPreview: productPatch,
    });

    if (!apply) {
      continue;
    }

    await callMutation("mutations/admin/products:updateProduct", productPatch);

    for (const variant of currentVariants) {
      await callMutation("mutations/admin/productVariants:deleteProductVariant", {
        id: variant._id,
      });
    }

    for (const batch of chunk(createVariantItems, 100)) {
      await callMutation("mutations/admin/productVariants:createProductVariantsBatch", {
        items: batch,
      });
    }
  }

  console.log(
    stringify({
      dataDir,
      requestedProducts,
      apply,
      allowIdentityUpdates,
      includeMedia,
      report,
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
