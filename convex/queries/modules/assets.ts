import { v } from "convex/values";
import { query } from "../../_generated/server";
import { r2 } from "../../r2Assets";

async function withResolvedUrl<T extends { fileUrl?: string; objectKey?: string }>(asset: T) {
  const accessUrl = asset.objectKey ? await r2.getUrl(asset.objectKey) : undefined;
  return {
    ...asset,
    accessUrl: accessUrl ?? asset.fileUrl ?? null,
  };
}

export const listAssets = query({
  args: {
    type: v.optional(
      v.union(
        v.literal("catalog"),
        v.literal("datasheet"),
        v.literal("certificate"),
        v.literal("cad"),
        v.literal("manual")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 100, 300);
    const assets = args.type
      ? await ctx.db
          .query("assets")
          .withIndex("by_type", (q) => q.eq("type", args.type!))
          .collect()
      : await ctx.db.query("assets").collect();

    assets.sort((a, b) => a.title.localeCompare(b.title));
    return await Promise.all(assets.slice(0, limit).map((asset) => withResolvedUrl(asset)));
  },
});

export const getAssetById = query({
  args: { id: v.id("assets") },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.id);
    if (!asset) return null;
    return await withResolvedUrl(asset);
  },
});
