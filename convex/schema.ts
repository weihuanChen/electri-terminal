import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { categoryPageConfig } from "./lib/categoryPageConfig";
import { familyPageConfig } from "./lib/familyPageConfig";
import { contactSettingsValidator } from "./lib/siteSettings";

const statusCommon = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived")
);

const attributeFieldType = v.union(
  v.literal("string"),
  v.literal("number"),
  v.literal("boolean"),
  v.literal("enum"),
  v.literal("array"),
  v.literal("range")
);

const legacyAttributeFieldType = v.union(
  attributeFieldType,
  v.literal("text")
);

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
  v.literal("pcs")
);

const attributeFilterMode = v.union(
  v.literal("exact"),
  v.literal("range_bucket")
);

const visualMediaType = v.union(
  v.literal("product"),
  v.literal("dimension"),
  v.literal("packaging"),
  v.literal("application")
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
  v.literal("image")
);

const articleType = v.union(
  v.literal("blog"),
  v.literal("guide"),
  v.literal("faq"),
  v.literal("application")
);

const inquiryType = v.union(
  v.literal("general"),
  v.literal("product"),
  v.literal("rfq")
);

const inquiryStatus = v.union(
  v.literal("new"),
  v.literal("in_progress"),
  v.literal("resolved"),
  v.literal("closed"),
  v.literal("spam")
);

const navItemType = v.union(
  v.literal("category"),
  v.literal("article"),
  v.literal("page"),
  v.literal("custom_url")
);

const importJobType = v.union(
  v.literal("product_csv"),
  v.literal("family_csv"),
  v.literal("category_csv")
);

const importStatus = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("partial_success")
);

const relationEntityType = v.union(
  v.literal("category"),
  v.literal("family"),
  v.literal("product"),
  v.literal("article")
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
  })
    .index("by_fieldKey", ["fieldKey"]),

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

  articles: defineTable({
    type: articleType,
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    content: v.optional(v.string()),
    categoryIds: v.optional(v.array(v.id("categories"))),
    tagNames: v.optional(v.array(v.string())),
    relatedCategoryIds: v.optional(v.array(v.id("categories"))),
    relatedFamilyIds: v.optional(v.array(v.id("productFamilies"))),
    relatedProductIds: v.optional(v.array(v.id("products"))),
    status: statusCommon,
    publishedAt: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]) // enforce uniqueness in mutation
    .index("by_type_status", ["type", "status"])
    .index("by_status_publishedAt", ["status", "publishedAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "type"],
    }),

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
  })
    .index("by_location", ["location"]), // enforce uniqueness in mutation

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
