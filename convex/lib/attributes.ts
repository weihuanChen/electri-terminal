import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

type ConvexCtx = MutationCtx | QueryCtx;

export type AttributeDefinitionType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "array"
  | "range";

export type AttributeUnitKey =
  | "mm"
  | "mm2"
  | "g"
  | "kg"
  | "v"
  | "a"
  | "c"
  | "awg"
  | "nm"
  | "pcs";

export type AttributeFilterMode = "exact" | "range_bucket";

export type ExpandedAttributeField = Doc<"attributeFields"> & {
  definition?: Doc<"attributeDefinitions">;
  fieldKey: string;
  label: string;
  fieldType: AttributeDefinitionType;
  displayPrecision?: number;
  filterMode?: AttributeFilterMode;
  unitKey?: AttributeUnitKey;
  unit?: string;
  options?: string[];
  groupName?: string;
};

async function getTemplateForCategory(ctx: ConvexCtx, categoryId: Id<"categories">) {
  const templates = await ctx.db
    .query("attributeTemplates")
    .withIndex("by_categoryId", (q) => q.eq("categoryId", categoryId))
    .collect();

  return (
    templates
      .filter((item) => item.status === "published")
      .sort((a, b) => a.createdAt - b.createdAt)[0] ?? templates[0] ?? null
  );
}

export async function getExpandedTemplateFieldsByTemplateId(
  ctx: ConvexCtx,
  templateId: Id<"attributeTemplates">
) {
  const fields = await ctx.db
    .query("attributeFields")
    .withIndex("by_templateId_sortOrder", (q) => q.eq("templateId", templateId))
    .collect();

  const definitions = await Promise.all(
    fields.map((field) =>
      field.definitionId ? ctx.db.get(field.definitionId) : Promise.resolve(null)
    )
  );

  return fields
    .map((field, index) => {
      const definition = definitions[index];
      if (!definition) {
        if (!field.fieldKey || !field.label || !field.fieldType) {
          return null;
        }

        return {
          ...field,
          fieldKey: field.fieldKey,
          label: field.label,
          fieldType:
            field.fieldType === "text"
              ? "string"
              : field.fieldType,
          displayPrecision: undefined,
          filterMode: undefined,
          unitKey: field.unitKey as AttributeUnitKey | undefined,
          unit: field.unit,
          options: field.options,
          groupName: field.groupName,
        } satisfies ExpandedAttributeField;
      }

      return {
        ...field,
        definition,
        fieldKey: definition.fieldKey,
        label: definition.label,
        fieldType: definition.fieldType,
        displayPrecision: definition.displayPrecision,
        filterMode: definition.filterMode as AttributeFilterMode | undefined,
        unitKey: definition.unitKey as AttributeUnitKey | undefined,
        unit: definition.unit,
        options: definition.options,
        groupName: definition.groupName,
      } satisfies ExpandedAttributeField;
    })
    .filter((field): field is ExpandedAttributeField => field !== null);
}

export async function getExpandedTemplateFieldsByCategoryId(
  ctx: ConvexCtx,
  categoryId: Id<"categories">
) {
  const template = await getTemplateForCategory(ctx, categoryId);
  if (!template) {
    return [];
  }

  return getExpandedTemplateFieldsByTemplateId(ctx, template._id);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRangeValue(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isFiniteNumber(value[0]) &&
    isFiniteNumber(value[1])
  );
}

function assertValueMatchesDefinition(
  field: ExpandedAttributeField,
  value: unknown
) {
  switch (field.fieldType) {
    case "string":
      if (typeof value !== "string") {
        throw new Error(`Attribute ${field.fieldKey} must be a string`);
      }
      return;
    case "number":
      if (!isFiniteNumber(value)) {
        throw new Error(`Attribute ${field.fieldKey} must be a number`);
      }
      return;
    case "boolean":
      if (typeof value !== "boolean") {
        throw new Error(`Attribute ${field.fieldKey} must be a boolean`);
      }
      return;
    case "enum":
      if (typeof value !== "string") {
        throw new Error(`Attribute ${field.fieldKey} must be an enum string`);
      }
      if (field.options?.length && !field.options.includes(value)) {
        throw new Error(`Attribute ${field.fieldKey} must be one of: ${field.options.join(", ")}`);
      }
      return;
    case "array":
      if (!isStringArray(value)) {
        throw new Error(`Attribute ${field.fieldKey} must be an array of strings`);
      }
      if (field.options?.length) {
        const invalid = value.find((item) => !field.options?.includes(item));
        if (invalid) {
          throw new Error(`Attribute ${field.fieldKey} contains invalid option: ${invalid}`);
        }
      }
      return;
    case "range":
      if (!isRangeValue(value)) {
        throw new Error(`Attribute ${field.fieldKey} must be a [min, max] number tuple`);
      }
      return;
  }
}

export async function validateAttributesAgainstCategory(
  ctx: MutationCtx,
  categoryId: Id<"categories">,
  attributes?: Record<string, unknown>
) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return;
  }

  const fields = await getExpandedTemplateFieldsByCategoryId(ctx, categoryId);
  const fieldMap = new Map(fields.map((field) => [field.fieldKey, field]));

  for (const [fieldKey, value] of Object.entries(attributes)) {
    const field = fieldMap.get(fieldKey);
    if (!field) {
      throw new Error(`Unknown attribute fieldKey for category: ${fieldKey}`);
    }
    assertValueMatchesDefinition(field, value);
  }
}
