const stringArray = (options: Record<string, unknown> = {}) => ({
  type: "array",
  items: { type: "string" },
  ...options,
});

const closedObject = (
  properties: Record<string, unknown>,
  required: string[],
) => ({
  type: "object",
  additionalProperties: false,
  properties,
  required,
});

const patchOperationSchema = closedObject(
  {
    operation: { type: "string", enum: ["add", "replace", "remove"] },
    target: {
      type: "string",
      enum: [
        "pageRole",
        "primaryAudience",
        "buyerStage",
        "primaryGoal",
        "primaryConceptIds",
        "secondaryConceptIds",
        "mustCommunicate",
        "verifiedClaims",
        "prohibitedClaims",
        "conversionIntent",
        "sectionIntents",
        "extensions",
      ],
    },
    itemKey: { type: "string" },
    value: {},
    reason: { type: "string", minLength: 5, maxLength: 300 },
    evidencePaths: stringArray({ maxItems: 20, uniqueItems: true }),
  },
  ["operation", "target", "reason", "evidencePaths"],
);

const canonicalIntentSchema = closedObject(
  {
    schemaVersion: { type: "integer", const: 1 },
    pageRole: { type: "string", minLength: 3, maxLength: 120 },
    primaryAudience: stringArray({
      minItems: 1,
      maxItems: 10,
      uniqueItems: true,
    }),
    buyerStage: stringArray({ minItems: 1, maxItems: 8, uniqueItems: true }),
    primaryGoal: { type: "string", minLength: 10, maxLength: 400 },
    primaryConceptIds: stringArray({ maxItems: 20, uniqueItems: true }),
    secondaryConceptIds: stringArray({ maxItems: 30, uniqueItems: true }),
    mustCommunicate: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: closedObject(
        {
          key: { type: "string", pattern: "^[a-z][a-z0-9_]*$", maxLength: 80 },
          intent: { type: "string", minLength: 5, maxLength: 400 },
          evidencePaths: stringArray({
            minItems: 1,
            maxItems: 20,
            uniqueItems: true,
          }),
        },
        ["key", "intent", "evidencePaths"],
      ),
    },
    verifiedClaims: {
      type: "array",
      maxItems: 20,
      items: closedObject(
        {
          claimKey: {
            type: "string",
            pattern: "^[a-z][a-z0-9_]*$",
            maxLength: 80,
          },
          factPath: { type: "string", minLength: 3, maxLength: 240 },
          allowedMeaning: { type: "string", minLength: 5, maxLength: 400 },
        },
        ["claimKey", "factPath", "allowedMeaning"],
      ),
    },
    prohibitedClaims: stringArray({ maxItems: 20, uniqueItems: true }),
    conversionIntent: closedObject(
      {
        primaryAction: { type: "string", minLength: 3, maxLength: 100 },
        secondaryAction: { type: "string", minLength: 3, maxLength: 100 },
      },
      ["primaryAction"],
    ),
    sectionIntents: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: closedObject(
        {
          sectionKey: {
            type: "string",
            pattern: "^[a-z][a-z0-9_]*$",
            maxLength: 80,
          },
          purpose: { type: "string", minLength: 5, maxLength: 400 },
          requiredConceptIds: stringArray({ maxItems: 20, uniqueItems: true }),
          requiredFactPaths: stringArray({ maxItems: 30, uniqueItems: true }),
        },
        ["sectionKey", "purpose", "requiredConceptIds", "requiredFactPaths"],
      ),
    },
  },
  [
    "schemaVersion",
    "pageRole",
    "primaryAudience",
    "buyerStage",
    "primaryGoal",
    "primaryConceptIds",
    "secondaryConceptIds",
    "mustCommunicate",
    "verifiedClaims",
    "prohibitedClaims",
    "conversionIntent",
    "sectionIntents",
  ],
);

const membershipCriterionSchema = closedObject(
  {
    fieldPath: { type: "string", minLength: 2, maxLength: 240 },
    operator: {
      type: "string",
      enum: ["equals", "in", "range", "contains", "exists"],
    },
    values: { type: "array", items: {} },
    unit: { type: "string", maxLength: 40 },
    required: { type: "boolean" },
  },
  ["fieldPath", "operator", "values", "required"],
);

const differentiatorSchema = closedObject(
  {
    key: { type: "string", pattern: "^[a-z][a-z0-9_]*$", maxLength: 80 },
    label: { type: "string", minLength: 2, maxLength: 120 },
    sourcePaths: stringArray({ minItems: 1, maxItems: 20, uniqueItems: true }),
    values: { type: "array", items: {} },
    intentImpact: { type: "string", minLength: 5, maxLength: 400 },
  },
  ["key", "label", "sourcePaths", "values", "intentImpact"],
);

const conflictSchema = closedObject(
  {
    category: {
      type: "string",
      enum: [
        "certification_conflict",
        "material_conflict",
        "rated_current_conflict",
        "application_conflict",
        "rated_voltage_conflict",
        "standard_conflict",
        "safety_claim_conflict",
        "source_evidence_missing",
        "protected_value_mismatch",
        "other",
      ],
    },
    severity: { type: "string", enum: ["blocker", "high", "medium", "low"] },
    message: { type: "string", minLength: 5, maxLength: 400 },
    sourcePaths: stringArray({ maxItems: 20, uniqueItems: true }),
    comparedValues: stringArray({ maxItems: 20 }),
    affectedIntentPath: { type: "string", maxLength: 240 },
    detectionMethod: { type: "string", minLength: 3, maxLength: 120 },
    status: { type: "string", const: "open" },
  },
  [
    "category",
    "severity",
    "message",
    "sourcePaths",
    "comparedValues",
    "detectionMethod",
    "status",
  ],
);

export const L2_CANONICAL_INTENT_DRAFT_OUTPUT_SCHEMA = closedObject(
  {
    schemaVersion: { type: "integer", const: 1 },
    taskType: { type: "string", const: "l2_page_intent_draft" },
    intent: canonicalIntentSchema,
    hierarchyRecommendation: closedObject(
      {
        scope: {
          type: "string",
          enum: [
            "inherit_group",
            "family_template",
            "product_group",
            "page_delta",
            "manual_review",
          ],
        },
        reason: { type: "string", minLength: 10, maxLength: 600 },
        suggestedGroupKey: {
          type: "string",
          pattern: "^$|^[a-z][a-z0-9_]*$",
          maxLength: 100,
        },
        membershipCriteria: {
          type: "array",
          maxItems: 20,
          items: membershipCriterionSchema,
        },
        differentiators: {
          type: "array",
          maxItems: 20,
          items: differentiatorSchema,
        },
        groupPatch: {
          type: "array",
          maxItems: 30,
          items: patchOperationSchema,
        },
        pageDelta: { type: "array", maxItems: 30, items: patchOperationSchema },
      },
      [
        "scope",
        "reason",
        "suggestedGroupKey",
        "membershipCriteria",
        "differentiators",
        "groupPatch",
        "pageDelta",
      ],
    ),
    confidence: closedObject(
      {
        reported: { type: "number", minimum: 0, maximum: 1 },
        evidenceCoverage: { type: "number", minimum: 0, maximum: 1 },
        dimensions: closedObject(
          {
            familyMatch: { type: "number", minimum: 0, maximum: 1 },
            groupFit: { type: "number", minimum: 0, maximum: 1 },
            deltaCompleteness: { type: "number", minimum: 0, maximum: 1 },
            factualGrounding: { type: "number", minimum: 0, maximum: 1 },
          },
          ["familyMatch", "groupFit", "deltaCompleteness", "factualGrounding"],
        ),
        reasons: stringArray({ minItems: 1, maxItems: 10 }),
        uncertainPaths: stringArray({ maxItems: 30, uniqueItems: true }),
      },
      [
        "reported",
        "evidenceCoverage",
        "dimensions",
        "reasons",
        "uncertainPaths",
      ],
    ),
    conflicts: { type: "array", maxItems: 30, items: conflictSchema },
    reviewRequired: { type: "boolean" },
  },
  [
    "schemaVersion",
    "taskType",
    "intent",
    "hierarchyRecommendation",
    "confidence",
    "conflicts",
    "reviewRequired",
  ],
);

export const L2_CANONICAL_INTENT_DRAFT_SYSTEM_PROMPT = `You are a senior B2B industrial content strategist and localization knowledge architect.

Analyze one L2 product page and return a language-neutral Intent candidate. This is a general analysis draft for human review. It is not approved content, not a translation, and not permission to alter the Intent hierarchy.

The output contains two distinct layers:
1. intent: a complete page-level Canonical Intent matching the supplied schema exactly.
2. hierarchyRecommendation: a non-binding recommendation expressed with the existing Family Template, Product Group, and Page Delta contracts.

Rules:
- Return JSON only. Do not return Markdown or commentary.
- Write concise English as the canonical working language.
- Never output headlines, SEO titles, meta descriptions, CTA labels, paragraphs, or finished marketing copy.
- Use only facts present in SOURCE SNAPSHOT or approved terminology/context.
- Never invent materials, certifications, standards, ratings, dimensions, applications, production capabilities, MOQ, lead time, or performance claims.
- Every mustCommunicate item requires a stable snake_case key and at least one real source evidence path.
- Every verifiedClaim requires a real factPath and a narrowly bounded allowedMeaning.
- Use canonical concept IDs from APPROVED TERMINOLOGY when available. Do not invent concept IDs.
- Product pages split only by model, size, wire range, stud range, current range, packaging, or dimensions should normally inherit a group and use a Page Delta only when the difference changes user decisions or emphasis.
- groupPatch and pageDelta must use explicit add, replace, or remove operations. Keyed targets must use itemKey.
- Put source contradictions and unsupported high-risk facts in conflicts. Certification, material, rated current, and application conflicts always require human review.
- confidence.reported is the model estimate only. Never produce system confidence.
- Set reviewRequired to true for any open blocker/high conflict, evidence gap, uncertain hierarchy decision, reported confidence below 0.90, or evidence coverage below 0.90.
- Do not reveal chain-of-thought. confidence.reasons and hierarchyRecommendation.reason must be short evidence-based summaries.`;

export const L2_CANONICAL_INTENT_DRAFT_USER_PROMPT = `Create an L2 Canonical Intent analysis draft.

SOURCE LOCALE
{{sourceLocale}}

SOURCE SNAPSHOT
{{sourceContent}}

APPROVED TERMINOLOGY AND CONCEPT BINDINGS
{{terminology}}

CURRENT APPROVED INTENT HIERARCHY
{{hierarchyContext}}

Evaluate the page against the approved Family Template and Product Groups when they exist. If the hierarchy is empty, recommend family_template or manual_review; do not pretend a group already exists. Output one complete Canonical Intent plus a non-binding hierarchy recommendation matching the schema exactly.`;

export const L2_CANONICAL_INTENT_DRAFT_VALIDATION_RULES = [
  {
    id: "canonical-contract",
    severity: "error",
    rule: "intent must match the complete Canonical Intent contract without finished copy",
  },
  {
    id: "evidence-required",
    severity: "error",
    rule: "mustCommunicate and verifiedClaims must reference real paths in the supplied Source Snapshot",
  },
  {
    id: "concept-id-authority",
    severity: "error",
    rule: "primaryConceptIds and secondaryConceptIds may only use IDs supplied in approved terminology/context",
  },
  {
    id: "patch-contract",
    severity: "error",
    rule: "groupPatch and pageDelta must use schema-aware patch operations and stable item keys",
  },
  {
    id: "mandatory-conflict-review",
    severity: "error",
    rule: "certification, material, rated current, and application conflicts require reviewRequired=true",
  },
  {
    id: "confidence-routing",
    severity: "error",
    rule: "reported confidence or evidence coverage below 0.90 requires reviewRequired=true",
  },
  {
    id: "analysis-only",
    severity: "error",
    rule: "the result is a draft recommendation and must not claim approval or automatically alter hierarchy state",
  },
] as const;

const GEMINI_JSON_SCHEMA_KEYS = new Set([
  "type",
  "enum",
  "items",
  "properties",
  "additionalProperties",
  "required",
]);

/**
 * Gemini accepts only a documented subset of JSON Schema. Keep the canonical
 * schema strict for local validation, while producing a portable provider
 * schema for generation. A JSON Schema `const` maps cleanly to a one-item enum.
 */
export function simplifyJsonSchemaForGemini(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(simplifyJsonSchemaForGemini);
  }
  if (!value || typeof value !== "object") return value;

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  if ("const" in source) {
    result.enum = [source.const];
  }
  for (const [key, child] of Object.entries(source)) {
    if (key === "const" || !GEMINI_JSON_SCHEMA_KEYS.has(key)) continue;
    if (key === "properties" || key === "$defs") {
      const entries =
        child && typeof child === "object" && !Array.isArray(child)
          ? Object.entries(child as Record<string, unknown>)
          : [];
      result[key] = Object.fromEntries(
        entries.map(([name, schema]) => [
          name,
          simplifyJsonSchemaForGemini(schema),
        ]),
      );
      continue;
    }
    result[key] = simplifyJsonSchemaForGemini(child);
  }
  return result;
}

const BASE_CANONICAL_PAGE_INTENT_PRESET = {
  purpose:
    "Produce a general, evidence-grounded L2 Canonical Intent analysis draft using the approved Template → Group → Delta contracts. Results require human review before entering the Intent hierarchy.",
  tags: [
    "localization",
    "canonical-intent",
    "content-planning",
    "page-analysis",
    "l2-product-page",
    "intent-classification",
    "manual-review",
  ],
  inputVariables: [
    "sourceLocale",
    "sourceContent",
    "terminology",
    "hierarchyContext",
  ],
  validationRules: [...L2_CANONICAL_INTENT_DRAFT_VALIDATION_RULES],
  systemPrompt: L2_CANONICAL_INTENT_DRAFT_SYSTEM_PROMPT,
  userPromptTemplate: L2_CANONICAL_INTENT_DRAFT_USER_PROMPT,
} as const;

const L2_INTENT_DRAFT_REQUIRED_INPUTS = [
  "sourceLocale",
  "sourceContent",
  "terminology",
  "hierarchyContext",
] as const;

const L2_INTENT_DRAFT_REQUIRED_OUTPUTS = [
  "schemaVersion",
  "taskType",
  "intent",
  "hierarchyRecommendation",
  "confidence",
  "conflicts",
  "reviewRequired",
] as const;

type L2IntentDraftPresetDescriptor = {
  enabled: boolean;
  tags: readonly string[];
};

type L2IntentDraftVersionDescriptor = {
  inputVariables: readonly string[];
  outputSchema: unknown;
};

/**
 * Identifies presets that can safely occupy the L2 Intent Analysis Draft task
 * slot. Compatibility is contract-based so provider-specific presets can be
 * added without extending a slug allow-list.
 */
export function isL2IntentDraftPresetVersionCompatible(
  preset: L2IntentDraftPresetDescriptor,
  version: L2IntentDraftVersionDescriptor,
) {
  if (!preset.enabled) return false;
  if (
    !preset.tags.includes("canonical-intent") ||
    !preset.tags.includes("l2-product-page") ||
    !L2_INTENT_DRAFT_REQUIRED_INPUTS.every((input) =>
      version.inputVariables.includes(input),
    )
  ) {
    return false;
  }

  if (
    !version.outputSchema ||
    typeof version.outputSchema !== "object" ||
    Array.isArray(version.outputSchema)
  ) {
    return false;
  }
  const schema = version.outputSchema as Record<string, unknown>;
  const required = Array.isArray(schema.required) ? schema.required : [];
  const properties =
    schema.properties &&
    typeof schema.properties === "object" &&
    !Array.isArray(schema.properties)
      ? (schema.properties as Record<string, unknown>)
      : {};
  if (
    !L2_INTENT_DRAFT_REQUIRED_OUTPUTS.every(
      (key) => required.includes(key) && key in properties,
    )
  ) {
    return false;
  }

  const taskType = properties.taskType;
  if (!taskType || typeof taskType !== "object" || Array.isArray(taskType)) {
    return false;
  }
  const taskTypeSchema = taskType as Record<string, unknown>;
  return (
    taskTypeSchema.const === "l2_page_intent_draft" ||
    (Array.isArray(taskTypeSchema.enum) &&
      taskTypeSchema.enum.includes("l2_page_intent_draft"))
  );
}

export const L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET = {
  ...BASE_CANONICAL_PAGE_INTENT_PRESET,
  name: "Canonical Page Intent Draft-deepseek",
  slug: "canonical-page-intent-draft-deepseek",
  providerKeys: ["deepseek"],
  outputSchema: L2_CANONICAL_INTENT_DRAFT_OUTPUT_SCHEMA,
  defaultTemperature: 0.15,
  defaultTopP: 0.9,
  defaultMaxTokens: 12_000,
  changeNote:
    "Provider-specific DeepSeek preset with the full canonical validation schema.",
} as const;

function buildGeminiIntentDraftOutputSchema() {
  const schema = simplifyJsonSchemaForGemini(
    L2_CANONICAL_INTENT_DRAFT_OUTPUT_SCHEMA,
  ) as Record<string, unknown>;
  const properties = schema.properties as Record<string, unknown>;
  const intent = properties.intent as Record<string, unknown>;
  const intentProperties = intent.properties as Record<string, unknown>;
  const mustCommunicate = intentProperties.mustCommunicate as Record<
    string,
    unknown
  >;
  const communicationItem = mustCommunicate.items as Record<string, unknown>;
  const communicationProperties = communicationItem.properties as Record<
    string,
    unknown
  >;
  const evidencePaths = communicationProperties.evidencePaths as Record<
    string,
    unknown
  >;
  // One small provider constraint prevents Gemini from satisfying an inherited
  // communication requirement with an empty evidence array. Large/nested
  // maxItems and numeric bounds remain local to avoid provider state explosion.
  evidencePaths.minItems = 1;
  return schema;
}

export const L2_CANONICAL_INTENT_DRAFT_GEMINI_OUTPUT_SCHEMA =
  buildGeminiIntentDraftOutputSchema();

export const L2_CANONICAL_INTENT_DRAFT_GEMINI_PRESET = {
  ...BASE_CANONICAL_PAGE_INTENT_PRESET,
  name: "Canonical Page Intent Draft-gemini",
  slug: "canonical-page-intent-draft-gemini",
  providerKeys: ["gemini"],
  systemPrompt: `${L2_CANONICAL_INTENT_DRAFT_SYSTEM_PROMPT}

Gemini structured-output clarifications:
- When APPROVED TERMINOLOGY is an empty array, every primaryConceptIds, secondaryConceptIds, and requiredConceptIds array must be empty. Never create a concept ID from a product name.
- Never emit a mustCommunicate item with an empty evidencePaths array. Record an unsupported inherited requirement only as a source_evidence_missing conflict.
- Every evidencePaths, factPath, requiredFactPaths, and sourcePaths value must be a path visibly present in SOURCE SNAPSHOT. Do not reconstruct a path from hierarchy expectations.`,
  userPromptTemplate: `${L2_CANONICAL_INTENT_DRAFT_USER_PROMPT}

FINAL CONTRACT CHECK
Before returning JSON, remove every mustCommunicate item whose evidencePaths would be empty. Keep the missing inherited requirement only in conflicts with category source_evidence_missing. If APPROVED TERMINOLOGY is [], all concept ID arrays must be [].`,
  outputSchema: L2_CANONICAL_INTENT_DRAFT_GEMINI_OUTPUT_SCHEMA,
  defaultTemperature: 0.1,
  defaultTopP: 0.9,
  defaultMaxTokens: 8_192,
  changeNote:
    "Gemini-specific v6 nested schema with a targeted non-empty communication evidence constraint and final contract check.",
} as const;

// Kept as a source-compatible alias for local contract tests and older imports.
export const L2_CANONICAL_INTENT_DRAFT_PRESET =
  L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET;
