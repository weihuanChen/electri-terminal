import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { categoryPageConfig } from "./lib/categoryPageConfig";
import { familyPageConfig } from "./lib/familyPageConfig";
import {
  localizationEntityTypeValidator,
  localizationFieldAuditValidator,
  localizationStatusValidator,
  localizationValidationIssueValidator,
  translationMethodValidator,
} from "./lib/localization";
import {
  canonicalConceptStatusValidator,
  canonicalIntentPayloadValidator,
  canonicalIntentStatusValidator,
  conceptBindingRoleValidator,
  conceptBindingSourceValidator,
  conceptBindingStatusValidator,
  conceptLocaleRuleStatusValidator,
  conceptTermValidator,
  foundationValidationIssueValidator,
  intentAuthoringStatusValidator,
  intentConfidenceBandValidator,
  intentConfidenceValidator,
  intentConflictValidator,
  intentGroupDifferentiatorValidator,
  intentInheritancePolicyValidator,
  intentMembershipCriterionValidator,
  intentPatchOperationValidator,
  intentSampleReviewStatusValidator,
  languageProfileStatusValidator,
  languageProfileVersionStatusValidator,
  localizationPageClassValidator,
  pageIntentDeltaBaseKindValidator,
  productIntentGroupMemberStatusValidator,
  protectedSourceValueValidator,
} from "./lib/localizationFoundation";
import {
  contactSettingsValidator,
  languageWorkflowSettingsValidator,
} from "./lib/siteSettings";

const statusCommon = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

const attributeFieldType = v.union(
  v.literal("string"),
  v.literal("number"),
  v.literal("boolean"),
  v.literal("enum"),
  v.literal("array"),
  v.literal("range"),
);

const legacyAttributeFieldType = v.union(attributeFieldType, v.literal("text"));

const attributeUnitKey = v.union(
  v.literal("mm"),
  v.literal("mm2"),
  v.literal("g"),
  v.literal("kg"),
  v.literal("v"),
  v.literal("a"),
  v.literal("c"),
  v.literal("awg"),
  v.literal("nm"),
  v.literal("pcs"),
);

const attributeFilterMode = v.union(
  v.literal("exact"),
  v.literal("range_bucket"),
);

const visualMediaType = v.union(
  v.literal("product"),
  v.literal("dimension"),
  v.literal("packaging"),
  v.literal("application"),
);

const visualMediaItem = v.object({
  type: visualMediaType,
  url: v.string(),
  alt: v.optional(v.string()),
  sortOrder: v.optional(v.number()),
});

const assetType = v.union(
  v.literal("catalog"),
  v.literal("datasheet"),
  v.literal("certificate"),
  v.literal("cad"),
  v.literal("manual"),
  v.literal("image"),
);

const articleType = v.union(
  v.literal("blog"),
  v.literal("guide"),
  v.literal("faq"),
  v.literal("application"),
);

const inquiryType = v.union(
  v.literal("general"),
  v.literal("product"),
  v.literal("rfq"),
);

const inquiryStatus = v.union(
  v.literal("new"),
  v.literal("in_progress"),
  v.literal("resolved"),
  v.literal("closed"),
  v.literal("spam"),
);

const navItemType = v.union(
  v.literal("category"),
  v.literal("article"),
  v.literal("page"),
  v.literal("custom_url"),
);

const importJobType = v.union(
  v.literal("product_csv"),
  v.literal("family_csv"),
  v.literal("category_csv"),
  v.literal("product_variants_json"),
);

const importStatus = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("partial_success"),
);

const relationEntityType = v.union(
  v.literal("category"),
  v.literal("family"),
  v.literal("product"),
  v.literal("article"),
);

const llmProviderKind = v.union(v.literal("official"), v.literal("gateway"));
const llmProviderProtocol = v.union(
  v.literal("openai_compatible"),
  v.literal("gemini"),
);
const llmAuthMode = v.union(v.literal("bearer"), v.literal("api_key"));
const llmRunStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("partial"),
  v.literal("failed"),
);
const llmResultStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
);

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(),
    status: statusCommon,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]) // enforce uniqueness in mutation
    .index("by_role", ["role"]),

  siteSettings: defineTable({
    key: v.string(),
    contact: contactSettingsValidator,
    languageWorkflows: v.optional(languageWorkflowSettingsValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")),
    level: v.number(),
    path: v.string(),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    image: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.number(),
    status: statusCommon,
    templateKey: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
    pageConfig: v.optional(categoryPageConfig),
    isVisibleInNav: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]) // enforce uniqueness in mutation
    .index("by_path", ["path"]) // enforce uniqueness in mutation
    .index("by_parentId", ["parentId"])
    .index("by_status_visible_sortOrder", [
      "status",
      "isVisibleInNav",
      "sortOrder",
    ])
    .index("by_status_sortOrder", ["status", "sortOrder"]),

  attributeTemplates: defineTable({
    name: v.string(),
    categoryId: v.id("categories"),
    description: v.optional(v.string()),
    status: statusCommon,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_categoryId", ["categoryId"])
    .index("by_categoryId_name", ["categoryId", "name"]),

  attributeFields: defineTable({
    templateId: v.id("attributeTemplates"),
    definitionId: v.optional(v.id("attributeDefinitions")),
    fieldKey: v.optional(v.string()),
    label: v.optional(v.string()),
    fieldType: v.optional(legacyAttributeFieldType),
    unitKey: v.optional(attributeUnitKey),
    unit: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    groupName: v.optional(v.string()),
    isRequired: v.boolean(),
    isFilterable: v.boolean(),
    isSearchable: v.boolean(),
    isVisibleOnFrontend: v.boolean(),
    importAlias: v.optional(v.string()),
    sortOrder: v.number(),
    helpText: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_templateId", ["templateId"])
    .index("by_templateId_definitionId", ["templateId", "definitionId"])
    .index("by_templateId_sortOrder", ["templateId", "sortOrder"]),

  attributeDefinitions: defineTable({
    fieldKey: v.string(),
    label: v.string(),
    fieldType: attributeFieldType,
    displayPrecision: v.optional(v.number()),
    filterMode: v.optional(attributeFilterMode),
    unitKey: v.optional(attributeUnitKey),
    unit: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    groupName: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_fieldKey", ["fieldKey"]),

  productFamilies: defineTable({
    name: v.string(),
    slug: v.string(),
    categoryId: v.id("categories"),
    brand: v.optional(v.string()),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    attributes: v.optional(v.record(v.string(), v.any())),
    highlights: v.optional(v.array(v.string())),
    manualHeroImage: v.optional(v.string()),
    manualHeroImageAlt: v.optional(v.string()),
    heroImage: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),
    mediaItems: v.optional(v.array(visualMediaItem)),
    status: statusCommon,
    sortOrder: v.number(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
    pageConfig: v.optional(familyPageConfig),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]) // enforce uniqueness in mutation
    .index("by_categoryId", ["categoryId"])
    .index("by_status_sortOrder", ["status", "sortOrder"]),

  products: defineTable({
    productKey: v.optional(v.string()),
    seriesCode: v.optional(v.string()),
    skuCode: v.string(),
    model: v.string(),
    normalizedModel: v.string(),
    slug: v.string(),
    title: v.string(),
    shortTitle: v.optional(v.string()),
    familyId: v.id("productFamilies"),
    categoryId: v.id("categories"),
    brand: v.optional(v.string()),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    attributes: v.optional(v.record(v.string(), v.any())),
    featureBullets: v.optional(v.array(v.string())),
    mainImage: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),
    mediaItems: v.optional(v.array(visualMediaItem)),
    status: statusCommon,
    isFeatured: v.boolean(),
    moq: v.optional(v.number()),
    packageInfo: v.optional(v.string()),
    leadTime: v.optional(v.string()),
    origin: v.optional(v.string()),
    searchKeywords: v.optional(v.array(v.string())),
    sortOrder: v.number(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_productKey", ["productKey"])
    .index("by_seriesCode", ["seriesCode"])
    .index("by_skuCode", ["skuCode"]) // enforce uniqueness in mutation
    .index("by_slug", ["slug"]) // enforce uniqueness in mutation
    .index("by_familyId", ["familyId"])
    .index("by_categoryId", ["categoryId"])
    .index("by_familyId_model", ["familyId", "model"])
    .index("by_status_featured_sortOrder", [
      "status",
      "isFeatured",
      "sortOrder",
    ])
    .index("by_status_sortOrder", ["status", "sortOrder"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "categoryId", "familyId"],
    })
    .searchIndex("search_model", {
      searchField: "normalizedModel",
      filterFields: ["status", "categoryId", "familyId"],
    }),

  productVariants: defineTable({
    productId: v.id("products"),
    skuCode: v.string(),
    itemNo: v.string(),
    attributes: v.optional(v.record(v.string(), v.any())),
    status: statusCommon,
    moq: v.optional(v.number()),
    packageInfo: v.optional(v.string()),
    leadTime: v.optional(v.string()),
    origin: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_productId", ["productId"])
    .index("by_skuCode", ["skuCode"])
    .index("by_productId_itemNo", ["productId", "itemNo"])
    .index("by_productId_sortOrder", ["productId", "sortOrder"])
    .index("by_status_sortOrder", ["status", "sortOrder"]),

  assets: defineTable({
    title: v.string(),
    type: assetType,
    fileUrl: v.optional(v.string()),
    objectKey: v.optional(v.string()),
    originalFilename: v.optional(v.string()),
    previewImage: v.optional(v.string()),
    language: v.optional(v.string()),
    version: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    isPublic: v.boolean(),
    requireLeadForm: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_public", ["isPublic"])
    .index("by_objectKey", ["objectKey"]),

  assetRelations: defineTable({
    assetId: v.id("assets"),
    entityType: relationEntityType,
    entityId: v.string(), // store target doc id as string for polymorphic relation
    sortOrder: v.number(),
  })
    .index("by_assetId", ["assetId"])
    .index("by_entityType_entityId", ["entityType", "entityId"])
    .index("by_asset_entity", ["assetId", "entityType", "entityId"]),

  localizations: defineTable({
    entityType: localizationEntityTypeValidator,
    sourceId: v.string(),
    locale: v.string(),
    status: localizationStatusValidator,
    localizedSlug: v.optional(v.string()),
    title: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    localizedFields: v.optional(v.record(v.string(), v.any())),
    sourceContentHash: v.optional(v.string()),
    sourceFieldHashes: v.optional(v.record(v.string(), v.string())),
    localizedContentHash: v.optional(v.string()),
    localizedFieldHashes: v.optional(v.record(v.string(), v.string())),
    fieldAudits: v.optional(
      v.record(v.string(), localizationFieldAuditValidator),
    ),
    requiredFieldKeys: v.optional(v.array(v.string())),
    protectedFieldKeys: v.optional(v.array(v.string())),
    translationMethod: v.optional(translationMethodValidator),
    translatedBy: v.optional(v.string()),
    generatedBy: v.optional(v.string()),
    reviewer: v.optional(v.string()),
    publishedBy: v.optional(v.string()),
    owner: v.optional(v.string()),
    reviewRequired: v.optional(v.boolean()),
    requiredForRelease: v.optional(v.boolean()),
    reviewNotes: v.optional(v.string()),
    workflowNotes: v.optional(v.string()),
    staleReason: v.optional(v.string()),
    staleSourceUpdatedAt: v.optional(v.number()),
    changedFieldKeys: v.optional(v.array(v.string())),
    validationIssues: v.optional(v.array(localizationValidationIssueValidator)),
    sourceUpdatedAt: v.optional(v.number()),
    translatedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_entity_locale", ["entityType", "sourceId", "locale"])
    .index("by_entity", ["entityType", "sourceId"])
    .index("by_locale_status", ["locale", "status"])
    .index("by_locale_entity_status", ["locale", "entityType", "status"])
    .index("by_locale_owner_status", ["locale", "owner", "status"])
    .index("by_locale_required_status", [
      "locale",
      "requiredForRelease",
      "status",
    ]),

  localizationSourceSnapshots: defineTable({
    entityType: localizationEntityTypeValidator,
    sourceId: v.string(),
    pageClass: localizationPageClassValidator,
    schemaVersion: v.number(),
    sourceUpdatedAt: v.number(),
    sourceContentHash: v.string(),
    sourceFieldHashes: v.record(v.string(), v.string()),
    sourcePayload: v.record(v.string(), v.any()),
    evidencePayload: v.record(v.string(), v.any()),
    protectedValues: v.array(protectedSourceValueValidator),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_entity_hash", ["entityType", "sourceId", "sourceContentHash"])
    .index("by_entity_created", ["entityType", "sourceId", "createdAt"]),

  canonicalIntents: defineTable({
    entityType: localizationEntityTypeValidator,
    sourceId: v.string(),
    currentRevisionId: v.optional(v.id("canonicalIntentRevisions")),
    approvedRevisionId: v.optional(v.id("canonicalIntentRevisions")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_entity", ["entityType", "sourceId"]),

  canonicalIntentRevisions: defineTable({
    canonicalIntentId: v.id("canonicalIntents"),
    revision: v.number(),
    sourceSnapshotId: v.id("localizationSourceSnapshots"),
    schemaVersion: v.number(),
    status: canonicalIntentStatusValidator,
    intent: canonicalIntentPayloadValidator,
    generationProvenance: v.optional(v.record(v.string(), v.string())),
    validationIssues: v.array(foundationValidationIssueValidator),
    createdBy: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewNote: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_parent_revision", ["canonicalIntentId", "revision"])
    .index("by_status", ["status"])
    .index("by_snapshot", ["sourceSnapshotId"]),

  languageProfiles: defineTable({
    locale: v.string(),
    market: v.string(),
    status: languageProfileStatusValidator,
    currentVersionId: v.optional(v.id("languageProfileVersions")),
    activeVersionId: v.optional(v.id("languageProfileVersions")),
    owner: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_locale_market", ["locale", "market"]),

  languageProfileVersions: defineTable({
    profileId: v.id("languageProfiles"),
    version: v.number(),
    schemaVersion: v.number(),
    status: languageProfileVersionStatusValidator,
    hardRules: v.record(v.string(), v.any()),
    softRules: v.record(v.string(), v.any()),
    changeNote: v.optional(v.string()),
    createdBy: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_profile_version", ["profileId", "version"]),

  canonicalConcepts: defineTable({
    key: v.string(),
    kind: v.string(),
    parentId: v.optional(v.id("canonicalConcepts")),
    canonicalLabel: v.string(),
    definition: v.string(),
    distinguishingCriteria: v.array(v.string()),
    protected: v.boolean(),
    status: canonicalConceptStatusValidator,
    replacementId: v.optional(v.id("canonicalConcepts")),
    createdBy: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_parent", ["parentId"])
    .index("by_status", ["status"]),

  conceptLocaleRules: defineTable({
    conceptId: v.id("canonicalConcepts"),
    locale: v.string(),
    market: v.string(),
    version: v.number(),
    status: conceptLocaleRuleStatusValidator,
    terms: v.array(conceptTermValidator),
    avoidTerms: v.array(v.string()),
    transliterationPolicy: v.optional(v.string()),
    grammaticalNotes: v.optional(v.string()),
    examples: v.array(v.string()),
    createdBy: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_concept_locale_market", ["conceptId", "locale", "market"])
    .index("by_locale_status", ["locale", "status"]),

  entityConceptBindings: defineTable({
    entityType: localizationEntityTypeValidator,
    sourceId: v.string(),
    conceptId: v.id("canonicalConcepts"),
    role: conceptBindingRoleValidator,
    fieldPaths: v.array(v.string()),
    contextTags: v.array(v.string()),
    source: conceptBindingSourceValidator,
    status: conceptBindingStatusValidator,
    createdBy: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    reviewNote: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_entity", ["entityType", "sourceId"])
    .index("by_concept", ["conceptId"])
    .index("by_entity_status", ["entityType", "sourceId", "status"])
    .index("by_entity_concept_role", [
      "entityType",
      "sourceId",
      "conceptId",
      "role",
    ]),

  familyIntentTemplates: defineTable({
    familyId: v.id("productFamilies"),
    key: v.string(),
    name: v.string(),
    status: intentAuthoringStatusValidator,
    currentRevisionId: v.optional(v.id("familyIntentTemplateRevisions")),
    approvedRevisionId: v.optional(v.id("familyIntentTemplateRevisions")),
    owner: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_family", ["familyId"])
    .index("by_family_key", ["familyId", "key"])
    .index("by_status", ["status"]),

  familyIntentTemplateRevisions: defineTable({
    templateId: v.id("familyIntentTemplates"),
    revision: v.number(),
    sourceSnapshotIds: v.array(v.id("localizationSourceSnapshots")),
    schemaVersion: v.number(),
    status: canonicalIntentStatusValidator,
    intent: canonicalIntentPayloadValidator,
    inheritancePolicy: intentInheritancePolicyValidator,
    coverageEvidence: v.record(v.string(), v.any()),
    generationProvenance: v.optional(v.record(v.string(), v.string())),
    validationIssues: v.array(foundationValidationIssueValidator),
    createdBy: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewNote: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    lockedBy: v.optional(v.string()),
    lockedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_template_revision", ["templateId", "revision"])
    .index("by_status", ["status"]),

  productIntentGroups: defineTable({
    familyIntentTemplateId: v.id("familyIntentTemplates"),
    familyId: v.id("productFamilies"),
    key: v.string(),
    name: v.string(),
    description: v.string(),
    status: intentAuthoringStatusValidator,
    currentRevisionId: v.optional(v.id("productIntentGroupRevisions")),
    approvedRevisionId: v.optional(v.id("productIntentGroupRevisions")),
    owner: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_template", ["familyIntentTemplateId"])
    .index("by_family", ["familyId"])
    .index("by_template_key", ["familyIntentTemplateId", "key"])
    .index("by_status", ["status"]),

  productIntentGroupRevisions: defineTable({
    groupId: v.id("productIntentGroups"),
    revision: v.number(),
    familyIntentTemplateRevisionId: v.id("familyIntentTemplateRevisions"),
    schemaVersion: v.number(),
    status: canonicalIntentStatusValidator,
    membershipCriteria: v.array(intentMembershipCriterionValidator),
    differentiators: v.array(intentGroupDifferentiatorValidator),
    intentPatch: v.array(intentPatchOperationValidator),
    requiredEvidencePaths: v.array(v.string()),
    confidenceDistribution: v.object({
      high: v.number(),
      medium: v.number(),
      low: v.number(),
      pending: v.number(),
      total: v.number(),
      average: v.optional(v.number()),
    }),
    conflictSummary: v.object({
      blocker: v.number(),
      high: v.number(),
      medium: v.number(),
      low: v.number(),
      unresolved: v.number(),
    }),
    samplePolicy: v.object({
      minimumCount: v.number(),
      percentage: v.number(),
      includeBoundaryMembers: v.boolean(),
      includeDistinctFactCombinations: v.boolean(),
      frozen: v.boolean(),
      freezeReason: v.optional(v.string()),
    }),
    generationProvenance: v.optional(v.record(v.string(), v.string())),
    validationIssues: v.array(foundationValidationIssueValidator),
    createdBy: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewNote: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    lockedBy: v.optional(v.string()),
    lockedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group_revision", ["groupId", "revision"])
    .index("by_template_revision", ["familyIntentTemplateRevisionId"])
    .index("by_status", ["status"]),

  productIntentGroupMembers: defineTable({
    productId: v.id("products"),
    sourceSnapshotId: v.id("localizationSourceSnapshots"),
    groupId: v.optional(v.id("productIntentGroups")),
    groupRevisionId: v.optional(v.id("productIntentGroupRevisions")),
    status: productIntentGroupMemberStatusValidator,
    confidence: intentConfidenceValidator,
    confidenceBand: intentConfidenceBandValidator,
    assignmentReason: v.string(),
    extractedDifferentiators: v.record(v.string(), v.any()),
    conflicts: v.array(intentConflictValidator),
    selectedForSample: v.boolean(),
    sampleReviewStatus: intentSampleReviewStatusValidator,
    sampleReviewedBy: v.optional(v.string()),
    sampleReviewedAt: v.optional(v.number()),
    reviewer: v.optional(v.string()),
    reviewNote: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_product_status", ["productId", "status"])
    .index("by_group", ["groupId"])
    .index("by_group_status", ["groupId", "status"])
    .index("by_confidence_band", ["confidenceBand"])
    .index("by_sample_status", ["sampleReviewStatus"]),

  pageIntentDeltas: defineTable({
    pageClass: v.union(v.literal("L1"), v.literal("L2")),
    entityType: v.union(v.literal("staticPage"), v.literal("product")),
    sourceId: v.string(),
    baseKind: pageIntentDeltaBaseKindValidator,
    status: intentAuthoringStatusValidator,
    currentRevisionId: v.optional(v.id("pageIntentDeltaRevisions")),
    approvedRevisionId: v.optional(v.id("pageIntentDeltaRevisions")),
    owner: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_entity", ["entityType", "sourceId"])
    .index("by_page_class_status", ["pageClass", "status"]),

  pageIntentDeltaRevisions: defineTable({
    pageIntentDeltaId: v.id("pageIntentDeltas"),
    revision: v.number(),
    sourceSnapshotId: v.id("localizationSourceSnapshots"),
    baseKind: pageIntentDeltaBaseKindValidator,
    baseCanonicalIntentRevisionId: v.optional(v.id("canonicalIntentRevisions")),
    baseProductGroupRevisionId: v.optional(v.id("productIntentGroupRevisions")),
    schemaVersion: v.number(),
    status: canonicalIntentStatusValidator,
    patchOperations: v.array(intentPatchOperationValidator),
    resolvedIntentHash: v.optional(v.string()),
    confidence: intentConfidenceValidator,
    confidenceBand: intentConfidenceBandValidator,
    conflicts: v.array(intentConflictValidator),
    generationProvenance: v.optional(v.record(v.string(), v.string())),
    validationIssues: v.array(foundationValidationIssueValidator),
    createdBy: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewNote: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    lockedBy: v.optional(v.string()),
    lockedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_delta_revision", ["pageIntentDeltaId", "revision"])
    .index("by_source_snapshot", ["sourceSnapshotId"])
    .index("by_base_group_revision", ["baseProductGroupRevisionId"])
    .index("by_status", ["status"]),

  llmProviders: defineTable({
    key: v.string(),
    name: v.string(),
    kind: llmProviderKind,
    protocol: llmProviderProtocol,
    baseUrl: v.string(),
    apiKeyEnvVar: v.string(),
    authMode: llmAuthMode,
    enabled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_enabled", ["enabled"]),

  llmModels: defineTable({
    providerId: v.id("llmProviders"),
    modelId: v.string(),
    displayName: v.string(),
    enabled: v.boolean(),
    supportsStructuredOutput: v.boolean(),
    supportsThinking: v.boolean(),
    supportsTemperature: v.boolean(),
    minTemperature: v.optional(v.number()),
    maxTemperature: v.optional(v.number()),
    maxOutputTokens: v.optional(v.number()),
    defaultTemperature: v.optional(v.number()),
    defaultTopP: v.optional(v.number()),
    defaultMaxTokens: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_provider", ["providerId"])
    .index("by_provider_model", ["providerId", "modelId"]),

  llmPromptPresets: defineTable({
    name: v.string(),
    slug: v.string(),
    purpose: v.optional(v.string()),
    tags: v.array(v.string()),
    currentVersion: v.number(),
    enabled: v.boolean(),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  llmPromptPresetVersions: defineTable({
    presetId: v.id("llmPromptPresets"),
    version: v.number(),
    providerKeys: v.optional(v.array(v.string())),
    systemPrompt: v.string(),
    userPromptTemplate: v.string(),
    inputVariables: v.array(v.string()),
    outputSchema: v.record(v.string(), v.any()),
    validationRules: v.array(v.any()),
    defaultTemperature: v.optional(v.number()),
    defaultTopP: v.optional(v.number()),
    defaultMaxTokens: v.optional(v.number()),
    changeNote: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_preset", ["presetId"])
    .index("by_preset_version", ["presetId", "version"]),

  llmLabRuns: defineTable({
    actor: v.string(),
    status: llmRunStatus,
    sourceLocale: v.string(),
    targetLocale: v.string(),
    presetId: v.id("llmPromptPresets"),
    presetVersionId: v.id("llmPromptPresetVersions"),
    presetSnapshot: v.any(),
    variables: v.record(v.string(), v.string()),
    sourceContent: v.string(),
    parameters: v.object({
      temperature: v.optional(v.number()),
      topP: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    }),
    modelIds: v.array(v.id("llmModels")),
    taskSlot: v.optional(v.string()),
    contextEntityType: v.optional(localizationEntityTypeValidator),
    contextSourceId: v.optional(v.string()),
    contextSourceSnapshotId: v.optional(v.id("localizationSourceSnapshots")),
    contextFamilyId: v.optional(v.id("productFamilies")),
    selectedResultId: v.optional(v.id("llmLabResults")),
    selectionNote: v.optional(v.string()),
    selectedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_preset", ["presetId"])
    .index("by_task_entity", [
      "taskSlot",
      "contextEntityType",
      "contextSourceId",
      "createdAt",
    ]),

  llmLabResults: defineTable({
    runId: v.id("llmLabRuns"),
    providerId: v.id("llmProviders"),
    modelId: v.id("llmModels"),
    providerKey: v.string(),
    providerName: v.string(),
    modelIdentifier: v.string(),
    modelDisplayName: v.string(),
    status: llmResultStatus,
    requestSnapshot: v.optional(v.any()),
    rawText: v.optional(v.string()),
    parsedOutput: v.optional(v.any()),
    schemaValid: v.optional(v.boolean()),
    validationErrors: v.optional(v.array(v.string())),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    finishReason: v.optional(v.string()),
    providerRequestId: v.optional(v.string()),
    error: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_run", ["runId"])
    .index("by_run_status", ["runId", "status"]),

  authors: defineTable({
    name: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  articles: defineTable({
    type: articleType,
    title: v.string(),
    slug: v.string(),
    authorId: v.optional(v.id("authors")),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    content: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id("categories"))),
    tagNames: v.optional(v.array(v.string())),
    relatedCategoryIds: v.optional(v.array(v.id("categories"))),
    relatedFamilyIds: v.optional(v.array(v.id("productFamilies"))),
    relatedProductIds: v.optional(v.array(v.id("products"))),
    featured: v.optional(v.boolean()),
    status: statusCommon,
    publishedAt: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]) // enforce uniqueness in mutation
    .index("by_authorId", ["authorId"])
    .index("by_type_status", ["type", "status"])
    .index("by_status_publishedAt", ["status", "publishedAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "type"],
    }),

  // Compact public article data used for recommendations and other card lists.
  // Keeping this separate prevents list queries from reading large article bodies.
  articleCards: defineTable({
    articleId: v.id("articles"),
    type: articleType,
    title: v.string(),
    slug: v.string(),
    authorId: v.optional(v.id("authors")),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id("categories"))),
    tagNames: v.optional(v.array(v.string())),
    relatedCategoryIds: v.optional(v.array(v.id("categories"))),
    relatedFamilyIds: v.optional(v.array(v.id("productFamilies"))),
    relatedProductIds: v.optional(v.array(v.id("products"))),
    featured: v.optional(v.boolean()),
    status: statusCommon,
    publishedAt: v.optional(v.number()),
    canonical: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_articleId", ["articleId"])
    .index("by_slug", ["slug"])
    .index("by_type_status", ["type", "status"])
    .index("by_status_publishedAt", ["status", "publishedAt"]),

  // Reverse lookup for entity-linked articles, primarily public FAQs.
  articleEntityRelations: defineTable({
    articleId: v.id("articles"),
    entityType: v.union(
      v.literal("category"),
      v.literal("family"),
      v.literal("product"),
    ),
    entityId: v.string(),
  })
    .index("by_articleId", ["articleId"])
    .index("by_entity", ["entityType", "entityId"]),

  inquiries: defineTable({
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
    status: inquiryStatus,
    assignedTo: v.optional(v.id("users")),
    internalNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type_status", ["type", "status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_email", ["email"]),

  inquiryItems: defineTable({
    inquiryId: v.id("inquiries"),
    productId: v.optional(v.id("products")),
    sku: v.optional(v.string()),
    quantity: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_inquiryId", ["inquiryId"])
    .index("by_productId", ["productId"]),

  navMenus: defineTable({
    name: v.string(),
    location: v.string(),
    status: statusCommon,
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_location", ["location"]), // enforce uniqueness in mutation

  navItems: defineTable({
    menuId: v.id("navMenus"),
    parentId: v.optional(v.id("navItems")),
    title: v.string(),
    itemType: navItemType,
    targetId: v.optional(v.string()),
    url: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.number(),
    isHighlighted: v.boolean(),
    isExternal: v.boolean(),
  })
    .index("by_menu_parent_sort", ["menuId", "parentId", "sortOrder"])
    .index("by_target", ["itemType", "targetId"]),

  importJobs: defineTable({
    type: importJobType,
    fileUrl: v.string(),
    status: importStatus,
    mappingConfig: v.optional(v.any()),
    totalRows: v.number(),
    successRows: v.number(),
    failedRows: v.number(),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    finishedAt: v.optional(v.number()),
  })
    .index("by_status_createdAt", ["status", "createdAt"])
    .index("by_createdBy", ["createdBy"]),

  importJobRows: defineTable({
    jobId: v.id("importJobs"),
    rowNumber: v.number(),
    rawData: v.optional(v.any()),
    status: importStatus,
    errorMessage: v.optional(v.string()),
    entityId: v.optional(v.string()),
  })
    .index("by_job_row", ["jobId", "rowNumber"]) // enforce uniqueness in mutation
    .index("by_job_status", ["jobId", "status"]),
});
