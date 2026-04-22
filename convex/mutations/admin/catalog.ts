import { Id } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
import { r2 } from "../../r2Assets";

const CATALOG_RELATION_TYPES = new Set(["category", "family", "product"]);

export const resetCatalogData = mutation({
  args: {},
  handler: async (ctx) => {
    const summary = {
      productVariants: 0,
      products: 0,
      families: 0,
      categories: 0,
      attributeFields: 0,
      attributeTemplates: 0,
      attributeDefinitions: 0,
      assetRelations: 0,
      assets: 0,
    };

    const productVariants = await ctx.db.query("productVariants").collect();
    for (const variant of productVariants) {
      await ctx.db.delete(variant._id);
      summary.productVariants += 1;
    }

    const products = await ctx.db.query("products").collect();
    for (const product of products) {
      await ctx.db.delete(product._id);
      summary.products += 1;
    }

    const families = await ctx.db.query("productFamilies").collect();
    for (const family of families) {
      await ctx.db.delete(family._id);
      summary.families += 1;
    }

    const categories = await ctx.db.query("categories").collect();
    categories.sort((a, b) => b.level - a.level);
    for (const category of categories) {
      await ctx.db.delete(category._id);
      summary.categories += 1;
    }

    const attributeFields = await ctx.db.query("attributeFields").collect();
    for (const field of attributeFields) {
      await ctx.db.delete(field._id);
      summary.attributeFields += 1;
    }

    const attributeTemplates = await ctx.db.query("attributeTemplates").collect();
    for (const template of attributeTemplates) {
      await ctx.db.delete(template._id);
      summary.attributeTemplates += 1;
    }

    const attributeDefinitions = await ctx.db.query("attributeDefinitions").collect();
    for (const definition of attributeDefinitions) {
      await ctx.db.delete(definition._id);
      summary.attributeDefinitions += 1;
    }

    const assetRelations = await ctx.db.query("assetRelations").collect();
    const catalogAssetIds = new Set<Id<"assets">>();
    for (const relation of assetRelations) {
      if (CATALOG_RELATION_TYPES.has(relation.entityType)) {
        await ctx.db.delete(relation._id);
        catalogAssetIds.add(relation.assetId);
        summary.assetRelations += 1;
      }
    }

    for (const assetId of catalogAssetIds) {
      const remainingRelations = await ctx.db
        .query("assetRelations")
        .withIndex("by_assetId", (q) => q.eq("assetId", assetId))
        .collect();
      if (remainingRelations.length > 0) {
        continue;
      }
      const asset = await ctx.db.get(assetId);
      if (!asset) {
        continue;
      }
      if (asset.objectKey) {
        await r2.deleteObject(ctx, asset.objectKey);
      }
      await ctx.db.delete(asset._id);
      summary.assets += 1;
    }

    return summary;
  },
});
