import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import {
  assertImportCounters,
  assertUniqueImportJobRow,
  withCreatedAt,
  withUpdatedAt,
} from "../../lib/validators";
import { importJobType, importStatus } from "./shared";

export const createImportJob = mutation({
  args: {
    type: importJobType,
    fileUrl: v.string(),
    mappingConfig: v.optional(v.any()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert(
      "importJobs",
      withCreatedAt({
        type: args.type,
        fileUrl: args.fileUrl,
        status: "pending",
        mappingConfig: args.mappingConfig,
        totalRows: 0,
        successRows: 0,
        failedRows: 0,
        createdBy: args.createdBy,
      })
    );
  },
});

export const updateImportJob = mutation({
  args: {
    id: v.id("importJobs"),
    status: v.optional(importStatus),
    totalRows: v.optional(v.number()),
    successRows: v.optional(v.number()),
    failedRows: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Import job not found");

    const totalRows = args.totalRows ?? current.totalRows;
    const successRows = args.successRows ?? current.successRows;
    const failedRows = args.failedRows ?? current.failedRows;
    assertImportCounters(totalRows, successRows, failedRows);

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.status !== undefined ? { status: args.status } : {}),
        ...(args.totalRows !== undefined ? { totalRows: args.totalRows } : {}),
        ...(args.successRows !== undefined ? { successRows: args.successRows } : {}),
        ...(args.failedRows !== undefined ? { failedRows: args.failedRows } : {}),
        ...(args.finishedAt !== undefined ? { finishedAt: args.finishedAt } : {}),
      })
    );

    return args.id;
  },
});

export const createImportJobRow = mutation({
  args: {
    jobId: v.id("importJobs"),
    rowNumber: v.number(),
    rawData: v.optional(v.any()),
    status: importStatus,
    errorMessage: v.optional(v.string()),
    entityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.rowNumber <= 0) {
      throw new Error("rowNumber must be greater than 0");
    }

    await assertUniqueImportJobRow(ctx, args.jobId, args.rowNumber);

    return await ctx.db.insert("importJobRows", {
      jobId: args.jobId,
      rowNumber: args.rowNumber,
      rawData: args.rawData,
      status: args.status,
      errorMessage: args.errorMessage,
      entityId: args.entityId,
    });
  },
});

export const updateImportJobRow = mutation({
  args: {
    id: v.id("importJobRows"),
    status: v.optional(importStatus),
    errorMessage: v.optional(v.string()),
    entityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Import job row not found");

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.status !== undefined ? { status: args.status } : {}),
        ...(args.errorMessage !== undefined ? { errorMessage: args.errorMessage } : {}),
        ...(args.entityId !== undefined ? { entityId: args.entityId } : {}),
      })
    );

    return args.id;
  },
});
