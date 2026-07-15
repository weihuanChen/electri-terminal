import type { StaticPageKey, Locale } from "./i18n/config";
import type { StaticPageStructuredContent } from "./i18n/staticPageContent";

export const LAB_TEMPLATE_VARIABLES = [
  "sourceLocale",
  "targetLocale",
  "sourceContent",
  "terminology",
] as const;

export const LAB_MAX_SOURCE_CHARS = 180_000;
export const LAB_MAX_OUTPUT_CHARS = 500_000;
export const LAB_MAX_MODELS_PER_RUN = 6;

export type LabParameters = {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
};

export type GeminiGenerateContentRequest = {
  systemInstruction: { parts: Array<{ text: string }> };
  contents: Array<{ role: "user"; parts: Array<{ text: string }> }>;
  generationConfig: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
    thinkingConfig?: { thinkingBudget: number };
    responseMimeType: "application/json";
    responseJsonSchema: Record<string, unknown>;
  };
};

export function buildGeminiGenerateContentRequest(args: {
  systemPrompt: string;
  userPrompt: string;
  outputSchema: Record<string, unknown>;
  parameters: LabParameters;
  thinkingBudget?: number;
}): GeminiGenerateContentRequest {
  return {
    systemInstruction: { parts: [{ text: args.systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: args.userPrompt }] }],
    generationConfig: {
      ...(args.parameters.temperature === undefined
        ? {}
        : { temperature: args.parameters.temperature }),
      ...(args.parameters.topP === undefined
        ? {}
        : { topP: args.parameters.topP }),
      ...(args.parameters.maxTokens === undefined
        ? {}
        : { maxOutputTokens: args.parameters.maxTokens }),
      ...(args.thinkingBudget === undefined
        ? {}
        : { thinkingConfig: { thinkingBudget: args.thinkingBudget } }),
      responseMimeType: "application/json",
      responseJsonSchema: args.outputSchema,
    },
  };
}

export function getGeminiThinkingBudget(modelId: string) {
  if (
    modelId === "gemini-2.5-flash" ||
    modelId.startsWith("gemini-2.5-flash-preview-")
  ) {
    return 1_024;
  }
  return undefined;
}

/**
 * REST payload entry for Gemini's asynchronous inline Batch API. The caller is
 * responsible for persisting the returned batch name before polling it.
 */
export function buildGeminiInlineBatchEntry(
  key: string,
  request: GeminiGenerateContentRequest,
) {
  if (!key.trim()) throw new Error("gemini_batch_key_required");
  return { request, metadata: { key } };
}

export type LabPromptSnapshot = {
  systemPrompt: string;
  userPromptTemplate: string;
  inputVariables: string[];
  outputSchema: Record<string, unknown>;
  validationRules: unknown[];
  version: number;
};

export type LocalizationDraftCandidate = {
  entityType: "staticPage";
  sourceId: StaticPageKey;
  locale: Locale;
  status: "draft";
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  localizedFields: {
    headline?: string;
    intro?: string;
    primaryCta?: string;
    secondaryCta?: string;
    content?: StaticPageStructuredContent;
  };
  translationMethod: "llm";
  generatedBy: string;
  reviewRequired: true;
  provenance: {
    labRunId: string;
    labResultId: string;
    presetVersionId: string;
    providerKey: string;
    modelId: string;
  };
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function renderPromptTemplate(
  template: string,
  variables: Record<string, string>,
) {
  const missing = new Set<string>();
  const rendered = template.replace(
    /\{\{\s*([A-Za-z][\w]*)\s*\}\}/g,
    (_, key: string) => {
      if (!(key in variables)) {
        missing.add(key);
        return "";
      }
      return variables[key];
    },
  );

  if (missing.size > 0) {
    throw new Error(`missing_prompt_variables:${[...missing].join(",")}`);
  }
  return rendered;
}

export function parseStructuredOutput(rawText: string) {
  const trimmed = rawText.trim();
  const fenced =
    trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)?.[1] ?? trimmed;
  const parsed = JSON.parse(fenced) as unknown;
  if (!isPlainObject(parsed))
    throw new Error("structured_output_must_be_object");
  return parsed;
}

function valueType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function matchesSchemaType(value: unknown, expected: unknown) {
  const actual = valueType(value);
  return expected === actual || (expected === "number" && actual === "integer");
}

function validateNode(
  value: unknown,
  schema: Record<string, unknown>,
  path: string,
  errors: string[],
) {
  const allowedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
  if (
    schema.type &&
    !allowedTypes.some((type) => matchesSchemaType(value, type))
  ) {
    errors.push(
      `${path}: expected ${allowedTypes.join("|")}, received ${valueType(value)}`,
    );
    return;
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${path}: value is not in enum`);
  }
  if ("const" in schema && value !== schema.const) {
    errors.push(`${path}: value does not match const`);
  }
  if (typeof value === "number") {
    if (typeof schema.minimum === "number" && value < schema.minimum) {
      errors.push(`${path}: lower than minimum`);
    }
    if (typeof schema.maximum === "number" && value > schema.maximum) {
      errors.push(`${path}: higher than maximum`);
    }
  }
  if (typeof value === "string") {
    if (
      typeof schema.minLength === "number" &&
      value.length < schema.minLength
    ) {
      errors.push(`${path}: shorter than minLength`);
    }
    if (
      typeof schema.maxLength === "number" &&
      value.length > schema.maxLength
    ) {
      errors.push(`${path}: longer than maxLength`);
    }
    if (typeof schema.pattern === "string") {
      try {
        if (!new RegExp(schema.pattern).test(value)) {
          errors.push(`${path}: does not match pattern`);
        }
      } catch {
        errors.push(`${path}: schema pattern is invalid`);
      }
    }
  }
  if (Array.isArray(value)) {
    if (typeof schema.minItems === "number" && value.length < schema.minItems) {
      errors.push(`${path}: fewer than minItems`);
    }
    if (typeof schema.maxItems === "number" && value.length > schema.maxItems) {
      errors.push(`${path}: more than maxItems`);
    }
    if (schema.uniqueItems === true) {
      const normalized = value.map((item) => JSON.stringify(item));
      if (new Set(normalized).size !== normalized.length) {
        errors.push(`${path}: items are not unique`);
      }
    }
    if (isPlainObject(schema.items)) {
      value.forEach((item, index) =>
        validateNode(
          item,
          schema.items as Record<string, unknown>,
          `${path}[${index}]`,
          errors,
        ),
      );
    }
  }
  if (isPlainObject(value)) {
    const required = Array.isArray(schema.required)
      ? schema.required.filter((key): key is string => typeof key === "string")
      : [];
    required.forEach((key) => {
      if (!(key in value)) errors.push(`${path}.${key}: required`);
    });
    const properties = isPlainObject(schema.properties)
      ? schema.properties
      : {};
    Object.entries(properties).forEach(([key, childSchema]) => {
      if (key in value && isPlainObject(childSchema)) {
        validateNode(value[key], childSchema, `${path}.${key}`, errors);
      }
    });
    if (schema.additionalProperties === false) {
      Object.keys(value).forEach((key) => {
        if (!(key in properties))
          errors.push(`${path}.${key}: additional property`);
      });
    }
  }
}

export function validateJsonSchema(
  value: unknown,
  schema: Record<string, unknown>,
) {
  const errors: string[] = [];
  validateNode(value, schema, "$", errors);
  return { valid: errors.length === 0, errors };
}

export function normalizeLabParameters(
  requested: LabParameters,
  model: {
    supportsTemperature: boolean;
    minTemperature?: number;
    maxTemperature?: number;
    maxOutputTokens?: number;
    defaultTemperature?: number;
    defaultTopP?: number;
    defaultMaxTokens?: number;
  },
) {
  const parameters: LabParameters = {};
  const warnings: string[] = [];
  const temperature = requested.temperature ?? model.defaultTemperature;
  if (temperature !== undefined) {
    if (!model.supportsTemperature) {
      warnings.push("temperature_not_supported");
    } else {
      const min = model.minTemperature ?? 0;
      const max = model.maxTemperature ?? 2;
      if (temperature < min || temperature > max) {
        throw new Error(`temperature_out_of_range:${min}:${max}`);
      }
      parameters.temperature = temperature;
    }
  }
  const topP = requested.topP ?? model.defaultTopP;
  if (topP !== undefined) {
    if (topP < 0 || topP > 1) throw new Error("top_p_out_of_range");
    parameters.topP = topP;
  }
  const maxTokens = requested.maxTokens ?? model.defaultMaxTokens;
  if (maxTokens !== undefined) {
    const upper = model.maxOutputTokens ?? 131_072;
    if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > upper) {
      throw new Error(`max_tokens_out_of_range:1:${upper}`);
    }
    parameters.maxTokens = maxTokens;
  }
  return { parameters, warnings };
}

export function assertSafeProviderUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:") throw new Error("provider_url_must_use_https");
  const hostname = url.hostname.toLowerCase();
  const blocked =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname.startsWith("169.254.") ||
    hostname.endsWith(".local");
  if (blocked) throw new Error("provider_url_private_network_blocked");
  url.username = "";
  url.password = "";
  return url.toString().replace(/\/$/, "");
}
