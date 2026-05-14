"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Id } from "@/convex/_generated/dataModel";
import { clearAdminSession, requireAdmin } from "@/lib/admin-auth";
import { getAdminConvexClient } from "@/lib/convex-admin";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalStr(formData: FormData, key: string) {
  const value = str(formData, key);
  return value.length > 0 ? value : undefined;
}

function boolFromForm(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (raw === null) return false;
  if (typeof raw !== "string") return true;

  const normalized = raw.trim().toLowerCase();
  return normalized === "on" || normalized === "true" || normalized === "1" || normalized === "yes";
}

function num(formData: FormData, key: string, fallback: number) {
  const raw = str(formData, key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function lines(formData: FormData, key: string) {
  return str(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeModel(model: string) {
  return model.toLowerCase().replace(/\s+/g, "");
}

function jsonArray<T>(formData: FormData, key: string, fallback: T[] = []) {
  if (!formData.has(key)) return fallback;

  const raw = str(formData, key);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "unknown_error";
}

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function mutationWithExtraFieldFallback(
  client: ReturnType<typeof getAdminConvexClient>,
  name: string,
  args: Record<string, unknown>
) {
  let currentArgs: Record<string, unknown> = { ...args };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await client.mutation(name, currentArgs);
      return;
    } catch (error: unknown) {
      const message = errorMessage(error);
      const extraFieldMatch = message.match(/extra field [`'"]([^`'"]+)[`'"]/i);
      if (!extraFieldMatch) {
        throw error;
      }

      const extraField = extraFieldMatch[1];
      if (!(extraField in currentArgs)) {
        throw error;
      }

      const rest = { ...currentArgs };
      delete rest[extraField];
      currentArgs = rest;
    }
  }

  throw new Error("mutation_extra_field_retry_exhausted");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function extractSelectionReason(pageConfig: unknown) {
  if (!isPlainObject(pageConfig)) return undefined;
  const content = pageConfig.content;
  if (!isPlainObject(content)) return undefined;
  return normalizeOptionalString(content.selectionReason);
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = str(formData, "name");
  const slug = str(formData, "slug");
  if (!name || !slug) {
    redirect("/admin?error=category_name_slug_required");
  }

  const parentId = optionalStr(formData, "parentId") as Id<"categories"> | undefined;

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/categories:createCategory", {
      name,
      slug,
      parentId,
      description: optionalStr(formData, "description"),
      shortDescription: optionalStr(formData, "shortDescription"),
      image: optionalStr(formData, "image"),
      icon: optionalStr(formData, "icon"),
      sortOrder: num(formData, "sortOrder", 0),
      status: (str(formData, "status") as "draft" | "published" | "archived") || "draft",
      templateKey: optionalStr(formData, "templateKey"),
      seoTitle: optionalStr(formData, "seoTitle"),
      seoDescription: optionalStr(formData, "seoDescription"),
      canonical: optionalStr(formData, "canonical"),
      pageConfig: formData.has("pageConfig") ? JSON.parse(str(formData, "pageConfig")) : undefined,
      isVisibleInNav: boolFromForm(formData, "isVisibleInNav"),
    });

    revalidatePath("/admin");
    redirect("/admin?success=category_created");
  } catch {
    redirect("/admin?error=category_create_failed");
  }
}

export async function createFamilyAction(formData: FormData) {
  await requireAdmin();

  const name = str(formData, "name");
  const slug = str(formData, "slug");
  const categoryId = str(formData, "categoryId") as Id<"categories">;

  if (!name || !slug || !categoryId) {
    redirect("/admin?error=family_required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    const parsedPageConfig = formData.has("pageConfig")
      ? JSON.parse(str(formData, "pageConfig"))
      : undefined;
    const expectedSelectionReason = extractSelectionReason(parsedPageConfig);

    const createdId = await client.mutation("mutations/admin/productFamilies:createProductFamily", {
      name,
      slug,
      categoryId,
      brand: optionalStr(formData, "brand"),
      summary: optionalStr(formData, "summary"),
      content: optionalStr(formData, "content"),
      attributes: formData.has("attributes") ? JSON.parse(str(formData, "attributes")) : undefined,
      highlights: formData.has("highlights") ? JSON.parse(str(formData, "highlights")) : undefined,
      manualHeroImage: formData.has("manualHeroImage") ? str(formData, "manualHeroImage") : undefined,
      manualHeroImageAlt: formData.has("manualHeroImageAlt") ? str(formData, "manualHeroImageAlt") : undefined,
      heroImage: optionalStr(formData, "heroImage"),
      gallery: formData.has("gallery") ? JSON.parse(str(formData, "gallery")) : undefined,
      mediaItems: formData.has("mediaItems") ? JSON.parse(str(formData, "mediaItems")) : undefined,
      status: (str(formData, "status") as "draft" | "published" | "archived") || "draft",
      sortOrder: num(formData, "sortOrder", 0),
      seoTitle: optionalStr(formData, "seoTitle"),
      seoDescription: optionalStr(formData, "seoDescription"),
      canonical: optionalStr(formData, "canonical"),
      pageConfig: parsedPageConfig,
    });

    if (parsedPageConfig !== undefined) {
      const savedFamily = await client.query("queries/modules/products:getProductFamilyById", {
        id: createdId,
      });
      const actualSelectionReason = extractSelectionReason(savedFamily?.pageConfig);
      if (actualSelectionReason !== expectedSelectionReason) {
        throw new Error("selection_reason_save_verification_failed");
      }
    }

    revalidatePath("/admin");
    redirect("/admin?success=family_created");
  } catch {
    redirect("/admin?error=family_create_failed");
  }
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const productKey = str(formData, "productKey");
  const seriesCode = str(formData, "seriesCode");
  const skuCode = str(formData, "skuCode");
  const model = str(formData, "model");
  const slug = str(formData, "slug");
  const title = str(formData, "title");
  const familyId = str(formData, "familyId") as Id<"productFamilies">;
  const categoryId = str(formData, "categoryId") as Id<"categories">;

  if (!skuCode || !model || !slug || !title || !familyId || !categoryId) {
    redirect("/admin?error=product_required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/products:createProduct", {
      productKey: productKey || undefined,
      seriesCode: seriesCode || undefined,
      skuCode,
      model,
      normalizedModel: normalizeModel(model),
      slug,
      title,
      familyId,
      categoryId,
      shortTitle: optionalStr(formData, "shortTitle"),
      content: optionalStr(formData, "content"),
      attributes: formData.has("attributes") ? JSON.parse(str(formData, "attributes")) : undefined,
      featureBullets: formData.has("featureBullets") ? JSON.parse(str(formData, "featureBullets")) : undefined,
      mainImage: optionalStr(formData, "mainImage"),
      gallery: formData.has("gallery") ? JSON.parse(str(formData, "gallery")) : undefined,
      mediaItems: formData.has("mediaItems") ? JSON.parse(str(formData, "mediaItems")) : undefined,
      status: (str(formData, "status") as "draft" | "published" | "archived") || "draft",
      isFeatured: boolFromForm(formData, "isFeatured"),
      moq: formData.has("moq") ? num(formData, "moq", 0) : undefined,
      packageInfo: optionalStr(formData, "packageInfo"),
      leadTime: optionalStr(formData, "leadTime"),
      origin: optionalStr(formData, "origin"),
      searchKeywords: formData.has("searchKeywords") ? JSON.parse(str(formData, "searchKeywords")) : undefined,
      sortOrder: num(formData, "sortOrder", 0),
      summary: optionalStr(formData, "summary"),
      brand: optionalStr(formData, "brand"),
      seoTitle: optionalStr(formData, "seoTitle"),
      seoDescription: optionalStr(formData, "seoDescription"),
      canonical: optionalStr(formData, "canonical"),
    });

    revalidatePath("/admin/products");
    redirect("/admin/products?success=product_created");
  } catch (error: unknown) {
    redirect(`/admin/products?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function createArticleAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const type = str(formData, "type") as "blog" | "guide" | "faq" | "application";
  const title = str(formData, "title");
  const slug = str(formData, "slug");

  if (!type || !title || !slug) {
    return { ok: false, error: "required_fields_missing" };
  }

  try {
    const client = getAdminConvexClient();
    await mutationWithExtraFieldFallback(client, "mutations/admin/articles:createArticle", {
      type,
      title,
      slug,
      excerpt: optionalStr(formData, "excerpt"),
      coverImage: optionalStr(formData, "coverImage"),
      content: optionalStr(formData, "content"),
      categoryIds: jsonArray<Id<"categories">>(formData, "categoryIds"),
      tagNames: jsonArray<string>(formData, "tagNames"),
      relatedCategoryIds: jsonArray<Id<"categories">>(formData, "relatedCategoryIds"),
      relatedFamilyIds: jsonArray<Id<"productFamilies">>(formData, "relatedFamilyIds"),
      relatedProductIds: jsonArray<Id<"products">>(formData, "relatedProductIds"),
      featured: boolFromForm(formData, "featured"),
      status: (str(formData, "status") as "draft" | "published" | "archived") || "draft",
      publishedAt: formData.has("publishedAt") ? num(formData, "publishedAt", 0) : undefined,
      seoTitle: optionalStr(formData, "seoTitle"),
      seoDescription: optionalStr(formData, "seoDescription"),
      canonical: optionalStr(formData, "canonical"),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/articles");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function updateInquiryStatusAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"inquiries">;
  const status = str(formData, "status") as
    | "new"
    | "in_progress"
    | "resolved"
    | "closed"
    | "spam";

  if (!id || !status) {
    redirect("/admin?error=inquiry_update_invalid");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/inquiries:updateInquiry", {
      id,
      status,
      internalNotes: optionalStr(formData, "internalNotes"),
    });

    revalidatePath("/admin");
    redirect("/admin?success=inquiry_updated");
  } catch {
    redirect("/admin?error=inquiry_update_failed");
  }
}

// Category management actions
export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"categories">;
  const name = str(formData, "name");
  const slug = str(formData, "slug");

  if (!id || !name || !slug) {
    throw new Error("required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/categories:updateCategory", {
      id,
      name,
      slug,
      parentId: optionalStr(formData, "parentId") as Id<"categories"> | undefined,
      description: optionalStr(formData, "description"),
      shortDescription: optionalStr(formData, "shortDescription"),
      image: optionalStr(formData, "image"),
      icon: optionalStr(formData, "icon"),
      sortOrder: num(formData, "sortOrder", 0),
      status: str(formData, "status") as "draft" | "published" | "archived",
      templateKey: optionalStr(formData, "templateKey"),
      seoTitle: optionalStr(formData, "seoTitle"),
      seoDescription: optionalStr(formData, "seoDescription"),
      canonical: optionalStr(formData, "canonical"),
      pageConfig: formData.has("pageConfig") ? JSON.parse(str(formData, "pageConfig")) : undefined,
      isVisibleInNav: boolFromForm(formData, "isVisibleInNav"),
    });

    revalidatePath("/admin/categories");
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"categories">;

  if (!id) {
    redirect("/admin/categories?error=id_required");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/categories:deleteCategory", { id });

    revalidatePath("/admin/categories");
    redirect("/admin/categories?success=category_deleted");
  } catch (error: unknown) {
    redirect(`/admin/categories?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function bulkUpdateCategoriesAction(formData: FormData) {
  await requireAdmin();

  const idsStr = str(formData, "ids");
  if (!idsStr) {
    redirect("/admin/categories?error=ids_required");
  }

  const ids = JSON.parse(idsStr) as Id<"categories">[];

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/categories:bulkUpdateCategories", {
      ids,
      updates: {
        status: optionalStr(formData, "status") as "draft" | "published" | "archived" | undefined,
        isVisibleInNav: formData.has("isVisibleInNav") ? boolFromForm(formData, "isVisibleInNav") : undefined,
      },
    });

    revalidatePath("/admin/categories");
    redirect("/admin/categories?success=bulk_updated");
  } catch (error: unknown) {
    redirect(`/admin/categories?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

// Product management actions
export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"products">;
  const productKey = str(formData, "productKey");
  const seriesCode = str(formData, "seriesCode");
  const skuCode = str(formData, "skuCode");
  const model = str(formData, "model");
  const slug = str(formData, "slug");
  const title = str(formData, "title");

  if (!id || !skuCode || !model || !slug || !title) {
    redirect("/admin/products?error=required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/products:updateProduct", {
      id,
      productKey: productKey || undefined,
      seriesCode: seriesCode || undefined,
      skuCode,
      model,
      normalizedModel: model.toLowerCase().replace(/\s+/g, ""),
      slug,
      title,
      shortTitle: optionalStr(formData, "shortTitle"),
      familyId: str(formData, "familyId") as Id<"productFamilies">,
      categoryId: str(formData, "categoryId") as Id<"categories">,
      brand: optionalStr(formData, "brand"),
      summary: optionalStr(formData, "summary"),
      content: optionalStr(formData, "content"),
      attributes: formData.has("attributes") ? JSON.parse(str(formData, "attributes")) : undefined,
      featureBullets: formData.has("featureBullets") ? JSON.parse(str(formData, "featureBullets")) : undefined,
      mainImage: optionalStr(formData, "mainImage"),
      gallery: formData.has("gallery") ? JSON.parse(str(formData, "gallery")) : undefined,
      mediaItems: formData.has("mediaItems") ? JSON.parse(str(formData, "mediaItems")) : undefined,
      status: str(formData, "status") as "draft" | "published" | "archived",
      isFeatured: boolFromForm(formData, "isFeatured"),
      moq: formData.has("moq") ? num(formData, "moq", 0) : undefined,
      packageInfo: optionalStr(formData, "packageInfo"),
      leadTime: optionalStr(formData, "leadTime"),
      origin: optionalStr(formData, "origin"),
      searchKeywords: formData.has("searchKeywords") ? JSON.parse(str(formData, "searchKeywords")) : undefined,
      sortOrder: num(formData, "sortOrder", 0),
      seoTitle: optionalStr(formData, "seoTitle"),
      seoDescription: optionalStr(formData, "seoDescription"),
      canonical: optionalStr(formData, "canonical"),
      pageConfig: formData.has("pageConfig") ? JSON.parse(str(formData, "pageConfig")) : undefined,
    });

    revalidatePath("/admin/products");
    redirect("/admin/products?success=product_updated");
  } catch (error: unknown) {
    redirect(`/admin/products?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"products">;

  if (!id) {
    redirect("/admin/products?error=id_required");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/products:deleteProduct", { id });

    revalidatePath("/admin/products");
    redirect("/admin/products?success=product_deleted");
  } catch (error: unknown) {
    redirect(`/admin/products?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function bulkUpdateProductsAction(formData: FormData) {
  await requireAdmin();

  const idsStr = str(formData, "ids");
  if (!idsStr) {
    redirect("/admin/products?error=ids_required");
  }

  const ids = JSON.parse(idsStr) as Id<"products">[];

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/products:bulkUpdateProducts", {
      ids,
      updates: {
        status: optionalStr(formData, "status") as "draft" | "published" | "archived" | undefined,
        isFeatured: formData.has("isFeatured") ? boolFromForm(formData, "isFeatured") : undefined,
        categoryId: optionalStr(formData, "categoryId") as Id<"categories"> | undefined,
      },
    });

    revalidatePath("/admin/products");
    redirect("/admin/products?success=bulk_updated");
  } catch (error: unknown) {
    redirect(`/admin/products?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function createProductVariantAction(formData: FormData) {
  await requireAdmin();

  const productId = str(formData, "productId") as Id<"products">;
  const skuCode = str(formData, "skuCode");
  const itemNo = str(formData, "itemNo");

  if (!productId || !skuCode || !itemNo) {
    redirect("/admin/products?error=variant_required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/productVariants:createProductVariant", {
      productId,
      skuCode,
      itemNo,
      attributes: formData.has("attributes")
        ? JSON.parse(str(formData, "attributes"))
        : undefined,
      status:
        (str(formData, "status") as "draft" | "published" | "archived") ||
        "draft",
      moq: formData.has("moq") ? num(formData, "moq", 0) : undefined,
      packageInfo: optionalStr(formData, "packageInfo"),
      leadTime: optionalStr(formData, "leadTime"),
      origin: optionalStr(formData, "origin"),
      sortOrder: num(formData, "sortOrder", 0),
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/admin/products/${productId}/edit`);
    redirect(`/admin/products/${productId}/edit?success=variant_created`);
  } catch (error: unknown) {
    redirect(
      `/admin/products/${productId}/edit?error=${encodeURIComponent(errorMessage(error))}`
    );
  }
}

export async function updateProductVariantAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"productVariants">;
  const productId = str(formData, "productId") as Id<"products">;
  const skuCode = str(formData, "skuCode");
  const itemNo = str(formData, "itemNo");

  if (!id || !productId || !skuCode || !itemNo) {
    redirect("/admin/products?error=variant_required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/productVariants:updateProductVariant", {
      id,
      skuCode,
      itemNo,
      attributes: formData.has("attributes")
        ? JSON.parse(str(formData, "attributes"))
        : undefined,
      status: str(formData, "status") as "draft" | "published" | "archived",
      moq: formData.has("moq") ? num(formData, "moq", 0) : undefined,
      packageInfo: optionalStr(formData, "packageInfo"),
      leadTime: optionalStr(formData, "leadTime"),
      origin: optionalStr(formData, "origin"),
      sortOrder: num(formData, "sortOrder", 0),
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/admin/products/${productId}/edit`);
    redirect(`/admin/products/${productId}/edit?success=variant_updated`);
  } catch (error: unknown) {
    redirect(
      `/admin/products/${productId}/edit?error=${encodeURIComponent(errorMessage(error))}`
    );
  }
}

export async function deleteProductVariantAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"productVariants">;
  const productId = str(formData, "productId") as Id<"products">;

  if (!id || !productId) {
    redirect("/admin/products?error=variant_id_required");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/productVariants:deleteProductVariant", {
      id,
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/admin/products/${productId}/edit`);
    redirect(`/admin/products/${productId}/edit?success=variant_deleted`);
  } catch (error: unknown) {
    redirect(
      `/admin/products/${productId}/edit?error=${encodeURIComponent(errorMessage(error))}`
    );
  }
}

// Article management actions
export async function updateArticleAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = str(formData, "id") as Id<"articles">;
  const type = str(formData, "type") as "blog" | "guide" | "faq" | "application";
  const title = str(formData, "title");
  const slug = str(formData, "slug");

  if (!id || !type || !title || !slug) {
    return { ok: false, error: "required_fields_missing" };
  }

  try {
    const client = getAdminConvexClient();
    const currentArticle = await client.query("queries/modules/articles:getArticleById", { id });
    await mutationWithExtraFieldFallback(client, "mutations/admin/articles:updateArticle", {
      id,
      type,
      title,
      slug,
      excerpt: optionalStr(formData, "excerpt"),
      coverImage: optionalStr(formData, "coverImage"),
      content: optionalStr(formData, "content"),
      categoryIds: jsonArray<Id<"categories">>(formData, "categoryIds"),
      tagNames: jsonArray<string>(formData, "tagNames"),
      relatedCategoryIds: jsonArray<Id<"categories">>(formData, "relatedCategoryIds"),
      relatedFamilyIds: jsonArray<Id<"productFamilies">>(formData, "relatedFamilyIds"),
      relatedProductIds: jsonArray<Id<"products">>(formData, "relatedProductIds"),
      featured: boolFromForm(formData, "featured"),
      status: str(formData, "status") as "draft" | "published" | "archived",
      publishedAt: formData.has("publishedAt") ? num(formData, "publishedAt", 0) : undefined,
      seoTitle: optionalStr(formData, "seoTitle"),
      seoDescription: optionalStr(formData, "seoDescription"),
      canonical: optionalStr(formData, "canonical"),
    });

    revalidatePath("/admin/articles");
    revalidatePath("/admin");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    if (typeof currentArticle?.slug === "string" && currentArticle.slug !== slug) {
      revalidatePath(`/blog/${currentArticle.slug}`);
    }
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"articles">;

  if (!id) {
    redirect("/admin/articles?error=id_required");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/articles:deleteArticle", { id });

    revalidatePath("/admin/articles");
    redirect("/admin/articles?success=article_deleted");
  } catch (error: unknown) {
    redirect(`/admin/articles?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function bulkUpdateArticlesAction(formData: FormData) {
  await requireAdmin();

  const idsStr = str(formData, "ids");
  if (!idsStr) {
    redirect("/admin/articles?error=ids_required");
  }

  const ids = JSON.parse(idsStr) as Id<"articles">[];

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/articles:bulkUpdateArticles", {
      ids,
      updates: {
        status: optionalStr(formData, "status") as "draft" | "published" | "archived" | undefined,
        type: optionalStr(formData, "type") as "blog" | "guide" | "faq" | "application" | undefined,
      },
    });

    revalidatePath("/admin/articles");
    redirect("/admin/articles?success=bulk_updated");
  } catch (error: unknown) {
    redirect(`/admin/articles?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

// Product Family management actions
export async function updateProductFamilyAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"productFamilies">;
  const name = str(formData, "name");
  const slug = str(formData, "slug");
  const categoryId = str(formData, "categoryId") as Id<"categories">;

  if (!id || !name || !slug || !categoryId) {
    redirect("/admin/families?error=required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    const parsedPageConfig = formData.has("pageConfig")
      ? JSON.parse(str(formData, "pageConfig"))
      : undefined;
    const expectedSelectionReason = extractSelectionReason(parsedPageConfig);

    await client.mutation("mutations/admin/productFamilies:updateProductFamily", {
      id,
      name,
      slug,
      categoryId,
      brand: optionalStr(formData, "brand"),
      summary: optionalStr(formData, "summary"),
      content: optionalStr(formData, "content"),
      attributes: formData.has("attributes") ? JSON.parse(str(formData, "attributes")) : undefined,
      highlights: formData.has("highlights") ? JSON.parse(str(formData, "highlights")) : undefined,
      manualHeroImage: formData.has("manualHeroImage") ? str(formData, "manualHeroImage") : undefined,
      manualHeroImageAlt: formData.has("manualHeroImageAlt") ? str(formData, "manualHeroImageAlt") : undefined,
      heroImage: optionalStr(formData, "heroImage"),
      gallery: formData.has("gallery") ? JSON.parse(str(formData, "gallery")) : undefined,
      mediaItems: formData.has("mediaItems") ? JSON.parse(str(formData, "mediaItems")) : undefined,
      status: str(formData, "status") as "draft" | "published" | "archived",
      sortOrder: num(formData, "sortOrder", 0),
      seoTitle: optionalStr(formData, "seoTitle"),
      seoDescription: optionalStr(formData, "seoDescription"),
      canonical: optionalStr(formData, "canonical"),
      pageConfig: parsedPageConfig,
    });

    if (parsedPageConfig !== undefined) {
      const savedFamily = await client.query("queries/modules/products:getProductFamilyById", {
        id,
      });
      const actualSelectionReason = extractSelectionReason(savedFamily?.pageConfig);
      if (actualSelectionReason !== expectedSelectionReason) {
        throw new Error("selection_reason_save_verification_failed");
      }
    }

    revalidatePath("/admin/families");
    redirect("/admin/families?success=family_updated");
  } catch (error: unknown) {
    redirect(`/admin/families?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function deleteProductFamilyAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"productFamilies">;

  if (!id) {
    redirect("/admin/families?error=id_required");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/productFamilies:deleteProductFamily", { id });

    revalidatePath("/admin/families");
    redirect("/admin/families?success=family_deleted");
  } catch (error: unknown) {
    redirect(`/admin/families?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function bulkUpdateProductFamiliesAction(formData: FormData) {
  await requireAdmin();

  const idsStr = str(formData, "ids");
  if (!idsStr) {
    redirect("/admin/families?error=ids_required");
  }

  const ids = JSON.parse(idsStr) as Id<"productFamilies">[];

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/productFamilies:bulkUpdateProductFamilies", {
      ids,
      updates: {
        status: optionalStr(formData, "status") as "draft" | "published" | "archived" | undefined,
        categoryId: optionalStr(formData, "categoryId") as Id<"categories"> | undefined,
      },
    });

    revalidatePath("/admin/families");
    redirect("/admin/families?success=bulk_updated");
  } catch (error: unknown) {
    redirect(`/admin/families?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

type AttributeTemplateFieldInput = {
  fieldKey: string;
  label: string;
  fieldType: "string" | "number" | "boolean" | "enum" | "array" | "range";
  displayPrecision?: number;
  filterMode?: "exact" | "range_bucket";
  unitKey?: "mm" | "mm2" | "g" | "kg" | "v" | "a" | "c" | "awg" | "nm" | "pcs";
  unit?: string;
  options?: string[];
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isVisibleOnFrontend: boolean;
  importAlias?: string;
  sortOrder: number;
  groupName?: string;
  helpText?: string;
  description?: string;
};

function parseAttributeTemplateFields(formData: FormData) {
  return jsonArray<AttributeTemplateFieldInput>(formData, "fields").map((field, index) => ({
    fieldKey: field.fieldKey.trim(),
    label: field.label.trim(),
    fieldType: field.fieldType,
    displayPrecision:
      typeof field.displayPrecision === "number" && Number.isFinite(field.displayPrecision)
        ? field.displayPrecision
        : undefined,
    filterMode: field.filterMode || undefined,
    unitKey: field.unitKey,
    unit: field.unit?.trim() || undefined,
    options: field.options?.map((option) => option.trim()).filter(Boolean),
    isRequired: Boolean(field.isRequired),
    isFilterable: Boolean(field.isFilterable),
    isSearchable: Boolean(field.isSearchable),
    isVisibleOnFrontend: Boolean(field.isVisibleOnFrontend),
    importAlias: field.importAlias?.trim() || undefined,
    sortOrder: Number.isFinite(field.sortOrder) ? field.sortOrder : index,
    groupName: field.groupName?.trim() || undefined,
    helpText: field.helpText?.trim() || undefined,
    description: field.description?.trim() || undefined,
  }));
}

export async function createAttributeTemplateAction(formData: FormData) {
  await requireAdmin();

  const name = str(formData, "name");
  const categoryId = str(formData, "categoryId") as Id<"categories">;

  if (!name || !categoryId) {
    redirect("/admin/attribute-templates?error=required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/attributeTemplates:createAttributeTemplate", {
      name,
      categoryId,
      description: optionalStr(formData, "description"),
      status: str(formData, "status") as "draft" | "published" | "archived",
      fields: parseAttributeTemplateFields(formData),
    });

    revalidatePath("/admin/attribute-templates");
    redirect("/admin/attribute-templates?success=template_created");
  } catch (error: unknown) {
    redirect(`/admin/attribute-templates?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function updateAttributeTemplateAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"attributeTemplates">;
  const name = str(formData, "name");
  const categoryId = str(formData, "categoryId") as Id<"categories">;

  if (!id || !name || !categoryId) {
    redirect("/admin/attribute-templates?error=required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/attributeTemplates:updateAttributeTemplate", {
      id,
      name,
      categoryId,
      description: optionalStr(formData, "description"),
      status: str(formData, "status") as "draft" | "published" | "archived",
      fields: parseAttributeTemplateFields(formData),
    });

    revalidatePath("/admin/attribute-templates");
    redirect("/admin/attribute-templates?success=template_updated");
  } catch (error: unknown) {
    redirect(`/admin/attribute-templates?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function deleteAttributeTemplateAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"attributeTemplates">;
  if (!id) {
    redirect("/admin/attribute-templates?error=id_required");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/attributeTemplates:deleteAttributeTemplate", { id });

    revalidatePath("/admin/attribute-templates");
    redirect("/admin/attribute-templates?success=template_deleted");
  } catch (error: unknown) {
    redirect(`/admin/attribute-templates?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

export async function createAssetAction(formData: FormData) {
  await requireAdmin();

  const title = str(formData, "title");
  const type = str(formData, "type") as
    | "catalog"
    | "datasheet"
    | "certificate"
    | "cad"
    | "manual"
    | "image";
  const fileUrl = optionalStr(formData, "fileUrl");
  const objectKey = optionalStr(formData, "objectKey");

  if (!title || !type || (!fileUrl && !objectKey)) {
    throw new Error("required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/assets:createAsset", {
      title,
      type,
      fileUrl,
      objectKey,
      originalFilename: optionalStr(formData, "originalFilename"),
      previewImage: optionalStr(formData, "previewImage"),
      language: optionalStr(formData, "language"),
      version: optionalStr(formData, "version"),
      fileSize: formData.has("fileSize") ? num(formData, "fileSize", 0) : undefined,
      mimeType: optionalStr(formData, "mimeType"),
      isPublic: boolFromForm(formData, "isPublic"),
      requireLeadForm: boolFromForm(formData, "requireLeadForm"),
    });

    revalidatePath("/admin/assets");
    return { ok: true };
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
}

export async function updateAssetAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"assets">;
  const title = str(formData, "title");
  const type = str(formData, "type") as
    | "catalog"
    | "datasheet"
    | "certificate"
    | "cad"
    | "manual"
    | "image";
  const fileUrl = optionalStr(formData, "fileUrl");
  const objectKey = optionalStr(formData, "objectKey");

  if (!id || !title || !type || (!fileUrl && !objectKey)) {
    throw new Error("required_fields_missing");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/assets:updateAsset", {
      id,
      title,
      type,
      fileUrl,
      objectKey,
      originalFilename: optionalStr(formData, "originalFilename"),
      previewImage: optionalStr(formData, "previewImage"),
      language: optionalStr(formData, "language"),
      version: optionalStr(formData, "version"),
      fileSize: formData.has("fileSize") ? num(formData, "fileSize", 0) : undefined,
      mimeType: optionalStr(formData, "mimeType"),
      isPublic: boolFromForm(formData, "isPublic"),
      requireLeadForm: boolFromForm(formData, "requireLeadForm"),
    });

    revalidatePath("/admin/assets");
    return { ok: true };
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
}

export async function deleteAssetAction(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id") as Id<"assets">;

  if (!id) {
    throw new Error("id_required");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/assets:deleteAsset", { id });

    revalidatePath("/admin/assets");
    return { ok: true };
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
}

export async function updateAssetRelationsAction(formData: FormData) {
  await requireAdmin();

  const assetId = str(formData, "assetId") as Id<"assets">;
  if (!assetId) {
    redirect("/admin/relations?error=asset_id_required");
  }

  try {
    const client = getAdminConvexClient();
    const relations = jsonArray<{
      entityType: "category" | "family" | "product" | "article";
      entityId: string;
      sortOrder: number;
    }>(formData, "relations");

    try {
      await client.mutation("mutations/admin/relations:updateAssetRelations", {
        assetId,
        relations,
      });
    } catch (error: unknown) {
      const message = errorMessage(error);
      const missingNestedAssetId =
        message.includes('table "assetRelations"') &&
        message.includes("required field `assetId`");

      if (!missingNestedAssetId) {
        throw error;
      }

      await client.mutation("mutations/admin/relations:updateAssetRelations", {
        assetId,
        relations: relations.map((relation, index) => ({
          assetId,
          entityType: relation.entityType,
          entityId: relation.entityId,
          sortOrder: Number.isFinite(relation.sortOrder) ? relation.sortOrder : index,
        })),
      });
    }

    revalidatePath("/admin/relations");
    return { ok: true };
  } catch (error: unknown) {
    throw new Error(errorMessage(error) || "asset_relations_update_failed");
  }
}

export async function updateFaqRelationsAction(formData: FormData) {
  await requireAdmin();

  const articleId = str(formData, "articleId") as Id<"articles">;
  if (!articleId) {
    redirect("/admin/relations?error=article_id_required");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/relations:updateFaqRelations", {
      articleId,
      categoryIds: jsonArray<Id<"categories">>(formData, "categoryIds"),
      relatedCategoryIds: jsonArray<Id<"categories">>(formData, "relatedCategoryIds"),
      relatedFamilyIds: jsonArray<Id<"productFamilies">>(formData, "relatedFamilyIds"),
      relatedProductIds: jsonArray<Id<"products">>(formData, "relatedProductIds"),
    });

    revalidatePath("/admin/relations");
    return { ok: true };
  } catch (error: unknown) {
    throw new Error(errorMessage(error) || "faq_relations_update_failed");
  }
}

export async function updateContactSettingsAction(formData: FormData) {
  await requireAdmin();

  const contact = {
    email: {
      enabled: boolFromForm(formData, "emailEnabled"),
      value: str(formData, "emailValue"),
    },
    whatsapp: {
      enabled: boolFromForm(formData, "whatsappEnabled"),
      value: str(formData, "whatsappValue"),
      href: optionalStr(formData, "whatsappHref"),
    },
    phone: {
      enabled: boolFromForm(formData, "phoneEnabled"),
      value: str(formData, "phoneValue"),
    },
    address: {
      enabled: boolFromForm(formData, "addressEnabled"),
      lines: lines(formData, "addressLines"),
    },
    socialMedia: {
      enabled: boolFromForm(formData, "socialMediaEnabled"),
      items: [],
    },
  };

  let saveError: unknown;
  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/siteSettings:upsertGlobalContactSettings", {
      contact,
    });
  } catch (error: unknown) {
    saveError = error;
  }

  if (saveError) {
    redirect(`/admin/settings/general?error=${encodeURIComponent(errorMessage(saveError))}`);
  }

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin/settings/general");
  redirect("/admin/settings/general?success=contact_settings_saved");
}
