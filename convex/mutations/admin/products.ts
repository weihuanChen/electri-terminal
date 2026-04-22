import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { validateAttributesAgainstCategory } from "../../lib/attributes";
import {
  assertFamilyMatchesCategory,
  assertUniqueProductKey,
  assertUniqueProductSku,
  assertUniqueProductSlug,
  withCreatedAt,
  withUpdatedAt,
} from "../../lib/validators";
import { statusCommon } from "./shared";

const visualMediaType = v.union(
  v.literal("product"),
  v.literal("dimension"),
  v.literal("packaging"),
  v.literal("application")
);

const visualMediaItem = v.object({
  type: visualMediaType,
  url: v.string(),
  alt: v.optional(v.string()),
  sortOrder: v.optional(v.number()),
});

export const createProduct = mutation({
  args: {
    productKey: v.optional(v.string()),
    seriesCode: v.optional(v.string()),
    skuCode: v.string(),
    model: v.string(),
    normalizedModel: v.string(),
    slug: v.string(),
    title: v.string(),
    shortTitle: v.optional(v.string()),
    familyId: v.id("productFamilies"),
    categoryId: v.id("categories"),
    brand: v.optional(v.string()),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    attributes: v.optional(v.record(v.string(), v.any())),
    featureBullets: v.optional(v.array(v.string())),
    mainImage: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),
    mediaItems: v.optional(v.array(visualMediaItem)),
    status: v.optional(statusCommon),
    isFeatured: v.optional(v.boolean()),
    moq: v.optional(v.number()),
    packageInfo: v.optional(v.string()),
    leadTime: v.optional(v.string()),
    origin: v.optional(v.string()),
    searchKeywords: v.optional(v.array(v.string())),
    sortOrder: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.productKey) {
      await assertUniqueProductKey(ctx, args.productKey);
    }
    await assertUniqueProductSku(ctx, args.skuCode);
    await assertUniqueProductSlug(ctx, args.slug);
    await assertFamilyMatchesCategory(ctx, args.familyId, args.categoryId);
    await validateAttributesAgainstCategory(ctx, args.categoryId, args.attributes);

    return await ctx.db.insert(
      "products",
      withCreatedAt({
        ...args,
        status: args.status ?? "draft",
        isFeatured: args.isFeatured ?? false,
        sortOrder: args.sortOrder ?? 0,
      })
    );
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    productKey: v.optional(v.string()),
    seriesCode: v.optional(v.string()),
    skuCode: v.optional(v.string()),
    model: v.optional(v.string()),
    normalizedModel: v.optional(v.string()),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    shortTitle: v.optional(v.string()),
    familyId: v.optional(v.id("productFamilies")),
    categoryId: v.optional(v.id("categories")),
    brand: v.optional(v.string()),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    attributes: v.optional(v.record(v.string(), v.any())),
    featureBullets: v.optional(v.array(v.string())),
    mainImage: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),
    mediaItems: v.optional(v.array(visualMediaItem)),
    status: v.optional(statusCommon),
    isFeatured: v.optional(v.boolean()),
    moq: v.optional(v.number()),
    packageInfo: v.optional(v.string()),
    leadTime: v.optional(v.string()),
    origin: v.optional(v.string()),
    searchKeywords: v.optional(v.array(v.string())),
    sortOrder: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Product not found");

    const nextProductKey = args.productKey ?? current.productKey;
    const nextSku = args.skuCode ?? current.skuCode;
    const nextSlug = args.slug ?? current.slug;
    const nextFamilyId = args.familyId ?? current.familyId;
    const nextCategoryId = args.categoryId ?? current.categoryId;
    if (nextProductKey && nextProductKey !== current.productKey) {
      await assertUniqueProductKey(ctx, nextProductKey, args.id);
    }
    if (nextSku !== current.skuCode) {
      await assertUniqueProductSku(ctx, nextSku, args.id);
    }
    if (nextSlug !== current.slug) {
      await assertUniqueProductSlug(ctx, nextSlug, args.id);
    }

    await assertFamilyMatchesCategory(ctx, nextFamilyId, nextCategoryId);
    await validateAttributesAgainstCategory(ctx, nextCategoryId, args.attributes);

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.skuCode !== undefined ? { skuCode: args.skuCode } : {}),
        ...(args.productKey !== undefined ? { productKey: args.productKey } : {}),
        ...(args.seriesCode !== undefined ? { seriesCode: args.seriesCode } : {}),
        ...(args.model !== undefined ? { model: args.model } : {}),
        ...(args.normalizedModel !== undefined
          ? { normalizedModel: args.normalizedModel }
          : {}),
        ...(args.slug !== undefined ? { slug: args.slug } : {}),
        ...(args.title !== undefined ? { title: args.title } : {}),
        ...(args.shortTitle !== undefined ? { shortTitle: args.shortTitle } : {}),
        ...(args.familyId !== undefined ? { familyId: args.familyId } : {}),
        ...(args.categoryId !== undefined ? { categoryId: args.categoryId } : {}),
        ...(args.brand !== undefined ? { brand: args.brand } : {}),
        ...(args.summary !== undefined ? { summary: args.summary } : {}),
        ...(args.content !== undefined ? { content: args.content } : {}),
        ...(args.attributes !== undefined ? { attributes: args.attributes } : {}),
        ...(args.featureBullets !== undefined
          ? { featureBullets: args.featureBullets }
          : {}),
        ...(args.mainImage !== undefined ? { mainImage: args.mainImage } : {}),
        ...(args.gallery !== undefined ? { gallery: args.gallery } : {}),
        ...(args.mediaItems !== undefined ? { mediaItems: args.mediaItems } : {}),
        ...(args.status !== undefined ? { status: args.status } : {}),
        ...(args.isFeatured !== undefined ? { isFeatured: args.isFeatured } : {}),
        ...(args.moq !== undefined ? { moq: args.moq } : {}),
        ...(args.packageInfo !== undefined ? { packageInfo: args.packageInfo } : {}),
        ...(args.leadTime !== undefined ? { leadTime: args.leadTime } : {}),
        ...(args.origin !== undefined ? { origin: args.origin } : {}),
        ...(args.searchKeywords !== undefined
          ? { searchKeywords: args.searchKeywords }
          : {}),
        ...(args.sortOrder !== undefined ? { sortOrder: args.sortOrder } : {}),
        ...(args.seoTitle !== undefined ? { seoTitle: args.seoTitle } : {}),
        ...(args.seoDescription !== undefined
          ? { seoDescription: args.seoDescription }
          : {}),
        ...(args.canonical !== undefined ? { canonical: args.canonical } : {}),
      })
    );

    return args.id;
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    // Products can be deleted without dependency checks
    // since they are leaf nodes in the hierarchy
    await ctx.db.delete(args.id);
  },
});

export const bulkUpdateProducts = mutation({
  args: {
    ids: v.array(v.id("products")),
    updates: v.object({
      status: v.optional(statusCommon),
      isFeatured: v.optional(v.boolean()),
      categoryId: v.optional(v.id("categories")),
    }),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const updateData: {
        status?: "draft" | "published" | "archived";
        isFeatured?: boolean;
        categoryId?: typeof args.updates.categoryId;
      } = {};
      if (args.updates.status !== undefined) {
        updateData.status = args.updates.status;
      }
      if (args.updates.isFeatured !== undefined) {
        updateData.isFeatured = args.updates.isFeatured;
      }
      if (args.updates.categoryId !== undefined) {
        updateData.categoryId = args.updates.categoryId;
      }
      await ctx.db.patch(id, withUpdatedAt(updateData));
    }
  },
});
