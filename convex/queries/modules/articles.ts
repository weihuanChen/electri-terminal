import { v } from "convex/values";
import { internalQuery, query } from "../../_generated/server";
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

export const listArticles = internalQuery({
  args: {
    type: v.optional(articleType),
    status: v.optional(statusCommon),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);

    let items: Doc<"articles">[];
    if (args.status && args.type) {
      const indexedQuery = ctx.db.query("articles")
        .withIndex("by_type_status_publishedAt", (q) =>
          q.eq("type", args.type!).eq("status", args.status!))
        .order("desc");
      items = args.tag ? await indexedQuery.collect() : await indexedQuery.take(limit);
    } else if (args.status) {
      const indexedQuery = ctx.db.query("articles")
        .withIndex("by_status_publishedAt", (q) => q.eq("status", args.status!))
        .order("desc");
      items = args.tag ? await indexedQuery.collect() : await indexedQuery.take(limit);
    } else if (args.type) {
      const indexedQuery = ctx.db.query("articles")
        .withIndex("by_type_publishedAt", (q) => q.eq("type", args.type!))
        .order("desc");
      items = args.tag ? await indexedQuery.collect() : await indexedQuery.take(limit);
    } else if (args.tag) {
      items = await ctx.db.query("articles").collect();
    } else {
      items = await ctx.db.query("articles")
        .withIndex("by_publishedAt")
        .order("desc")
        .take(limit);
    }
    if (args.type) items = items.filter((x) => x.type === args.type);
    if (args.status) items = items.filter((x) => x.status === args.status);
    if (args.tag) items = items.filter((x) => (x.tagNames ?? []).includes(args.tag!));

    items.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
    return await attachAuthors(ctx, items.slice(0, limit));
  },
});

// Blog cards never need the article body. Keep this separate from the admin
// query, whose callers edit and export complete article documents.
export const listPublicArticleCards = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object({
    _id: v.id("articles"),
    slug: v.string(),
    title: v.string(),
    type: articleType,
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    tagNames: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    publishedAt: v.optional(v.number()),
    updatedAt: v.number(),
    createdAt: v.number(),
    readingMinutes: v.optional(v.number()),
    authorId: v.optional(v.id("authors")),
    author: v.union(v.null(), v.object({
      _id: v.id("authors"),
      name: v.string(),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      avatar: v.optional(v.string()),
    })),
  })),
  handler: async (ctx, args) => {
    const state = await ctx.db.query("sitemapCardState")
      .withIndex("by_key", (q) => q.eq("key", "catalog"))
      .unique();
    const limit = Math.min(Math.max(args.limit ?? 200, 1), 200);
    const cards = state?.completedKinds.includes("article")
      ? await ctx.db.query("articleCards")
          .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
          .order("desc")
          .take(limit)
      : await ctx.db.query("articles")
          .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
          .order("desc")
          .take(limit);
    const authorIds = [...new Set(cards.flatMap((card) => card.authorId ? [card.authorId] : []))];
    const authors = await Promise.all(authorIds.map((id) => ctx.db.get(id)));
    const authorById = new Map(
      authors.filter((author) => author !== null).map((author) => [String(author._id), {
        _id: author._id,
        name: author.name,
        title: author.title,
        description: author.description,
        avatar: author.avatar,
      }])
    );

    return cards.map((card) => ({
      _id: "articleId" in card ? card.articleId : card._id,
      slug: card.slug,
      title: card.title,
      type: card.type,
      excerpt: card.excerpt,
      coverImage: card.coverImage,
      tagNames: card.tagNames,
      featured: card.featured,
      publishedAt: card.publishedAt,
      updatedAt: card.updatedAt,
      createdAt: card.createdAt,
      readingMinutes: "readingMinutes" in card
        ? card.readingMinutes
        : Math.max(1, Math.ceil(
            `${card.title} ${card.excerpt ?? ""} ${"content" in card ? card.content ?? "" : ""}`
              .trim().split(/\s+/).filter(Boolean).length / 220
          )),
      authorId: card.authorId,
      author: card.authorId ? authorById.get(String(card.authorId)) ?? null : null,
    }));
  },
});

export const getArticleBySlug = internalQuery({
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

export const getArticleById = internalQuery({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return null;
    const [articleWithAuthor] = await attachAuthors(ctx, [article]);
    return articleWithAuthor;
  },
});
