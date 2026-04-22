import { v } from "convex/values";
import { query } from "../../_generated/server";
import { articleType, statusCommon } from "./shared";

export const listArticles = query({
  args: {
    type: v.optional(articleType),
    status: v.optional(statusCommon),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);

    let items = await ctx.db.query("articles").collect();
    if (args.type) items = items.filter((x) => x.type === args.type);
    if (args.status) items = items.filter((x) => x.status === args.status);
    if (args.tag) items = items.filter((x) => (x.tagNames ?? []).includes(args.tag!));

    items.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
    return items.slice(0, limit);
  },
});

export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getArticleById = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
