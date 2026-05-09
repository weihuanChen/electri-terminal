import { v } from "convex/values";
import { QueryCtx, query } from "../../_generated/server";
import { r2 } from "../../r2Assets";

async function resolveRelationTarget(
  ctx: QueryCtx,
  entityType: string,
  entityId: string
) {
  if (entityType === "category") {
    return await ctx.db.get(entityId);
  }
  if (entityType === "family") {
    return await ctx.db.get(entityId);
  }
  if (entityType === "product") {
    return await ctx.db.get(entityId);
  }
  if (entityType === "article") {
    return await ctx.db.get(entityId);
  }
  return null;
}

async function resolveAssetAccessUrl(asset: { objectKey?: string; fileUrl?: string }) {
  if (asset.objectKey) {
    return await r2.getUrl(asset.objectKey);
  }
  return asset.fileUrl ?? null;
}

export const listAssetsWithRelations = query({
  args: {
    publicOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let assets = await ctx.db.query("assets").collect();
    if (args.publicOnly !== undefined) {
      assets = assets.filter((asset) => asset.isPublic === args.publicOnly);
    }

    assets.sort((a, b) => a.title.localeCompare(b.title));

    return await Promise.all(
      assets.map(async (asset) => {
        const relations = await ctx.db
          .query("assetRelations")
          .withIndex("by_assetId", (q) => q.eq("assetId", asset._id))
          .collect();

        const hydratedRelations = await Promise.all(
          relations
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(async (relation) => ({
              ...relation,
              target: await resolveRelationTarget(ctx, relation.entityType, relation.entityId),
            }))
        );

        return {
          ...asset,
          accessUrl: await resolveAssetAccessUrl(asset),
          relations: hydratedRelations,
        };
      })
    );
  },
});

export const listFaqArticlesWithRelations = query({
  args: {},
  handler: async (ctx) => {
    const faqs = await ctx.db
      .query("articles")
      .withIndex("by_type_status", (q) => q.eq("type", "faq").eq("status", "published"))
      .collect();
    const draftFaqs = await ctx.db
      .query("articles")
      .withIndex("by_type_status", (q) => q.eq("type", "faq").eq("status", "draft"))
      .collect();

    const items = [...faqs, ...draftFaqs].sort((a, b) => a.title.localeCompare(b.title));

    return await Promise.all(
      items.map(async (article) => {
        const [categories, relatedCategories, relatedFamilies, relatedProducts] =
          await Promise.all([
            Promise.all((article.categoryIds ?? []).map((id) => ctx.db.get(id))),
            Promise.all((article.relatedCategoryIds ?? []).map((id) => ctx.db.get(id))),
            Promise.all((article.relatedFamilyIds ?? []).map((id) => ctx.db.get(id))),
            Promise.all((article.relatedProductIds ?? []).map((id) => ctx.db.get(id))),
          ]);

        return {
          ...article,
          categories: categories.filter(Boolean),
          relatedCategories: relatedCategories.filter(Boolean),
          relatedFamilies: relatedFamilies.filter(Boolean),
          relatedProducts: relatedProducts.filter(Boolean),
        };
      })
    );
  },
});

export const getAssetByIdWithRelations = query({
  args: { id: v.id("assets") },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.id);
    if (!asset) return null;

    const relations = await ctx.db
      .query("assetRelations")
      .withIndex("by_assetId", (q) => q.eq("assetId", args.id))
      .collect();

    return {
      ...asset,
      accessUrl: await resolveAssetAccessUrl(asset),
      relations: await Promise.all(
        relations
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(async (relation) => ({
            ...relation,
            target: await resolveRelationTarget(ctx, relation.entityType, relation.entityId),
          }))
      ),
    };
  },
});
