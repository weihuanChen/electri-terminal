import { v } from "convex/values";

export const localizationEntityTypeValidator = v.union(
  v.literal("staticPage"),
  v.literal("category"),
  v.literal("family"),
  v.literal("product"),
  v.literal("article")
);

export const localizationStatusValidator = v.union(
  v.literal("missing"),
  v.literal("draft"),
  v.literal("machine_ready"),
  v.literal("review_required"),
  v.literal("approved"),
  v.literal("published"),
  v.literal("stale")
);

export const translationMethodValidator = v.union(
  v.literal("manual"),
  v.literal("llm"),
  v.literal("import"),
  v.literal("external_vendor"),
  v.literal("source_copy"),
  v.literal("unknown")
);

export const localizationIssueSeverityValidator = v.union(
  v.literal("blocker"),
  v.literal("high"),
  v.literal("medium"),
  v.literal("low")
);

export const localizationFieldStatusValidator = v.union(
  v.literal("missing"),
  v.literal("draft"),
  v.literal("machine_ready"),
  v.literal("review_required"),
  v.literal("approved"),
  v.literal("published"),
  v.literal("stale"),
  v.literal("protected")
);

export const localizationFieldAuditValidator = v.object({
  status: localizationFieldStatusValidator,
  sourceHash: v.optional(v.string()),
  localizedHash: v.optional(v.string()),
  changed: v.optional(v.boolean()),
  requiredForRelease: v.optional(v.boolean()),
  reviewedAt: v.optional(v.number()),
  reviewer: v.optional(v.string()),
  note: v.optional(v.string()),
});

export const localizationValidationIssueValidator = v.object({
  severity: localizationIssueSeverityValidator,
  code: v.string(),
  message: v.string(),
  fieldKey: v.optional(v.string()),
  sourceUrl: v.optional(v.string()),
  targetUrl: v.optional(v.string()),
  createdAt: v.number(),
  resolvedAt: v.optional(v.number()),
});

