import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import {
  assertUniqueNavLocation,
  withCreatedAt,
  withUpdatedAt,
} from "../../lib/validators";
import { statusCommon } from "./shared";

export const createNavMenu = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    status: v.optional(statusCommon),
  },
  handler: async (ctx, args) => {
    await assertUniqueNavLocation(ctx, args.location);

    return await ctx.db.insert(
      "navMenus",
      withCreatedAt({
        name: args.name,
        location: args.location,
        status: args.status ?? "draft",
      })
    );
  },
});

export const updateNavMenu = mutation({
  args: {
    id: v.id("navMenus"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.optional(statusCommon),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Navigation menu not found");

    if (args.location && args.location !== current.location) {
      await assertUniqueNavLocation(ctx, args.location, args.id);
    }

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.name !== undefined ? { name: args.name } : {}),
        ...(args.location !== undefined ? { location: args.location } : {}),
        ...(args.status !== undefined ? { status: args.status } : {}),
      })
    );

    return args.id;
  },
});
