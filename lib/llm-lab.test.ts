import { describe, expect, it } from "vitest";
import {
  assertSafeProviderUrl,
  buildGeminiGenerateContentRequest,
  buildGeminiInlineBatchEntry,
  getGeminiThinkingBudget,
  normalizeLabParameters,
  parseStructuredOutput,
  renderPromptTemplate,
  validateJsonSchema,
} from "./llm-lab";
import {
  isL2IntentDraftPresetVersionCompatible,
  L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET,
  L2_CANONICAL_INTENT_DRAFT_GEMINI_PRESET,
  L2_CANONICAL_INTENT_DRAFT_OUTPUT_SCHEMA,
  simplifyJsonSchemaForGemini,
} from "./i18n/l2-intent-preset";

describe("L2 Intent Analysis Draft compatibility", () => {
  it("accepts provider-specific presets that satisfy the shared contract", () => {
    for (const preset of [
      L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET,
      L2_CANONICAL_INTENT_DRAFT_GEMINI_PRESET,
    ]) {
      expect(
        isL2IntentDraftPresetVersionCompatible(
          { enabled: true, tags: preset.tags },
          {
            inputVariables: preset.inputVariables,
            outputSchema: preset.outputSchema,
          },
        ),
      ).toBe(true);
    }
  });

  it("rejects a generic draft that is missing an L2 contract requirement", () => {
    expect(
      isL2IntentDraftPresetVersionCompatible(
        {
          enabled: true,
          tags: ["canonical-intent", "l2-product-page"],
        },
        {
          inputVariables: ["sourceLocale", "sourceContent", "terminology"],
          outputSchema: L2_CANONICAL_INTENT_DRAFT_OUTPUT_SCHEMA,
        },
      ),
    ).toBe(false);
  });
});

describe("LLM Prompt Lab utilities", () => {
  it("renders known variables and rejects missing variables", () => {
    expect(
      renderPromptTemplate("{{sourceLocale}} -> {{ targetLocale }}", {
        sourceLocale: "en",
        targetLocale: "ru",
      }),
    ).toBe("en -> ru");
    expect(() => renderPromptTemplate("{{missing}}", {})).toThrow(
      "missing_prompt_variables:missing",
    );
  });

  it("parses fenced JSON and validates required properties", () => {
    const output = parseStructuredOutput('```json\n{"title":"Пример"}\n```');
    const valid = validateJsonSchema(output, {
      type: "object",
      required: ["title"],
      additionalProperties: false,
      properties: { title: { type: "string" } },
    });
    expect(valid).toEqual({ valid: true, errors: [] });
    expect(
      validateJsonSchema({}, { type: "object", required: ["title"] }).valid,
    ).toBe(false);
  });

  it("enforces numeric, array, pattern, and const constraints", () => {
    const schema = {
      type: "object",
      required: ["schemaVersion", "confidence", "keys"],
      properties: {
        schemaVersion: { type: "integer", const: 1 },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        keys: {
          type: "array",
          minItems: 1,
          maxItems: 2,
          uniqueItems: true,
          items: { type: "string", pattern: "^[a-z_]+$" },
        },
      },
    };

    expect(
      validateJsonSchema(
        { schemaVersion: 2, confidence: 1.2, keys: ["Bad-Key", "Bad-Key"] },
        schema,
      ).errors,
    ).toEqual(
      expect.arrayContaining([
        "$.schemaVersion: value does not match const",
        "$.confidence: higher than maximum",
        "$.keys: items are not unique",
        "$.keys[0]: does not match pattern",
      ]),
    );
    expect(
      validateJsonSchema(
        { confidence: 1 },
        {
          type: "object",
          required: ["confidence"],
          properties: { confidence: { type: "number" } },
        },
      ),
    ).toEqual({ valid: true, errors: [] });
  });

  it("filters unsupported temperature and enforces parameter limits", () => {
    expect(
      normalizeLabParameters(
        { temperature: 0.4, maxTokens: 100 },
        {
          supportsTemperature: false,
          maxOutputTokens: 200,
        },
      ),
    ).toEqual({
      parameters: { maxTokens: 100 },
      warnings: ["temperature_not_supported"],
    });
  });

  it("blocks unsafe provider URLs", () => {
    expect(assertSafeProviderUrl("https://api.example.com/v1/")).toBe(
      "https://api.example.com/v1",
    );
    expect(() => assertSafeProviderUrl("http://api.example.com")).toThrow(
      "provider_url_must_use_https",
    );
    expect(() => assertSafeProviderUrl("https://127.0.0.1/v1")).toThrow(
      "provider_url_private_network_blocked",
    );
  });

  it("builds Gemini requests with responseJsonSchema instead of responseSchema", () => {
    const request = buildGeminiGenerateContentRequest({
      systemPrompt: "Return JSON.",
      userPrompt: "Analyze this page.",
      outputSchema: { type: "object", additionalProperties: false },
      parameters: { temperature: 0.1, topP: 0.9, maxTokens: 8192 },
    });
    expect(request.generationConfig).toMatchObject({
      responseMimeType: "application/json",
      responseJsonSchema: { type: "object", additionalProperties: false },
      temperature: 0.1,
      topP: 0.9,
      maxOutputTokens: 8192,
    });
    expect(request.generationConfig).not.toHaveProperty("responseSchema");
    expect(buildGeminiInlineBatchEntry("result-1", request)).toEqual({
      request,
      metadata: { key: "result-1" },
    });
  });

  it("caps Gemini 2.5 Flash thinking so structured output has token headroom", () => {
    expect(getGeminiThinkingBudget("gemini-2.5-flash")).toBe(1024);
    expect(getGeminiThinkingBudget("gemini-2.5-pro")).toBeUndefined();
    const request = buildGeminiGenerateContentRequest({
      systemPrompt: "Return JSON.",
      userPrompt: "Analyze this page.",
      outputSchema: { type: "object" },
      parameters: { maxTokens: 8192 },
      thinkingBudget: getGeminiThinkingBudget("gemini-2.5-flash"),
    });
    expect(request.generationConfig.thinkingConfig).toEqual({
      thinkingBudget: 1024,
    });
  });

  it("simplifies the canonical schema to Gemini's supported subset", () => {
    const simplified = simplifyJsonSchemaForGemini({
      type: "object",
      additionalProperties: false,
      properties: {
        schemaVersion: { type: "integer", const: 1 },
        keys: {
          type: "array",
          uniqueItems: true,
          items: { type: "string", pattern: "^[a-z]+$", maxLength: 20 },
        },
      },
    });
    expect(simplified).toEqual({
      type: "object",
      additionalProperties: false,
      properties: {
        schemaVersion: { enum: [1], type: "integer" },
        keys: { type: "array", items: { type: "string" } },
      },
    });
    const serialized = JSON.stringify(
      L2_CANONICAL_INTENT_DRAFT_GEMINI_PRESET.outputSchema,
    );
    expect(serialized).not.toContain("uniqueItems");
    expect(serialized).not.toContain("minLength");
    expect(serialized).not.toContain("maxLength");
    expect(serialized).not.toContain("pattern");
    expect(serialized).not.toContain('"const"');
    expect(serialized).not.toContain("maxItems");
    expect(serialized).not.toContain("minimum");
    expect(serialized).not.toContain("maximum");
    const schema = L2_CANONICAL_INTENT_DRAFT_GEMINI_PRESET.outputSchema as {
      properties: {
        intent: { required: string[]; properties: Record<string, unknown> };
      };
    };
    expect(schema.properties.intent.required).toEqual(
      expect.arrayContaining([
        "primaryGoal",
        "mustCommunicate",
        "sectionIntents",
      ]),
    );
    expect(schema.properties.intent.properties).toHaveProperty("primaryGoal");
    expect(
      (
        schema.properties.intent.properties.mustCommunicate as {
          items: { properties: { evidencePaths: { minItems: number } } };
        }
      ).items.properties.evidencePaths.minItems,
    ).toBe(1);
  });

  it("accepts an L2 intent candidate that matches the production contracts", () => {
    const candidate = {
      schemaVersion: 1,
      taskType: "l2_page_intent_draft",
      intent: {
        schemaVersion: 1,
        pageRole: "industrial_product_selection",
        primaryAudience: ["electrical_engineer"],
        buyerStage: ["evaluation"],
        primaryGoal: "Help buyers select the suitable product range",
        primaryConceptIds: [],
        secondaryConceptIds: [],
        mustCommunicate: [
          {
            key: "product_scope",
            intent: "Define the applicable product range",
            evidencePaths: ["sourcePayload.summary"],
          },
        ],
        verifiedClaims: [],
        prohibitedClaims: ["Unsupported certification claims"],
        conversionIntent: { primaryAction: "request_quote" },
        sectionIntents: [
          {
            sectionKey: "overview",
            purpose: "Define the product and its selection scope",
            requiredConceptIds: [],
            requiredFactPaths: ["sourcePayload.summary"],
          },
        ],
      },
      hierarchyRecommendation: {
        scope: "manual_review",
        reason: "No approved hierarchy exists for reliable inheritance",
        suggestedGroupKey: "",
        membershipCriteria: [],
        differentiators: [],
        groupPatch: [],
        pageDelta: [],
      },
      confidence: {
        reported: 0.8,
        evidenceCoverage: 0.8,
        dimensions: {
          familyMatch: 0.9,
          groupFit: 0.5,
          deltaCompleteness: 0.5,
          factualGrounding: 0.9,
        },
        reasons: ["The source defines the product family"],
        uncertainPaths: ["evidencePayload.attributes"],
      },
      conflicts: [],
      reviewRequired: true,
    };

    expect(
      validateJsonSchema(candidate, L2_CANONICAL_INTENT_DRAFT_OUTPUT_SCHEMA),
    ).toEqual({ valid: true, errors: [] });
  });
});
