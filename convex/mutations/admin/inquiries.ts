import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import {
  assertPositiveQuantity,
  withCreatedAt,
  withUpdatedAt,
} from "../../lib/validators";
import { inquiryStatus, inquiryType, relationEntityType } from "./shared";

export const createInquiry = mutation({
  args: {
    type: inquiryType,
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    message: v.string(),
    sourcePage: v.optional(v.string()),
    sourceType: v.optional(relationEntityType),
    sourceId: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    items: v.optional(
      v.array(
        v.object({
          productId: v.optional(v.id("products")),
          sku: v.optional(v.string()),
          quantity: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items ?? []) {
      assertPositiveQuantity(item.quantity);
    }

    const inquiryId = await ctx.db.insert(
      "inquiries",
      withCreatedAt({
        type: args.type,
        name: args.name,
        email: args.email,
        company: args.company,
        country: args.country,
        phone: args.phone,
        message: args.message,
        sourcePage: args.sourcePage,
        sourceType: args.sourceType,
        sourceId: args.sourceId,
        utmSource: args.utmSource,
        utmMedium: args.utmMedium,
        utmCampaign: args.utmCampaign,
        status: "new",
      })
    );

    for (const item of args.items ?? []) {
      await ctx.db.insert("inquiryItems", {
        inquiryId,
        productId: item.productId,
        sku: item.sku,
        quantity: item.quantity,
        notes: item.notes,
      });
    }

    return inquiryId;
  },
});

export const updateInquiry = mutation({
  args: {
    id: v.id("inquiries"),
    status: v.optional(inquiryStatus),
    assignedTo: v.optional(v.id("users")),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Inquiry not found");

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.status !== undefined ? { status: args.status } : {}),
        ...(args.assignedTo !== undefined ? { assignedTo: args.assignedTo } : {}),
        ...(args.internalNotes !== undefined
          ? { internalNotes: args.internalNotes }
          : {}),
      })
    );

    return args.id;
  },
});
