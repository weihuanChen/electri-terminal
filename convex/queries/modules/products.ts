import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExpandedTemplateFieldsByCategoryId } from "../../lib/attributes";
import { statusCommon } from "./shared";

export const listProductFamilies = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    status: v.optional(statusCommon),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);

    let items = args.categoryId
      ? await ctx.db
          .query("productFamilies")
          .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId!))
          .collect()
      : await ctx.db.query("productFamilies").collect();

    if (args.status) items = items.filter((x) => x.status === args.status);

    items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    return items.slice(0, limit);
  },
});

export const exportProductFamiliesForContent = query({
  args: {
    status: v.optional(statusCommon),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("productFamilies").collect();

    return items
      .filter((item) => !args.status || item.status === args.status)
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      });
  },
});

export const listProducts = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    familyId: v.optional(v.id("productFamilies")),
    status: v.optional(statusCommon),
    isFeatured: v.optional(v.boolean()),
    keyword: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);

    let items = args.familyId
      ? await ctx.db
          .query("products")
          .withIndex("by_familyId", (q) => q.eq("familyId", args.familyId!))
          .collect()
      : args.categoryId
        ? await ctx.db
            .query("products")
            .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId!))
            .collect()
        : await ctx.db.query("products").collect();

    if (args.status) items = items.filter((x) => x.status === args.status);
    if (args.isFeatured !== undefined) {
      items = items.filter((x) => x.isFeatured === args.isFeatured);
    }

    if (args.keyword) {
      const kw = args.keyword.trim().toLowerCase();
      items = items.filter((x) => {
        const haystack = [x.title, x.model, x.normalizedModel, x.skuCode]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(kw);
      });
    }

    items.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    return items.slice(0, limit);
  },
});

export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getProductById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getProductAdminDetailById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    const [category, family, templateFields, variants] = await Promise.all([
      ctx.db.get(product.categoryId),
      ctx.db.get(product.familyId),
      getExpandedTemplateFieldsByCategoryId(ctx, product.categoryId),
      ctx.db
        .query("productVariants")
        .withIndex("by_productId_sortOrder", (q) => q.eq("productId", product._id))
        .collect(),
    ]);

    return {
      product,
      category,
      family,
      templateFields,
      variants: variants.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.itemNo.localeCompare(b.itemNo)
      ),
    };
  },
});

export const getProductFamilyById = query({
  args: { id: v.id("productFamilies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getProductFamilyBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productFamilies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});
