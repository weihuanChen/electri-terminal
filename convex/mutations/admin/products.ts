import { v } from "convex/values";
import { mutation, type MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
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
import { markChangedSourceLocalizationsStale } from "../../lib/localizationStale";

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

const MAX_SELECTION_TIP_LENGTH = 320;
const MAX_SELECTION_RELATED_PRODUCTS = 2;

async function validateSelectionGuidance(
  ctx: MutationCtx,
  args: {
    productId?: Id<"products">;
    familyId: Id<"productFamilies">;
    selectionTip?: string;
    selectionRelatedProductIds?: Id<"products">[];
  }
) {
  if ((args.selectionTip?.length ?? 0) > MAX_SELECTION_TIP_LENGTH) {
    throw new Error(`Selection tip must be ${MAX_SELECTION_TIP_LENGTH} characters or fewer`);
  }

  if (args.selectionRelatedProductIds === undefined) return;

  const uniqueIds = new Set(args.selectionRelatedProductIds);
  if (uniqueIds.size !== args.selectionRelatedProductIds.length) {
    throw new Error("Selection related products must be unique");
  }
  if (uniqueIds.size > MAX_SELECTION_RELATED_PRODUCTS) {
    throw new Error(`Select at most ${MAX_SELECTION_RELATED_PRODUCTS} related products`);
  }
  if (args.productId && uniqueIds.has(args.productId)) {
    throw new Error("A product cannot link to itself as selection guidance");
  }

  for (const relatedProductId of args.selectionRelatedProductIds) {
    const relatedProduct = await ctx.db.get(relatedProductId);
    if (!relatedProduct) {
      throw new Error("Selection related product not found");
    }
    if (relatedProduct.familyId !== args.familyId) {
      throw new Error("Selection related products must belong to the same family");
    }
  }
}

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
    selectionTip: v.optional(v.string()),
    selectionRelatedProductIds: v.optional(v.array(v.id("products"))),
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
    await validateSelectionGuidance(ctx, {
      familyId: args.familyId,
      selectionTip: args.selectionTip,
      selectionRelatedProductIds: args.selectionRelatedProductIds,
    });

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
    selectionTip: v.optional(v.string()),
    selectionRelatedProductIds: v.optional(v.array(v.id("products"))),
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
    await validateSelectionGuidance(ctx, {
      productId: args.id,
      familyId: nextFamilyId,
      selectionTip: args.selectionTip,
      selectionRelatedProductIds:
        args.selectionRelatedProductIds ??
        (args.familyId !== undefined ? current.selectionRelatedProductIds : undefined),
    });

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
        ...(args.selectionTip !== undefined ? { selectionTip: args.selectionTip } : {}),
        ...(args.selectionRelatedProductIds !== undefined
          ? { selectionRelatedProductIds: args.selectionRelatedProductIds }
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

    await markChangedSourceLocalizationsStale({
      ctx,
      entityType: "product",
      sourceId: String(args.id),
      current,
      updates: args,
      translatableFieldKeys: ["title", "shortTitle", "summary", "content", "featureBullets", "selectionTip", "seoTitle", "seoDescription"],
    });

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
