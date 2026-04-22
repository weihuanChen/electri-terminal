import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { withCreatedAt, withUpdatedAt } from "../../lib/validators";
import { r2 } from "../../r2Assets";
import { assetType } from "./shared";

export const createAsset = mutation({
  args: {
    title: v.string(),
    type: assetType,
    fileUrl: v.optional(v.string()),
    objectKey: v.optional(v.string()),
    originalFilename: v.optional(v.string()),
    previewImage: v.optional(v.string()),
    language: v.optional(v.string()),
    version: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    isPublic: v.boolean(),
    requireLeadForm: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.fileUrl && !args.objectKey) {
      throw new Error("Either fileUrl or objectKey is required");
    }

    return await ctx.db.insert("assets", withCreatedAt(args));
  },
});

export const updateAsset = mutation({
  args: {
    id: v.id("assets"),
    title: v.optional(v.string()),
    type: v.optional(assetType),
    fileUrl: v.optional(v.string()),
    objectKey: v.optional(v.string()),
    originalFilename: v.optional(v.string()),
    previewImage: v.optional(v.string()),
    language: v.optional(v.string()),
    version: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    requireLeadForm: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Asset not found");

    const nextObjectKey = args.objectKey ?? current.objectKey;
    if (current.objectKey && current.objectKey !== nextObjectKey) {
      await r2.deleteObject(ctx, current.objectKey);
    }

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.title !== undefined ? { title: args.title } : {}),
        ...(args.type !== undefined ? { type: args.type } : {}),
        ...(args.fileUrl !== undefined ? { fileUrl: args.fileUrl } : {}),
        ...(args.objectKey !== undefined ? { objectKey: args.objectKey } : {}),
        ...(args.originalFilename !== undefined
          ? { originalFilename: args.originalFilename }
          : {}),
        ...(args.previewImage !== undefined ? { previewImage: args.previewImage } : {}),
        ...(args.language !== undefined ? { language: args.language } : {}),
        ...(args.version !== undefined ? { version: args.version } : {}),
        ...(args.fileSize !== undefined ? { fileSize: args.fileSize } : {}),
        ...(args.mimeType !== undefined ? { mimeType: args.mimeType } : {}),
        ...(args.isPublic !== undefined ? { isPublic: args.isPublic } : {}),
        ...(args.requireLeadForm !== undefined
          ? { requireLeadForm: args.requireLeadForm }
          : {}),
      })
    );

    return args.id;
  },
});

export const deleteAsset = mutation({
  args: { id: v.id("assets") },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.id);
    if (!asset) throw new Error("Asset not found");

    if (asset.objectKey) {
      await r2.deleteObject(ctx, asset.objectKey);
    }

    const relations = await ctx.db
      .query("assetRelations")
      .withIndex("by_assetId", (q) => q.eq("assetId", args.id))
      .collect();

    for (const relation of relations) {
      await ctx.db.delete(relation._id);
    }

    await ctx.db.delete(args.id);
  },
});
