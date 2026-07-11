import "server-only";

import { ConvexHttpClient } from "convex/browser";
import type { Doc } from "@/convex/_generated/dataModel";

export type AdminAssetType = Doc<"assets">["type"];

export interface AdminAttributeTemplateSummary {
  _id: string;
  name: string;
  categoryId: string;
  description?: string;
  status: "draft" | "published" | "archived";
  fieldCount?: number;
  fields?: Array<{
    fieldKey: string;
    label: string;
    fieldType:
      | "string"
      | "number"
      | "boolean"
      | "enum"
      | "array"
      | "range";
    displayPrecision?: number;
    filterMode?: "exact" | "range_bucket";
    unitKey?: "mm" | "mm2" | "g" | "kg" | "v" | "a" | "c" | "awg" | "nm" | "pcs";
    unit?: string;
    options?: string[];
    definitionId?: string;
    isRequired: boolean;
    isFilterable: boolean;
    isSearchable: boolean;
    isVisibleOnFrontend: boolean;
    importAlias?: string;
    sortOrder: number;
    groupName?: string;
    helpText?: string;
  }>;
  category?: {
    _id: string;
    name: string;
  } | null;
}

export interface AdminAssetWithRelations {
  _id: string;
  title: string;
  type: AdminAssetType;
  fileUrl?: string;
  objectKey?: string;
  originalFilename?: string;
  accessUrl?: string | null;
  previewImage?: string;
  language?: string;
  version?: string;
  fileSize?: number;
  mimeType?: string;
  isPublic: boolean;
  requireLeadForm: boolean;
  createdAt?: number;
  updatedAt?: number;
  relations?: Array<{
    entityType: "category" | "family" | "product" | "article";
    entityId: string;
    sortOrder: number;
  }>;
}

export interface AdminAuthor {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  avatar?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface AdminFaqWithRelations {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  categoryIds?: string[];
  relatedCategoryIds?: string[];
  relatedFamilyIds?: string[];
  relatedProductIds?: string[];
}

export interface AdminProductVariantSummary {
  _id: string;
  productId: string;
  skuCode: string;
  itemNo: string;
  attributes?: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  moq?: number;
  packageInfo?: string;
  leadTime?: string;
  origin?: string;
  sortOrder: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface AdminProductDetail {
  product: Doc<"products">;
  category: Doc<"categories"> | null;
  family: Doc<"productFamilies"> | null;
  templateFields: AdminAttributeTemplateSummary["fields"];
  variants: AdminProductVariantSummary[];
}

export interface AdminData {
  categories: Doc<"categories">[];
  families: Doc<"productFamilies">[];
  products: Doc<"products">[];
  articles: Doc<"articles">[];
  authors: AdminAuthor[];
  inquiries: Doc<"inquiries">[];
  users: Doc<"users">[];
  importJobs: Doc<"importJobs">[];
  attributeTemplates: AdminAttributeTemplateSummary[];
  assets: AdminAssetWithRelations[];
  loadError?: string;
}

let convexClient: ConvexHttpClient | undefined;
let convexClientUrl: string | undefined;

function getConvexClient() {
  const url = process.env.CONVEX_SERVER_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "Missing CONVEX_SERVER_URL or NEXT_PUBLIC_CONVEX_URL in environment"
    );
  }
  const normalizedUrl = url.replace(/\/+$/, "");
  if (!convexClient || convexClientUrl !== normalizedUrl) {
    convexClientUrl = normalizedUrl;
    convexClient = new ConvexHttpClient(normalizedUrl);
  }
  return convexClient;
}

type UntypedConvexClient = {
  query: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
  mutation: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
  action: (name: string, args?: Record<string, unknown>) => Promise<unknown>;
};

function getUntypedClient() {
  return getConvexClient() as unknown as UntypedConvexClient;
}

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

export async function queryAdmin<T>(
  name: string,
  args: Record<string, unknown> = {}
) {
  try {
    return (await getUntypedClient().query(name, args)) as T;
  } catch (error) {
    const message = getReadableErrorMessage(error);
    throw new Error(
      `Convex query failed: ${name}. ${message}. Check CONVEX_SERVER_URL, NEXT_PUBLIC_CONVEX_URL, and deploy status.`
    );
  }
}

export async function mutateAdmin<T>(
  name: string,
  args: Record<string, unknown> = {}
) {
  try {
    return (await getUntypedClient().mutation(name, args)) as T;
  } catch (error) {
    const message = getReadableErrorMessage(error);
    throw new Error(
      `Convex mutation failed: ${name}. ${message}. Check CONVEX_SERVER_URL, NEXT_PUBLIC_CONVEX_URL, and deploy status.`
    );
  }
}

export async function actionAdmin<T>(
  name: string,
  args: Record<string, unknown> = {}
) {
  try {
    return (await getUntypedClient().action(name, args)) as T;
  } catch (error) {
    const message = getReadableErrorMessage(error);
    throw new Error(
      `Convex action failed: ${name}. ${message}. Check CONVEX_SERVER_URL, NEXT_PUBLIC_CONVEX_URL, and deploy status.`
    );
  }
}

export async function loadAdminData(): Promise<AdminData> {
  const errors: string[] = [];

  async function loadSection<T>(label: string, loader: Promise<T>, fallback: T) {
    try {
      return await loader;
    } catch (error) {
      errors.push(`${label}: ${getReadableErrorMessage(error)}`);
      return fallback;
    }
  }

  const [
    categories,
    families,
    products,
    articles,
    authors,
    inquiries,
    users,
    importJobs,
    attributeTemplates,
    assets,
  ] = await Promise.all([
    loadSection(
      "categories",
      queryAdmin<Doc<"categories">[]>("queries/modules/categories:listCategories", {
        limit: 100,
      }),
      []
    ),
    loadSection(
      "families",
      queryAdmin<Doc<"productFamilies">[]>("queries/modules/products:listProductFamilies", {
        limit: 100,
      }),
      []
    ),
    loadSection(
      "products",
      queryAdmin<Doc<"products">[]>("queries/modules/products:listProducts", {
        limit: 100,
      }),
      []
    ),
    loadSection(
      "articles",
      queryAdmin<Doc<"articles">[]>("queries/modules/articles:listArticles", {
        limit: 100,
      }),
      []
    ),
    loadSection(
      "authors",
      queryAdmin<AdminAuthor[]>("queries/modules/authors:listAuthors", {
        limit: 300,
      }),
      []
    ),
    loadSection(
      "inquiries",
      queryAdmin<Doc<"inquiries">[]>("queries/modules/inquiries:listInquiries", {
        limit: 100,
      }),
      []
    ),
    loadSection(
      "users",
      queryAdmin<Doc<"users">[]>("queries/modules/users:listUsers", {
        limit: 100,
      }),
      []
    ),
    loadSection(
      "importJobs",
      queryAdmin<Doc<"importJobs">[]>("queries/modules/imports:listImportJobs", {
        limit: 50,
      }),
      []
    ),
    loadSection(
      "attributeTemplates",
      queryAdmin<AdminAttributeTemplateSummary[]>(
        "queries/modules/attributeTemplates:listAttributeTemplates"
      ),
      []
    ),
    loadSection(
      "assets",
      queryAdmin<AdminAssetWithRelations[]>("queries/modules/relations:listAssetsWithRelations"),
      []
    ),
  ]);

  return {
    categories,
    families,
    products,
    articles,
    authors,
    inquiries,
    users,
    importJobs,
    attributeTemplates,
    assets,
    loadError: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

export function getAdminConvexClient() {
  return getUntypedClient();
}

export async function getCategory(id: string) {
  return queryAdmin<Doc<"categories">>("queries/modules/categories:getCategoryById", { id });
}

export async function getProduct(id: string) {
  return queryAdmin<Doc<"products">>("queries/modules/products:getProductById", { id });
}

export async function getProductAdminDetail(id: string) {
  return queryAdmin<AdminProductDetail | null>(
    "queries/modules/products:getProductAdminDetailById",
    { id }
  );
}

export async function getImportJobRows(id: string) {
  return queryAdmin<Doc<"importJobRows">[]>(
    "queries/modules/imports:listImportJobRows",
    { jobId: id, limit: 500 }
  );
}

export async function getArticle(id: string) {
  return queryAdmin<Doc<"articles">>("queries/modules/articles:getArticleById", { id });
}

export async function getAuthor(id: string) {
  return queryAdmin<AdminAuthor | null>("queries/modules/authors:getAuthorById", { id });
}

export async function getProductFamily(id: string) {
  return queryAdmin<Doc<"productFamilies">>("queries/modules/products:getProductFamilyById", { id });
}

export async function getAttributeTemplate(id: string) {
  return queryAdmin<AdminAttributeTemplateSummary | null>(
    "queries/modules/attributeTemplates:getAttributeTemplateById",
    { id }
  );
}

export async function getAsset(id: string) {
  return queryAdmin<AdminAssetWithRelations | null>("queries/modules/relations:getAssetByIdWithRelations", {
    id,
  });
}
