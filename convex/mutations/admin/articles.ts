import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import {
  assertUniqueArticleSlug,
  withCreatedAt,
  withUpdatedAt,
} from "../../lib/validators";
import {
  deleteArticleDerivedData,
  syncArticleDerivedData,
} from "../../lib/articleDerivedData";
import { articleType, statusCommon } from "./shared";

export const createArticle = mutation({
  args: {
    type: articleType,
    title: v.string(),
    slug: v.string(),
    authorId: v.optional(v.id("authors")),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    content: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id("categories"))),
    tagNames: v.optional(v.array(v.string())),
    relatedCategoryIds: v.optional(v.array(v.id("categories"))),
    relatedFamilyIds: v.optional(v.array(v.id("productFamilies"))),
    relatedProductIds: v.optional(v.array(v.id("products"))),
    featured: v.optional(v.boolean()),
    status: v.optional(statusCommon),
    publishedAt: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertUniqueArticleSlug(ctx, args.slug);

    const articleId = await ctx.db.insert(
      "articles",
      withCreatedAt({
        ...args,
        status: args.status ?? "draft",
      })
    );
    const article = await ctx.db.get(articleId);
    if (!article) throw new Error("Created article not found");
    await syncArticleDerivedData(ctx, article);
    return articleId;
  },
});

export const updateArticle = mutation({
  args: {
    id: v.id("articles"),
    type: v.optional(articleType),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    authorId: v.optional(v.id("authors")),
    clearAuthor: v.optional(v.boolean()),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    content: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id("categories"))),
    tagNames: v.optional(v.array(v.string())),
    relatedCategoryIds: v.optional(v.array(v.id("categories"))),
    relatedFamilyIds: v.optional(v.array(v.id("productFamilies"))),
    relatedProductIds: v.optional(v.array(v.id("products"))),
    featured: v.optional(v.boolean()),
    status: v.optional(statusCommon),
    publishedAt: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Article not found");

    if (args.slug && args.slug !== current.slug) {
      await assertUniqueArticleSlug(ctx, args.slug, args.id);
    }

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.type !== undefined ? { type: args.type } : {}),
        ...(args.title !== undefined ? { title: args.title } : {}),
        ...(args.slug !== undefined ? { slug: args.slug } : {}),
        ...(args.authorId !== undefined
          ? { authorId: args.authorId }
          : args.clearAuthor
            ? { authorId: undefined }
            : {}),
        ...(args.excerpt !== undefined ? { excerpt: args.excerpt } : {}),
        ...(args.coverImage !== undefined ? { coverImage: args.coverImage } : {}),
        ...(args.content !== undefined ? { content: args.content } : {}),
        ...(args.categoryIds !== undefined ? { categoryIds: args.categoryIds } : {}),
        ...(args.tagNames !== undefined ? { tagNames: args.tagNames } : {}),
        ...(args.relatedCategoryIds !== undefined
          ? { relatedCategoryIds: args.relatedCategoryIds }
          : {}),
        ...(args.relatedFamilyIds !== undefined
          ? { relatedFamilyIds: args.relatedFamilyIds }
          : {}),
        ...(args.relatedProductIds !== undefined
          ? { relatedProductIds: args.relatedProductIds }
          : {}),
        ...(args.featured !== undefined ? { featured: args.featured } : {}),
        ...(args.status !== undefined ? { status: args.status } : {}),
        ...(args.publishedAt !== undefined ? { publishedAt: args.publishedAt } : {}),
        ...(args.seoTitle !== undefined ? { seoTitle: args.seoTitle } : {}),
        ...(args.seoDescription !== undefined
          ? { seoDescription: args.seoDescription }
          : {}),
        ...(args.canonical !== undefined ? { canonical: args.canonical } : {}),
      })
    );

    const updated = await ctx.db.get(args.id);
    if (!updated) throw new Error("Updated article not found");
    await syncArticleDerivedData(ctx, updated);

    return args.id;
  },
});

export const deleteArticle = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new Error("Article not found");

    // Articles can be deleted without dependency checks
    await deleteArticleDerivedData(ctx, args.id);
    await ctx.db.delete(args.id);
  },
});

export const bulkUpdateArticles = mutation({
  args: {
    ids: v.array(v.id("articles")),
    updates: v.object({
      status: v.optional(statusCommon),
      type: v.optional(articleType),
    }),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const updateData: {
        status?: "draft" | "published" | "archived";
        type?: "blog" | "guide" | "faq" | "application";
      } = {};
      if (args.updates.status !== undefined) {
        updateData.status = args.updates.status;
      }
      if (args.updates.type !== undefined) {
        updateData.type = args.updates.type;
      }
      await ctx.db.patch(id, withUpdatedAt(updateData));
      const updated = await ctx.db.get(id);
      if (updated) {
        await syncArticleDerivedData(ctx, updated);
      }
    }
  },
});

export const backfillArticleDerivedData = mutation({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    for (const article of articles) {
      await syncArticleDerivedData(ctx, article);
    }
    return { synced: articles.length };
  },
});
