import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const STATS_KEY = "published";

type CountMaps = {
  productCountByCategoryId: Record<string, number>;
  familyCountByCategoryId: Record<string, number>;
  productCountByFamilyId: Record<string, number>;
  fallbackImageByCategoryId: Record<string, string>;
};

export type CatalogPlacement = {
  categoryId: string;
  familyId?: string;
  status: string;
  image?: string;
};

function emptyMaps(): CountMaps {
  return {
    productCountByCategoryId: {},
    familyCountByCategoryId: {},
    productCountByFamilyId: {},
    fallbackImageByCategoryId: {},
  };
}

function bump(map: Record<string, number>, key: string, delta: number) {
  const next = (map[key] ?? 0) + delta;
  if (next <= 0) delete map[key];
  else map[key] = next;
}

async function readMaps(ctx: MutationCtx): Promise<CountMaps> {
  const current = await ctx.db.query("catalogStats")
    .withIndex("by_key", (q) => q.eq("key", STATS_KEY))
    .unique();
  if (!current) return emptyMaps();
  return {
    productCountByCategoryId: { ...current.productCountByCategoryId },
    familyCountByCategoryId: { ...current.familyCountByCategoryId },
    productCountByFamilyId: { ...current.productCountByFamilyId },
    fallbackImageByCategoryId: { ...current.fallbackImageByCategoryId },
  };
}

async function writeMaps(ctx: MutationCtx, maps: CountMaps) {
  const current = await ctx.db.query("catalogStats")
    .withIndex("by_key", (q) => q.eq("key", STATS_KEY))
    .unique();
  const doc = { key: STATS_KEY, ...maps };
  if (current) await ctx.db.replace(current._id, doc);
  else await ctx.db.insert("catalogStats", doc);
}

export async function noteCatalogPlacement(
  ctx: MutationCtx,
  before: CatalogPlacement | null,
  after: CatalogPlacement | null,
  kind: "product" | "family",
) {
  const maps = await readMaps(ctx);
  if (before?.status === "published") {
    if (kind === "family") bump(maps.familyCountByCategoryId, before.categoryId, -1);
    else {
      bump(maps.productCountByCategoryId, before.categoryId, -1);
      if (before.familyId) bump(maps.productCountByFamilyId, before.familyId, -1);
    }
  }
  if (after?.status === "published") {
    if (kind === "family") {
      bump(maps.familyCountByCategoryId, after.categoryId, 1);
      if (after.image && !maps.fallbackImageByCategoryId[after.categoryId]) {
        maps.fallbackImageByCategoryId[after.categoryId] = after.image;
      }
    } else {
      bump(maps.productCountByCategoryId, after.categoryId, 1);
      if (after.familyId) bump(maps.productCountByFamilyId, after.familyId, 1);
    }
  }
  await writeMaps(ctx, maps);
}

export async function rebuildCatalogStats(ctx: MutationCtx) {
  const maps = emptyMaps();
  for await (const family of ctx.db.query("productFamilies")
    .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))) {
    const categoryId = String(family.categoryId);
    bump(maps.familyCountByCategoryId, categoryId, 1);
    const image = family.manualHeroImage ?? family.heroImage ?? family.gallery?.[0];
    if (image && !maps.fallbackImageByCategoryId[categoryId]) {
      maps.fallbackImageByCategoryId[categoryId] = image;
    }
  }
  for await (const product of ctx.db.query("products")
    .withIndex("by_status_sortOrder", (q) => q.eq("status", "published"))) {
    bump(maps.productCountByCategoryId, String(product.categoryId), 1);
    bump(maps.productCountByFamilyId, String(product.familyId), 1);
  }
  await writeMaps(ctx, maps);
}

export function categoryPlacement(
  categoryId: Id<"categories">,
  status: string,
  image?: string,
): CatalogPlacement {
  return { categoryId: String(categoryId), status, image };
}
