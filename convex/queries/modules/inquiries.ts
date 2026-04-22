import { v } from "convex/values";
import { query } from "../../_generated/server";
import { inquiryStatus, inquiryType } from "./shared";

export const listInquiries = query({
  args: {
    type: v.optional(inquiryType),
    status: v.optional(inquiryStatus),
    assignedTo: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);
    let items = await ctx.db.query("inquiries").collect();

    if (args.type) items = items.filter((x) => x.type === args.type);
    if (args.status) items = items.filter((x) => x.status === args.status);
    if (args.assignedTo !== undefined) {
      items = items.filter((x) => x.assignedTo === args.assignedTo);
    }

    items.sort((a, b) => b.createdAt - a.createdAt);
    return items.slice(0, limit);
  },
});
