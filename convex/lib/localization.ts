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

export const localizationEditableFieldValidators = {
  localizedSlug: v.optional(v.string()),
  title: v.optional(v.string()),
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),
  localizedFields: v.optional(v.record(v.string(), v.any())),
  sourceUpdatedAt: v.optional(v.number()),
  sourceContentHash: v.optional(v.string()),
  sourceFieldHashes: v.optional(v.record(v.string(), v.string())),
  localizedContentHash: v.optional(v.string()),
  localizedFieldHashes: v.optional(v.record(v.string(), v.string())),
  fieldAudits: v.optional(v.record(v.string(), localizationFieldAuditValidator)),
  requiredFieldKeys: v.optional(v.array(v.string())),
  protectedFieldKeys: v.optional(v.array(v.string())),
  translationMethod: v.optional(translationMethodValidator),
  translatedBy: v.optional(v.string()),
  generatedBy: v.optional(v.string()),
  owner: v.optional(v.string()),
  reviewRequired: v.optional(v.boolean()),
  requiredForRelease: v.optional(v.boolean()),
  reviewNotes: v.optional(v.string()),
  workflowNotes: v.optional(v.string()),
  validationIssues: v.optional(v.array(localizationValidationIssueValidator)),
};

export const localizationEditableFieldsValidator = v.object(
  localizationEditableFieldValidators
);

export const localizationIdentityValidator = {
  entityType: localizationEntityTypeValidator,
  sourceId: v.string(),
  locale: v.string(),
};
