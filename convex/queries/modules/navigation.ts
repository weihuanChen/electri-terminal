import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getNavigationByLocation = query({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    const menu = await ctx.db
      .query("navMenus")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .unique();

    if (!menu) return null;

    const allItems = await ctx.db
      .query("navItems")
      .withIndex("by_menu_parent_sort", (q) => q.eq("menuId", menu._id))
      .collect();

    const byParent = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const key = item.parentId ?? "__root__";
      const bucket = byParent.get(key) ?? [];
      bucket.push(item);
      byParent.set(key, bucket);
    }

    for (const [, bucket] of byParent) {
      bucket.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    }

    const build = (parentKey: string): Array<Record<string, unknown>> => {
      const nodes = byParent.get(parentKey) ?? [];
      return nodes.map((n) => ({
        ...n,
        children: build(n._id),
      }));
    };

    return {
      menu,
      items: build("__root__"),
    };
  },
});
