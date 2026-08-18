import { v } from "convex/values";
import { query } from "../../_generated/server";
import {
  getExpandedTemplateFieldsByCategoryId,
  getExpandedTemplateFieldsByTemplateId,
} from "../../lib/attributes";
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

export const getProductFormOptions = query({
  args: {},
  handler: async (ctx) => {
    const [categories, families, products, templates] = await Promise.all([
      ctx.db.query("categories").take(200),
      ctx.db.query("productFamilies").take(200),
      ctx.db.query("products").take(200),
      ctx.db.query("attributeTemplates").take(200),
    ]);
    const templatesWithFields = await Promise.all(
      templates.map(async (template) => ({
        _id: template._id,
        name: template.name,
        categoryId: template.categoryId,
        status: template.status,
        fields: (await getExpandedTemplateFieldsByTemplateId(ctx, template._id)).map(
          (field) => ({
            fieldKey: field.fieldKey,
            label: field.label,
            fieldType: field.fieldType,
            displayPrecision: field.displayPrecision,
            filterMode: field.filterMode,
            unitKey: field.unitKey,
            unit: field.unit,
            options: field.options,
            isRequired: field.isRequired,
            isFilterable: field.isFilterable,
            isSearchable: field.isSearchable,
            isVisibleOnFrontend: field.isVisibleOnFrontend,
            sortOrder: field.sortOrder,
            groupName: field.groupName,
            helpText: field.helpText,
          })
        ),
      }))
    );

    return {
      categories: categories
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        .map((category) => ({ _id: category._id, name: category.name })),
      families: families
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        .map((family) => ({
          _id: family._id,
          name: family.name,
          categoryId: family.categoryId,
          attributes: family.attributes,
        })),
      products: products
        .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
        .map((product) => ({
          _id: product._id,
          title: product.title,
          shortTitle: product.shortTitle,
          slug: product.slug,
          familyId: product.familyId,
          status: product.status,
        })),
      attributeTemplates: templatesWithFields.sort((a, b) => a.name.localeCompare(b.name)),
    };
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
