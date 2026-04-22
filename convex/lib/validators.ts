import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

export function nowTs() {
  return Date.now();
}

export function withCreatedAt<T extends Record<string, unknown>>(doc: T) {
  const ts = nowTs();
  return {
    ...doc,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function withUpdatedAt<T extends Record<string, unknown>>(patch: T) {
  return {
    ...patch,
    updatedAt: nowTs(),
  };
}

async function assertUnique(
  exists: boolean,
  message: string
): Promise<void> {
  if (exists) throw new Error(message);
}

export async function assertUniqueUserEmail(
  ctx: MutationCtx,
  email: string,
  excludeId?: Id<"users">
) {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Email already exists: ${email}`
  );
}

export async function assertUniqueCategorySlug(
  ctx: MutationCtx,
  slug: string,
  excludeId?: Id<"categories">
) {
  const existing = await ctx.db
    .query("categories")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Category slug already exists: ${slug}`
  );
}

export async function assertUniqueCategoryPath(
  ctx: MutationCtx,
  path: string,
  excludeId?: Id<"categories">
) {
  const existing = await ctx.db
    .query("categories")
    .withIndex("by_path", (q) => q.eq("path", path))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Category path already exists: ${path}`
  );
}

export async function assertUniqueFamilySlug(
  ctx: MutationCtx,
  slug: string,
  excludeId?: Id<"productFamilies">
) {
  const existing = await ctx.db
    .query("productFamilies")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Product family slug already exists: ${slug}`
  );
}

export async function assertUniqueProductSku(
  ctx: MutationCtx,
  skuCode: string,
  excludeId?: Id<"products">
) {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_skuCode", (q) => q.eq("skuCode", skuCode))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `SKU already exists: ${skuCode}`
  );
}

export async function assertUniqueProductKey(
  ctx: MutationCtx,
  productKey: string,
  excludeId?: Id<"products">
) {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_productKey", (q) => q.eq("productKey", productKey))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Product key already exists: ${productKey}`
  );
}

export async function assertUniqueProductSlug(
  ctx: MutationCtx,
  slug: string,
  excludeId?: Id<"products">
) {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Product slug already exists: ${slug}`
  );
}

export async function assertUniqueProductVariantSku(
  ctx: MutationCtx,
  skuCode: string,
  excludeId?: Id<"productVariants">
) {
  const existing = await ctx.db
    .query("productVariants")
    .withIndex("by_skuCode", (q) => q.eq("skuCode", skuCode))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Product variant SKU already exists: ${skuCode}`
  );
}

export async function assertUniqueProductVariantItemNo(
  ctx: MutationCtx,
  productId: Id<"products">,
  itemNo: string,
  excludeId?: Id<"productVariants">
) {
  const existing = await ctx.db
    .query("productVariants")
    .withIndex("by_productId_itemNo", (q) =>
      q.eq("productId", productId).eq("itemNo", itemNo)
    )
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Product variant itemNo already exists in product: ${itemNo}`
  );
}

export async function assertUniqueFamilyModel(
  ctx: MutationCtx,
  familyId: Id<"productFamilies">,
  model: string,
  excludeId?: Id<"products">
) {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_familyId_model", (q) =>
      q.eq("familyId", familyId).eq("model", model)
    )
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Model already exists in family: ${model}`
  );
}

export async function assertUniqueArticleSlug(
  ctx: MutationCtx,
  slug: string,
  excludeId?: Id<"articles">
) {
  const existing = await ctx.db
    .query("articles")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Article slug already exists: ${slug}`
  );
}

export async function assertUniqueNavLocation(
  ctx: MutationCtx,
  location: string,
  excludeId?: Id<"navMenus">
) {
  const existing = await ctx.db
    .query("navMenus")
    .withIndex("by_location", (q) => q.eq("location", location))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Navigation location already exists: ${location}`
  );
}

export async function assertUniqueImportJobRow(
  ctx: MutationCtx,
  jobId: Id<"importJobs">,
  rowNumber: number,
  excludeId?: Id<"importJobRows">
) {
  const existing = await ctx.db
    .query("importJobRows")
    .withIndex("by_job_row", (q) => q.eq("jobId", jobId).eq("rowNumber", rowNumber))
    .unique();

  await assertUnique(
    !!existing && existing._id !== excludeId,
    `Import row already exists: job=${jobId}, row=${rowNumber}`
  );
}

export async function assertFamilyMatchesCategory(
  ctx: MutationCtx,
  familyId: Id<"productFamilies">,
  categoryId: Id<"categories">
) {
  const family = await ctx.db.get(familyId);
  if (!family) throw new Error("Product family not found");
  if (family.categoryId !== categoryId) {
    throw new Error("Product categoryId must match product family categoryId");
  }
}

export async function getProductOrThrow(
  ctx: MutationCtx,
  productId: Id<"products">
) {
  const product = await ctx.db.get(productId);
  if (!product) throw new Error("Product not found");
  return product;
}

export function assertPositiveQuantity(quantity?: number) {
  if (quantity !== undefined && quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }
}

export function assertImportCounters(
  totalRows: number,
  successRows: number,
  failedRows: number
) {
  if (totalRows < 0 || successRows < 0 || failedRows < 0) {
    throw new Error("Import counters must be >= 0");
  }
  if (successRows + failedRows > totalRows) {
    throw new Error("successRows + failedRows cannot exceed totalRows");
  }
}

export async function resolveCategoryHierarchy(
  ctx: MutationCtx,
  slug: string,
  parentId?: Id<"categories">,
  currentCategoryId?: Id<"categories">
) {
  if (!parentId) {
    return {
      level: 0,
      path: `/categories/${slug}`,
    };
  }

  const parent = await ctx.db.get(parentId);
  if (!parent) throw new Error("Parent category not found");

  // Prevent cycles when updating category parent.
  if (currentCategoryId) {
    let cursor: Id<"categories"> | undefined = parentId;
    while (cursor) {
      if (cursor === currentCategoryId) {
        throw new Error("Invalid category parent: cycle detected");
      }
      const node: Doc<"categories"> | null = await ctx.db.get(cursor);
      cursor = node?.parentId;
    }
  }

  return {
    level: parent.level + 1,
    path: `${parent.path}/${slug}`,
  };
}
