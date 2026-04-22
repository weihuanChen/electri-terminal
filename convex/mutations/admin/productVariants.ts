import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { validateAttributesAgainstCategory } from "../../lib/attributes";
import {
  assertUniqueProductVariantItemNo,
  assertUniqueProductVariantSku,
  getProductOrThrow,
  withCreatedAt,
  withUpdatedAt,
} from "../../lib/validators";
import { statusCommon } from "./shared";

export const createProductVariant = mutation({
  args: {
    productId: v.id("products"),
    skuCode: v.string(),
    itemNo: v.string(),
    attributes: v.optional(v.record(v.string(), v.any())),
    status: v.optional(statusCommon),
    moq: v.optional(v.number()),
    packageInfo: v.optional(v.string()),
    leadTime: v.optional(v.string()),
    origin: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await getProductOrThrow(ctx, args.productId);

    await assertUniqueProductVariantSku(ctx, args.skuCode);
    await assertUniqueProductVariantItemNo(ctx, args.productId, args.itemNo);
    await validateAttributesAgainstCategory(ctx, product.categoryId, args.attributes);

    return await ctx.db.insert(
      "productVariants",
      withCreatedAt({
        ...args,
        status: args.status ?? "draft",
        sortOrder: args.sortOrder ?? 0,
      })
    );
  },
});

export const updateProductVariant = mutation({
  args: {
    id: v.id("productVariants"),
    productId: v.optional(v.id("products")),
    skuCode: v.optional(v.string()),
    itemNo: v.optional(v.string()),
    attributes: v.optional(v.record(v.string(), v.any())),
    status: v.optional(statusCommon),
    moq: v.optional(v.number()),
    packageInfo: v.optional(v.string()),
    leadTime: v.optional(v.string()),
    origin: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Product variant not found");

    const nextProductId = args.productId ?? current.productId;
    const nextSkuCode = args.skuCode ?? current.skuCode;
    const nextItemNo = args.itemNo ?? current.itemNo;
    const product = await getProductOrThrow(ctx, nextProductId);

    if (nextSkuCode !== current.skuCode) {
      await assertUniqueProductVariantSku(ctx, nextSkuCode, args.id);
    }

    if (nextProductId !== current.productId || nextItemNo !== current.itemNo) {
      await assertUniqueProductVariantItemNo(
        ctx,
        nextProductId,
        nextItemNo,
        args.id
      );
    }

    await validateAttributesAgainstCategory(
      ctx,
      product.categoryId,
      args.attributes
    );

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.productId !== undefined ? { productId: args.productId } : {}),
        ...(args.skuCode !== undefined ? { skuCode: args.skuCode } : {}),
        ...(args.itemNo !== undefined ? { itemNo: args.itemNo } : {}),
        ...(args.attributes !== undefined ? { attributes: args.attributes } : {}),
        ...(args.status !== undefined ? { status: args.status } : {}),
        ...(args.moq !== undefined ? { moq: args.moq } : {}),
        ...(args.packageInfo !== undefined ? { packageInfo: args.packageInfo } : {}),
        ...(args.leadTime !== undefined ? { leadTime: args.leadTime } : {}),
        ...(args.origin !== undefined ? { origin: args.origin } : {}),
        ...(args.sortOrder !== undefined ? { sortOrder: args.sortOrder } : {}),
      })
    );

    return args.id;
  },
});

export const deleteProductVariant = mutation({
  args: { id: v.id("productVariants") },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.id);
    if (!variant) throw new Error("Product variant not found");

    await ctx.db.delete(args.id);
  },
});

export const bulkUpdateProductVariants = mutation({
  args: {
    ids: v.array(v.id("productVariants")),
    updates: v.object({
      status: v.optional(statusCommon),
      productId: v.optional(v.id("products")),
    }),
  },
  handler: async (ctx, args) => {
    let nextProductCategoryId:
      | Awaited<ReturnType<typeof getProductOrThrow>>["categoryId"]
      | undefined;

    if (args.updates.productId !== undefined) {
      const product = await getProductOrThrow(ctx, args.updates.productId);
      nextProductCategoryId = product.categoryId;
    }

    for (const id of args.ids) {
      const current = await ctx.db.get(id);
      if (!current) {
        throw new Error(`Product variant not found: ${id}`);
      }

      if (args.updates.productId !== undefined) {
        await assertUniqueProductVariantItemNo(
          ctx,
          args.updates.productId,
          current.itemNo,
          id
        );
        await validateAttributesAgainstCategory(
          ctx,
          nextProductCategoryId!,
          current.attributes
        );
      }

      const updateData: {
        status?: "draft" | "published" | "archived";
        productId?: typeof args.updates.productId;
      } = {};

      if (args.updates.status !== undefined) {
        updateData.status = args.updates.status;
      }
      if (args.updates.productId !== undefined) {
        updateData.productId = args.updates.productId;
      }

      await ctx.db.patch(id, withUpdatedAt(updateData));
    }
  },
});

export const createProductVariantsBatch = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        skuCode: v.string(),
        itemNo: v.string(),
        attributes: v.optional(v.record(v.string(), v.any())),
        status: v.optional(statusCommon),
        moq: v.optional(v.number()),
        packageInfo: v.optional(v.string()),
        leadTime: v.optional(v.string()),
        origin: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const createdIds = [];
    const productCache = new Map<string, Awaited<ReturnType<typeof getProductOrThrow>>>();

    for (const item of args.items) {
      const productKey = String(item.productId);
      let product = productCache.get(productKey);
      if (!product) {
        product = await getProductOrThrow(ctx, item.productId);
        productCache.set(productKey, product);
      }

      await assertUniqueProductVariantSku(ctx, item.skuCode);
      await assertUniqueProductVariantItemNo(ctx, item.productId, item.itemNo);
      await validateAttributesAgainstCategory(
        ctx,
        product.categoryId,
        item.attributes
      );

      const id = await ctx.db.insert(
        "productVariants",
        withCreatedAt({
          ...item,
          status: item.status ?? "draft",
          sortOrder: item.sortOrder ?? 0,
        })
      );
      createdIds.push(id);
    }

    return createdIds;
  },
});
