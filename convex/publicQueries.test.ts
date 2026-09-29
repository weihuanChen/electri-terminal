/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const backfillSitemapCards = makeFunctionReference<"mutation">(
  "mutations/admin/sitemapCards:backfillSitemapCards",
);

describe("public Convex queries", () => {
  it("does not expose draft category, family, product, or article records", async () => {
    const t = convexTest(schema, modules);
    const ids = await t.run(async (ctx) => {
      const categoryId = await ctx.db.insert("categories", {
        name: "Draft category",
        slug: "draft-category",
        level: 0,
        path: "/categories/draft-category",
        sortOrder: 1,
        status: "draft",
        isVisibleInNav: false,
        createdAt: 1,
        updatedAt: 1,
      });
      const familyId = await ctx.db.insert("productFamilies", {
        name: "Draft family",
        slug: "draft-family",
        categoryId,
        sortOrder: 1,
        status: "draft",
        createdAt: 1,
        updatedAt: 1,
      });
      await ctx.db.insert("products", {
        skuCode: "DRAFT-1",
        model: "DRAFT-1",
        normalizedModel: "draft-1",
        slug: "draft-product",
        title: "Draft product",
        familyId,
        categoryId,
        status: "draft",
        isFeatured: false,
        sortOrder: 1,
        createdAt: 1,
        updatedAt: 1,
      });
      await ctx.db.insert("products", {
        skuCode: "PUBLISHED-CHILD-1",
        model: "PUBLISHED-CHILD-1",
        normalizedModel: "published-child-1",
        slug: "published-child-of-draft",
        title: "Published child of draft",
        familyId,
        categoryId,
        status: "published",
        isFeatured: false,
        sortOrder: 2,
        createdAt: 1,
        updatedAt: 1,
      });
      await ctx.db.insert("articles", {
        type: "blog",
        title: "Draft article",
        slug: "draft-article",
        content: "Private editorial copy",
        status: "draft",
        createdAt: 1,
        updatedAt: 1,
      });
      return { categoryId, familyId };
    });

    expect(await t.query(api.frontend.getCategoryMetadataBySlug, { slug: "draft-category" })).toBeNull();
    expect(await t.query(api.frontend.getCategoryWithChildren, { slug: "draft-category" })).toBeNull();
    expect(await t.query(api.frontend.getCategoryContent, { categoryId: ids.categoryId })).toEqual({
      families: [], products: [],
    });
    expect(await t.query(api.frontend.getFamilyWithProducts, { slug: "draft-family" })).toBeNull();
    expect(await t.query(api.frontend.getProductBySlug, { slug: "draft-product" })).toBeNull();
    expect(await t.query(api.frontend.getProductBySlug, { slug: "published-child-of-draft" })).toBeNull();
    expect(await t.query(api.frontend.getArticleBySlug, { slug: "draft-article" })).toBeNull();
    expect(await t.query(api.frontend.listRelatedArticlesBySlug, { slug: "draft-article" })).toEqual([]);

    const drafts = await t.query(internal.queries.modules.articles.listArticles, { status: "draft" });
    expect(drafts.map((article) => article.slug)).toEqual(["draft-article"]);
    expect(ids.familyId).toBeDefined();
  });

  it("serves published article cards safely before the backfill marker", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      for (const [slug, status] of [["published-article", "published"], ["draft-article", "draft"]] as const) {
        await ctx.db.insert("articles", {
          type: "guide",
          title: slug,
          slug,
          content: "A short article body",
          status,
          createdAt: 1,
          updatedAt: 1,
        });
      }
    });

    const cards = await t.query(api.queries.modules.articles.listPublicArticleCards, { limit: 10 });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({ slug: "published-article", readingMinutes: 1 });
    expect(cards[0]).not.toHaveProperty("content");
  });

  it("paginates sitemap entries and excludes drafts", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      for (const [slug, status] of [["first", "published"], ["second", "published"], ["draft", "draft"]] as const) {
        await ctx.db.insert("categories", {
          name: slug,
          slug,
          level: 0,
          path: `/categories/${slug}`,
          sortOrder: 1,
          status,
          isVisibleInNav: false,
          createdAt: 1,
          updatedAt: 1,
        });
      }
    });

    const first = await t.query(api.frontend.listSitemapContentPage, {
      kind: "category",
      paginationOpts: { cursor: null, numItems: 1 },
    });
    expect(first.page).toHaveLength(1);
    expect(first.isDone).toBe(false);
    const second = await t.query(api.frontend.listSitemapContentPage, {
      kind: "category",
      paginationOpts: { cursor: first.continueCursor, numItems: 1 },
    });
    expect(second.page).toHaveLength(1);
    expect([...first.page, ...second.page].map((entry) => entry.slug).sort()).toEqual(["first", "second"]);
  });

  it("enables catalog cards only after every backfill kind completes", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      const categoryId = await ctx.db.insert("categories", {
        name: "Terminals", slug: "terminals", level: 0,
        path: "/categories/terminals", sortOrder: 1,
        status: "published", isVisibleInNav: true,
        createdAt: 1, updatedAt: 1,
      });
      const familyId = await ctx.db.insert("productFamilies", {
        name: "Ring terminals", slug: "ring-terminals", categoryId,
        attributes: { material: "copper" }, status: "published",
        sortOrder: 1, createdAt: 1, updatedAt: 1,
      });
      await ctx.db.insert("products", {
        skuCode: "RING-1", model: "RING-1", normalizedModel: "ring-1",
        slug: "ring-terminal", title: "Ring terminal", familyId, categoryId,
        attributes: { wireSize: "2.5" }, status: "published",
        isFeatured: false, sortOrder: 1, createdAt: 1, updatedAt: 1,
      });
    });

    for (const kind of ["category", "family", "product"] as const) {
      const result = await t.mutation(backfillSitemapCards, {
        kind,
        paginationOpts: { cursor: null, numItems: 10 },
      });
      expect(result.isDone).toBe(true);
      expect(result.count).toBe(1);
    }

    const { state, productFacets, familyFacets } = await t.run(async (ctx) => ({
      state: await ctx.db.query("sitemapCardState").first(),
      productFacets: await ctx.db.query("productFacetCards").collect(),
      familyFacets: await ctx.db.query("familyFacetCards").collect(),
    }));
    expect(state?.enabled).toBe(true);
    expect(state?.completedKinds).toContain("productFacets");
    expect(state?.completedKinds).toContain("productList");
    expect(state?.completedKinds).toContain("familyFacets");
    expect(productFacets[0].attributes).toEqual({ wireSize: "2.5" });
    expect(familyFacets[0].attributes).toEqual({ material: "copper" });
    const listCards = await t.run(async (ctx) => ctx.db.query("productListCards").collect());
    expect(listCards[0]).toMatchObject({ slug: "ring-terminal", skuCode: "RING-1" });
    expect(listCards[0]).not.toHaveProperty("content");
  });

  it("returns one bounded published category page, including child products", async () => {
    const t = convexTest(schema, modules);
    const categoryId = await t.run(async (ctx) => {
      const parentId = await ctx.db.insert("categories", {
        name: "Terminals", slug: "terminals", level: 0,
        path: "/categories/terminals", sortOrder: 1,
        status: "published", isVisibleInNav: true, createdAt: 1, updatedAt: 1,
      });
      const childId = await ctx.db.insert("categories", {
        name: "Ring", slug: "ring", parentId, level: 1,
        path: "/categories/ring", sortOrder: 2,
        status: "published", isVisibleInNav: true, createdAt: 1, updatedAt: 1,
      });
      const familyId = await ctx.db.insert("productFamilies", {
        name: "Ring family", slug: "ring-family", categoryId: childId,
        status: "published", sortOrder: 1, createdAt: 1, updatedAt: 1,
      });
      for (const [slug, status, sortOrder] of [
        ["first-product", "published", 1],
        ["second-product", "published", 2],
        ["draft-product", "draft", 0],
      ] as const) {
        await ctx.db.insert("products", {
          skuCode: slug, model: slug, normalizedModel: slug, slug,
          title: slug, familyId, categoryId: childId, content: "full product body",
          status, isFeatured: false, sortOrder, createdAt: 1, updatedAt: 1,
        });
      }
      return parentId;
    });

    const content = await t.query(api.frontend.getCategoryContent, {
      categoryId, type: "products", limit: 1,
    });
    expect(content.products.map((product) => product.slug)).toEqual(["first-product"]);
    expect(content.products[0]).not.toHaveProperty("content");
  });

  it("searches published catalog titles and skips drafts", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      const categoryId = await ctx.db.insert("categories", {
        name: "Ring Terminals", slug: "ring-terminals", level: 0,
        path: "/categories/ring-terminals", sortOrder: 1,
        status: "published", isVisibleInNav: true, createdAt: 1, updatedAt: 1,
      });
      const familyId = await ctx.db.insert("productFamilies", {
        name: "Vinyl Ring", slug: "vinyl-ring", categoryId,
        status: "published", sortOrder: 1, createdAt: 1, updatedAt: 1,
      });
      await ctx.db.insert("products", {
        skuCode: "VR-1", model: "VR-1", normalizedModel: "vr-1",
        slug: "vinyl-ring-product", title: "Vinyl ring product",
        familyId, categoryId, status: "published", isFeatured: true,
        sortOrder: 1, createdAt: 1, updatedAt: 1,
      });
      await ctx.db.insert("products", {
        skuCode: "DR-1", model: "DR-1", normalizedModel: "dr-1",
        slug: "draft-ring-product", title: "Draft vinyl ring",
        familyId, categoryId, status: "draft", isFeatured: false,
        sortOrder: 2, createdAt: 1, updatedAt: 1,
      });
      await ctx.db.insert("articles", {
        type: "guide", title: "Vinyl ring guide", slug: "vinyl-ring-guide",
        content: "A long article body that search must not scan",
        status: "published", createdAt: 1, updatedAt: 1,
      });
    });

    const results = await t.query(api.frontend.searchSiteContent, { query: "vinyl ring", limit: 8 });
    expect(results.products.map((product) => product.slug)).toEqual(["vinyl-ring-product"]);
    expect(results.families.map((family) => family.slug)).toEqual(["vinyl-ring"]);
    expect(results.articles.map((article) => article.slug)).toEqual(["vinyl-ring-guide"]);
    expect(results.articles[0]).not.toHaveProperty("content");
    const empty = await t.query(api.frontend.searchSiteContent, { query: "   ", limit: 8 });
    expect(empty.products).toEqual([]);
    expect(empty.popularSuggestions).toContain("Ring Terminals");
  });

  it("marks article cards ready only after the last article page", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      for (const slug of ["first-article", "second-article"]) {
        await ctx.db.insert("articles", {
          type: "blog", title: slug, slug, status: "published",
          createdAt: 1, updatedAt: 1,
        });
      }
    });

    const first = await t.mutation(internal.mutations.admin.articles.backfillArticleDerivedData, {
      paginationOpts: { cursor: null, numItems: 1 },
    });
    expect(first.isDone).toBe(false);
    expect(await t.run(async (ctx) => ctx.db.query("sitemapCardState").first())).toBeNull();
    const second = await t.mutation(internal.mutations.admin.articles.backfillArticleDerivedData, {
      paginationOpts: { cursor: first.continueCursor, numItems: 1 },
    });
    expect(second.isDone).toBe(true);
    const state = await t.run(async (ctx) => ctx.db.query("sitemapCardState").first());
    expect(state?.completedKinds).toContain("article");
    expect(await t.query(api.queries.modules.articles.listPublicArticleCards, { limit: 10 })).toHaveLength(2);
  });
});
