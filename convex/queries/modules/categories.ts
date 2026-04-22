import { v } from "convex/values";
import { query } from "../../_generated/server";
import { statusCommon } from "./shared";

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const listCategories = query({
  args: {
    status: v.optional(statusCommon),
    parentId: v.optional(v.id("categories")),
    isVisibleInNav: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);

    let items = await ctx.db.query("categories").collect();

    if (args.status) items = items.filter((x) => x.status === args.status);
    if (args.parentId !== undefined) {
      items = items.filter((x) => x.parentId === args.parentId);
    }
    if (args.isVisibleInNav !== undefined) {
      items = items.filter((x) => x.isVisibleInNav === args.isVisibleInNav);
    }

    items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    return items.slice(0, limit);
  },
});

export const exportCategoriesForContent = query({
  args: {
    status: v.optional(statusCommon),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("categories").collect();

    return items
      .filter((item) => !args.status || item.status === args.status)
      .sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      });
  },
});

export const getCategoryById = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
