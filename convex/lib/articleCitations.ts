import { v } from "convex/values";

export const articleCitationSourceTypeValidator = v.union(
  v.literal("standard"),
  v.literal("paper"),
  v.literal("regulator"),
  v.literal("datasheet"),
  v.literal("internal-test"),
  v.literal("webpage")
);

export const articleCitationValidator = v.object({
  id: v.string(),
  title: v.string(),
  publisher: v.string(),
  url: v.string(),
  sourceType: articleCitationSourceTypeValidator,
  publishedAt: v.optional(v.number()),
  accessedAt: v.optional(v.number()),
  standardNumber: v.optional(v.string()),
  standardEdition: v.optional(v.string()),
  locator: v.optional(v.string()),
});

export const articleQuotationValidator = v.object({
  text: v.string(),
  attribution: v.string(),
  citationId: v.string(),
});
