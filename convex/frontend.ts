import { v } from "convex/values";
import { query } from "./_generated/server";
import { getExpandedTemplateFieldsByCategoryId } from "./lib/attributes";
import {
  DEFAULT_CONTACT_SETTINGS,
  normalizeContactSettings,
  SITE_SETTINGS_GLOBAL_KEY,
} from "./lib/siteSettings";
import { r2 } from "./r2Assets";

type VisualMediaType = "product" | "dimension" | "packaging" | "application";

type VisualMediaItem = {
  type: VisualMediaType;
  url: string;
  alt?: string;
  sortOrder?: number;
};

type AttributeFilterMode = "exact" | "range_bucket";

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

async function resolveAssetUrl(asset: any) {
  if (!asset) return asset;
  const accessUrl = asset.objectKey ? await r2.getUrl(asset.objectKey) : asset.fileUrl;
  return {
    ...asset,
    fileUrl: accessUrl ?? asset.fileUrl,
    previewImage: asset.previewImage,
  };
}

async function getRelatedAssets(ctx: any, entityType: "category" | "family" | "product", entityId: string) {
  const relations = await ctx.db
    .query("assetRelations")
    .withIndex("by_entityType_entityId", (q: any) => q.eq("entityType", entityType).eq("entityId", entityId))
    .collect();

  const assets = await Promise.all(
    relations
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      .map(async (relation: any) => ctx.db.get(relation.assetId))
  );

  const publicAssets = assets.filter((asset: any) => asset && asset.isPublic);
  return await Promise.all(publicAssets.map((asset: any) => resolveAssetUrl(asset)));
}

function sortFamilyResources(
  resources: any[],
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

async function getRelatedFaqs(ctx: any, entityType: "category" | "family" | "product", entityId: string) {
  const articles = await ctx.db
    .query("articles")
    .withIndex("by_type_status", (q: any) => q.eq("type", "faq").eq("status", "published"))
    .collect();

  return articles.filter((article: any) => {
    if (entityType === "category") {
      return (article.relatedCategoryIds ?? []).some((id: any) => id === entityId);
    }
    if (entityType === "family") {
      return (article.relatedFamilyIds ?? []).some((id: any) => id === entityId);
    }
    return (article.relatedProductIds ?? []).some((id: any) => id === entityId);
  });
}

async function getLinkedFamilyRelations(ctx: any, family: any) {
  const linking = family.pageConfig?.linking;
  const [relatedCategories, relatedFamilies, relatedArticles] = await Promise.all([
    linking?.relatedCategoryIds?.length
      ? Promise.all(linking.relatedCategoryIds.map((id: any) => ctx.db.get(id)))
      : [],
    linking?.relatedFamilyIds?.length
      ? Promise.all(linking.relatedFamilyIds.map((id: any) => ctx.db.get(id)))
      : [],
    linking?.relatedArticleIds?.length
      ? Promise.all(linking.relatedArticleIds.map((id: any) => ctx.db.get(id)))
      : [],
  ]);

  return {
    relatedCategories: relatedCategories
      .filter((item: any) => item && item.status === "published")
      .map((item: any) => ({
        _id: item._id,
        name: item.name,
        slug: item.slug,
      })),
    relatedFamilies: relatedFamilies
      .filter((item: any) => item && item.status === "published" && item._id !== family._id)
      .map((item: any) => ({
        _id: item._id,
        name: item.name,
        slug: item.slug,
      })),
    relatedArticles: relatedArticles
      .filter((item: any) => item && item.status === "published" && item.type !== "faq")
      .map((item: any) => ({
        _id: item._id,
        title: item.title,
        slug: item.slug,
        type: item.type,
      })),
  };
}

async function getTemplateFields(ctx: any, categoryId: string) {
  const fields = await getExpandedTemplateFieldsByCategoryId(ctx, categoryId);
  return fields.filter((field) => field.isVisibleOnFrontend);
}

function mergeAttributes(
  familyAttributes?: Record<string, any>,
  productAttributes?: Record<string, any>
) {
  return {
    ...(familyAttributes ?? {}),
    ...(productAttributes ?? {}),
  };
}

function mergeVariantAttributes(
  familyAttributes?: Record<string, any>,
  productAttributes?: Record<string, any>,
  variantAttributes?: Record<string, any>
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

async function getCategoryFilters(ctx: any, categoryId: string) {
  const [fields, products, families] = await Promise.all([
    getTemplateFields(ctx, categoryId),
    ctx.db
      .query("products")
      .withIndex("by_categoryId", (q: any) => q.eq("categoryId", categoryId))
      .collect(),
    ctx.db
      .query("productFamilies")
      .withIndex("by_categoryId", (q: any) => q.eq("categoryId", categoryId))
      .collect(),
  ]);

  const publishedProducts = products.filter((item: any) => item.status === "published");
  const familyMap = new Map(families.map((family: any) => [family._id, family]));

  return fields
    .filter((field: any) => field.isFilterable)
    .map((field: any) => {
      const filterMode = getFilterMode(field);
      if (filterMode === "range_bucket") {
        const numericValues = publishedProducts.flatMap((product) => {
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
        });

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
    .filter((group: any) => group.options.length > 0);
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
      .withIndex("by_status_sortOrder", (q) =>
        q.eq("status", "published")
      )
      .take(limit);

    return categories.filter((cat) => cat.isVisibleInNav);
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
      .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
      .collect();

    return products
      .filter((product) => product.isFeatured)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, limit)
      .map((product) => omitBrand(product));
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
      .take(limit);

    return articles.sort((a, b) => {
      const aTime = a.publishedAt ?? a.createdAt;
      const bTime = b.publishedAt ?? b.createdAt;
      return bTime - aTime;
    }).slice(0, limit);
  },
});

export const searchSiteContent = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const keyword = args.query.trim();
    const limit = Math.min(args.limit ?? 8, 20);

    const [allProducts, allFamilies, allCategories, allArticles] = await Promise.all([
      ctx.db
        .query("products")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("productFamilies")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("categories")
        .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("articles")
        .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
        .collect(),
    ]);

    const buildSuggestions = (queryText: string) => {
      const normalized = queryText.toLowerCase();
      const suggestionCandidates = [
        ...allProducts.flatMap((product) => [
          { value: product.title, type: "product" as const },
          { value: product.skuCode, type: "sku" as const },
        ]),
        ...allFamilies.map((family) => ({ value: family.name, type: "family" as const })),
        ...allCategories.map((category) => ({ value: category.name, type: "category" as const })),
        ...allArticles.map((article) => ({ value: article.title, type: "article" as const })),
      ].filter(
        (candidate): candidate is {
          value: string;
          type: "product" | "sku" | "family" | "category" | "article";
        } =>
          Boolean(candidate.value?.trim())
      );

      const priorityByType = {
        sku: 0,
        product: 1,
        family: 2,
        category: 3,
        article: 4,
      };

      return Array.from(
        new Map(
          suggestionCandidates.map((candidate) => [
            candidate.value.trim().toLowerCase(),
            { value: candidate.value.trim(), type: candidate.type },
          ])
        ).values()
      )
        .filter((candidate) => candidate.value.toLowerCase().includes(normalized))
        .sort((left, right) => {
          const leftPriority = priorityByType[left.type];
          const rightPriority = priorityByType[right.type];
          if (leftPriority !== rightPriority) {
            return leftPriority - rightPriority;
          }

          const leftStartsWith = left.value.toLowerCase().startsWith(normalized) ? 0 : 1;
          const rightStartsWith = right.value.toLowerCase().startsWith(normalized) ? 0 : 1;
          if (leftStartsWith !== rightStartsWith) {
            return leftStartsWith - rightStartsWith;
          }

          if (left.value.length !== right.value.length) {
            return left.value.length - right.value.length;
          }

          return left.value.localeCompare(right.value);
        })
        .map((candidate) => candidate.value)
        .slice(0, 8);
    };

    const popularSuggestions = [
      ...allCategories
        .filter((category) => category.isVisibleInNav && category.level === 0)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((category) => category.name),
      ...allFamilies.slice(0, 4).map((family) => family.name),
      ...allProducts.filter((product) => product.isFeatured).slice(0, 4).map((product) => product.title),
    ]
      .filter((value): value is string => Boolean(value?.trim()))
      .slice(0, 10);

    if (!keyword) {
      return {
        products: [],
        families: [],
        categories: [],
        articles: [],
        suggestions: [],
        popularSuggestions: Array.from(new Set(popularSuggestions)),
      };
    }

    const normalizedKeyword = keyword.toLowerCase();

    const [
      productTitleMatches,
      productModelMatches,
      articleTitleMatches,
    ] =
      await Promise.all([
        ctx.db
          .query("products")
          .withSearchIndex("search_title", (q) =>
            q.search("title", keyword).eq("status", "published")
          )
          .take(limit),
        ctx.db
          .query("products")
          .withSearchIndex("search_model", (q) =>
            q.search("normalizedModel", normalizedKeyword).eq("status", "published")
          )
          .take(limit),
        ctx.db
          .query("articles")
          .withSearchIndex("search_title", (q) =>
            q.search("title", keyword).eq("status", "published")
          )
          .take(limit),
      ]);

    const familyLookup = new Map(allFamilies.map((family) => [family._id, family]));
    const categoryLookup = new Map(allCategories.map((category) => [category._id, category]));

    const products = Array.from(
      new Map(
        [...productTitleMatches, ...productModelMatches, ...allProducts].map((product) => [
          product._id,
          product,
        ])
      ).values()
    )
      .filter((product) => {
        const haystack = [
          product.title,
          product.shortTitle,
          product.model,
          product.skuCode,
          ...(product.searchKeywords ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedKeyword);
      })
      .slice(0, limit)
      .map((product) => ({
        _id: product._id,
        slug: product.slug,
        title: product.title,
        shortTitle: product.shortTitle,
        model: product.model,
        skuCode: product.skuCode,
        summary: product.summary,
        mainImage: product.mainImage,
        family: familyLookup.get(product.familyId)
          ? {
              slug: familyLookup.get(product.familyId)!.slug,
              name: familyLookup.get(product.familyId)!.name,
            }
          : null,
        category: categoryLookup.get(product.categoryId)
          ? {
              slug: categoryLookup.get(product.categoryId)!.slug,
              name: categoryLookup.get(product.categoryId)!.name,
            }
          : null,
      }));

    const familyResults = allFamilies
      .filter((family) => {
        const haystack = [family.name, family.summary]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedKeyword);
      })
      .slice(0, limit)
      .map((family) => ({
        _id: family._id,
        slug: family.slug,
        name: family.name,
        summary: family.summary,
        heroImage: resolveFamilyHeroImage(family),
        category: categoryLookup.get(family.categoryId)
          ? {
              slug: categoryLookup.get(family.categoryId)!.slug,
              name: categoryLookup.get(family.categoryId)!.name,
            }
          : null,
      }));

    const categoryResults = allCategories
      .filter((category) => {
        const haystack = [category.name, category.shortDescription, category.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedKeyword);
      })
      .slice(0, 6)
      .map((category) => ({
        _id: category._id,
        slug: category.slug,
        name: category.name,
        description: category.shortDescription || category.description,
      }));

    const articleResults = Array.from(
      new Map(
        [...articleTitleMatches, ...allArticles]
          .filter((article) => {
            const haystack = [article.title, article.excerpt, article.content]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return haystack.includes(normalizedKeyword);
          })
          .map((article) => [article._id, article])
      ).values()
    )
      .slice(0, limit)
      .map((article) => ({
      _id: article._id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      type: article.type,
      publishedAt: article.publishedAt,
    }));

    return {
      products,
      families: familyResults,
      categories: categoryResults,
      articles: articleResults,
      suggestions: buildSuggestions(keyword),
      popularSuggestions: Array.from(new Set(popularSuggestions)),
    };
  },
});

export const listApplicationArticles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 8, 20);

    const applications = await ctx.db
      .query("articles")
      .withIndex("by_type_status", (q) => q.eq("type", "application").eq("status", "published"))
      .collect();

    return applications
      .sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt))
      .slice(0, limit)
      .map((item) => ({
        ...item,
        productCount: item.relatedProductIds?.length ?? 0,
      }));
  },
});

export const listSitemapContent = query({
  args: {},
  handler: async (ctx) => {
    const [categories, families, products, articles] = await Promise.all([
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
        .query("articles")
        .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
        .collect(),
    ]);

    return {
      categories: categories.map((category) => ({
        slug: category.slug,
        canonical: category.canonical,
        updatedAt: category.updatedAt,
        image: category.image,
      })),
      families: families.map((family) => ({
        slug: family.slug,
        canonical: family.canonical,
        updatedAt: family.updatedAt,
        mediaItems: normalizeMediaItems({
          mediaItems: family.mediaItems,
          primaryUrl: resolveFamilyHeroImage(family),
          gallery: family.gallery,
        }).map((item) => ({
          url: item.url,
          alt: item.alt,
        })),
      })),
      products: products.map((product) => ({
        slug: product.slug,
        canonical: product.canonical,
        updatedAt: product.updatedAt,
        mediaItems: normalizeMediaItems({
          mediaItems: product.mediaItems,
          primaryUrl: product.mainImage,
          gallery: product.gallery,
        }).map((item) => ({
          url: item.url,
          alt: item.alt,
        })),
      })),
      articles: articles.map((article) => ({
        slug: article.slug,
        canonical: article.canonical,
        updatedAt: article.updatedAt,
        coverImage: article.coverImage,
        title: article.title,
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
        v.literal("manual")
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

// Get category with children
export const getCategoryWithChildren = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!category) return null;

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
    const visitedCategoryIds = new Set<string>([args.categoryId.toString()]);
    const categoryIdsToQuery = [args.categoryId];
    const queue = [args.categoryId];

    // Include descendants so parent category pages can show all related families/products.
    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) continue;

      const children = await ctx.db
        .query("categories")
        .withIndex("by_parentId", (q) => q.eq("parentId", currentId))
        .collect();

      for (const child of children) {
        if (child.status !== "published") continue;
        const childIdKey = child._id.toString();
        if (visitedCategoryIds.has(childIdKey)) continue;

        visitedCategoryIds.add(childIdKey);
        categoryIdsToQuery.push(child._id);
        queue.push(child._id);
      }
    }

    const result = {
      families: [],
      products: [],
    };

    if (type === "families" || type === "all") {
      const familyBuckets = await Promise.all(
        categoryIdsToQuery.map((categoryId) =>
          ctx.db
            .query("productFamilies")
            .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
            .collect()
        )
      );

      const familyMapById = new Map<string, (typeof familyBuckets)[number][number]>();
      for (const family of familyBuckets.flat()) {
        familyMapById.set(family._id.toString(), family);
      }

      result.families = Array.from(familyMapById.values())
        .filter((f) => f.status === "published")
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, limit)
        .map((family) => ({
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
      const familiesByCategory = await Promise.all(
        categoryIdsToQuery.map((categoryId) =>
          ctx.db
            .query("productFamilies")
            .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
            .collect()
        )
      );

      const families = familiesByCategory.flat();
      const familyMap = new Map(families.map((family) => [family._id, family]));

      const productBuckets = await Promise.all(
        categoryIdsToQuery.map((categoryId) =>
          ctx.db
            .query("products")
            .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
            .collect()
        )
      );

      const productMapById = new Map<string, (typeof productBuckets)[number][number]>();
      for (const product of productBuckets.flat()) {
        productMapById.set(product._id.toString(), product);
      }

      result.products = Array.from(productMapById.values())
        .filter((p) => p.status === "published")
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, limit)
        .map((product) => ({
          ...omitBrand(product),
          attributes: mergeAttributes(
            familyMap.get(product.familyId)?.attributes,
            product.attributes
          ),
          mediaItems: normalizeMediaItems({
            mediaItems: product.mediaItems,
            primaryUrl: product.mainImage,
            gallery: product.gallery,
          }),
        }));
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

    if (!family) return null;

    const products = await ctx.db
      .query("products")
      .withIndex("by_familyId", (q) => q.eq("familyId", family._id))
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
      category: await ctx.db.get(family.categoryId),
      resources: sortFamilyResources(
        resources,
        family.pageConfig?.conversion?.downloadsMode,
        family.pageConfig?.conversion?.pinnedDownloadIds
      ),
      faqs: await getRelatedFaqs(ctx, "family", family._id),
      ...linkedRelations,
      products: products
        .filter((p) => p.status === "published")
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((product) => ({
          ...omitBrand(product),
          attributes: mergeAttributes(family.attributes, product.attributes),
          mediaItems: normalizeMediaItems({
            mediaItems: product.mediaItems,
            primaryUrl: product.mainImage,
            gallery: product.gallery,
          }),
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

    if (!product) return null;

    // Get family info
    const family = await ctx.db.get(product.familyId);
    // Get category info
    const category = await ctx.db.get(product.categoryId);
    const specificationFields = await getTemplateFields(ctx, product.categoryId);
    const variants = await ctx.db
      .query("productVariants")
      .withIndex("by_productId_sortOrder", (q) => q.eq("productId", product._id))
      .collect();

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

    if (!article) return null;

    const relatedProducts = article.relatedProductIds
      ? (
          await Promise.all(article.relatedProductIds.map((productId) => ctx.db.get(productId)))
        ).filter(Boolean).map((product) => omitBrand(product))
      : [];

    const relatedFamilies = article.relatedFamilyIds
      ? (
          await Promise.all(article.relatedFamilyIds.map((familyId) => ctx.db.get(familyId)))
        ).filter(Boolean).map((family) => omitBrand(family))
      : [];

    return {
      ...article,
      relatedProducts,
      relatedFamilies,
    };
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
    const buildTree = (parentId: string | null = null) => {
      return items
        .filter((item) => {
          const itemParentId = item.parentId?._id.toString() || null;
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
