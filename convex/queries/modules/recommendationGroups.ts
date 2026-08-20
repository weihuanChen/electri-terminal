import { v } from "convex/values";
import { query } from "../../_generated/server";
import type { Doc, Id } from "../../_generated/dataModel";
import { statusCommon } from "./shared";

function sortGroups(
  a: Doc<"productRecommendationGroups">,
  b: Doc<"productRecommendationGroups">,
) {
  return a.sortOrder - b.sortOrder || a.code.localeCompare(b.code);
}

export const listRecommendationGroups = query({
  args: {
    status: v.optional(statusCommon),
  },
  handler: async (ctx, args) => {
    const [groups, articles] = await Promise.all([
      ctx.db.query("productRecommendationGroups").collect(),
      ctx.db.query("articles").collect(),
    ]);

    const usageByGroupId = new Map<string, number>();
    for (const article of articles) {
      for (const groupId of article.recommendationGroupIds ?? []) {
        const key = String(groupId);
        usageByGroupId.set(key, (usageByGroupId.get(key) ?? 0) + 1);
      }
    }

    return groups
      .filter((group) => !args.status || group.status === args.status)
      .sort(sortGroups)
      .map((group) => ({
        ...group,
        usageCount: usageByGroupId.get(String(group._id)) ?? 0,
      }));
  },
});

export const getRecommendationGroupById = query({
  args: { id: v.id("productRecommendationGroups") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getRecommendationGroupFormOptions = query({
  args: {},
  handler: async (ctx) => {
    const [families, products] = await Promise.all([
      ctx.db.query("productFamilies").collect(),
      ctx.db.query("products").collect(),
    ]);

    return {
      families: families
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        .map((family) => ({
          _id: family._id,
          name: family.name,
          slug: family.slug,
        })),
      products: products
        .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
        .map((product) => ({
          _id: product._id,
          familyId: product.familyId,
          title: product.title,
          shortTitle: product.shortTitle,
          slug: product.slug,
          model: product.model,
          skuCode: product.skuCode,
          status: product.status,
          mainImage: product.mainImage,
        })),
    };
  },
});

export const listPublishedRecommendationGroupsByIds = query({
  args: { ids: v.array(v.id("productRecommendationGroups")) },
  handler: async (ctx, args) => {
    const groups = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    return groups.filter(
      (group): group is Doc<"productRecommendationGroups"> =>
        Boolean(group && group.status === "published"),
    );
  },
});

export type RecommendationGroupId = Id<"productRecommendationGroups">;
