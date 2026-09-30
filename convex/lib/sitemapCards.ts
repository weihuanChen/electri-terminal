import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { categoryPlacement, noteCatalogPlacement } from "./catalogStats";
import { getFamilySearchText, getRelatedSeriesRule } from "./relatedSeries";

type SyncOptions = { deferAggregates?: boolean };

type FacetGroup = {
  id: string;
  label: string;
  type: "checkbox" | "radio";
  options: Array<{ label: string; value: string; count: number }>;
};

type SitemapCard = Omit<Doc<"sitemapCards">, "_id" | "_creationTime">;

function collectImages(
  primary: string | undefined,
  mediaItems: Array<{ url: string; alt?: string }> | undefined,
  gallery: string[] | undefined,
) {
  const seen = new Set<string>();
  return [
    ...(primary ? [{ url: primary }] : []),
    ...(mediaItems ?? []).map((item) => ({
      url: item.url,
      ...(item.alt ? { alt: item.alt } : {}),
    })),
    ...(gallery ?? []).map((url) => ({ url })),
  ].filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

async function upsert(ctx: MutationCtx, card: SitemapCard) {
  const current = await ctx.db.query("sitemapCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", card.sourceId))
    .unique();
  if (current) {
    await ctx.db.replace(current._id, card);
  } else {
    await ctx.db.insert("sitemapCards", card);
  }
}

async function refreshCategoryFacetSummary(ctx: MutationCtx, categoryId: Id<"categories">) {
  const groups: FacetGroup[] = await ctx.runQuery(internal.frontend.computeCategoryFilters, {
    categoryId,
  });
  const current = await ctx.db.query("categoryFacetSummaries")
    .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
    .unique();
  if (current) await ctx.db.replace(current._id, { categoryId, groups });
  else await ctx.db.insert("categoryFacetSummaries", { categoryId, groups });
}

export async function refreshAllCategoryFacetSummaries(ctx: MutationCtx) {
  for await (const category of ctx.db.query("categories")) {
    await refreshCategoryFacetSummary(ctx, category._id);
  }
}

export async function removeSitemapCard(ctx: MutationCtx, sourceId: string) {
  const current = await ctx.db.query("sitemapCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
    .unique();
  const productList = await ctx.db.query("productListCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
    .unique();
  if (productList?.status === "published") {
    await noteCatalogPlacement(ctx, {
      categoryId: String(productList.categoryId),
      familyId: String(productList.familyId),
      status: productList.status,
    }, null, "product");
  } else if (current?.entityType === "family" && current.status === "published" && current.categoryId) {
    await noteCatalogPlacement(ctx, categoryPlacement(current.categoryId, current.status), null, "family");
  }
  if (current) await ctx.db.delete(current._id);
  const productFacet = await ctx.db.query("productFacetCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
    .unique();
  if (productFacet) await ctx.db.delete(productFacet._id);
  const familyFacet = await ctx.db.query("familyFacetCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
    .unique();
  if (familyFacet) await ctx.db.delete(familyFacet._id);
  const listed = await ctx.db.query("productListCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
    .unique();
  if (listed) await ctx.db.delete(listed._id);
  const categoryId = productList?.categoryId ?? current?.categoryId;
  if (categoryId) await refreshCategoryFacetSummary(ctx, categoryId);
}

export async function syncCategorySitemapCard(ctx: MutationCtx, category: Doc<"categories">) {
  await upsert(ctx, {
    sourceId: String(category._id),
    entityType: "category",
    status: category.status,
    slug: category.slug,
    canonical: category.canonical,
    updatedAt: category.updatedAt,
    image: category.image,
  });
}

export async function syncFamilySitemapCard(
  ctx: MutationCtx,
  family: Doc<"productFamilies">,
  options?: SyncOptions,
) {
  const previous = await ctx.db.query("sitemapCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", String(family._id)))
    .unique();
  const mediaItems = collectImages(
    family.manualHeroImage ?? family.heroImage,
    family.mediaItems,
    family.gallery,
  );
  await upsert(ctx, {
    sourceId: String(family._id),
    entityType: "family",
    status: family.status,
    slug: family.slug,
    canonical: family.canonical,
    updatedAt: family.updatedAt,
    mediaItems,
    familyId: family._id,
    categoryId: family.categoryId,
    name: family.name,
    summary: family.summary,
    sortOrder: family.sortOrder,
    image: family.manualHeroImage ?? family.heroImage ?? mediaItems[0]?.url,
    seriesLabel: getRelatedSeriesRule(family)?.label,
    isRingSeries: getFamilySearchText(family).includes("ring terminal"),
  });
  const facet = await ctx.db.query("familyFacetCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", String(family._id)))
    .unique();
  const facetData = {
    sourceId: String(family._id),
    familyId: family._id,
    categoryId: family.categoryId,
    status: family.status,
    attributes: family.attributes,
  };
  if (facet) await ctx.db.replace(facet._id, facetData);
  else await ctx.db.insert("familyFacetCards", facetData);
  if (!options?.deferAggregates) {
    await noteCatalogPlacement(
      ctx,
      previous?.categoryId ? categoryPlacement(previous.categoryId, previous.status) : null,
      categoryPlacement(
        family.categoryId,
        family.status,
        family.manualHeroImage ?? family.heroImage ?? family.gallery?.[0],
      ),
      "family",
    );
    await refreshCategoryFacetSummary(ctx, family.categoryId);
    if (previous?.categoryId && previous.categoryId !== family.categoryId) {
      await refreshCategoryFacetSummary(ctx, previous.categoryId);
    }
  }
}

export async function syncProductSitemapCard(
  ctx: MutationCtx,
  product: Doc<"products">,
  options?: SyncOptions,
) {
  const previousList = await ctx.db.query("productListCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", String(product._id)))
    .unique();
  await upsert(ctx, {
    sourceId: String(product._id),
    entityType: "product",
    status: product.status,
    slug: product.slug,
    canonical: product.canonical,
    updatedAt: product.updatedAt,
    mediaItems: collectImages(product.mainImage, product.mediaItems, product.gallery),
  });
  const facet = await ctx.db.query("productFacetCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", String(product._id)))
    .unique();
  const facetData = {
    sourceId: String(product._id),
    familyId: product.familyId,
    categoryId: product.categoryId,
    status: product.status,
    attributes: product.attributes,
  };
  if (facet) await ctx.db.replace(facet._id, facetData);
  else await ctx.db.insert("productFacetCards", facetData);

  const listCard = {
    sourceId: String(product._id),
    productId: product._id,
    familyId: product.familyId,
    categoryId: product.categoryId,
    status: product.status,
    sortOrder: product.sortOrder,
    slug: product.slug,
    skuCode: product.skuCode,
    model: product.model,
    title: product.title,
    shortTitle: product.shortTitle,
    summary: product.summary,
    mainImage: product.mainImage,
    isFeatured: product.isFeatured,
    attributes: product.attributes,
    moq: product.moq,
    leadTime: product.leadTime,
  };
  if (previousList) await ctx.db.replace(previousList._id, listCard);
  else await ctx.db.insert("productListCards", listCard);
  if (!options?.deferAggregates) {
    await noteCatalogPlacement(
      ctx,
      previousList
        ? {
            categoryId: String(previousList.categoryId),
            familyId: String(previousList.familyId),
            status: previousList.status,
          }
        : null,
      {
        categoryId: String(product.categoryId),
        familyId: String(product.familyId),
        status: product.status,
      },
      "product",
    );
    await refreshCategoryFacetSummary(ctx, product.categoryId);
    if (previousList && previousList.categoryId !== product.categoryId) {
      await refreshCategoryFacetSummary(ctx, previousList.categoryId);
    }
  }
}
