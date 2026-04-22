#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ConvexHttpClient } from "convex/browser";

const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");
const DEFAULT_INPUT_PATH = path.join(ROOT, "exports", "catalog-content", "copy-tasks.published.json");

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

function getEntityTypeFilter() {
  const value = getArg("--entity-type");
  if (!value || value === "all") return "all";
  if (value === "category" || value === "family") return value;
  throw new Error(`Invalid --entity-type value: ${value}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sortObject(value) {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObject(value[key]);
        return result;
      }, {});
  }

  return value;
}

function isEqual(left, right) {
  return JSON.stringify(sortObject(left)) === JSON.stringify(sortObject(right));
}

function asNonEmptyString(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asStringOrNull(value) {
  if (value === null) return null;
  return asNonEmptyString(value);
}

function asStringArray(value) {
  if (!Array.isArray(value)) return undefined;

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function splitParagraphs(value) {
  if (typeof value !== "string") return [];
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value) {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

function compactObject(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === null || entry === undefined) continue;

    if (Array.isArray(entry)) {
      result[key] = entry;
      continue;
    }

    if (typeof entry === "object") {
      const nested = compactObject(entry);
      if (nested && Object.keys(nested).length > 0) {
        result[key] = nested;
      }
      continue;
    }

    result[key] = entry;
  }

  return result;
}

function normalizeFamilyPageConfigInput(pageConfig) {
  const normalized = asPlainObject(pageConfig);
  if (!normalized) return undefined;
  const content = asPlainObject(normalized.content) ?? {};
  const overview = asPlainObject(content.overview) ?? {};
  const features = asPlainObject(content.features) ?? {};
  const applications = asPlainObject(content.applications) ?? {};
  const selectionGuideValue = content.selectionGuide;
  const selectionGuide =
    selectionGuideValue && typeof selectionGuideValue === "object" && !Array.isArray(selectionGuideValue)
      ? selectionGuideValue
      : undefined;

  return compactObject({
    seo: {
      metaTitle: asStringOrNull(normalized.seo?.metaTitle),
      metaDescription: asStringOrNull(normalized.seo?.metaDescription),
      canonicalUrl: asStringOrNull(normalized.seo?.canonicalUrl),
      noindex: normalized.seo?.noindex === true,
      ogImage: asStringOrNull(normalized.seo?.ogImage),
    },
    content: {
      heroIntro: asStringOrNull(content.heroIntro),
      overview: {
        intro: asStringOrNull(overview.intro),
        details: asStringArray(overview.details) ?? splitParagraphs(content.overviewText),
      },
      features: {
        intro: asStringOrNull(features.intro) ?? asStringOrNull(content.featuresIntro),
        items: asStringArray(features.items) ?? asStringArray(content.featuresList) ?? [],
      },
      applications: {
        intro:
          asStringOrNull(applications.intro) ?? asStringOrNull(content.applicationsIntro),
        items:
          asStringArray(applications.items) ?? asStringArray(content.applicationsList) ?? [],
      },
      selectionGuide: {
        intro:
          selectionGuide
            ? asStringOrNull(selectionGuide.intro)
            : asStringOrNull(selectionGuideValue),
        steps:
          selectionGuide
            ? asStringArray(selectionGuide.steps) ?? []
            : splitLines(selectionGuideValue),
      },
      technicalNotes:
        asStringArray(content.technicalNotes) ?? splitLines(content.technicalNote),
    },
    longform: {
      markdown: asStringOrNull(normalized.longform?.markdown),
    },
    conversion: {
      ctaPrimaryLabel: asStringOrNull(normalized.conversion?.ctaPrimaryLabel),
      ctaPrimaryHref: asStringOrNull(normalized.conversion?.ctaPrimaryHref),
      ctaSecondaryLabel: asStringOrNull(normalized.conversion?.ctaSecondaryLabel),
      ctaSecondaryHref: asStringOrNull(normalized.conversion?.ctaSecondaryHref),
      downloadsMode:
        normalized.conversion?.downloadsMode === "manual" ? "manual" : "auto",
      pinnedDownloadIds: Array.isArray(normalized.conversion?.pinnedDownloadIds)
        ? normalized.conversion.pinnedDownloadIds
        : [],
    },
    seoBoost: {
      faqMode:
        normalized.seoBoost?.faqMode === "embedded" || normalized.seoBoost?.faqMode === "mixed"
          ? normalized.seoBoost.faqMode
          : "relation",
      embeddedFaqItems: Array.isArray(normalized.seoBoost?.embeddedFaqItems)
        ? normalized.seoBoost.embeddedFaqItems
            .map((item) => {
              const question = asNonEmptyString(item?.question);
              const answer = asNonEmptyString(item?.answer);
              if (!question || !answer) return null;
              return { question, answer };
            })
            .filter(Boolean)
        : [],
    },
    linking: {
      relatedCategoryIds: Array.isArray(normalized.linking?.relatedCategoryIds)
        ? normalized.linking.relatedCategoryIds
        : [],
      relatedFamilyIds: Array.isArray(normalized.linking?.relatedFamilyIds)
        ? normalized.linking.relatedFamilyIds
        : [],
      relatedArticleIds: Array.isArray(normalized.linking?.relatedArticleIds)
        ? normalized.linking.relatedArticleIds
        : [],
    },
    display: {
      showOverview: normalized.display?.showOverview !== false,
      showFeatures: normalized.display?.showFeatures !== false,
      showApplications: normalized.display?.showApplications !== false,
      showSelectionGuide: normalized.display?.showSelectionGuide !== false,
      showTechnicalNote: normalized.display?.showTechnicalNote !== false,
      showLongform: normalized.display?.showLongform !== false,
      showDownloads: normalized.display?.showDownloads !== false,
      showFaq: normalized.display?.showFaq !== false,
      showRelatedLinks: normalized.display?.showRelatedLinks !== false,
      showBottomCta: normalized.display?.showBottomCta !== false,
    },
  });
}

function normalizeCategoryPageConfigInput(pageConfig) {
  const normalized = asPlainObject(pageConfig);
  if (!normalized) return undefined;

  const content = asPlainObject(normalized.content) ?? {};
  const overview = asPlainObject(content.overview) ?? {};
  const applications = asPlainObject(content.applications) ?? {};
  const selectionGuide = asPlainObject(content.selectionGuide) ?? {};

  return compactObject({
    seo: {
      metaTitle: asStringOrNull(normalized.seo?.metaTitle),
      metaDescription: asStringOrNull(normalized.seo?.metaDescription),
      canonicalUrl: asStringOrNull(normalized.seo?.canonicalUrl),
      noindex: normalized.seo?.noindex === true,
      ogImage: asStringOrNull(normalized.seo?.ogImage),
    },
    content: {
      summary: asStringOrNull(content.summary),
      heroIntro: asStringOrNull(content.heroIntro),
      overview: {
        intro: asStringOrNull(overview.intro),
        keyPoints: asStringArray(overview.keyPoints) ?? [],
      },
      typesOverview: Array.isArray(content.typesOverview)
        ? content.typesOverview
            .map((item) => {
              const name = asNonEmptyString(item?.name);
              if (!name) return null;
              return compactObject({
                name,
                description: asStringOrNull(item?.description),
                link: asStringOrNull(item?.link),
              });
            })
            .filter(Boolean)
        : [],
      applications: {
        intro: asStringOrNull(applications.intro),
        items: asStringArray(applications.items) ?? [],
      },
      selectionGuide: {
        intro: asStringOrNull(selectionGuide.intro),
        steps: asStringArray(selectionGuide.steps) ?? [],
      },
      featuredFamilies: Array.isArray(content.featuredFamilies)
        ? content.featuredFamilies
            .map((item) => {
              const name = asNonEmptyString(item?.name);
              const link = asNonEmptyString(item?.link);
              if (!name || !link) return null;
              return compactObject({
                name,
                description: asStringOrNull(item?.description),
                image: asStringOrNull(item?.image),
                link,
              });
            })
            .filter(Boolean)
        : [],
    },
    seoBoost: {
      faqMode:
        normalized.seoBoost?.faqMode === "embedded" || normalized.seoBoost?.faqMode === "mixed"
          ? normalized.seoBoost.faqMode
          : "relation",
      embeddedFaqItems: Array.isArray(normalized.seoBoost?.embeddedFaqItems)
        ? normalized.seoBoost.embeddedFaqItems
            .map((item) => {
              const question = asNonEmptyString(item?.question);
              const answer = asNonEmptyString(item?.answer);
              if (!question || !answer) return null;
              return { question, answer };
            })
            .filter(Boolean)
        : [],
    },
    display: {
      showOverview: normalized.display?.showOverview !== false,
      showTypesOverview: normalized.display?.showTypesOverview !== false,
      showApplications: normalized.display?.showApplications !== false,
      showSelectionGuide: normalized.display?.showSelectionGuide !== false,
      showFeaturedFamilies: normalized.display?.showFeaturedFamilies !== false,
      showFaq: normalized.display?.showFaq !== false,
      showDownloads: normalized.display?.showDownloads !== false,
      showBottomCta: normalized.display?.showBottomCta !== false,
      collapsedFilterGroupKeys: asStringArray(normalized.display?.collapsedFilterGroupKeys) ?? [],
    },
  });
}

function buildCategoryMutationFromBundleEntry(entry) {
  const patch = {};
  const pageConfig = normalizeCategoryPageConfigInput(entry.pageConfig);

  if (typeof entry.description === "string") patch.description = entry.description;
  if (typeof entry.shortDescription === "string") patch.shortDescription = entry.shortDescription;
  if (typeof entry.seoTitle === "string") patch.seoTitle = entry.seoTitle;
  if (typeof entry.seoDescription === "string") patch.seoDescription = entry.seoDescription;
  if (typeof entry.canonical === "string") patch.canonical = entry.canonical;
  if (pageConfig) patch.pageConfig = pageConfig;

  return {
    taskId: `category:${entry.slug}`,
    entityType: "category",
    entityId: entry._id,
    mutation: "mutations/admin/categories:updateCategory",
    args: {
      id: entry._id,
      ...patch,
    },
    patch,
  };
}

function buildFamilyMutationFromBundleEntry(entry) {
  const patch = {};
  const summary = asNonEmptyString(entry.summary);
  const content = asNonEmptyString(entry.content);
  const seoTitle = asNonEmptyString(entry.seoTitle);
  const seoDescription = asNonEmptyString(entry.seoDescription);
  const canonical = asNonEmptyString(entry.canonical);
  const highlights = asStringArray(entry.highlights);
  const pageConfig = normalizeFamilyPageConfigInput(entry.pageConfig);

  if (summary) patch.summary = summary;
  if (content) patch.content = content;
  if (seoTitle) patch.seoTitle = seoTitle;
  if (seoDescription) patch.seoDescription = seoDescription;
  if (canonical) patch.canonical = canonical;
  if (highlights) patch.highlights = highlights;
  if (pageConfig) patch.pageConfig = pageConfig;

  return {
    taskId: `family:${entry.slug}`,
    entityType: "family",
    entityId: entry._id,
    mutation: "mutations/admin/productFamilies:updateProductFamily",
    args: {
      id: entry._id,
      ...patch,
    },
    patch,
  };
}

function buildCategoryMutation(task) {
  const current = task.context?.category;
  const proposed = task.proposed;

  if (!current || !proposed) {
    throw new Error(`Task ${task.taskId} is missing category context or proposed payload.`);
  }

  const patch = {};
  const proposedPageConfig = normalizeCategoryPageConfigInput(proposed.pageConfig);
  const currentPageConfig = normalizeCategoryPageConfigInput(current.pageConfig) ?? {};

  if (typeof proposed.description === "string" && proposed.description !== current.description) {
    patch.description = proposed.description;
  }
  if (
    typeof proposed.shortDescription === "string" &&
    proposed.shortDescription !== current.shortDescription
  ) {
    patch.shortDescription = proposed.shortDescription;
  }
  if (typeof proposed.seoTitle === "string" && proposed.seoTitle !== current.seoTitle) {
    patch.seoTitle = proposed.seoTitle;
  }
  if (
    typeof proposed.seoDescription === "string" &&
    proposed.seoDescription !== current.seoDescription
  ) {
    patch.seoDescription = proposed.seoDescription;
  }
  if (typeof proposed.canonical === "string" && proposed.canonical !== current.canonical) {
    patch.canonical = proposed.canonical;
  }
  if (proposedPageConfig && !isEqual(proposedPageConfig, currentPageConfig)) {
    patch.pageConfig = proposedPageConfig;
  }

  return {
    mutation: "mutations/admin/categories:updateCategory",
    args: {
      id: task.entityId,
      ...patch,
    },
    patch,
  };
}

function buildFamilyMutation(task) {
  const current = task.context?.family;
  const proposed = task.proposed;

  if (!current || !proposed) {
    throw new Error(`Task ${task.taskId} is missing family context or proposed payload.`);
  }

  const patch = {};
  const summary = asNonEmptyString(proposed.summary);
  const content = asNonEmptyString(proposed.content);
  const seoTitle = asNonEmptyString(proposed.seoTitle);
  const seoDescription = asNonEmptyString(proposed.seoDescription);
  const canonical = asNonEmptyString(proposed.canonical);
  const highlights = asStringArray(proposed.highlights);
  const pageConfig = normalizeFamilyPageConfigInput(proposed.pageConfig);

  if (summary && summary !== current.summary) patch.summary = summary;
  if (content && content !== current.content) patch.content = content;
  if (seoTitle && seoTitle !== current.seoTitle) patch.seoTitle = seoTitle;
  if (seoDescription && seoDescription !== current.seoDescription) {
    patch.seoDescription = seoDescription;
  }
  if (canonical && canonical !== current.canonical) patch.canonical = canonical;
  if (highlights && !isEqual(highlights, current.highlights ?? [])) patch.highlights = highlights;
  if (pageConfig && !isEqual(pageConfig, current.pageConfig ?? {})) patch.pageConfig = pageConfig;

  return {
    mutation: "mutations/admin/productFamilies:updateProductFamily",
    args: {
      id: task.entityId,
      ...patch,
    },
    patch,
  };
}

function buildMutationRequest(task) {
  if (task.entityType === "category") return buildCategoryMutation(task);
  if (task.entityType === "family") return buildFamilyMutation(task);
  throw new Error(`Unsupported entityType in task ${task.taskId}: ${task.entityType}`);
}

function buildPreparedMutations(payload) {
  if (Array.isArray(payload?.tasks)) {
    return payload.tasks.map((task) => ({
      taskId: task.taskId,
      entityType: task.entityType,
      entityId: task.entityId,
      ...buildMutationRequest(task),
    }));
  }

  if (Array.isArray(payload?.categories) || Array.isArray(payload?.families)) {
    const categories = Array.isArray(payload.categories) ? payload.categories : [];
    const families = Array.isArray(payload.families) ? payload.families : [];

    return [
      ...categories.map(buildCategoryMutationFromBundleEntry),
      ...families.map(buildFamilyMutationFromBundleEntry),
    ];
  }

  throw new Error(`Unsupported input format in ${inputPath}`);
}

const showHelp = hasFlag("--help");

if (showHelp) {
  console.log(`Usage: node scripts/apply-copy-tasks.mjs [--input <file>] [--entity-type <type>] [--apply]

Options:
  --input <file>   Path to edited copy-tasks JSON or catalog-content JSON
  --entity-type    all | category | family (default: all)
  --apply          Execute Convex mutations. Without this flag the script only shows a dry-run summary.
  --help           Show this help text
`);
  process.exit(0);
}

loadEnvFile(ENV_FILE);

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Checked process env and .env.local.");
}

const inputPath = path.resolve(getArg("--input") ?? DEFAULT_INPUT_PATH);
const entityTypeFilter = getEntityTypeFilter();
const shouldApply = hasFlag("--apply");
const client = new ConvexHttpClient(convexUrl);

async function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const payload = readJson(inputPath);
  const prepared = buildPreparedMutations(payload).filter(
    (item) => entityTypeFilter === "all" || item.entityType === entityTypeFilter
  );
  if (prepared.length === 0) {
    throw new Error(`No writable entries found in ${inputPath}`);
  }

  const actionable = prepared.filter((item) => Object.keys(item.patch).length > 0);
  const skipped = prepared.filter((item) => Object.keys(item.patch).length === 0);

  console.log(`Input: ${inputPath}`);
  console.log(`Entity filter: ${entityTypeFilter}`);
  console.log(`Entries loaded: ${prepared.length}`);
  console.log(`Tasks with changes: ${actionable.length}`);
  console.log(`Tasks without changes: ${skipped.length}`);

  for (const item of actionable.slice(0, 20)) {
    console.log(
      `[${item.entityType}] ${item.taskId} -> ${Object.keys(item.patch).join(", ")}`
    );
  }

  if (!shouldApply) {
    console.log("Dry run only. Re-run with --apply to write changes to Convex.");
    return;
  }

  let applied = 0;
  for (const item of actionable) {
    await client.mutation(item.mutation, item.args);
    applied += 1;
    console.log(`Applied ${applied}/${actionable.length}: ${item.taskId}`);
  }

  console.log(`Applied ${applied} task updates.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
