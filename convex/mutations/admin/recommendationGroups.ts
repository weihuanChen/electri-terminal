import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { withCreatedAt, withUpdatedAt } from "../../lib/validators";
import { statusCommon } from "./shared";

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function requiredText(value: string, error: string) {
  const normalized = value.trim();
  if (!normalized) throw new Error(error);
  return normalized;
}

async function assertUniqueCode(
  ctx: MutationCtx,
  code: string,
  excludeId?: Id<"productRecommendationGroups">,
) {
  const existing = await ctx.db
    .query("productRecommendationGroups")
    .withIndex("by_code", (q) => q.eq("code", code))
    .unique();
  if (existing && existing._id !== excludeId) {
    throw new Error(`recommendation_group_code_exists:${code}`);
  }
}

async function validateProducts(
  ctx: MutationCtx,
  productIds: Id<"products">[],
) {
  if (productIds.length === 0) {
    throw new Error("recommendation_group_products_required");
  }
  if (new Set(productIds.map(String)).size !== productIds.length) {
    throw new Error("recommendation_group_products_duplicate");
  }

  const products = await Promise.all(productIds.map((id) => ctx.db.get(id)));
  if (products.some((product) => !product)) {
    throw new Error("recommendation_group_product_not_found");
  }
}

export const createRecommendationGroup = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    productIds: v.array(v.id("products")),
    status: v.optional(statusCommon),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const code = normalizeCode(args.code);
    const name = requiredText(args.name, "recommendation_group_name_required");
    if (!code) throw new Error("recommendation_group_code_required");
    await Promise.all([
      assertUniqueCode(ctx, code),
      validateProducts(ctx, args.productIds),
    ]);

    return ctx.db.insert(
      "productRecommendationGroups",
      withCreatedAt({
        code,
        name,
        description: args.description?.trim() || undefined,
        productIds: args.productIds,
        status: args.status ?? "draft",
        sortOrder: args.sortOrder ?? 0,
      }),
    );
  },
});

export const updateRecommendationGroup = mutation({
  args: {
    id: v.id("productRecommendationGroups"),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    productIds: v.array(v.id("products")),
    status: statusCommon,
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("recommendation_group_not_found");

    const code = normalizeCode(args.code);
    const name = requiredText(args.name, "recommendation_group_name_required");
    if (!code) throw new Error("recommendation_group_code_required");
    await Promise.all([
      assertUniqueCode(ctx, code, args.id),
      validateProducts(ctx, args.productIds),
    ]);

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        code,
        name,
        description: args.description?.trim() || undefined,
        productIds: args.productIds,
        status: args.status,
        sortOrder: args.sortOrder,
      }),
    );
    return args.id;
  },
});

export const deleteRecommendationGroup = mutation({
  args: { id: v.id("productRecommendationGroups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.id);
    if (!group) throw new Error("recommendation_group_not_found");

    const articles = await ctx.db.query("articles").collect();
    const usageCount = articles.filter((article) =>
      article.recommendationGroupIds?.includes(args.id),
    ).length;
    if (usageCount > 0) {
      throw new Error(`recommendation_group_in_use:${usageCount}`);
    }

    await ctx.db.delete(args.id);
  },
});
