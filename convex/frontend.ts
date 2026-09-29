import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { internalQuery, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { getExpandedTemplateFieldsByCategoryId } from "./lib/attributes";
import {
  DEFAULT_CONTACT_SETTINGS,
  normalizeContactSettings,
  normalizeLanguageWorkflowSettings,
  SITE_SETTINGS_GLOBAL_KEY,
} from "./lib/siteSettings";
import { r2 } from "./r2Assets";
import { resolveRecommendationProductIds } from "../lib/recommendationGroups";
import {
  getFamilySearchText,
  getRelatedSeriesRule,
  RELATED_SERIES_RULES,
  type RelatedSeriesLabel,
} from "./lib/relatedSeries";

type VisualMediaType = "product" | "dimension" | "packaging" | "application";

type VisualMediaItem = {
  type: VisualMediaType;
  url: string;
  alt?: string;
  sortOrder?: number;
};

type AttributeRecord = Record<string, unknown>;
type ResolvedPublicAsset = Doc<"assets"> & {
  fileUrl?: string | null;
};
type FrontendAttributeField = NonNullable<
  Awaited<ReturnType<typeof getExpandedTemplateFieldsByCategoryId>>[number]
>;
type CategoryContentFamily = Omit<Doc<"productFamilies">, "brand"> & {
  heroImage?: string;
  mediaItems: VisualMediaItem[];
};
type CategoryContentProduct = {
  _id: Id<"products">;
  slug: string;
  title: string;
  shortTitle?: string;
  model?: string;
  skuCode?: string;
  summary?: string;
  mainImage?: string;
  isFeatured?: boolean;
  familyId: Id<"productFamilies">;
  categoryId: Id<"categories">;
  sortOrder: number;
  attributes: AttributeRecord;
  mediaItems: VisualMediaItem[];
};
type CategoryContentResult = {
  families: CategoryContentFamily[];
  products: CategoryContentProduct[];
};
type PublicNavigationItem = Doc<"navItems"> & {
  children: PublicNavigationItem[];
};

type AttributeFilterMode = "exact" | "range_bucket";

type LocalizationEntityType =
  | "staticPage"
  | "category"
  | "family"
  | "product"
  | "article";

type LocalizationStatus =
  | "missing"
  | "draft"
  | "machine_ready"
  | "review_required"
  | "approved"
  | "published"
  | "stale";

type LocalizedEligibilityRoute =
  | { kind: "staticPage"; pageKey: string }
  | { kind: "category"; slug: string }
  | { kind: "family"; slug: string }
  | { kind: "product"; slug: string }
  | { kind: "article"; slug: string }
  | { kind: "blogPage"; page: number };

type LocalizationRouteSource = {
  entityType: LocalizationEntityType;
  sourceId: string;
  sourceStatus: string;
  sourceUpdatedAt: number | null;
};

const localizedEligibilityRouteValidator = v.union(
  v.object({
    kind: v.literal("staticPage"),
    pageKey: v.string(),
  }),
  v.object({
    kind: v.literal("category"),
    slug: v.string(),
  }),
  v.object({
    kind: v.literal("family"),
    slug: v.string(),
  }),
  v.object({
    kind: v.literal("product"),
    slug: v.string(),
  }),
  v.object({
    kind: v.literal("article"),
    slug: v.string(),
  }),
  v.object({
    kind: v.literal("blogPage"),
    page: v.number(),
  })
);

const UNIT_LABELS: Record<string, string> = {
  mm: "mm",
  mm2: "mm²",
  g: "g",
  kg: "kg",
  v: "V",
  a: "A",
  c: "°C",
  awg: "AWG",
  nm: "N·m",
  pcs: "pcs",
};

function isPublishedCategory(
  item: Doc<"categories"> | null
): item is Doc<"categories"> {
  return Boolean(item && item.status === "published");
}

function isPublishedFamily(
  item: Doc<"productFamilies"> | null
): item is Doc<"productFamilies"> {
  return Boolean(item && item.status === "published");
}

function isPublishedArticle(
  item: Doc<"articles"> | null
): item is Doc<"articles"> {
  return Boolean(item && item.status === "published");
}

function isPublicAsset(item: Doc<"assets"> | null): item is Doc<"assets"> {
  return Boolean(item && item.isPublic);
}

async function resolveAssetUrl(asset: Doc<"assets">): Promise<ResolvedPublicAsset> {
  const accessUrl = asset.objectKey ? await r2.getUrl(asset.objectKey) : asset.fileUrl;
  return {
    ...asset,
    fileUrl: accessUrl ?? asset.fileUrl,
    previewImage: asset.previewImage,
  };
}

async function getRelatedAssets(
  ctx: QueryCtx,
  entityType: "category" | "family" | "product",
  entityId: string
) {
  const relations = await ctx.db
    .query("assetRelations")
    .withIndex("by_entityType_entityId", (q) =>
      q.eq("entityType", entityType).eq("entityId", entityId)
    )
    .collect();

  const assets = await Promise.all(
    relations
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(async (relation) => ctx.db.get(relation.assetId))
  );

  const publicAssets = assets.filter(isPublicAsset);
  return await Promise.all(publicAssets.map((asset) => resolveAssetUrl(asset)));
}

function sortFamilyResources(
  resources: ResolvedPublicAsset[],
  downloadsMode?: "auto" | "manual",
  pinnedDownloadIds?: string[]
) {
  if (downloadsMode !== "manual" || !pinnedDownloadIds || pinnedDownloadIds.length === 0) {
    return resources;
  }

  const orderMap = new Map(pinnedDownloadIds.map((id, index) => [id, index]));
  return resources
    .filter((resource) => orderMap.has(resource._id))
    .sort((a, b) => (orderMap.get(a._id) ?? 0) - (orderMap.get(b._id) ?? 0));
}

async function getRelatedFaqs(
  ctx: QueryCtx,
  entityType: "category" | "family" | "product",
  entityId: string
) {
  const relations = await ctx.db
    .query("articleEntityRelations")
    .withIndex("by_entity", (q) =>
      q.eq("entityType", entityType).eq("entityId", String(entityId))
    )
    .collect();

  if (relations.length > 0) {
    const relatedArticles = await Promise.all(
      relations.map((relation) => ctx.db.get(relation.articleId))
    );
    return relatedArticles.filter(isPublishedArticle).filter((article) => article.type === "faq");
  }

  // Preserve existing data until the one-time derived-data backfill has run.
  const state = await ctx.db.query("sitemapCardState")
    .withIndex("by_key", (q) => q.eq("key", "catalog"))
    .unique();
  const hasDerivedData = state?.completedKinds.includes("article") ?? false;
  if (hasDerivedData) return [];

  const articles = await ctx.db
    .query("articles")
    .withIndex("by_type_status", (q) => q.eq("type", "faq").eq("status", "published"))
    .collect();

  return articles.filter((article) => {
    if (entityType === "category") {
      return (article.relatedCategoryIds ?? []).some((id) => id === entityId);
    }
    if (entityType === "family") {
      return (article.relatedFamilyIds ?? []).some((id) => id === entityId);
    }
    return (article.relatedProductIds ?? []).some((id) => id === entityId);
  });
}

type PublicAuthor = Pick<
  Doc<"authors">,
  "_id" | "name" | "title" | "description" | "avatar"
>;

function toPublicAuthor(author: Doc<"authors"> | null): PublicAuthor | null {
  if (!author) return null;

  return {
    _id: author._id,
    name: author.name,
    title: author.title,
    description: author.description,
    avatar: author.avatar,
  };
}

async function getArticleAuthor(
  ctx: QueryCtx,
  article?: Pick<Doc<"articles">, "authorId"> | null
) {
  if (!article?.authorId) return null;
  const author = await ctx.db.get(article.authorId);
  return toPublicAuthor(author);
}

async function attachArticleAuthors(ctx: QueryCtx, articles: Doc<"articles">[]) {
  const authorIds = Array.from(
    new Set(
      articles.flatMap((article) => (article.authorId ? [article.authorId] : []))
    )
  ) as Id<"authors">[];

  const authors = await Promise.all(authorIds.map((authorId) => ctx.db.get(authorId)));
  const authorById = new Map<string, PublicAuthor | null>(
    authors
      .filter((author): author is Doc<"authors"> => Boolean(author))
      .map((author) => [String(author._id), toPublicAuthor(author)])
  );

  return articles.map((article) => ({
    ...article,
    author: article.authorId ? authorById.get(String(article.authorId)) ?? null : null,
  }));
}

async function resolveLocalizedRouteSource(
  ctx: QueryCtx,
  route: LocalizedEligibilityRoute
): Promise<LocalizationRouteSource | null> {
  switch (route.kind) {
    case "staticPage":
      return {
        entityType: "staticPage",
        sourceId: route.pageKey,
        sourceStatus: "published",
        sourceUpdatedAt: null,
      };
    case "blogPage":
      if (!Number.isSafeInteger(route.page) || route.page <= 1) {
        return null;
      }

      return {
        entityType: "staticPage",
        sourceId: "blog",
        sourceStatus: "published",
        sourceUpdatedAt: null,
      };
    case "category": {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", route.slug))
        .unique();

      return category
        ? {
            entityType: "category",
            sourceId: String(category._id),
            sourceStatus: category.status,
            sourceUpdatedAt: category.updatedAt,
          }
        : null;
    }
    case "family": {
      const family = await ctx.db
        .query("productFamilies")
        .withIndex("by_slug", (q) => q.eq("slug", route.slug))
        .unique();

      return family
        ? {
            entityType: "family",
            sourceId: String(family._id),
            sourceStatus: family.status,
            sourceUpdatedAt: family.updatedAt,
          }
        : null;
    }
    case "product": {
      const product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", route.slug))
        .unique();

      return product
        ? {
            entityType: "product",
            sourceId: String(product._id),
            sourceStatus: product.status,
            sourceUpdatedAt: product.updatedAt,
          }
        : null;
    }
    case "article": {
      const article = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", route.slug))
        .unique();

      return article
        ? {
            entityType: "article",
            sourceId: String(article._id),
            sourceStatus: article.status,
            sourceUpdatedAt: article.updatedAt,
          }
        : null;
    }
  }
}

function buildMissingRouteEligibility(locale: string) {
  return {
    locale,
    sourceEntityType: null,
    sourceId: null,
    sourceStatus: "missing",
    sourceUpdatedAt: null,
    localizationStatus: "missing" satisfies LocalizationStatus,
    localizedSlug: null,
    title: null,
    seoTitle: null,
    seoDescription: null,
    updatedAt: null,
    eligible: false,
    reasons: ["source_not_found"],
  };
}

function getLocalizedFieldString(localization: unknown, keys: string[]) {
  if (!localization || typeof localization !== "object") {
    return null;
  }

  const fields = (localization as { localizedFields?: unknown }).localizedFields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return null;
  }

  for (const key of keys) {
    const value = (fields as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

async function getLinkedFamilyRelations(
  ctx: QueryCtx,
  family: Doc<"productFamilies">
) {
  const linking = family.pageConfig?.linking;
  const [relatedCategories, relatedFamilies, relatedArticles]: [
    Array<Doc<"categories"> | null>,
    Array<Doc<"productFamilies"> | null>,
    Array<Doc<"articles"> | null>,
  ] = await Promise.all([
    linking?.relatedCategoryIds?.length
      ? Promise.all(linking.relatedCategoryIds.map((id) => ctx.db.get(id)))
      : [],
    linking?.relatedFamilyIds?.length
      ? Promise.all(linking.relatedFamilyIds.map((id) => ctx.db.get(id)))
      : [],
    linking?.relatedArticleIds?.length
      ? Promise.all(linking.relatedArticleIds.map((id) => ctx.db.get(id)))
      : [],
  ]);

  return {
    relatedCategories: relatedCategories
      .filter(isPublishedCategory)
      .map((item) => ({
        _id: item._id,
        name: item.name,
        slug: item.slug,
      })),
    relatedFamilies: relatedFamilies
      .filter((item): item is Doc<"productFamilies"> =>
        isPublishedFamily(item) && item._id !== family._id
      )
      .map((item) => ({
        _id: item._id,
        name: item.name,
        slug: item.slug,
      })),
    relatedArticles: relatedArticles
      .filter((item): item is Doc<"articles"> =>
        isPublishedArticle(item) && item.type !== "faq"
      )
      .map((item) => ({
        _id: item._id,
        title: item.title,
        slug: item.slug,
        type: item.type,
      })),
  };
}

async function getTemplateFields(
  ctx: QueryCtx,
  categoryId: Id<"categories">
): Promise<FrontendAttributeField[]> {
  const fields = await getExpandedTemplateFieldsByCategoryId(ctx, categoryId);
  return fields.filter(
    (field): field is FrontendAttributeField =>
      Boolean(field && field.isVisibleOnFrontend)
  );
}

function mergeAttributes(
  familyAttributes?: AttributeRecord,
  productAttributes?: AttributeRecord
) {
  return {
    ...(familyAttributes ?? {}),
    ...(productAttributes ?? {}),
  };
}

function mergeVariantAttributes(
  familyAttributes?: AttributeRecord,
  productAttributes?: AttributeRecord,
  variantAttributes?: AttributeRecord
) {
  return {
    ...(familyAttributes ?? {}),
    ...(productAttributes ?? {}),
    ...(variantAttributes ?? {}),
  };
}

function getUnitLabel(field: { unitKey?: string; unit?: string }) {
  if (field.unitKey && UNIT_LABELS[field.unitKey]) {
    return UNIT_LABELS[field.unitKey];
  }
  return field.unit;
}

function formatAttributeValue(value: unknown, field: { fieldType?: string; unitKey?: string; unit?: string }) {
  const precision =
    typeof (field as { displayPrecision?: number }).displayPrecision === "number"
      ? (field as { displayPrecision?: number }).displayPrecision
      : undefined;
  const unitLabel = getUnitLabel(field);
  const formatNumber = (item: number) =>
    typeof precision === "number" ? item.toFixed(precision) : String(item);
  if (Array.isArray(value)) {
    if (
      field.fieldType === "range" &&
      value.length === 2 &&
      value.every((item) => typeof item === "number")
    ) {
      const label = `${formatNumber(value[0])}-${formatNumber(value[1])}`;
      return unitLabel ? `${label} ${unitLabel}` : label;
    }
    return value.join(", ");
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "number") {
    return unitLabel ? `${formatNumber(value)} ${unitLabel}` : formatNumber(value);
  }
  return unitLabel ? `${value} ${unitLabel}` : String(value);
}

function serializeFilterValue(value: unknown) {
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  return String(value);
}

function deserializeFilterValue(value: string) {
  if (value.startsWith("[")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function getFilterValues(rawValue: unknown) {
  if (Array.isArray(rawValue)) {
    if (rawValue.length === 2 && rawValue.every((item) => typeof item === "number")) {
      return [serializeFilterValue(rawValue)];
    }
    return rawValue.map((item) => String(item));
  }
  return rawValue !== undefined && rawValue !== null
    ? [serializeFilterValue(rawValue)]
    : [];
}

function omitBrand<T extends { brand?: string }>(record: T): Omit<T, "brand"> {
  const { brand, ...rest } = record;
  void brand;
  return rest;
}

function niceStep(roughStep: number) {
  if (!Number.isFinite(roughStep) || roughStep <= 0) {
    return 1;
  }
  const exponent = Math.floor(Math.log10(roughStep));
  const base = 10 ** exponent;
  const fraction = roughStep / base;
  if (fraction <= 1) return base;
  if (fraction <= 2) return 2 * base;
  if (fraction <= 5) return 5 * base;
  return 10 * base;
}

function buildNumericBuckets(values: Array<number | [number, number]>) {
  const numericPoints = values.flatMap((value) =>
    Array.isArray(value) ? [value[0], value[1]] : [value]
  );

  if (!numericPoints.length) {
    return [];
  }

  const minValue = Math.min(...numericPoints);
  const maxValue = Math.max(...numericPoints);

  if (minValue === maxValue) {
    return [{ min: minValue, max: maxValue }];
  }

  const step = niceStep((maxValue - minValue) / 5);
  const start = Math.floor(minValue / step) * step;
  const buckets: Array<{ min: number; max: number }> = [];

  for (let index = 0; index < 12; index += 1) {
    const bucketMin = start + index * step;
    const bucketMax = bucketMin + step;
    buckets.push({ min: bucketMin, max: bucketMax });
    if (bucketMax >= maxValue) {
      break;
    }
  }

  return buckets;
}

function matchesBucket(rawValue: unknown, bucket: { min: number; max: number }) {
  if (typeof rawValue === "number") {
    return rawValue >= bucket.min && rawValue <= bucket.max;
  }
  if (
    Array.isArray(rawValue) &&
    rawValue.length === 2 &&
    rawValue.every((item) => typeof item === "number")
  ) {
    return rawValue[0] <= bucket.max && rawValue[1] >= bucket.min;
  }
  return false;
}

function getFilterMode(field: { filterMode?: AttributeFilterMode; fieldType?: string }) {
  if (
    field.filterMode === "range_bucket" &&
    (field.fieldType === "number" || field.fieldType === "range")
  ) {
    return "range_bucket";
  }
  return "exact";
}

function normalizeMediaItems({
  mediaItems,
  primaryUrl,
  gallery,
}: {
  mediaItems?: VisualMediaItem[];
  primaryUrl?: string;
  gallery?: string[];
}) {
  const normalized: VisualMediaItem[] = [];

  if (mediaItems?.length) {
    normalized.push(
      ...mediaItems
        .filter((item) => item?.url)
        .map((item, index) => ({
          ...item,
          sortOrder: item.sortOrder ?? index,
        }))
    );
  }

  if (primaryUrl) {
    normalized.push({
      type: "product",
      url: primaryUrl,
      sortOrder: -1,
    });
  }

  for (const [index, url] of (gallery ?? []).entries()) {
    if (!url) continue;
    normalized.push({
      type: "product",
      url,
      sortOrder: index,
    });
  }

  const seen = new Set<string>();
  return normalized
    .filter((item) => {
      const key = `${item.type}:${item.url}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
}

function resolveFamilyManualHeroImage(family: {
  manualHeroImage?: string;
}) {
  const trimmed = family.manualHeroImage?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveFamilyFallbackProductImage(family: {
  heroImage?: string;
  gallery?: string[];
  mediaItems?: VisualMediaItem[];
}) {
  const normalized = normalizeMediaItems({
    mediaItems: family.mediaItems,
    primaryUrl: family.heroImage,
    gallery: family.gallery,
  });
  return normalized.find((item) => item.type === "product")?.url;
}

function resolveFamilyHeroImage(family: {
  manualHeroImage?: string;
  heroImage?: string;
  gallery?: string[];
  mediaItems?: VisualMediaItem[];
}) {
  return resolveFamilyManualHeroImage(family) ?? resolveFamilyFallbackProductImage(family);
}

type RelatedSeriesItem = {
  _id: Id<"productFamilies">;
  name: string;
  slug: string;
  summary?: string;
  image?: string;
  relationLabel: RelatedSeriesLabel;
};

type ScoredRelatedSeriesItem = {
  item: RelatedSeriesItem;
  score: number;
  sortOrder: number;
};

type RelatedSeriesCandidate = {
  _id: Id<"productFamilies">;
  categoryId: Id<"categories">;
  name: string;
  slug: string;
  summary?: string;
  image?: string;
  sortOrder: number;
  rule: (typeof RELATED_SERIES_RULES)[number] | undefined;
  isRingSeries: boolean;
};

type CategoryFilterOption = {
  label: string;
  value: string;
  count: number;
};

type CategoryFilterGroup = {
  id: string;
  label: string;
  type: "checkbox" | "radio";
  options: CategoryFilterOption[];
};

const MANUAL_RELATED_SERIES_LABELS: RelatedSeriesLabel[] = [
  "Single Crimp",
  "Heat Shrink",
  "Nylon",
  "Non Insulated",
];

function toRelatedSeriesItem(
  family: Doc<"productFamilies">,
  label: RelatedSeriesLabel
): RelatedSeriesItem {
  return {
    _id: family._id,
    name: family.name,
    slug: family.slug,
    summary: family.summary,
    image: resolveFamilyHeroImage(family),
    relationLabel: label,
  };
}

function dedupeRelatedSeriesItems(items: RelatedSeriesItem[]) {
  const seenLabels = new Set<string>();
  const seenIds = new Set<string>();

  return items.filter((item) => {
    if (!item || seenLabels.has(item.relationLabel) || seenIds.has(item._id)) {
      return false;
    }
    seenLabels.add(item.relationLabel);
    seenIds.add(item._id);
    return true;
  });
}

async function computeRelatedSeriesForFamily(
  ctx: QueryCtx,
  categoryId: Id<"categories">,
  family: Doc<"productFamilies"> | null
) {
  if (!family) return [];

  const manualFamilies = family.pageConfig?.linking?.relatedFamilyIds?.length
    ? await Promise.all(family.pageConfig.linking.relatedFamilyIds.map((id) => ctx.db.get(id)))
    : [];

  const manualItems = manualFamilies
    .filter((item): item is Doc<"productFamilies"> =>
      isPublishedFamily(item) && item._id !== family._id
    )
    .map((item, index) => {
      const rule = getRelatedSeriesRule(item);
      const fallbackLabel = MANUAL_RELATED_SERIES_LABELS[index];
      return rule || fallbackLabel
        ? toRelatedSeriesItem(item, rule?.label ?? fallbackLabel)
        : null;
    })
    .filter((item): item is RelatedSeriesItem => Boolean(item));

  if (manualItems.length > 0) {
    return dedupeRelatedSeriesItems(manualItems).slice(0, 4);
  }

  const currentSearchText = getFamilySearchText(family);
  if (!getRelatedSeriesRule(family) && !currentSearchText.includes("ring terminal")) {
    return [];
  }

  // Before card backfill, keep the fallback scan inside the two relevant
  // categories. Once cards are ready, the original sibling search is cheap.
  let candidateCategoryIds = [...new Set([family.categoryId, categoryId])];
  const cardState = await ctx.db.query("sitemapCardState")
    .withIndex("by_key", (q) => q.eq("key", "catalog"))
    .unique();
  let candidates: RelatedSeriesCandidate[];
  if (cardState?.enabled) {
    const category = await ctx.db.get(categoryId);
    const siblings = category?.parentId
      ? await ctx.db.query("categories")
          .withIndex("by_parentId", (q) => q.eq("parentId", category.parentId))
          .collect()
      : [];
    candidateCategoryIds = [...new Set([
      ...candidateCategoryIds,
      ...(category?.parentId ? [category.parentId] : []),
      ...siblings.filter(isPublishedCategory).map((item) => item._id),
    ])];
    const cards = (await Promise.all(candidateCategoryIds.map((candidateCategoryId) =>
      ctx.db.query("sitemapCards")
        .withIndex("by_entityType_and_status_and_categoryId", (q) =>
          q.eq("entityType", "family").eq("status", "published").eq("categoryId", candidateCategoryId))
        .collect()
    ))).flat();
    candidates = cards.flatMap((card) => {
      if (!card.familyId || !card.categoryId || !card.name) return [];
      return [{
        _id: card.familyId,
        categoryId: card.categoryId,
        name: card.name,
        slug: card.slug,
        summary: card.summary,
        image: card.image,
        sortOrder: card.sortOrder ?? 0,
        rule: RELATED_SERIES_RULES.find((rule) => rule.label === card.seriesLabel),
        isRingSeries: card.isRingSeries ?? false,
      }];
    });
  } else {
    const families = (await Promise.all(candidateCategoryIds.map((candidateCategoryId) =>
      ctx.db.query("productFamilies")
        .withIndex("by_categoryId", (q) => q.eq("categoryId", candidateCategoryId))
        .collect()
    ))).flat();
    candidates = families.filter(isPublishedFamily).map((item) => ({
      _id: item._id,
      categoryId: item.categoryId,
      name: item.name,
      slug: item.slug,
      summary: item.summary,
      image: resolveFamilyHeroImage(item),
      sortOrder: item.sortOrder,
      rule: getRelatedSeriesRule(item),
      isRingSeries: getFamilySearchText(item).includes("ring terminal"),
    }));
  }

  const currentIsRingSeries = currentSearchText.includes("ring terminal");

  return candidates
    .map((item): ScoredRelatedSeriesItem | null => {
      const rule = item.rule;
      if (!rule) return null;

      const preferredSlugIndex = (rule.preferredSlugs ?? []).indexOf(item.slug);
      const score =
        rule.priority +
        (preferredSlugIndex >= 0 ? 1000 - preferredSlugIndex * 25 : 0) +
        (item._id === family._id ? 120 : 0) +
        (item.categoryId === categoryId ? 20 : 0) +
        (currentIsRingSeries && item.isRingSeries ? 50 : 0) +
        (item.image || item.summary ? 5 : 0);

      return {
        item: {
          _id: item._id, name: item.name, slug: item.slug,
          summary: item.summary, image: item.image, relationLabel: rule.label,
        },
        score,
        sortOrder: item.sortOrder ?? 0,
      };
    })
    .filter((entry): entry is ScoredRelatedSeriesItem => Boolean(entry))
    .sort((left, right) => right.score - left.score || left.sortOrder - right.sortOrder)
    .map((entry) => entry.item)
    .filter((item, index, items) =>
      items.findIndex((candidate) => candidate.relationLabel === item.relationLabel) === index
    )
    .slice(0, 4);
}

export const getRelatedSeriesForFamily = query({
  args: {
    familyId: v.id("productFamilies"),
    categoryId: v.id("categories"),
  },
  returns: v.array(v.object({
    _id: v.id("productFamilies"),
    name: v.string(),
    slug: v.string(),
    summary: v.optional(v.string()),
    image: v.optional(v.string()),
    relationLabel: v.union(
      v.literal("Single Crimp"),
      v.literal("Heat Shrink"),
      v.literal("Nylon"),
      v.literal("Non Insulated"),
    ),
  })),
  handler: async (ctx, args) => {
    const family = await ctx.db.get(args.familyId);
    if (!family || family.status !== "published") return [];
    return await computeRelatedSeriesForFamily(ctx, args.categoryId, family);
  },
});

async function getCategoryFilters(ctx: QueryCtx, categoryId: Id<"categories">) {
  const state = await ctx.db.query("sitemapCardState")
    .withIndex("by_key", (q) => q.eq("key", "catalog"))
    .unique();
  const fields = await getTemplateFields(ctx, categoryId);
  const facetsReady = state?.completedKinds.includes("familyFacets") &&
    state.completedKinds.includes("productFacets");
  const [products, families] = facetsReady
    ? await Promise.all([
        ctx.db.query("productFacetCards")
          .withIndex("by_categoryId_and_status", (q) =>
            q.eq("categoryId", categoryId).eq("status", "published"))
          .collect(),
        ctx.db.query("familyFacetCards")
          .withIndex("by_categoryId_and_status", (q) =>
            q.eq("categoryId", categoryId).eq("status", "published"))
          .collect(),
      ])
    : await Promise.all([
        ctx.db.query("products")
          .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
          .collect(),
        ctx.db.query("productFamilies")
          .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
          .collect(),
      ]);

  const publishedProducts = products.filter((item) => item.status === "published");
  const familyMap = new Map(families.map((family) => [
    "familyId" in family ? family.familyId : family._id,
    family,
  ]));

  return fields
    .filter((field) => field.isFilterable)
    .map((field): CategoryFilterGroup => {
      const filterMode = getFilterMode(field);
      if (filterMode === "range_bucket") {
        const numericValues: Array<number | [number, number]> = publishedProducts.flatMap(
          (product): Array<number | [number, number]> => {
            const rawValue = mergeAttributes(
              familyMap.get(product.familyId)?.attributes,
              product.attributes
            )[field.fieldKey];
            if (typeof rawValue === "number") {
              return [rawValue];
            }
            if (
              Array.isArray(rawValue) &&
              rawValue.length === 2 &&
              rawValue.every((item) => typeof item === "number")
            ) {
              return [rawValue as [number, number]];
            }
            return [];
          }
        );

        const options = buildNumericBuckets(numericValues)
          .map((bucket) => {
            let count = 0;
            for (const product of publishedProducts) {
              const rawValue = mergeAttributes(
                familyMap.get(product.familyId)?.attributes,
                product.attributes
              )[field.fieldKey];
              if (matchesBucket(rawValue, bucket)) {
                count += 1;
              }
            }

            return {
              label: formatAttributeValue([bucket.min, bucket.max], field),
              value: `bucket:${bucket.min}:${bucket.max}`,
              count,
            };
          })
          .filter((option) => option.count > 0);

        return {
          id: field.fieldKey,
          label: field.label,
          type: "checkbox",
          options,
        };
      }

      const counts = new Map<string, number>();

      for (const product of publishedProducts) {
        const rawValue = mergeAttributes(
          familyMap.get(product.familyId)?.attributes,
          product.attributes
        )[field.fieldKey];
        const values = getFilterValues(rawValue);

        for (const value of values) {
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
      }

      const options = Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([value, count]) => ({
          label: formatAttributeValue(deserializeFilterValue(value), field),
          value,
          count,
        }));

      return {
        id: field.fieldKey,
        label: field.label,
        type: field.fieldType === "enum" ? "radio" : "checkbox",
        options,
      };
    })
    .filter((group) => group.options.length > 0);
}

// Categories for frontend
export const listCategoriesForPublic = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_status_visible_sortOrder", (q) =>
        q.eq("status", "published").eq("isVisibleInNav", true)
      )
      .take(limit);

    return categories.map((category) => ({
      _id: category._id,
      slug: category.slug,
      name: category.name,
      parentId: category.parentId,
      level: category.level,
      sortOrder: category.sortOrder,
      isVisibleInNav: category.isVisibleInNav,
      shortDescription: category.shortDescription,
      description: category.description,
      overviewIntro: category.pageConfig?.content?.overview?.intro,
      image: category.image,
      icon: category.icon,
      seoDescription: category.seoDescription,
    }));
  },
});

export const getPublicContactSettings = query({
  args: {},
  handler: async (ctx) => {
    const settingsDoc = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", SITE_SETTINGS_GLOBAL_KEY))
      .unique();

    return normalizeContactSettings(settingsDoc?.contact ?? DEFAULT_CONTACT_SETTINGS);
  },
});

export const getLanguageWorkflowSettings = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settingsDoc = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", SITE_SETTINGS_GLOBAL_KEY))
      .unique();

    return normalizeLanguageWorkflowSettings(settingsDoc?.languageWorkflows ?? []);
  },
});

// Product families for frontend
export const listFeaturedFamilies = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 10, 50);

    const families = await ctx.db
      .query("productFamilies")
      .withIndex("by_status_sortOrder", (q) =>
        q.eq("status", "published")
      )
      .take(limit);

    return families.map((family) => omitBrand(family));
  },
});

export const listFeaturedProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 10, 50);

    const products = await ctx.db
      .query("products")
      .withIndex("by_status_featured_sortOrder", (q) =>
        q.eq("status", "published").eq("isFeatured", true)
      )
      .take(limit);

    return products.map((product) => ({
      _id: product._id,
      slug: product.slug,
      title: product.title,
      shortTitle: product.shortTitle,
      summary: product.summary,
      mainImage: product.mainImage,
      categoryId: product.categoryId,
    }));
  },
});

export const getProductsHubData = query({
  args: {
    categoryLimit: v.optional(v.number()),
    featuredFamilyLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const categoryLimit = Math.min(args.categoryLimit ?? 8, 20);
    const featuredFamilyLimit = Math.min(args.featuredFamilyLimit ?? 6, 20);

    const [categories, families, products] = await Promise.all([
      ctx.db
        .query("categories")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("productFamilies")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("products")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .collect(),
    ]);

    const visibleRootCategories = categories
      .filter((category) => category.isVisibleInNav && category.level === 0)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .slice(0, categoryLimit);

    const childCategoryIdsByParentId = new Map<string, string[]>();
    for (const category of categories) {
      if (!category.parentId) continue;
      const parentIdKey = category.parentId.toString();
      const childIds = childCategoryIdsByParentId.get(parentIdKey) ?? [];
      childIds.push(category._id.toString());
      childCategoryIdsByParentId.set(parentIdKey, childIds);
    }

    const descendantCategoryIdsByRootId = new Map<string, Set<string>>();
    for (const rootCategory of visibleRootCategories) {
      const rootIdKey = rootCategory._id.toString();
      const visited = new Set<string>([rootIdKey]);
      const queue = [rootIdKey];

      while (queue.length > 0) {
        const currentId = queue.shift();
        if (!currentId) continue;

        const children = childCategoryIdsByParentId.get(currentId) ?? [];
        for (const childId of children) {
          if (visited.has(childId)) continue;
          visited.add(childId);
          queue.push(childId);
        }
      }

      descendantCategoryIdsByRootId.set(rootIdKey, visited);
    }

    const productCountByCategoryId = new Map<string, number>();
    for (const product of products) {
      productCountByCategoryId.set(
        product.categoryId.toString(),
        (productCountByCategoryId.get(product.categoryId.toString()) ?? 0) + 1
      );
    }

    const familyCountByCategoryId = new Map<string, number>();
    for (const family of families) {
      familyCountByCategoryId.set(
        family.categoryId.toString(),
        (familyCountByCategoryId.get(family.categoryId.toString()) ?? 0) + 1
      );
    }

    const productsByFamilyId = new Map<string, number>();
    for (const product of products) {
      productsByFamilyId.set(product.familyId, (productsByFamilyId.get(product.familyId) ?? 0) + 1);
    }

    const firstFamilyImageByCategoryId = new Map<string, string>();
    for (const family of families) {
      const resolvedFamilyHeroImage = resolveFamilyHeroImage(family);
      const familyCategoryIdKey = family.categoryId.toString();
      if (!firstFamilyImageByCategoryId.has(familyCategoryIdKey) && resolvedFamilyHeroImage) {
        firstFamilyImageByCategoryId.set(familyCategoryIdKey, resolvedFamilyHeroImage);
      }
    }

    const categoryLookup = new Map(categories.map((category) => [category._id, category]));

    return {
      categories: visibleRootCategories.map((category) => {
        const categoryIdKey = category._id.toString();
        const descendantIds =
          descendantCategoryIdsByRootId.get(categoryIdKey) ?? new Set<string>([categoryIdKey]);

        let aggregatedFamilyCount = 0;
        let aggregatedProductCount = 0;
        let fallbackImage: string | undefined;

        for (const descendantId of descendantIds) {
          aggregatedFamilyCount += familyCountByCategoryId.get(descendantId) ?? 0;
          aggregatedProductCount += productCountByCategoryId.get(descendantId) ?? 0;
          if (!fallbackImage) {
            fallbackImage = firstFamilyImageByCategoryId.get(descendantId);
          }
        }

        return {
          _id: category._id,
          slug: category.slug,
          name: category.name,
          description:
            category.seoDescription || category.shortDescription || category.description,
          image: category.image || fallbackImage,
          familyCount: aggregatedFamilyCount,
          productCount: aggregatedProductCount,
        };
      }),
      featuredFamilies: families.slice(0, featuredFamilyLimit).map((family) => ({
        _id: family._id,
        slug: family.slug,
        name: family.name,
        summary: family.summary,
        heroImage: resolveFamilyHeroImage(family),
        highlights: family.highlights,
        productCount: productsByFamilyId.get(family._id) ?? 0,
        category: categoryLookup.get(family.categoryId)
          ? {
              slug: categoryLookup.get(family.categoryId)!.slug,
              name: categoryLookup.get(family.categoryId)!.name,
            }
          : null,
      })),
    };
  },
});

// Articles for frontend
export const listLatestArticles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 10, 50);

    const articles = await ctx.db
      .query("articles")
      .withIndex("by_status_publishedAt", (q) =>
        q.eq("status", "published")
      )
      .collect();

    const latestArticles = articles
      .sort((a, b) => {
        const aTime = a.publishedAt ?? a.createdAt;
        const bTime = b.publishedAt ?? b.createdAt;
        return bTime - aTime;
      })
      .slice(0, limit);

    return await attachArticleAuthors(ctx, latestArticles);
  },
});

async function hasCatalogKind(ctx: QueryCtx, kind: string) {
  const state = await ctx.db.query("sitemapCardState")
    .withIndex("by_key", (q) => q.eq("key", "catalog"))
    .unique();
  return state?.completedKinds.includes(kind) ?? false;
}

function lowestBySortOrder<T extends { sortOrder: number }>(
  items: T[],
  idOf: (item: T) => string,
  limit: number,
) {
  const byId = new Map<string, T>();
  for (const item of items) {
    const id = idOf(item);
    if (!byId.has(id)) byId.set(id, item);
  }
  return Array.from(byId.values())
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .slice(0, limit);
}

async function publishedCategoryTreeIds(ctx: QueryCtx, rootId: Id<"categories">) {
  const categoryIds: Array<Id<"categories">> = [rootId];
  const seen = new Set<string>([String(rootId)]);
  const queue: Array<Id<"categories">> = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) continue;
    const children = await ctx.db
      .query("categories")
      .withIndex("by_parentId", (q) => q.eq("parentId", currentId))
      .collect();
    for (const child of children) {
      if (child.status !== "published" || seen.has(String(child._id))) continue;
      seen.add(String(child._id));
      categoryIds.push(child._id);
      queue.push(child._id);
    }
  }

  return categoryIds;
}

function toCategoryProduct(
  product: {
    _id: Id<"products">;
    slug: string;
    title: string;
    shortTitle?: string;
    model?: string;
    skuCode?: string;
    summary?: string;
    mainImage?: string;
    isFeatured?: boolean;
    familyId: Id<"productFamilies">;
    categoryId: Id<"categories">;
    sortOrder: number;
    attributes?: AttributeRecord;
    mediaItems?: VisualMediaItem[];
    gallery?: string[];
  },
  familyAttributes?: AttributeRecord,
): CategoryContentProduct {
  return {
    _id: product._id,
    slug: product.slug,
    title: product.title,
    shortTitle: product.shortTitle,
    model: product.model,
    skuCode: product.skuCode,
    summary: product.summary,
    mainImage: product.mainImage,
    isFeatured: product.isFeatured,
    familyId: product.familyId,
    categoryId: product.categoryId,
    sortOrder: product.sortOrder,
    attributes: mergeAttributes(familyAttributes, product.attributes),
    mediaItems: normalizeMediaItems({
      mediaItems: product.mediaItems,
      primaryUrl: product.mainImage,
      gallery: product.gallery,
    }),
  };
}

export const searchSiteContent = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const keyword = args.query.trim();
    const limit = Math.min(args.limit ?? 8, 20);
    const [visibleCategories, popularFamilies, popularProducts] = await Promise.all([
      ctx.db.query("categories")
        .withIndex("by_status_visible_sortOrder", (q) =>
          q.eq("status", "published").eq("isVisibleInNav", true))
        .take(100),
      ctx.db.query("productFamilies")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .take(4),
      ctx.db.query("products")
        .withIndex("by_status_featured_sortOrder", (q) =>
          q.eq("status", "published").eq("isFeatured", true))
        .take(4),
    ]);
    const popularSuggestions = Array.from(new Set([
      ...visibleCategories.filter((category) => category.level === 0).map((category) => category.name),
      ...popularFamilies.map((family) => family.name),
      ...popularProducts.map((product) => product.title),
    ].filter((value) => value.trim()))).slice(0, 10);

    if (!keyword) {
      return {
        products: [],
        families: [],
        categories: [],
        articles: [],
        suggestions: [],
        popularSuggestions,
      };
    }

    const normalizedKeyword = keyword.toLowerCase();
    const [
      titleMatches,
      modelMatches,
      skuMatches,
      exactSku,
      familyMatches,
      categoryMatches,
      articleMatches,
    ] = await Promise.all([
      ctx.db.query("products")
        .withSearchIndex("search_title", (q) => q.search("title", keyword).eq("status", "published"))
        .take(limit),
      ctx.db.query("products")
        .withSearchIndex("search_model", (q) =>
          q.search("normalizedModel", normalizedKeyword).eq("status", "published"))
        .take(limit),
      ctx.db.query("products")
        .withSearchIndex("search_sku", (q) => q.search("skuCode", keyword).eq("status", "published"))
        .take(limit),
      ctx.db.query("products").withIndex("by_skuCode", (q) => q.eq("skuCode", keyword)).unique(),
      ctx.db.query("productFamilies")
        .withSearchIndex("search_name", (q) => q.search("name", keyword).eq("status", "published"))
        .take(limit),
      ctx.db.query("categories")
        .withSearchIndex("search_name", (q) => q.search("name", keyword).eq("status", "published"))
        .take(limit),
      ctx.db.query("articles")
        .withSearchIndex("search_title", (q) => q.search("title", keyword).eq("status", "published"))
        .take(limit),
    ]);

    const productMatches = Array.from(new Map(
      [...titleMatches, ...modelMatches, ...skuMatches, ...(exactSku?.status === "published" ? [exactSku] : [])]
        .map((product) => [product._id, product]),
    ).values()).slice(0, limit);
    const familyIds = [...new Set(productMatches.map((product) => product.familyId))];
    const categoryIds = [...new Set([
      ...productMatches.map((product) => product.categoryId),
      ...familyMatches.map((family) => family.categoryId),
    ])];
    const [relatedFamilies, relatedCategories] = await Promise.all([
      Promise.all(familyIds.map((familyId) => ctx.db.get(familyId))),
      Promise.all(categoryIds.map((categoryId) => ctx.db.get(categoryId))),
    ]);
    const familyLookup = new Map(
      relatedFamilies.flatMap((family) => family ? [[family._id, family] as const] : []),
    );
    const categoryLookup = new Map(
      relatedCategories.flatMap((category) => category ? [[category._id, category] as const] : []),
    );

    const products = productMatches.map((product) => ({
      _id: product._id,
      slug: product.slug,
      title: product.title,
      shortTitle: product.shortTitle,
      model: product.model,
      skuCode: product.skuCode,
      summary: product.summary,
      mainImage: product.mainImage,
      family: familyLookup.get(product.familyId)
        ? { slug: familyLookup.get(product.familyId)!.slug, name: familyLookup.get(product.familyId)!.name }
        : null,
      category: categoryLookup.get(product.categoryId)
        ? { slug: categoryLookup.get(product.categoryId)!.slug, name: categoryLookup.get(product.categoryId)!.name }
        : null,
    }));
    const families = familyMatches.map((family) => ({
      _id: family._id,
      slug: family.slug,
      name: family.name,
      summary: family.summary,
      heroImage: resolveFamilyHeroImage(family),
      category: categoryLookup.get(family.categoryId)
        ? { slug: categoryLookup.get(family.categoryId)!.slug, name: categoryLookup.get(family.categoryId)!.name }
        : null,
    }));
    const categories = categoryMatches.map((category) => ({
      _id: category._id,
      slug: category.slug,
      name: category.name,
      description: category.shortDescription || category.description,
    }));
    const articles = articleMatches.map((article) => ({
      _id: article._id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      type: article.type,
      publishedAt: article.publishedAt,
    }));
    const suggestions = Array.from(new Set(
      [
        ...products.flatMap((product) => [product.skuCode, product.title, product.shortTitle]),
        ...families.map((family) => family.name),
        ...categories.map((category) => category.name),
        ...articles.map((article) => article.title),
      ].filter((value): value is string => Boolean(value?.toLowerCase().includes(normalizedKeyword))),
    )).slice(0, 8);

    return { products, families, categories, articles, suggestions, popularSuggestions };
  },
});

export const listApplicationArticles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 8, 20);

    const applicationCards = await ctx.db
      .query("articleCards")
      .withIndex("by_type_status", (q) => q.eq("type", "application").eq("status", "published"))
      .collect();

    if (applicationCards.length === 0) {
      const legacyApplications = await ctx.db
        .query("articles")
        .withIndex("by_type_status", (q) =>
          q.eq("type", "application").eq("status", "published")
        )
        .collect();
      return legacyApplications
        .sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt))
        .slice(0, limit)
        .map((item) => ({
          _id: item._id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          coverImage: item.coverImage,
          productCount: item.relatedProductIds?.length ?? 0,
        }));
    }

    const slicedApplications = applicationCards
      .sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt))
      .slice(0, limit);

    return slicedApplications.map((item) => ({
        _id: item.articleId,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        coverImage: item.coverImage,
        productCount: item.relatedProductIds?.length ?? 0,
      }));
  },
});

const sitemapKindValidator = v.union(
  v.literal("category"),
  v.literal("family"),
  v.literal("product"),
  v.literal("article"),
);

const sitemapPageItemValidator = v.object({
  slug: v.string(),
  canonical: v.optional(v.string()),
  updatedAt: v.number(),
  image: v.optional(v.string()),
  mediaItems: v.optional(v.array(v.object({
    url: v.string(),
    alt: v.optional(v.string()),
  }))),
  coverImage: v.optional(v.string()),
  title: v.optional(v.string()),
});

export const listSitemapContentPage = query({
  args: {
    kind: sitemapKindValidator,
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(sitemapPageItemValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.kind === "article") {
      const cardState = await ctx.db.query("sitemapCardState")
        .withIndex("by_key", (q) => q.eq("key", "catalog"))
        .unique();
      const hasCards = cardState?.completedKinds.includes("article") ?? false;
      const page = hasCards
        ? await ctx.db.query("articleCards")
            .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
            .paginate(args.paginationOpts)
        : await ctx.db.query("articles")
            .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
            .paginate(args.paginationOpts);
      return {
        page: page.page.map((article) => ({
          slug: article.slug,
          canonical: article.canonical,
          updatedAt: article.updatedAt,
          coverImage: article.coverImage,
          title: article.title,
        })),
        isDone: page.isDone,
        continueCursor: page.continueCursor,
      };
    }

    const state = await ctx.db.query("sitemapCardState")
      .withIndex("by_key", (q) => q.eq("key", "catalog"))
      .unique();
    if (state?.enabled) {
      const catalogKind = args.kind as "category" | "family" | "product";
      const page = await ctx.db.query("sitemapCards")
        .withIndex("by_entityType_and_status_and_categoryId", (q) =>
          q.eq("entityType", catalogKind).eq("status", "published"))
        .paginate(args.paginationOpts);
      return {
        page: page.page.map((card) => ({
          slug: card.slug,
          canonical: card.canonical,
          updatedAt: card.updatedAt,
          image: card.image,
          mediaItems: card.mediaItems,
        })),
        isDone: page.isDone,
        continueCursor: page.continueCursor,
      };
    }

    if (args.kind === "category") {
      const page = await ctx.db.query("categories")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .paginate(args.paginationOpts);
      return {
        page: page.page.map((category) => ({
          slug: category.slug,
          canonical: category.canonical,
          updatedAt: category.updatedAt,
          image: category.image,
        })),
        isDone: page.isDone,
        continueCursor: page.continueCursor,
      };
    }

    if (args.kind === "family") {
      const page = await ctx.db.query("productFamilies")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .paginate(args.paginationOpts);
      return {
        page: page.page.map((family) => ({
          slug: family.slug,
          canonical: family.canonical,
          updatedAt: family.updatedAt,
          mediaItems: normalizeMediaItems({
            mediaItems: family.mediaItems,
            primaryUrl: resolveFamilyHeroImage(family),
            gallery: family.gallery,
          }).map(({ url, alt }) => ({ url, alt })),
        })),
        isDone: page.isDone,
        continueCursor: page.continueCursor,
      };
    }

    const page = await ctx.db.query("products")
      .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
      .paginate(args.paginationOpts);
    return {
      page: page.page.map((product) => ({
        slug: product.slug,
        canonical: product.canonical,
        updatedAt: product.updatedAt,
        mediaItems: normalizeMediaItems({
          mediaItems: product.mediaItems,
          primaryUrl: product.mainImage,
          gallery: product.gallery,
        }).map(({ url, alt }) => ({ url, alt })),
      })),
      isDone: page.isDone,
      continueCursor: page.continueCursor,
    };
  },
});

// Compact, published-only content used to build the curated /llms.txt index.
// Keep full article and product bodies out of this response so the route stays
// inexpensive even as the catalog grows.
export const listLlmsTxtContent = query({
  args: {},
  handler: async (ctx) => {
    const [categories, families, products, articleCards] = await Promise.all([
      ctx.db
        .query("categories")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("productFamilies")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("products")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("articleCards")
        .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
        .collect(),
    ]);
    const articles = articleCards.length > 0
      ? articleCards
      : await ctx.db
          .query("articles")
          .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
          .collect();

    const familyCountByCategoryId = new Map<string, number>();
    const productCountByCategoryId = new Map<string, number>();
    const productCountByFamilyId = new Map<string, number>();

    for (const family of families) {
      const categoryId = String(family.categoryId);
      familyCountByCategoryId.set(
        categoryId,
        (familyCountByCategoryId.get(categoryId) ?? 0) + 1
      );
    }

    for (const product of products) {
      const categoryId = String(product.categoryId);
      const familyId = String(product.familyId);
      productCountByCategoryId.set(
        categoryId,
        (productCountByCategoryId.get(categoryId) ?? 0) + 1
      );
      productCountByFamilyId.set(
        familyId,
        (productCountByFamilyId.get(familyId) ?? 0) + 1
      );
    }

    return {
      categories: categories.map((category) => ({
        id: String(category._id),
        slug: category.slug,
        title: category.name,
        description:
          category.seoDescription ||
          category.shortDescription ||
          category.description,
        canonical: category.canonical,
        level: category.level,
        isVisibleInNav: category.isVisibleInNav,
        sortOrder: category.sortOrder,
        relatedCount:
          (familyCountByCategoryId.get(String(category._id)) ?? 0) +
          (productCountByCategoryId.get(String(category._id)) ?? 0),
        contentSignalCount:
          Number(Boolean(category.pageConfig)) +
          Number(Boolean(category.description || category.shortDescription)),
        updatedAt: category.updatedAt,
      })),
      families: families.map((family) => ({
        id: String(family._id),
        categoryId: String(family.categoryId),
        slug: family.slug,
        title: family.name,
        description: family.seoDescription || family.summary,
        canonical: family.canonical,
        sortOrder: family.sortOrder,
        relatedCount: productCountByFamilyId.get(String(family._id)) ?? 0,
        contentSignalCount:
          Number(Boolean(family.pageConfig)) +
          Number(Boolean(family.content)) +
          Number(Boolean(family.highlights?.length)),
        updatedAt: family.updatedAt,
      })),
      products: products
        .filter((product) => product.isFeatured)
        .map((product) => ({
          id: String(product._id),
          categoryId: String(product.categoryId),
          familyId: String(product.familyId),
          slug: product.slug,
          title: product.title,
          description: product.seoDescription || product.summary,
          canonical: product.canonical,
          sortOrder: product.sortOrder,
          isFeatured: product.isFeatured,
          contentSignalCount:
            Number(Boolean(product.content)) +
            Number(Boolean(product.featureBullets?.length)) +
            Number(Boolean(product.attributes)),
          updatedAt: product.updatedAt,
        })),
      articles: articles.map((article) => ({
        id: "articleId" in article ? String(article.articleId) : String(article._id),
        slug: article.slug,
        title: article.title,
        description:
          "seoDescription" in article
            ? article.seoDescription || article.excerpt
            : article.excerpt,
        canonical: article.canonical,
        articleType: article.type,
        featured: article.featured ?? false,
        relatedCount:
          (article.relatedCategoryIds?.length ?? 0) +
          (article.relatedFamilyIds?.length ?? 0) +
          (article.relatedProductIds?.length ?? 0),
        contentSignalCount:
          Number(Boolean(article.excerpt)) +
          Number(Boolean(article.coverImage)) +
          Number(Boolean(article.tagNames?.length)),
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
      })),
    };
  },
});

export const listPublicResources = query({
  args: {
    type: v.optional(
      v.union(
        v.literal("catalog"),
        v.literal("datasheet"),
        v.literal("certificate"),
        v.literal("cad"),
        v.literal("manual"),
        v.literal("image")
      )
    ),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);
    let assets = await ctx.db
      .query("assets")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();

    if (args.type) {
      assets = assets.filter((asset) => asset.type === args.type);
    }

    if (args.search) {
      const keyword = args.search.toLowerCase();
      assets = assets.filter((asset) => asset.title.toLowerCase().includes(keyword));
    }

    return await Promise.all(assets.slice(0, limit).map((asset) => resolveAssetUrl(asset)));
  },
});

export const getLocalizedRouteEligibility = query({
  args: {
    locale: v.string(),
    route: localizedEligibilityRouteValidator,
  },
  handler: async (ctx, args) => {
    const source = await resolveLocalizedRouteSource(ctx, args.route);
    if (!source) {
      return buildMissingRouteEligibility(args.locale);
    }

    const localization =
      args.locale === "en"
        ? null
        : await ctx.db
            .query("localizations")
            .withIndex("by_entity_locale", (q) =>
              q
                .eq("entityType", source.entityType)
                .eq("sourceId", source.sourceId)
                .eq("locale", args.locale)
            )
            .unique();

    const localizationStatus: LocalizationStatus =
      args.locale === "en" ? "published" : localization?.status ?? "missing";
    const reasons: string[] = [];

    if (source.sourceStatus !== "published") {
      reasons.push("source_not_published");
    }

    if (args.locale !== "en") {
      if (!localization) {
        reasons.push("translation_missing");
      } else if (localization.status !== "published") {
        reasons.push("translation_not_published");
      }
    }

    return {
      locale: args.locale,
      sourceEntityType: source.entityType,
      sourceId: source.sourceId,
      sourceStatus: source.sourceStatus,
      sourceUpdatedAt: source.sourceUpdatedAt,
      localizationStatus,
      localizedSlug: localization?.localizedSlug ?? null,
      title:
        localization?.title ??
        getLocalizedFieldString(localization, ["title", "name", "headline"]),
      seoTitle:
        localization?.seoTitle ??
        getLocalizedFieldString(localization, ["seoTitle", "metaTitle"]),
      seoDescription:
        localization?.seoDescription ??
        getLocalizedFieldString(localization, ["seoDescription", "metaDescription"]),
      updatedAt: localization?.updatedAt ?? null,
      eligible: reasons.length === 0,
      reasons,
    };
  },
});

// Metadata does not need the product-backed facet counts or related content.
export const getCategoryMetadataBySlug = query({
  args: { slug: v.string() },
  returns: v.union(v.null(), v.object({
    _id: v.id("categories"),
    slug: v.string(),
    name: v.string(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    image: v.optional(v.string()),
    canonical: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    updatedAt: v.number(),
    pageConfig: v.optional(v.object({
      seo: v.optional(v.object({
        metaTitle: v.optional(v.string()),
        metaDescription: v.optional(v.string()),
        canonicalUrl: v.optional(v.string()),
        noindex: v.optional(v.boolean()),
        ogImage: v.optional(v.string()),
      })),
      content: v.optional(v.object({
        summary: v.optional(v.string()),
        heroIntro: v.optional(v.string()),
      })),
    })),
  })),
  handler: async (ctx, args) => {
    const category = await ctx.db.query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!isPublishedCategory(category)) return null;
    return {
      _id: category._id,
      slug: category.slug,
      name: category.name,
      status: category.status,
      description: category.description,
      shortDescription: category.shortDescription,
      image: category.image,
      canonical: category.canonical,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      updatedAt: category.updatedAt,
      pageConfig: category.pageConfig ? {
        seo: category.pageConfig.seo,
        content: category.pageConfig.content ? {
          summary: category.pageConfig.content.summary,
          heroIntro: category.pageConfig.content.heroIntro,
        } : undefined,
      } : undefined,
    };
  },
});

// Get category with children
export const getCategoryWithChildren = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!isPublishedCategory(category)) return null;

    const children = await ctx.db
      .query("categories")
      .withIndex("by_parentId", (q) => q.eq("parentId", category._id))
      .collect();

    return {
      ...category,
      children: children.filter((child) => child.status === "published"),
      resources: await getRelatedAssets(ctx, "category", category._id),
      faqs: await getRelatedFaqs(ctx, "category", category._id),
      filters: await getCategoryFilters(ctx, category._id),
    };
  },
});

// Get products/families in category
export const getCategoryContent = query({
  args: {
    categoryId: v.id("categories"),
    type: v.optional(v.union(v.literal("products"), v.literal("families"), v.literal("all"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const type = args.type ?? "all";
    const category = await ctx.db.get(args.categoryId);
    if (!isPublishedCategory(category)) {
      return { families: [], products: [] };
    }

    const categoryIds = await publishedCategoryTreeIds(ctx, args.categoryId);
    const result: CategoryContentResult = { families: [], products: [] };
    const familyAttributes = new Map<string, AttributeRecord | undefined>();

    if (type === "families" || type === "all") {
      const familyBuckets = await Promise.all(categoryIds.map((categoryId) =>
        ctx.db.query("productFamilies")
          .withIndex("by_categoryId_and_status_and_sortOrder", (q) =>
            q.eq("categoryId", categoryId).eq("status", "published"))
          .take(limit)
      ));
      const families = lowestBySortOrder(familyBuckets.flat(), (family) => family._id, limit);
      for (const family of families) familyAttributes.set(family._id, family.attributes);
      result.families = families.map((family) => ({
        ...omitBrand(family),
        heroImage: resolveFamilyHeroImage(family),
        mediaItems: normalizeMediaItems({
          mediaItems: family.mediaItems,
          primaryUrl: resolveFamilyHeroImage(family),
          gallery: family.gallery,
        }),
      }));
    }

    if (type === "products" || type === "all") {
      const useProductListCards = await hasCatalogKind(ctx, "productList");
      const productBuckets = await Promise.all(categoryIds.map((categoryId) =>
        useProductListCards
          ? ctx.db.query("productListCards")
              .withIndex("by_categoryId_and_status_and_sortOrder", (q) =>
                q.eq("categoryId", categoryId).eq("status", "published"))
              .take(limit)
          : ctx.db.query("products")
              .withIndex("by_categoryId_and_status_and_sortOrder", (q) =>
                q.eq("categoryId", categoryId).eq("status", "published"))
              .take(limit)
      ));
      const products = lowestBySortOrder(
        productBuckets.flat(),
        (product) => "productId" in product ? product.productId : product._id,
        limit,
      );
      const missingFamilyIds = [...new Set(products.map((product) => product.familyId))]
        .filter((familyId) => !familyAttributes.has(familyId));
      if (missingFamilyIds.length > 0) {
        const facetsReady = await hasCatalogKind(ctx, "familyFacets");
        await Promise.all(missingFamilyIds.map(async (familyId) => {
          if (facetsReady) {
            const card = await ctx.db.query("familyFacetCards")
              .withIndex("by_sourceId", (q) => q.eq("sourceId", String(familyId)))
              .unique();
            familyAttributes.set(familyId, card?.attributes);
            return;
          }
          const family = await ctx.db.get(familyId);
          familyAttributes.set(familyId, family?.attributes);
        }));
      }
      result.products = products.map((product) => toCategoryProduct(
        "productId" in product ? { ...product, _id: product.productId } : product,
        familyAttributes.get(product.familyId),
      ));
    }

    return result;
  },
});

// Get product family with products
export const getFamilyWithProducts = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const family = await ctx.db
      .query("productFamilies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!isPublishedFamily(family)) return null;

    const category = await ctx.db.get(family.categoryId);
    if (!isPublishedCategory(category)) return null;

    const useProductListCards = await hasCatalogKind(ctx, "productList");
    const products = useProductListCards
      ? await ctx.db
          .query("productListCards")
          .withIndex("by_familyId_and_status_and_sortOrder", (q) =>
            q.eq("familyId", family._id).eq("status", "published")
          )
          .collect()
      : await ctx.db
          .query("products")
          .withIndex("by_familyId_and_status_and_sortOrder", (q) =>
            q.eq("familyId", family._id).eq("status", "published")
          )
          .collect();

    const resources = await getRelatedAssets(ctx, "family", family._id);
    const linkedRelations = await getLinkedFamilyRelations(ctx, family);

    return {
      ...omitBrand(family),
      mediaItems: normalizeMediaItems({
        mediaItems: family.mediaItems,
        primaryUrl: resolveFamilyHeroImage(family),
        gallery: family.gallery,
      }),
      category,
      resources: sortFamilyResources(
        resources,
        family.pageConfig?.conversion?.downloadsMode,
        family.pageConfig?.conversion?.pinnedDownloadIds
      ),
      faqs: await getRelatedFaqs(ctx, "family", family._id),
      ...linkedRelations,
      products: products
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((product) => ({
          _id: "productId" in product ? product.productId : product._id,
          slug: product.slug,
          skuCode: product.skuCode,
          model: product.model,
          title: product.title,
          shortTitle: product.shortTitle,
          attributes: mergeAttributes(family.attributes, product.attributes),
          moq: product.moq,
          leadTime: product.leadTime,
        })),
    };
  },
});

// Get product detail
export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!product || product.status !== "published") return null;

    const [family, category] = await Promise.all([
      ctx.db.get(product.familyId),
      ctx.db.get(product.categoryId),
    ]);
    if (!isPublishedFamily(family) || !isPublishedCategory(category)) return null;
    const specificationFields = await getTemplateFields(ctx, product.categoryId);
    const variants = await ctx.db
      .query("productVariants")
      .withIndex("by_productId_sortOrder", (q) => q.eq("productId", product._id))
      .collect();
    const selectionRelatedProducts = (
      await Promise.all(
        (product.selectionRelatedProductIds ?? [])
          .slice(0, 2)
          .map((productId) => ctx.db.get(productId))
      )
    ).flatMap((relatedProduct) => {
      if (
        !relatedProduct ||
        relatedProduct.status !== "published" ||
        relatedProduct._id === product._id
      ) {
        return [];
      }

      return [
        {
          _id: relatedProduct._id,
          slug: relatedProduct.slug,
          title: relatedProduct.title,
          shortTitle: relatedProduct.shortTitle,
          model: relatedProduct.model,
        },
      ];
    });

    return {
      ...omitBrand(product),
      attributes: mergeAttributes(family?.attributes, product.attributes),
      mediaItems: normalizeMediaItems({
        mediaItems: product.mediaItems,
        primaryUrl: product.mainImage,
        gallery: product.gallery,
      }),
      family: family ? omitBrand(family) : family,
      category,
      resources: await getRelatedAssets(ctx, "product", product._id),
      faqs: await getRelatedFaqs(ctx, "product", product._id),
      // Loaded through a family-scoped query so products in the same family share
      // the same Convex query cache entry.
      relatedSeries: [],
      selectionRelatedProducts,
      specificationFields,
      variants: variants
        .filter((variant) => variant.status === "published")
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((variant) => ({
          ...variant,
          attributes: mergeVariantAttributes(
            family?.attributes,
            product.attributes,
            variant.attributes
          ),
        })),
    };
  },
});

// Get article by slug
export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!isPublishedArticle(article)) return null;

    const [author, recommendationGroups] = await Promise.all([
      getArticleAuthor(ctx, article),
      article.recommendationGroupIds
        ? Promise.all(article.recommendationGroupIds.map((groupId) => ctx.db.get(groupId)))
        : [],
    ]);

    const resolvedProductIds = resolveRecommendationProductIds(
      recommendationGroups,
      article.relatedProductIds ?? [],
    );
    const relatedProducts = (
      await Promise.all(resolvedProductIds.slice(0, 12).map((productId) => ctx.db.get(productId)))
    )
      .filter(
        (product): product is Doc<"products"> =>
          Boolean(product && product.status === "published"),
      )
      .slice(0, 6)
      .map((product) => omitBrand(product));

    return {
      ...article,
      author,
      relatedProducts,
    };
  },
});

function buildArticleRelationIdSet(article: {
  categoryIds?: unknown[];
  relatedCategoryIds?: unknown[];
  relatedFamilyIds?: unknown[];
  relatedProductIds?: unknown[];
}) {
  return {
    categoryIds: new Set([...(article.categoryIds ?? []), ...(article.relatedCategoryIds ?? [])].map(String)),
    familyIds: new Set((article.relatedFamilyIds ?? []).map(String)),
    productIds: new Set((article.relatedProductIds ?? []).map(String)),
  };
}

function buildArticleTagSet(article: { tagNames?: string[] }) {
  return new Set(
    (article.tagNames ?? [])
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  );
}

function countSetIntersection(left: Set<string>, right: Set<string>) {
  let count = 0;
  for (const value of left) {
    if (right.has(value)) {
      count += 1;
    }
  }
  return count;
}

// Related articles for blog detail page
export const listRelatedArticlesBySlug = query({
  args: {
    slug: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id("articles"),
    slug: v.string(),
    title: v.string(),
    type: v.union(v.literal("blog"), v.literal("guide"), v.literal("faq"), v.literal("application")),
    excerpt: v.optional(v.string()),
    createdAt: v.number(),
    publishedAt: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const targetArticleCard = await ctx.db
      .query("articleCards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    const cardState = await ctx.db.query("sitemapCardState")
      .withIndex("by_key", (q) => q.eq("key", "catalog"))
      .unique();
    const useDerivedData = Boolean(
      targetArticleCard && cardState?.completedKinds.includes("article")
    );
    const targetArticle = targetArticleCard ?? await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!targetArticle || targetArticle.status !== "published") return [];

    const limit = Math.min(Math.max(args.limit ?? 3, 1), 8);
    // Rank a bounded pool of recent cards. The old full scan loaded every
    // published article separately for each blog-detail slug.
    const allPublishedArticles = useDerivedData
      ? Array.from(new Map((await Promise.all([
          ctx.db.query("articleCards")
            .withIndex("by_type_status_publishedAt", (q) =>
              q.eq("type", targetArticle.type).eq("status", "published"))
            .order("desc").take(64),
          ctx.db.query("articleCards")
            .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
            .order("desc").take(32),
        ])).flat().map((card) => [card._id, card])).values())
      : await ctx.db
          .query("articles")
          .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
          .order("desc")
          .take(64);

    const targetRelations = buildArticleRelationIdSet(targetArticle);
    const targetTags = buildArticleTagSet(targetArticle);

    const scoredArticles = allPublishedArticles
      .filter((article) => article.slug !== targetArticle.slug)
      .map((candidate) => {
        const candidateRelations = buildArticleRelationIdSet(candidate);
        const candidateTags = buildArticleTagSet(candidate);

        let score = 0;
        if (candidate.type === targetArticle.type) {
          score += 6;
        }

        score += countSetIntersection(targetTags, candidateTags) * 3;
        score += countSetIntersection(targetRelations.categoryIds, candidateRelations.categoryIds) * 4;
        score += countSetIntersection(targetRelations.familyIds, candidateRelations.familyIds) * 3;
        score += countSetIntersection(targetRelations.productIds, candidateRelations.productIds) * 3;

        if (candidate.featured) {
          score += 1;
        }

        return {
          candidate,
          score,
          timestamp: candidate.updatedAt ?? candidate.publishedAt ?? candidate.createdAt,
        };
      })
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return right.timestamp - left.timestamp;
      });

    const rankedArticles = scoredArticles.filter((item) => item.score > 0).map((item) => item.candidate);
    const fallbackArticles = scoredArticles.filter((item) => item.score <= 0).map((item) => item.candidate);

    return [...rankedArticles, ...fallbackArticles].slice(0, limit).map((article) => ({
      _id: "articleId" in article ? article.articleId : article._id,
      slug: article.slug,
      title: article.title,
      type: article.type,
      excerpt: article.excerpt,
      createdAt: article.createdAt,
      publishedAt: article.publishedAt,
    }));
  },
});

// Navigation for frontend
export const getPublicNavigation = query({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    const menu = await ctx.db
      .query("navMenus")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .unique();

    if (!menu || menu.status !== "published") return [];

    const items = await ctx.db
      .query("navItems")
      .withIndex("by_menu_parent_sort", (q) => q.eq("menuId", menu._id))
      .collect();

    // Build tree structure
    const buildTree = (parentId: string | null = null): PublicNavigationItem[] => {
      return items
        .filter((item) => {
          const itemParentId = item.parentId?.toString() ?? null;
          return itemParentId === parentId;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({
          ...item,
          children: buildTree(item._id.toString()),
        }));
    };

    return buildTree();
  },
});
