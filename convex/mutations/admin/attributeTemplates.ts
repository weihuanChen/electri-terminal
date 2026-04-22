import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { MutationCtx, mutation } from "../../_generated/server";
import { withCreatedAt, withUpdatedAt } from "../../lib/validators";
import { statusCommon } from "./shared";

const attributeDefinitionType = v.union(
  v.literal("string"),
  v.literal("number"),
  v.literal("boolean"),
  v.literal("enum"),
  v.literal("array"),
  v.literal("range")
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

const fieldValidator = v.object({
  fieldKey: v.string(),
  label: v.string(),
  fieldType: attributeDefinitionType,
  displayPrecision: v.optional(v.number()),
  filterMode: v.optional(attributeFilterMode),
  unitKey: v.optional(attributeUnitKey),
  unit: v.optional(v.string()),
  options: v.optional(v.array(v.string())),
  isRequired: v.boolean(),
  isFilterable: v.boolean(),
  isSearchable: v.boolean(),
  isVisibleOnFrontend: v.boolean(),
  importAlias: v.optional(v.string()),
  sortOrder: v.number(),
  groupName: v.optional(v.string()),
  helpText: v.optional(v.string()),
  description: v.optional(v.string()),
});

type AttributeTemplateFieldInput = {
  fieldKey: string;
  label: string;
  fieldType: "string" | "number" | "boolean" | "enum" | "array" | "range";
  displayPrecision?: number;
  filterMode?: "exact" | "range_bucket";
  unitKey?: "mm" | "mm2" | "g" | "kg" | "v" | "a" | "c" | "awg" | "nm" | "pcs";
  unit?: string;
  options?: string[];
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isVisibleOnFrontend: boolean;
  importAlias?: string;
  sortOrder: number;
  groupName?: string;
  helpText?: string;
  description?: string;
};

async function assertUniqueTemplateName(
  ctx: MutationCtx,
  categoryId: Id<"categories">,
  name: string,
  excludeId?: Id<"attributeTemplates">
) {
  const existing = await ctx.db
    .query("attributeTemplates")
    .withIndex("by_categoryId_name", (q) => q.eq("categoryId", categoryId).eq("name", name))
    .unique();

  if (existing && existing._id !== excludeId) {
    throw new Error(`Template already exists in category: ${name}`);
  }
}

function validateFields(fields: AttributeTemplateFieldInput[]) {
  const fieldKeys = new Set<string>();

  for (const field of fields) {
    const normalizedKey = field.fieldKey.trim();
    if (!normalizedKey) {
      throw new Error("Field key is required");
    }
    if (fieldKeys.has(normalizedKey)) {
      throw new Error(`Duplicate field key in template: ${normalizedKey}`);
    }
    if (field.fieldType === "enum" && !field.options?.length) {
      throw new Error(`Field ${normalizedKey} requires options for type ${field.fieldType}`);
    }
    if (
      field.filterMode === "range_bucket" &&
      field.fieldType !== "number" &&
      field.fieldType !== "range"
    ) {
      throw new Error(`Field ${normalizedKey} only supports range_bucket on number or range types`);
    }
    if (
      field.displayPrecision !== undefined &&
      (!Number.isInteger(field.displayPrecision) || field.displayPrecision < 0 || field.displayPrecision > 6)
    ) {
      throw new Error(`Field ${normalizedKey} displayPrecision must be an integer between 0 and 6`);
    }
    fieldKeys.add(normalizedKey);
  }
}

async function upsertAttributeDefinition(
  ctx: MutationCtx,
  field: AttributeTemplateFieldInput
) {
  const existing = await ctx.db
    .query("attributeDefinitions")
    .withIndex("by_fieldKey", (q) => q.eq("fieldKey", field.fieldKey))
    .unique();

  const definitionData = {
    fieldKey: field.fieldKey,
    label: field.label,
    fieldType: field.fieldType,
    displayPrecision: field.displayPrecision,
    filterMode: field.filterMode,
    unitKey: field.unitKey,
    unit: field.unit,
    options: field.options?.length ? field.options : undefined,
    groupName: field.groupName,
    description: field.description,
  };

  if (!existing) {
    return await ctx.db.insert("attributeDefinitions", withCreatedAt(definitionData));
  }

  await ctx.db.patch(existing._id, withUpdatedAt(definitionData));
  return existing._id;
}

async function replaceTemplateFields(
  ctx: MutationCtx,
  templateId: Id<"attributeTemplates">,
  fields: AttributeTemplateFieldInput[]
) {
  const existingFields = await ctx.db
    .query("attributeFields")
    .withIndex("by_templateId", (q) => q.eq("templateId", templateId))
    .collect();

  for (const field of existingFields) {
    await ctx.db.delete(field._id);
  }

  for (const field of fields) {
    const definitionId = await upsertAttributeDefinition(ctx, field);
    await ctx.db.insert(
      "attributeFields",
      withCreatedAt({
        templateId,
        definitionId,
        isRequired: field.isRequired,
        isFilterable: field.isFilterable,
        isSearchable: field.isSearchable,
        isVisibleOnFrontend: field.isVisibleOnFrontend,
        importAlias: field.importAlias,
        sortOrder: field.sortOrder,
        helpText: field.helpText,
      })
    );
  }
}

export const createAttributeTemplate = mutation({
  args: {
    name: v.string(),
    categoryId: v.id("categories"),
    description: v.optional(v.string()),
    status: v.optional(statusCommon),
    fields: v.array(fieldValidator),
  },
  handler: async (ctx, args) => {
    await assertUniqueTemplateName(ctx, args.categoryId, args.name);
    validateFields(args.fields);

    const templateId = await ctx.db.insert(
      "attributeTemplates",
      withCreatedAt({
        name: args.name,
        categoryId: args.categoryId,
        description: args.description,
        status: args.status ?? "draft",
      })
    );

    await replaceTemplateFields(ctx, templateId, args.fields);
    return templateId;
  },
});

export const updateAttributeTemplate = mutation({
  args: {
    id: v.id("attributeTemplates"),
    name: v.string(),
    categoryId: v.id("categories"),
    description: v.optional(v.string()),
    status: statusCommon,
    fields: v.array(fieldValidator),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Attribute template not found");

    await assertUniqueTemplateName(ctx, args.categoryId, args.name, args.id);
    validateFields(args.fields);

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        name: args.name,
        categoryId: args.categoryId,
        description: args.description,
        status: args.status,
      })
    );

    await replaceTemplateFields(ctx, args.id, args.fields);
    return args.id;
  },
});

export const deleteAttributeTemplate = mutation({
  args: {
    id: v.id("attributeTemplates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) throw new Error("Attribute template not found");

    const fields = await ctx.db
      .query("attributeFields")
      .withIndex("by_templateId", (q) => q.eq("templateId", args.id))
      .collect();

    for (const field of fields) {
      await ctx.db.delete(field._id);
    }

    await ctx.db.delete(args.id);
  },
});
