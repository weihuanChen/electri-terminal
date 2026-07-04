import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { withCreatedAt, withUpdatedAt } from "../../lib/validators";

export const createAuthor = mutation({
  args: {
    name: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("authors", withCreatedAt(args));
  },
});

export const updateAuthor = mutation({
  args: {
    id: v.id("authors"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Author not found");

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.name !== undefined ? { name: args.name } : {}),
        ...(args.title !== undefined ? { title: args.title } : {}),
        ...(args.description !== undefined ? { description: args.description } : {}),
        ...(args.avatar !== undefined ? { avatar: args.avatar } : {}),
      })
    );

    return args.id;
  },
});

export const deleteAuthor = mutation({
  args: { id: v.id("authors") },
  handler: async (ctx, args) => {
    const author = await ctx.db.get(args.id);
    if (!author) throw new Error("Author not found");

    const linkedArticles = await ctx.db
      .query("articles")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.id))
      .take(1);

    if (linkedArticles.length > 0) {
      throw new Error("Cannot delete author with assigned articles");
    }

    await ctx.db.delete(args.id);
  },
});
