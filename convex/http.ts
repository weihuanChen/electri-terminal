import { httpRouter } from "convex/server";

import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function getQueryParam(request: Request, key: string) {
  return new URL(request.url).searchParams.get(key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function compactObject(value: unknown): unknown {
  if (Array.isArray(value)) return value;
  if (!isPlainObject(value)) return value;

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === null || entry === undefined) continue;
    if (Array.isArray(entry)) {
      result[key] = entry;
      continue;
    }
    if (isPlainObject(entry)) {
      const nested = compactObject(entry);
      if (isPlainObject(nested) && Object.keys(nested).length > 0) {
        result[key] = nested;
      }
      continue;
    }
    result[key] = entry;
  }

  return result;
}

function deepMerge(base: unknown, patch: unknown): unknown {
  if (Array.isArray(patch)) return patch;
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch;

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (Array.isArray(value)) {
      result[key] = value;
      continue;
    }
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
      continue;
    }
    result[key] = value;
  }

  return result;
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeFamilyPageConfigPatch(value: unknown) {
  if (!isPlainObject(value)) return undefined;
  return compactObject(value) as Record<string, unknown>;
}

async function verifyBearerToken(request: Request) {
  const expectedToken = process.env.COPY_BACKFILL_TOKEN;
  if (!expectedToken) return null;

  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix) || header.slice(prefix.length) !== expectedToken) {
    return json({ error: "Unauthorized" }, 401);
  }

  return null;
}

export const listFamilies = httpAction(async (ctx, request) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authError = await verifyBearerToken(request);
  if (authError) return authError;

  const status = getQueryParam(request, "status") ?? undefined;
  if (status && status !== "draft" && status !== "published" && status !== "archived") {
    return json({ error: "status must be draft, published, or archived" }, 400);
  }

  const families = await ctx.runQuery(
    api["queries/modules/products"].exportProductFamiliesForContent,
    status ? ({ status } as never) : ({} as never)
  );

  return json({
    families: families.map((family) => ({
      _id: family._id,
      slug: family.slug,
      name: family.name,
      categoryId: family.categoryId,
      status: family.status,
      sortOrder: family.sortOrder,
      updatedAt: family.updatedAt,
    })),
    count: families.length,
  });
});

export const getFamilyPageConfig = httpAction(async (ctx, request) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authError = await verifyBearerToken(request);
  if (authError) return authError;

  const id = getQueryParam(request, "id");
  if (!id) {
    return json({ error: "Missing id query param" }, 400);
  }

  const family = await ctx.runQuery(api["queries/modules/products"].getProductFamilyById, {
    id: id as never,
  });

  if (!family) {
    return json({ error: "Product family not found", id }, 404);
  }

  return json({
    family: {
      _id: family._id,
      slug: family.slug,
      name: family.name,
      categoryId: family.categoryId,
      status: family.status,
      summary: family.summary ?? null,
      content: family.content ?? null,
      highlights: family.highlights ?? [],
      seoTitle: family.seoTitle ?? null,
      seoDescription: family.seoDescription ?? null,
      canonical: family.canonical ?? null,
      pageConfig: family.pageConfig ?? {},
      updatedAt: family.updatedAt,
    },
  });
});

export const getFamilyPageConfigBySlug = httpAction(async (ctx, request) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authError = await verifyBearerToken(request);
  if (authError) return authError;

  const slug = getQueryParam(request, "slug");
  if (!slug) {
    return json({ error: "Missing slug query param" }, 400);
  }

  const family = await ctx.runQuery(api["queries/modules/products"].getProductFamilyBySlug, {
    slug,
  });

  if (!family) {
    return json({ error: "Product family not found", slug }, 404);
  }

  return json({
    family: {
      _id: family._id,
      slug: family.slug,
      name: family.name,
      categoryId: family.categoryId,
      status: family.status,
      summary: family.summary ?? null,
      content: family.content ?? null,
      highlights: family.highlights ?? [],
      seoTitle: family.seoTitle ?? null,
      seoDescription: family.seoDescription ?? null,
      canonical: family.canonical ?? null,
      pageConfig: family.pageConfig ?? {},
      updatedAt: family.updatedAt,
    },
  });
});

export const backfillCatalogCopy = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authError = await verifyBearerToken(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!isPlainObject(body)) {
    return json({ error: "Request body must be a JSON object" }, 400);
  }

  const entityType = body.entityType;
  const entityId = body.entityId;
  const entitySlug = body.entitySlug;
  const patch = isPlainObject(body.patch) ? body.patch : undefined;

  if (entityType !== "category" && entityType !== "family") {
    return json({ error: "entityType must be 'category' or 'family'" }, 400);
  }

  if (
    typeof entityId !== "string" &&
    !(entityType === "family" && typeof entitySlug === "string" && entitySlug.trim())
  ) {
    return json(
      { error: "Provide entityId, or for family updates provide entitySlug" },
      400
    );
  }

  if (!patch) {
    return json({ error: "patch must be a JSON object" }, 400);
  }

  if (entityType === "category") {
    const current = await ctx.runQuery(api["queries/modules/categories"].getCategoryById, {
      id: entityId as never,
    });

    if (!current) {
      return json({ error: "Category not found", entityId }, 404);
    }

    const mutationArgs: Record<string, unknown> = { id: entityId };
    const description = normalizeString(patch.description);
    const shortDescription = normalizeString(patch.shortDescription);
    const seoTitle = normalizeString(patch.seoTitle);
    const seoDescription = normalizeString(patch.seoDescription);
    const canonical = normalizeString(patch.canonical);

    if (description) mutationArgs.description = description;
    if (shortDescription) mutationArgs.shortDescription = shortDescription;
    if (seoTitle) mutationArgs.seoTitle = seoTitle;
    if (seoDescription) mutationArgs.seoDescription = seoDescription;
    if (canonical) mutationArgs.canonical = canonical;

    if (Object.keys(mutationArgs).length === 1) {
      return json({ ok: true, entityType, entityId, updatedFields: [] });
    }

    await ctx.runMutation(api["mutations/admin/categories"].updateCategory, mutationArgs as never);

    return json({
      ok: true,
      entityType,
      entityId,
      updatedFields: Object.keys(mutationArgs).filter((key) => key !== "id"),
    });
  }

  const current =
    typeof entityId === "string"
      ? await ctx.runQuery(api["queries/modules/products"].getProductFamilyById, {
          id: entityId as never,
        })
      : await ctx.runQuery(api["queries/modules/products"].getProductFamilyBySlug, {
          slug: entitySlug as string,
        });

  if (!current) {
    return json({ error: "Product family not found", entityId, entitySlug }, 404);
  }

  const mutationArgs: Record<string, unknown> = { id: current._id };
  const summary = normalizeString(patch.summary);
  const content = normalizeString(patch.content);
  const seoTitle = normalizeString(patch.seoTitle);
  const seoDescription = normalizeString(patch.seoDescription);
  const canonical = normalizeString(patch.canonical);
  const highlights = normalizeStringArray(patch.highlights);
  const pageConfigPatch = normalizeFamilyPageConfigPatch(patch.pageConfig);

  if (summary) mutationArgs.summary = summary;
  if (content) mutationArgs.content = content;
  if (seoTitle) mutationArgs.seoTitle = seoTitle;
  if (seoDescription) mutationArgs.seoDescription = seoDescription;
  if (canonical) mutationArgs.canonical = canonical;
  if (highlights) mutationArgs.highlights = highlights;

  if (pageConfigPatch) {
    mutationArgs.pageConfig = compactObject(
      deepMerge(current.pageConfig ?? {}, pageConfigPatch)
    ) as Record<string, unknown>;
  }

  if (Object.keys(mutationArgs).length === 1) {
    return json({ ok: true, entityType, entityId, updatedFields: [] });
  }

  await ctx.runMutation(
    api["mutations/admin/productFamilies"].updateProductFamily,
    mutationArgs as never
  );

  return json({
    ok: true,
    entityType,
    entityId: current._id,
    entitySlug: current.slug,
    updatedFields: Object.keys(mutationArgs).filter((key) => key !== "id"),
  });
});

http.route({
  path: "/catalog-copy/families",
  method: "GET",
  handler: listFamilies,
});

http.route({
  path: "/catalog-copy/family",
  method: "GET",
  handler: getFamilyPageConfig,
});

http.route({
  path: "/catalog-copy/family-by-slug",
  method: "GET",
  handler: getFamilyPageConfigBySlug,
});

http.route({
  path: "/catalog-copy/backfill",
  method: "POST",
  handler: backfillCatalogCopy,
});

export default http;
