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

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value, "utf8");
}

function normalizeStatusArg(status) {
  if (!status || status === "all") return undefined;
  if (["draft", "published", "archived"].includes(status)) return status;
  throw new Error(`Invalid --status value: ${status}`);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function stringArray(value) {
  return safeArray(value)
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

function slugifyStatus(status) {
  return status ?? "all";
}

function normalizePageConfig(pageConfig) {
  const seo = pageConfig?.seo ?? {};
  const content = pageConfig?.content ?? {};
  const conversion = pageConfig?.conversion ?? {};
  const seoBoost = pageConfig?.seoBoost ?? {};
  const linking = pageConfig?.linking ?? {};
  const display = pageConfig?.display ?? {};
  const overview = content?.overview ?? {};
  const features = content?.features ?? {};
  const applications = content?.applications ?? {};
  const selectionGuide =
    content?.selectionGuide && typeof content.selectionGuide === "object"
      ? content.selectionGuide
      : {};

  return {
    seo: {
      metaTitle: seo.metaTitle ?? null,
      metaDescription: seo.metaDescription ?? null,
      canonicalUrl: seo.canonicalUrl ?? null,
      noindex: seo.noindex ?? false,
      ogImage: seo.ogImage ?? null,
    },
    content: {
      heroIntro: content.heroIntro ?? null,
      overview: {
        intro: overview.intro ?? null,
        details:
          stringArray(overview.details).length > 0
            ? stringArray(overview.details)
            : splitParagraphs(content.overviewText),
      },
      features: {
        intro: features.intro ?? content.featuresIntro ?? null,
        items:
          stringArray(features.items).length > 0
            ? stringArray(features.items)
            : stringArray(content.featuresList),
      },
      applications: {
        intro: applications.intro ?? content.applicationsIntro ?? null,
        items:
          stringArray(applications.items).length > 0
            ? stringArray(applications.items)
            : stringArray(content.applicationsList),
      },
      selectionGuide: {
        intro:
          typeof content.selectionGuide === "string"
            ? content.selectionGuide ?? null
            : selectionGuide.intro ?? null,
        steps:
          typeof content.selectionGuide === "string"
            ? splitLines(content.selectionGuide)
            : stringArray(selectionGuide.steps),
      },
      technicalNotes:
        stringArray(content.technicalNotes).length > 0
          ? stringArray(content.technicalNotes)
          : splitLines(content.technicalNote),
    },
    longform: {
      markdown: pageConfig?.longform?.markdown ?? null,
    },
    conversion: {
      ctaPrimaryLabel: conversion.ctaPrimaryLabel ?? null,
      ctaPrimaryHref: conversion.ctaPrimaryHref ?? null,
      ctaSecondaryLabel: conversion.ctaSecondaryLabel ?? null,
      ctaSecondaryHref: conversion.ctaSecondaryHref ?? null,
      downloadsMode: conversion.downloadsMode ?? "auto",
      pinnedDownloadIds: safeArray(conversion.pinnedDownloadIds),
    },
    seoBoost: {
      faqMode: seoBoost.faqMode ?? "relation",
      embeddedFaqItems: safeArray(seoBoost.embeddedFaqItems),
    },
    linking: {
      relatedCategoryIds: safeArray(linking.relatedCategoryIds),
      relatedFamilyIds: safeArray(linking.relatedFamilyIds),
      relatedArticleIds: safeArray(linking.relatedArticleIds),
    },
    display: {
      showOverview: display.showOverview ?? true,
      showFeatures: display.showFeatures ?? true,
      showApplications: display.showApplications ?? true,
      showSelectionGuide: display.showSelectionGuide ?? true,
      showTechnicalNote: display.showTechnicalNote ?? true,
      showLongform: display.showLongform ?? true,
      showDownloads: display.showDownloads ?? true,
      showFaq: display.showFaq ?? true,
      showRelatedLinks: display.showRelatedLinks ?? true,
      showBottomCta: display.showBottomCta ?? true,
    },
  };
}

function getFamilyWritableFields(pageConfig) {
  return {
    summary: null,
    content: null,
    seoTitle: null,
    seoDescription: null,
    canonical: null,
    highlights: [],
    pageConfig: {
      seo: {
        metaTitle: pageConfig.seo.metaTitle,
        metaDescription: pageConfig.seo.metaDescription,
        canonicalUrl: pageConfig.seo.canonicalUrl,
        noindex: pageConfig.seo.noindex,
        ogImage: pageConfig.seo.ogImage,
      },
      content: {
        heroIntro: pageConfig.content.heroIntro,
        overview: {
          intro: pageConfig.content.overview.intro,
          details: pageConfig.content.overview.details,
        },
        features: {
          intro: pageConfig.content.features.intro,
          items: pageConfig.content.features.items,
        },
        applications: {
          intro: pageConfig.content.applications.intro,
          items: pageConfig.content.applications.items,
        },
        selectionGuide: {
          intro: pageConfig.content.selectionGuide.intro,
          steps: pageConfig.content.selectionGuide.steps,
        },
        technicalNotes: pageConfig.content.technicalNotes,
      },
      longform: {
        markdown: pageConfig.longform.markdown,
      },
      conversion: {
        ctaPrimaryLabel: pageConfig.conversion.ctaPrimaryLabel,
        ctaPrimaryHref: pageConfig.conversion.ctaPrimaryHref,
        ctaSecondaryLabel: pageConfig.conversion.ctaSecondaryLabel,
        ctaSecondaryHref: pageConfig.conversion.ctaSecondaryHref,
      },
      seoBoost: {
        faqMode: pageConfig.seoBoost.faqMode,
        embeddedFaqItems: pageConfig.seoBoost.embeddedFaqItems,
      },
      linking: {
        relatedCategoryIds: pageConfig.linking.relatedCategoryIds,
        relatedFamilyIds: pageConfig.linking.relatedFamilyIds,
        relatedArticleIds: pageConfig.linking.relatedArticleIds,
      },
    },
  };
}

function buildAgentPromptTemplate() {
  return [
    "You are enriching catalog copy for an industrial electrical components website.",
    "Use the provided context only. Do not invent certifications, specs, compliance claims, dimensions, or performance data.",
    "Keep terminology consistent with B2B manufacturing and sourcing language.",
    "Return valid JSON only.",
    "Preserve ids, slugs, and unchanged structural fields.",
    "Fill empty or weak copy fields where appropriate, but keep the output factual and concise.",
  ].join("\n");
}

function buildMarkdownTaskBrief(copyTasksPath) {
  return `# Copy Tasks Template

Use \`${path.basename(copyTasksPath)}\` as the machine-readable source for agent workflows.

Recommended workflow:
1. Load one task from the JSON file.
2. Pass \`instructions\`, \`context\`, and \`target\` to the agent.
3. Ask the agent to return only the \`proposed\` object in valid JSON.
4. Review before writing back to Convex/admin.
`;
}

const showHelp = hasFlag("--help");

if (showHelp) {
  console.log(`Usage: node scripts/export-catalog-content.mjs [--status <status>] [--out-dir <dir>]

Options:
  --status <status>  Filter by status: all, published, draft, archived (default: all)
  --out-dir <dir>    Output directory (default: exports/catalog-content)
  --help             Show this help text

Output:
  categories.<status>.json
  families.<status>.json
  catalog-content.<status>.json
  copy-tasks.<status>.json
  copy-tasks.<status>.md
`);
  process.exit(0);
}

loadEnvFile(ENV_FILE);

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Checked process env and .env.local.");
}

const status = normalizeStatusArg(getArg("--status"));
const outputDir = path.resolve(getArg("--out-dir") ?? DEFAULT_OUTPUT_DIR);
const client = new ConvexHttpClient(convexUrl);

async function main() {
  const queryArgs = status ? { status } : {};
  const [categories, families] = await Promise.all([
    client.query("queries/modules/categories:exportCategoriesForContent", queryArgs),
    client.query("queries/modules/products:exportProductFamiliesForContent", queryArgs),
  ]);

  const categoryById = new Map(categories.map((item) => [item._id, item]));
  const familiesByCategoryId = new Map();

  for (const family of families) {
    const list = familiesByCategoryId.get(family.categoryId) ?? [];
    list.push(family);
    familiesByCategoryId.set(family.categoryId, list);
  }

  const exportedCategories = categories.map((category) => {
    const parent = category.parentId ? categoryById.get(category.parentId) ?? null : null;
    const categoryFamilies = (familiesByCategoryId.get(category._id) ?? []).map((family) => ({
      _id: family._id,
      slug: family.slug,
      name: family.name,
      status: family.status,
      sortOrder: family.sortOrder,
      brand: family.brand ?? null,
      summary: family.summary ?? null,
    }));

    return {
      _id: category._id,
      slug: category.slug,
      name: category.name,
      status: category.status,
      level: category.level,
      path: category.path,
      sortOrder: category.sortOrder,
      isVisibleInNav: category.isVisibleInNav,
      parent: parent
        ? {
            _id: parent._id,
            slug: parent.slug,
            name: parent.name,
          }
        : null,
      description: category.description ?? null,
      shortDescription: category.shortDescription ?? null,
      seoTitle: category.seoTitle ?? null,
      seoDescription: category.seoDescription ?? null,
      canonical: category.canonical ?? null,
      templateKey: category.templateKey ?? null,
      familyCount: categoryFamilies.length,
      familySlugs: categoryFamilies.map((family) => family.slug),
      families: categoryFamilies,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  });

  const exportedFamilies = families.map((family) => {
    const category = categoryById.get(family.categoryId) ?? null;
    const normalizedPageConfig = normalizePageConfig(family.pageConfig);

    return {
      _id: family._id,
      slug: family.slug,
      name: family.name,
      status: family.status,
      sortOrder: family.sortOrder,
      category: category
        ? {
            _id: category._id,
            slug: category.slug,
            name: category.name,
            path: category.path,
          }
        : null,
      brand: family.brand ?? null,
      summary: family.summary ?? null,
      content: family.content ?? null,
      highlights: safeArray(family.highlights),
      attributes: family.attributes ?? {},
      heroImage: family.heroImage ?? null,
      gallery: safeArray(family.gallery),
      mediaItems: safeArray(family.mediaItems),
      seoTitle: family.seoTitle ?? null,
      seoDescription: family.seoDescription ?? null,
      canonical: family.canonical ?? null,
      pageConfig: normalizedPageConfig,
      copyInputs: {
        familyName: family.name,
        categoryName: category?.name ?? null,
        brand: family.brand ?? null,
        summary: family.summary ?? null,
        content: family.content ?? null,
        highlights: safeArray(family.highlights),
        pageConfig: normalizedPageConfig,
      },
      createdAt: family.createdAt,
      updatedAt: family.updatedAt,
    };
  });

  const copyTaskInstructions = buildAgentPromptTemplate();
  const categoryCopyTasks = exportedCategories.map((category) => ({
    taskId: `category:${category.slug}`,
    entityType: "category",
    entityId: category._id,
    slug: category.slug,
    name: category.name,
    status: category.status,
    instructions: copyTaskInstructions,
    context: {
      category,
      relatedFamilies: category.families,
    },
    target: {
      writableFields: {
        description: category.description,
        shortDescription: category.shortDescription,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        canonical: category.canonical,
      },
      preferredOutputs: [
        "description",
        "shortDescription",
        "seoTitle",
        "seoDescription",
      ],
    },
    notes: [
      "Keep copy aligned with the category level and breadcrumb path.",
      "Do not rename slug or category name.",
      "Do not fabricate technical specifications.",
    ],
    proposed: {
      description: category.description,
      shortDescription: category.shortDescription,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      canonical: category.canonical,
    },
  }));

  const familyCopyTasks = exportedFamilies.map((family) => ({
    taskId: `family:${family.slug}`,
    entityType: "family",
    entityId: family._id,
    slug: family.slug,
    name: family.name,
    status: family.status,
    instructions: copyTaskInstructions,
    context: {
      family: {
        _id: family._id,
        slug: family.slug,
        name: family.name,
        brand: family.brand,
        summary: family.summary,
        content: family.content,
        highlights: family.highlights,
        category: family.category,
        attributes: family.attributes,
        heroImage: family.heroImage,
        seoTitle: family.seoTitle,
        seoDescription: family.seoDescription,
        canonical: family.canonical,
        pageConfig: family.pageConfig,
      },
    },
    target: {
      writableFields: getFamilyWritableFields(family.pageConfig),
      preferredOutputs: [
        "summary",
        "pageConfig.content.heroIntro",
        "pageConfig.content.overview.intro",
        "pageConfig.content.overview.details",
        "pageConfig.content.features.intro",
        "pageConfig.content.features.items",
        "pageConfig.content.applications.intro",
        "pageConfig.content.applications.items",
        "pageConfig.content.selectionGuide.intro",
        "pageConfig.content.selectionGuide.steps",
        "pageConfig.content.technicalNotes",
        "pageConfig.longform.markdown",
        "pageConfig.seo.metaTitle",
        "pageConfig.seo.metaDescription",
      ],
    },
    notes: [
      "Keep family copy specific to this series, not the entire category.",
      "Preserve factual limits from current data; do not invent specifications or compliance.",
      "If a field lacks evidence, leave it null or empty instead of guessing.",
      "Use longform markdown for SEO depth and avoid repeating overview, features, or applications verbatim.",
    ],
    proposed: {
      summary: family.summary,
      content: family.content,
      seoTitle: family.seoTitle,
      seoDescription: family.seoDescription,
      canonical: family.canonical,
      highlights: family.highlights,
      pageConfig: family.pageConfig,
    },
  }));

  const copyTasks = {
    exportedAt: new Date().toISOString(),
    filters: { status: status ?? "all" },
    counts: {
      categories: categoryCopyTasks.length,
      families: familyCopyTasks.length,
      total: categoryCopyTasks.length + familyCopyTasks.length,
    },
    taskTemplateVersion: 1,
    tasks: [...categoryCopyTasks, ...familyCopyTasks],
  };

  const statusLabel = slugifyStatus(status);
  ensureDir(outputDir);

  const summary = {
    exportedAt: new Date().toISOString(),
    filters: { status: status ?? "all" },
    counts: {
      categories: exportedCategories.length,
      families: exportedFamilies.length,
    },
    categories: exportedCategories,
    families: exportedFamilies,
  };

  const categoriesPath = path.join(outputDir, `categories.${statusLabel}.json`);
  const familiesPath = path.join(outputDir, `families.${statusLabel}.json`);
  const bundlePath = path.join(outputDir, `catalog-content.${statusLabel}.json`);
  const copyTasksPath = path.join(outputDir, `copy-tasks.${statusLabel}.json`);
  const copyTasksBriefPath = path.join(outputDir, `copy-tasks.${statusLabel}.md`);

  writeJson(categoriesPath, exportedCategories);
  writeJson(familiesPath, exportedFamilies);
  writeJson(bundlePath, summary);
  writeJson(copyTasksPath, copyTasks);
  writeText(copyTasksBriefPath, buildMarkdownTaskBrief(copyTasksPath));

  console.log(`Exported ${exportedCategories.length} categories -> ${categoriesPath}`);
  console.log(`Exported ${exportedFamilies.length} families -> ${familiesPath}`);
  console.log(`Exported bundle -> ${bundlePath}`);
  console.log(`Exported copy tasks -> ${copyTasksPath}`);
  console.log(`Exported copy task brief -> ${copyTasksBriefPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
