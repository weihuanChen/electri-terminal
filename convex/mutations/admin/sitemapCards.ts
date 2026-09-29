import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { internalMutation } from "../../_generated/server";
import {
  syncCategorySitemapCard,
  syncFamilySitemapCard,
  syncProductSitemapCard,
} from "../../lib/sitemapCards";

const KINDS = ["category", "family", "product"] as const;

// Run each kind repeatedly with the returned cursor until isDone is true.
// The read path switches to cards only when all three kinds are complete.
export const backfillSitemapCards = internalMutation({
  args: {
    kind: v.union(v.literal("category"), v.literal("family"), v.literal("product")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (args.paginationOpts.cursor === null) {
      const state = await ctx.db.query("sitemapCardState")
        .withIndex("by_key", (q) => q.eq("key", "catalog"))
        .unique();
      if (state) {
        await ctx.db.patch(state._id, {
          enabled: false,
          completedKinds: state.completedKinds.filter((kind) => kind !== args.kind),
        });
      }
    }

    let result: { count: number; isDone: boolean; continueCursor: string };
    if (args.kind === "category") {
      const page = await ctx.db.query("categories").paginate(args.paginationOpts);
      for (const doc of page.page) await syncCategorySitemapCard(ctx, doc);
      result = { count: page.page.length, isDone: page.isDone, continueCursor: page.continueCursor };
    } else if (args.kind === "family") {
      const page = await ctx.db.query("productFamilies").paginate(args.paginationOpts);
      for (const doc of page.page) await syncFamilySitemapCard(ctx, doc);
      result = { count: page.page.length, isDone: page.isDone, continueCursor: page.continueCursor };
    } else {
      const page = await ctx.db.query("products").paginate(args.paginationOpts);
      for (const doc of page.page) await syncProductSitemapCard(ctx, doc);
      result = { count: page.page.length, isDone: page.isDone, continueCursor: page.continueCursor };
    }

    if (result.isDone) {
      const state = await ctx.db.query("sitemapCardState")
        .withIndex("by_key", (q) => q.eq("key", "catalog"))
        .unique();
      const completedKinds = [...new Set([...(state?.completedKinds ?? []), args.kind])];
      const enabled = KINDS.every((kind) => completedKinds.includes(kind));
      if (state) {
        await ctx.db.patch(state._id, { completedKinds, enabled });
      } else {
        await ctx.db.insert("sitemapCardState", { key: "catalog", completedKinds, enabled });
      }
    }

    return result;
  },
});
