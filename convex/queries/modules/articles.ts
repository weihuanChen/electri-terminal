import { v } from "convex/values";
import { query } from "../../_generated/server";
import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { articleType, statusCommon } from "./shared";

type PublicAuthor = Pick<
  Doc<"authors">,
  "_id" | "name" | "title" | "description" | "avatar"
>;

async function attachAuthors(ctx: QueryCtx, articles: Doc<"articles">[]) {
  const authorIds = Array.from(
    new Set(
      articles.flatMap((article) => (article.authorId ? [article.authorId] : []))
    )
  ) as Id<"authors">[];

  const authors = await Promise.all(authorIds.map((authorId) => ctx.db.get(authorId)));
  const authorById = new Map<string, PublicAuthor>(
    authors
      .filter((author): author is Doc<"authors"> => Boolean(author))
      .map((author) => [
        String(author._id),
        {
          _id: author._id,
          name: author.name,
          title: author.title,
          description: author.description,
          avatar: author.avatar,
        },
      ])
  );

  return articles.map((article) => ({
    ...article,
    author: article.authorId ? authorById.get(String(article.authorId)) ?? null : null,
  }));
}

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
    return await attachAuthors(ctx, items.slice(0, limit));
  },
});

export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!article) return null;
    const [articleWithAuthor] = await attachAuthors(ctx, [article]);
    return articleWithAuthor;
  },
});

export const getArticleById = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return null;
    const [articleWithAuthor] = await attachAuthors(ctx, [article]);
    return articleWithAuthor;
  },
});
