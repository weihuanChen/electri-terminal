import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getFamilySearchText, getRelatedSeriesRule } from "./relatedSeries";

type SitemapCard = Omit<Doc<"sitemapCards">, "_id" | "_creationTime">;

function collectImages(
  primary: string | undefined,
  mediaItems: Array<{ url: string; alt?: string }> | undefined,
  gallery: string[] | undefined,
) {
  const seen = new Set<string>();
  return [
    ...(primary ? [{ url: primary }] : []),
    ...(mediaItems ?? []),
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

export async function removeSitemapCard(ctx: MutationCtx, sourceId: string) {
  const current = await ctx.db.query("sitemapCards")
    .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
    .unique();
  if (current) await ctx.db.delete(current._id);
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

export async function syncFamilySitemapCard(ctx: MutationCtx, family: Doc<"productFamilies">) {
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
}

export async function syncProductSitemapCard(ctx: MutationCtx, product: Doc<"products">) {
  await upsert(ctx, {
    sourceId: String(product._id),
    entityType: "product",
    status: product.status,
    slug: product.slug,
    canonical: product.canonical,
    updatedAt: product.updatedAt,
    mediaItems: collectImages(product.mainImage, product.mediaItems, product.gallery),
  });
}
