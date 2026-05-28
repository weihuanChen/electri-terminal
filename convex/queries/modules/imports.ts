import { v } from "convex/values";
import { query } from "../../_generated/server";
import { importStatus } from "./shared";

export const listImportJobs = query({
  args: {
    status: v.optional(importStatus),
    createdBy: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);

    let items = await ctx.db.query("importJobs").collect();
    if (args.status) items = items.filter((x) => x.status === args.status);
    if (args.createdBy !== undefined) {
      items = items.filter((x) => x.createdBy === args.createdBy);
    }

    items.sort((a, b) => b.createdAt - a.createdAt);
    return items.slice(0, limit);
  },
});

export const listImportJobRows = query({
  args: {
    jobId: v.id("importJobs"),
    status: v.optional(importStatus),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 200, 500);
    let items = await ctx.db
      .query("importJobRows")
      .withIndex("by_job_row", (q) => q.eq("jobId", args.jobId))
      .collect();

    if (args.status) items = items.filter((item) => item.status === args.status);

    items.sort((a, b) => a.rowNumber - b.rowNumber);
    return items.slice(0, limit);
  },
});
