import { v } from "convex/values";
import { query } from "../../_generated/server";

export const listAuthors = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 100, 300);
    const authors = await ctx.db.query("authors").collect();

    authors.sort((a, b) => a.name.localeCompare(b.name));
    return authors.slice(0, limit);
  },
});

export const getAuthorById = query({
  args: { id: v.id("authors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
