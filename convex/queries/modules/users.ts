import { v } from "convex/values";
import { query } from "../../_generated/server";

export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 100, 300);
    const users = await ctx.db.query("users").collect();

    users.sort((a, b) => a.name.localeCompare(b.name));
    return users.slice(0, limit);
  },
});
