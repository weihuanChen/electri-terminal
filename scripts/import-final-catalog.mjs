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
  return product.seriesCode ?? getImportProductCode(product);
}

function getPrimaryMediaUrl(mediaItems) {
  const productMedia = (mediaItems ?? []).find((item) => item?.type === "product" && item?.url);
  return productMedia?.url;
}

loadEnvFile(ENV_FILE);

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Checked process env and .env.local.");
}

const dataDir = getArg("--data-dir") ?? DEFAULT_DATA_DIR;
const shouldReset = hasFlag("--reset");
const showHelp = hasFlag("--help");

if (showHelp) {
  console.log(`Usage: node scripts/import-final-catalog.mjs [--reset] [--data-dir <dir>]

Options:
  --reset            Clear catalog data before import
  --data-dir <dir>   Override input directory (default: data/final_import_primary)
  --help             Show this help text
`);
  process.exit(0);
}

const client = new ConvexHttpClient(convexUrl);

const callMutation = (name, args = {}) => client.mutation(name, args);

function buildTemplateFields(templateFields, definitionMap) {
  return templateFields.map((field) => {
    const definition = definitionMap.get(field.fieldKey);
    if (!definition) {
      throw new Error(`Missing attribute definition for fieldKey: ${field.fieldKey}`);
    }
    return {
      fieldKey: field.fieldKey,
      label: definition.label,
      fieldType: definition.fieldType,
      displayPrecision: definition.displayPrecision,
      filterMode: definition.filterMode,
      unitKey: definition.unitKey,
      unit: definition.unit,
      options: definition.options,
      groupName: definition.groupName,
      description: definition.description,
      isRequired: field.isRequired,
      isFilterable: field.isFilterable,
      isSearchable: field.isSearchable,
      isVisibleOnFrontend: field.isVisibleOnFrontend,
      importAlias: field.importAlias,
      sortOrder: field.sortOrder,
      helpText: field.helpText,
    };
  });
}

async function mutateInBatches(name, items, batchSize, mapArgs) {
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    await callMutation(name, mapArgs(batch));
    console.log(
      `${name} ${Math.min(index + batch.length, items.length)}/${items.length}`
    );
  }
}

async function main() {
  const categories = readJson(path.join(dataDir, "categories.json"));
  const definitions = readJson(path.join(dataDir, "attribute-definitions.json"));
  const templates = readJson(path.join(dataDir, "attribute-templates.json"));
  const families = readJson(path.join(dataDir, "families.json"));
  const products = readJson(path.join(dataDir, "products.json"));
  const variants = readJson(path.join(dataDir, "product-variants.json"));

  if (shouldReset) {
    const resetSummary = await callMutation(
      "mutations/admin/catalog:resetCatalogData",
      {}
    );
    console.log("resetCatalogData", resetSummary);
  }

  const categoryIdBySlug = new Map();
  const topLevelCategories = categories.filter((category) => !category.parentSlug);
  const childCategories = categories.filter((category) => category.parentSlug);

  for (const category of topLevelCategories) {
    const id = await callMutation("mutations/admin/categories:createCategory", {
      name: category.name,
      slug: category.slug,
      description: category.description,
      shortDescription: category.shortDescription,
      image: category.image,
      icon: category.icon,
      sortOrder: category.sortOrder,
      status: category.status,
      templateKey: category.templateKey,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      canonical: category.canonical,
      isVisibleInNav: category.isVisibleInNav,
    });
    categoryIdBySlug.set(category.slug, id);
  }

  for (const category of childCategories) {
    const parentId = categoryIdBySlug.get(category.parentSlug);
    if (!parentId) {
      throw new Error(`Missing parent category: ${category.parentSlug}`);
    }
    const id = await callMutation("mutations/admin/categories:createCategory", {
      name: category.name,
      slug: category.slug,
      parentId,
      description: category.description,
      shortDescription: category.shortDescription,
      image: category.image,
      icon: category.icon,
      sortOrder: category.sortOrder,
      status: category.status,
      templateKey: category.templateKey,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      canonical: category.canonical,
      isVisibleInNav: category.isVisibleInNav,
    });
    categoryIdBySlug.set(category.slug, id);
  }

  const definitionMap = new Map(definitions.map((definition) => [definition.fieldKey, definition]));
  for (const entry of templates) {
    const categoryId = categoryIdBySlug.get(entry.template.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for template: ${entry.template.categorySlug}`);
    }
    await callMutation("mutations/admin/attributeTemplates:createAttributeTemplate", {
      name: entry.template.name,
      categoryId,
      description: entry.template.description,
      status: entry.template.status,
      fields: buildTemplateFields(entry.fields, definitionMap),
    });
  }

  const familyIdBySlug = new Map();
  for (const family of families) {
    const categoryId = categoryIdBySlug.get(family.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for family: ${family.slug}`);
    }
    const id = await callMutation("mutations/admin/productFamilies:createProductFamily", {
      name: family.name,
      slug: family.slug,
      categoryId,
      brand: family.brand,
      summary: family.summary,
      content: family.content,
      attributes: family.attributes,
      highlights: family.highlights,
      heroImage: family.heroImage ?? getPrimaryMediaUrl(family.coverMediaItems ?? family.mediaItems),
      gallery: family.gallery,
      mediaItems: family.coverMediaItems ?? family.mediaItems,
      status: family.status,
      sortOrder: family.sortOrder,
      seoTitle: family.seoTitle,
      seoDescription: family.seoDescription,
      canonical: family.canonical,
    });
    familyIdBySlug.set(family.slug, id);
  }

  const productIdBySlug = new Map();
  for (const product of products) {
    const familyId = familyIdBySlug.get(product.familySlug);
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!familyId) {
      throw new Error(`Missing family for product: ${product.slug}`);
    }
    if (!categoryId) {
      throw new Error(`Missing category for product: ${product.slug}`);
    }
    const id = await callMutation("mutations/admin/products:createProduct", {
      productKey: product.productKey,
      seriesCode: getImportSeriesCode(product),
      skuCode: getImportProductCode(product),
      model: getImportSeriesCode(product),
      normalizedModel: normalizeModel(getImportSeriesCode(product)),
      slug: product.slug,
      title: product.title,
      shortTitle: product.shortTitle,
      familyId,
      categoryId,
      brand: product.brand,
      summary: product.summary,
      content: product.content,
      attributes: product.attributes,
      featureBullets: product.featureBullets,
      mainImage: product.mainImage ?? getPrimaryMediaUrl(product.mediaItems),
      gallery: product.gallery,
      mediaItems: product.mediaItems,
      status: product.status,
      isFeatured: product.isFeatured,
      moq: product.moq,
      packageInfo: product.packageInfo,
      leadTime: product.leadTime,
      origin: product.origin,
      searchKeywords:
        product.searchKeywords ??
        [product.title, product.shortTitle, getImportProductCode(product), getImportSeriesCode(product)]
          .filter(Boolean),
      sortOrder: product.sortOrder,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      canonical: product.canonical,
    });
    productIdBySlug.set(product.slug, id);
  }

  await mutateInBatches(
    "mutations/admin/productVariants:createProductVariantsBatch",
    variants,
    100,
    (batch) => ({
      items: batch.map((variant) => {
        const productId = productIdBySlug.get(variant.productSlug);
        if (!productId) {
          throw new Error(`Missing product for variant: ${variant.skuCode}`);
        }
        return {
          productId,
          skuCode: variant.skuCode,
          itemNo: variant.itemNo,
          attributes: variant.attributes,
          status: variant.status,
          moq: variant.moq,
          packageInfo: variant.packageInfo,
          leadTime: variant.leadTime,
          origin: variant.origin,
          sortOrder: variant.sortOrder,
        };
      }),
    })
  );

  console.log(
    JSON.stringify(
      {
        imported: {
          categories: categories.length,
          templates: templates.length,
          families: families.length,
          products: products.length,
          productVariants: variants.length,
        },
        dataDir,
        resetBeforeImport: shouldReset,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
