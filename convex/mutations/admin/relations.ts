import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { withUpdatedAt } from "../../lib/validators";
import { relationEntityType } from "./shared";

const relationValidator = v.object({
  assetId: v.optional(v.id("assets")),
  entityType: relationEntityType,
  entityId: v.string(),
  sortOrder: v.number(),
});

export const updateAssetRelations = mutation({
  args: {
    assetId: v.id("assets"),
    relations: v.array(relationValidator),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) throw new Error("Asset not found");

    const existing = await ctx.db
      .query("assetRelations")
      .withIndex("by_assetId", (q) => q.eq("assetId", args.assetId))
      .collect();

    for (const relation of existing) {
      await ctx.db.delete(relation._id);
    }

    for (const relation of args.relations) {
      await ctx.db.insert("assetRelations", {
        assetId: relation.assetId ?? args.assetId,
        entityType: relation.entityType,
        entityId: relation.entityId,
        sortOrder: relation.sortOrder,
      });
    }

    await ctx.db.patch(args.assetId, withUpdatedAt({}));

    return args.assetId;
  },
});

export const updateFaqRelations = mutation({
  args: {
    articleId: v.id("articles"),
    categoryIds: v.optional(v.array(v.id("categories"))),
    relatedCategoryIds: v.optional(v.array(v.id("categories"))),
    relatedFamilyIds: v.optional(v.array(v.id("productFamilies"))),
    relatedProductIds: v.optional(v.array(v.id("products"))),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("FAQ article not found");
    if (article.type !== "faq") {
      throw new Error("Only FAQ articles support FAQ relations");
    }

    await ctx.db.patch(
      args.articleId,
      withUpdatedAt({
        categoryIds: args.categoryIds ?? [],
        relatedCategoryIds: args.relatedCategoryIds ?? [],
        relatedFamilyIds: args.relatedFamilyIds ?? [],
        relatedProductIds: args.relatedProductIds ?? [],
      })
    );

    return args.articleId;
  },
});
