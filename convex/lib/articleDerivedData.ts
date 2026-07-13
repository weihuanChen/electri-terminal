import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

function compactArticle(article: Doc<"articles">) {
  return {
    articleId: article._id,
    type: article.type,
    title: article.title,
    slug: article.slug,
    authorId: article.authorId,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    categoryIds: article.categoryIds,
    tagNames: article.tagNames,
    relatedCategoryIds: article.relatedCategoryIds,
    relatedFamilyIds: article.relatedFamilyIds,
    relatedProductIds: article.relatedProductIds,
    featured: article.featured,
    status: article.status,
    publishedAt: article.publishedAt,
    canonical: article.canonical,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

async function replaceArticleEntityRelations(
  ctx: MutationCtx,
  article: Doc<"articles">
) {
  const existing = await ctx.db
    .query("articleEntityRelations")
    .withIndex("by_articleId", (q) => q.eq("articleId", article._id))
    .collect();
  await Promise.all(existing.map((relation) => ctx.db.delete(relation._id)));

  if (article.type !== "faq" || article.status !== "published") {
    return;
  }

  const relations: Array<{
    entityType: "category" | "family" | "product";
    entityId: string;
  }> = [];
  const seen = new Set<string>();

  const append = (
    entityType: "category" | "family" | "product",
    ids: Array<Id<"categories"> | Id<"productFamilies"> | Id<"products">>
  ) => {
    for (const id of ids) {
      const entityId = String(id);
      const key = `${entityType}:${entityId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      relations.push({ entityType, entityId });
    }
  };

  append("category", [
    ...(article.categoryIds ?? []),
    ...(article.relatedCategoryIds ?? []),
  ]);
  append("family", article.relatedFamilyIds ?? []);
  append("product", article.relatedProductIds ?? []);

  await Promise.all(
    relations.map((relation) =>
      ctx.db.insert("articleEntityRelations", {
        articleId: article._id,
        ...relation,
      })
    )
  );
}

export async function syncArticleDerivedData(
  ctx: MutationCtx,
  article: Doc<"articles">
) {
  const existingCard = await ctx.db
    .query("articleCards")
    .withIndex("by_articleId", (q) => q.eq("articleId", article._id))
    .unique();
  const card = compactArticle(article);

  if (existingCard) {
    await ctx.db.replace(existingCard._id, card);
  } else {
    await ctx.db.insert("articleCards", card);
  }

  await replaceArticleEntityRelations(ctx, article);
}

export async function deleteArticleDerivedData(
  ctx: MutationCtx,
  articleId: Id<"articles">
) {
  const [card, relations] = await Promise.all([
    ctx.db
      .query("articleCards")
      .withIndex("by_articleId", (q) => q.eq("articleId", articleId))
      .unique(),
    ctx.db
      .query("articleEntityRelations")
      .withIndex("by_articleId", (q) => q.eq("articleId", articleId))
      .collect(),
  ]);

  await Promise.all([
    ...(card ? [ctx.db.delete(card._id)] : []),
    ...relations.map((relation) => ctx.db.delete(relation._id)),
  ]);
}
