import { v } from "convex/values";
import { mutation, type MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import {
  getExpandedTemplateFieldsByCategoryId,
  validateAttributesAgainstCategory,
  type ExpandedAttributeField,
} from "../../lib/attributes";
import {
  assertUniqueProductVariantItemNo,
  assertUniqueProductVariantSku,
  getProductOrThrow,
  nowTs,
  withCreatedAt,
  withUpdatedAt,
} from "../../lib/validators";
import { statusCommon } from "./shared";

type ProductVariantImportItem = {
  productSlug: string;
  skuCode: string;
  itemNo: string;
  attributes?: Record<string, unknown>;
  status?: "draft" | "published" | "archived";
  moq?: number;
  packageInfo?: string;
  leadTime?: string;
  origin?: string;
  sortOrder?: number;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getReadableErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "unknown_error";
}

function parseRangeString(rawValue: string, fieldKey: string) {
  const value = rawValue.trim();
  if (!value) return undefined;

  const between = value.match(/^(-?\d+(?:\.\d+)?)\s*[-~]\s*(-?\d+(?:\.\d+)?)$/);
  if (between) {
    const left = Number(between[1]);
    const right = Number(between[2]);
    if (Number.isFinite(left) && Number.isFinite(right)) {
      return [Math.min(left, right), Math.max(left, right)] as [number, number];
    }
  }

  const single = value.match(/^(-?\d+(?:\.\d+)?)$/);
  if (single) {
    const numeric = Number(single[1]);
    if (Number.isFinite(numeric)) {
      return [numeric, numeric] as [number, number];
    }
  }

  if (fieldKey === "awg_range") {
    return undefined;
  }

  return undefined;
}

function normalizeAttributeValue(rawValue: unknown, field: ExpandedAttributeField) {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return undefined;
  }

  switch (field.fieldType) {
    case "string":
    case "enum": {
      const text = String(rawValue).trim();
      if (field.fieldType === "enum" && field.options?.length && !field.options.includes(text)) {
        return undefined;
      }
      return text || undefined;
    }
    case "number": {
      const numeric =
        typeof rawValue === "number" ? rawValue : Number(String(rawValue).trim());
      return Number.isFinite(numeric) ? numeric : undefined;
    }
    case "boolean": {
      if (typeof rawValue === "boolean") return rawValue;
      if (typeof rawValue === "string") {
        const normalized = rawValue.trim().toLowerCase();
        if (["true", "yes", "y", "1"].includes(normalized)) return true;
        if (["false", "no", "n", "0"].includes(normalized)) return false;
      }
      return undefined;
    }
    case "array": {
      if (Array.isArray(rawValue)) {
        const items = rawValue.map((item) => String(item).trim()).filter(Boolean);
        if (field.options?.length && items.some((item) => !field.options?.includes(item))) {
          return undefined;
        }
        return items.length ? items : undefined;
      }
      if (typeof rawValue === "string") {
        const items = rawValue
          .split(/[;,]/)
          .map((item) => item.trim())
          .filter(Boolean);
        if (field.options?.length && items.some((item) => !field.options?.includes(item))) {
          return undefined;
        }
        return items.length ? items : undefined;
      }
      return undefined;
    }
    case "range": {
      if (
        Array.isArray(rawValue) &&
        rawValue.length === 2 &&
        rawValue.every((item) => typeof item === "number" && Number.isFinite(item))
      ) {
        return [
          Math.min(rawValue[0], rawValue[1]),
          Math.max(rawValue[0], rawValue[1]),
        ] as [number, number];
      }
      if (typeof rawValue === "string") {
        return parseRangeString(rawValue, field.fieldKey);
      }
      return undefined;
    }
  }
}

function sanitizeAttributes(
  attributes: Record<string, unknown> | undefined,
  fields: ExpandedAttributeField[]
) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return {
      attributes: undefined,
      dropped: [] as string[],
      invalid: [] as string[],
    };
  }

  const fieldMap = new Map(fields.map((field) => [field.fieldKey, field]));
  const entries: Array<[string, unknown]> = [];
  const dropped: string[] = [];
  const invalid: string[] = [];

  for (const [key, value] of Object.entries(attributes)) {
    const field = fieldMap.get(key);
    if (!field) {
      dropped.push(key);
      continue;
    }

    const normalized = normalizeAttributeValue(value, field);
    if (normalized === undefined) {
      invalid.push(key);
      continue;
    }

    entries.push([key, normalized]);
  }

  return {
    attributes: entries.length ? Object.fromEntries(entries) : undefined,
    dropped,
    invalid,
  };
}

async function getSanitizableFields(
  ctx: MutationCtx,
  categoryId: Id<"categories">
) {
  return (await getExpandedTemplateFieldsByCategoryId(ctx, categoryId)).filter(
    Boolean
  ) as ExpandedAttributeField[];
}

function validateImportItem(item: unknown): ProductVariantImportItem {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error("row must be an object");
  }

  const record = item as Record<string, unknown>;
  const productSlug = String(record.productSlug ?? "").trim();
  const skuCode = String(record.skuCode ?? "").trim();
  const itemNo = String(record.itemNo ?? "").trim();

  if (!productSlug) throw new Error("productSlug is required");
  if (!skuCode) throw new Error("skuCode is required");
  if (!itemNo) throw new Error("itemNo is required");

  const sortOrder = record.sortOrder === undefined ? 0 : Number(record.sortOrder);
  if (!Number.isFinite(sortOrder)) {
    throw new Error("sortOrder must be a number");
  }

  const status =
    record.status === "published" || record.status === "archived"
      ? record.status
      : record.status === undefined || record.status === "" || record.status === "draft"
        ? "draft"
        : undefined;
  if (!status) {
    throw new Error("status must be draft, published, or archived");
  }

  if (record.attributes !== undefined) {
    if (
      !record.attributes ||
      typeof record.attributes !== "object" ||
      Array.isArray(record.attributes)
    ) {
      throw new Error("attributes must be an object");
    }
  }

  const moq = record.moq === undefined || record.moq === "" ? undefined : Number(record.moq);
  if (moq !== undefined && !Number.isFinite(moq)) {
    throw new Error("moq must be a number");
  }

  return {
    productSlug,
    skuCode,
    itemNo,
    attributes: record.attributes as Record<string, unknown> | undefined,
    status,
    moq,
    packageInfo:
      typeof record.packageInfo === "string" && record.packageInfo.trim()
        ? record.packageInfo.trim()
        : undefined,
    leadTime:
      typeof record.leadTime === "string" && record.leadTime.trim()
        ? record.leadTime.trim()
        : undefined,
    origin:
      typeof record.origin === "string" && record.origin.trim()
        ? record.origin.trim()
        : undefined,
    sortOrder,
  };
}

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

export const importProductVariantsFromJson = mutation({
  args: {
    items: v.array(v.any()),
    sourceName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("importJobs", {
      type: "product_variants_json",
      fileUrl: args.sourceName?.trim() || "pasted-product-variants.json",
      status: "running",
      mappingConfig: {
        entity: "productVariants",
        key: "productSlug -> productId",
        attributePolicy: "drop_unknown_or_invalid_fields",
      },
      totalRows: args.items.length,
      successRows: 0,
      failedRows: 0,
      createdAt: nowTs(),
    });

    const productBySlug = new Map<string, Awaited<ReturnType<typeof getProductOrThrow>>>();
    const fieldsByCategory = new Map<string, ExpandedAttributeField[]>();
    let successRows = 0;
    let failedRows = 0;

    for (let index = 0; index < args.items.length; index += 1) {
      const rowNumber = index + 1;
      const rawData = args.items[index];

      try {
        const item = validateImportItem(rawData);
        let product = productBySlug.get(item.productSlug);
        if (!product) {
          const found = await ctx.db
            .query("products")
            .withIndex("by_slug", (q) => q.eq("slug", item.productSlug))
            .unique();
          if (!found) {
            throw new Error(`Product not found for productSlug: ${item.productSlug}`);
          }
          product = found;
          productBySlug.set(item.productSlug, product);
        }

        const fieldsKey = String(product.categoryId);
        let fields = fieldsByCategory.get(fieldsKey);
        if (!fields) {
          fields = await getSanitizableFields(ctx, product.categoryId);
          fieldsByCategory.set(fieldsKey, fields);
        }

        await assertUniqueProductVariantSku(ctx, item.skuCode);
        await assertUniqueProductVariantItemNo(ctx, product._id, item.itemNo);

        const sanitized = sanitizeAttributes(item.attributes, fields);
        const warnings = [
          sanitized.dropped.length
            ? `Dropped unknown attributes: ${sanitized.dropped.join(", ")}`
            : "",
          sanitized.invalid.length
            ? `Dropped invalid attributes: ${sanitized.invalid.join(", ")}`
            : "",
        ].filter(Boolean);

        const variantId = await ctx.db.insert(
          "productVariants",
          withCreatedAt({
            productId: product._id,
            skuCode: item.skuCode,
            itemNo: item.itemNo,
            attributes: sanitized.attributes,
            status: item.status ?? "draft",
            moq: isFiniteNumber(item.moq) ? item.moq : undefined,
            packageInfo: item.packageInfo,
            leadTime: item.leadTime,
            origin: item.origin,
            sortOrder: item.sortOrder ?? 0,
          })
        );

        successRows += 1;
        await ctx.db.insert("importJobRows", {
          jobId,
          rowNumber,
          rawData,
          status: "completed",
          errorMessage: warnings.length ? warnings.join("; ") : undefined,
          entityId: String(variantId),
        });
      } catch (error) {
        failedRows += 1;
        await ctx.db.insert("importJobRows", {
          jobId,
          rowNumber,
          rawData,
          status: "failed",
          errorMessage: getReadableErrorMessage(error),
        });
      }
    }

    await ctx.db.patch(jobId, {
      status:
        failedRows === 0
          ? "completed"
          : successRows === 0
            ? "failed"
            : "partial_success",
      successRows,
      failedRows,
      finishedAt: nowTs(),
    });

    return { jobId, totalRows: args.items.length, successRows, failedRows };
  },
});
