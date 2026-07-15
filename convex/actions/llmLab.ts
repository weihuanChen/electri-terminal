"use node";

import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import {
  assertSafeProviderUrl,
  buildGeminiGenerateContentRequest,
  getGeminiThinkingBudget,
  LAB_MAX_OUTPUT_CHARS,
  normalizeLabParameters,
  parseStructuredOutput,
  renderPromptTemplate,
  validateJsonSchema,
} from "../../lib/llm-lab";
import { fetchWithProviderRetry } from "../../lib/llm-provider-retry";
import {
  assertCanonicalIntentContract,
  assertIntentPatchOperations,
  requiresManualIntentReview,
  type CanonicalIntentPayload,
  type IntentPatchOperation,
} from "../lib/localizationFoundation";

type ExecutionContext = {
  result: { _id: Id<"llmLabResults"> };
  run: {
    taskSlot?: string;
    variables: Record<string, string>;
    parameters: { temperature?: number; topP?: number; maxTokens?: number };
    presetSnapshot: {
      slug?: string;
      version?: number;
      systemPrompt: string;
      userPromptTemplate: string;
      outputSchema: Record<string, unknown>;
    };
  };
  model: {
    modelId: string;
    supportsTemperature: boolean;
    minTemperature?: number;
    maxTemperature?: number;
    maxOutputTokens?: number;
    defaultTemperature?: number;
    defaultTopP?: number;
    defaultMaxTokens?: number;
  };
  provider: {
    key: string;
    protocol: "openai_compatible" | "gemini";
    baseUrl: string;
    apiKeyEnvVar: string;
    authMode: "bearer" | "api_key";
  };
};

function validateL2IntentCandidate(
  output: Record<string, unknown>,
  variables: Record<string, string>,
) {
  const errors: string[] = [];
  const intentCandidate = output.intent;
  let intent: CanonicalIntentPayload | undefined;
  const recommendation = output.hierarchyRecommendation as
    | {
        groupPatch?: IntentPatchOperation[];
        pageDelta?: IntentPatchOperation[];
      }
    | undefined;
  const confidence = output.confidence as
    { reported?: number; evidenceCoverage?: number } | undefined;
  const conflicts = Array.isArray(output.conflicts)
    ? (output.conflicts as Array<{
        category: string;
        status: "open" | "resolved" | "accepted_exception";
      }>)
    : [];
  try {
    assertCanonicalIntentContract(intentCandidate);
    intent = intentCandidate as CanonicalIntentPayload;
    const sectionKeys = intent.sectionIntents.map((item) => item.sectionKey);
    if (new Set(sectionKeys).size !== sectionKeys.length) {
      throw new Error("canonical_intent_duplicate_section_key");
    }
    const claimKeys = intent.verifiedClaims.map((item) => item.claimKey);
    if (new Set(claimKeys).size !== claimKeys.length) {
      throw new Error("canonical_intent_duplicate_claim_key");
    }
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "invalid_canonical_intent",
    );
  }
  for (const [label, operations] of [
    ["groupPatch", recommendation?.groupPatch ?? []],
    ["pageDelta", recommendation?.pageDelta ?? []],
  ] as const) {
    try {
      assertIntentPatchOperations(operations);
    } catch (error) {
      errors.push(
        `${label}:${error instanceof Error ? error.message : "invalid_patch"}`,
      );
    }
  }
  if (
    (typeof confidence?.reported === "number" && confidence.reported < 0.9) ||
    (typeof confidence?.evidenceCoverage === "number" &&
      confidence.evidenceCoverage < 0.9) ||
    requiresManualIntentReview(conflicts)
  ) {
    if (output.reviewRequired !== true) {
      errors.push("review_required_by_confidence_or_conflict");
    }
  }
  if (intent) {
    let terminology: Array<{ conceptId?: string }>;
    try {
      const parsed = JSON.parse(variables.terminology ?? "[]") as unknown;
      if (!Array.isArray(parsed)) throw new Error("terminology_must_be_array");
      terminology = parsed as Array<{ conceptId?: string }>;
    } catch {
      errors.push("invalid_terminology_context");
      return errors;
    }
    try {
      const allowedConceptIds = new Set(
        terminology.map((item) => item.conceptId).filter(Boolean),
      );
      const usedConceptIds = [
        ...intent.primaryConceptIds,
        ...intent.secondaryConceptIds,
        ...intent.sectionIntents.flatMap((section) =>
          "requiredConceptIds" in section ? section.requiredConceptIds : [],
        ),
      ];
      for (const conceptId of usedConceptIds) {
        if (!allowedConceptIds.has(conceptId)) {
          errors.push(`unapproved_concept_id:${conceptId}`);
        }
      }
    } catch {
      errors.push("canonical_intent_concept_fields_invalid");
    }
  }
  return errors;
}

function assertToken(token: string) {
  const expected = process.env.LLM_LAB_INTERNAL_TOKEN;
  if (!expected || token !== expected) throw new Error("llm_lab_unauthorized");
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

async function invoke(context: ExecutionContext) {
  const { run, model, provider } = context;
  const apiKey = process.env[provider.apiKeyEnvVar];
  if (!apiKey) throw new Error(`provider_key_missing:${provider.apiKeyEnvVar}`);
  const baseUrl = assertSafeProviderUrl(provider.baseUrl);
  const userPrompt = renderPromptTemplate(
    run.presetSnapshot.userPromptTemplate,
    run.variables,
  );
  const { parameters, warnings } = normalizeLabParameters(
    run.parameters,
    model,
  );
  const messages = [
    { role: "system" as const, content: run.presetSnapshot.systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];
  const geminiThinkingBudget =
    provider.protocol === "gemini"
      ? getGeminiThinkingBudget(model.modelId)
      : undefined;
  const requestSnapshot = {
    providerKey: provider.key,
    modelId: model.modelId,
    messages,
    outputSchema: run.presetSnapshot.outputSchema,
    parameters,
    ...(geminiThinkingBudget === undefined
      ? {}
      : { thinkingBudget: geminiThinkingBudget }),
    warnings,
  };
  const started = Date.now();
  let response: Response;
  if (provider.protocol === "gemini") {
    const geminiRequest = buildGeminiGenerateContentRequest({
      systemPrompt: messages[0].content,
      userPrompt,
      outputSchema: run.presetSnapshot.outputSchema,
      parameters,
      thinkingBudget: geminiThinkingBudget,
    });
    response = await fetchWithProviderRetry((signal) =>
      fetch(`${baseUrl}/models/${encodeURIComponent(model.modelId)}:generateContent`, {
        method: "POST",
        redirect: "error",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(geminiRequest),
        signal,
      }),
    );
  } else {
    const endpoint = baseUrl.endsWith("/v1")
      ? `${baseUrl}/chat/completions`
      : `${baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    headers[provider.authMode === "api_key" ? "api-key" : "authorization"] =
      provider.authMode === "api_key" ? apiKey : `Bearer ${apiKey}`;
    response = await fetchWithProviderRetry((signal) =>
      fetch(endpoint, {
        method: "POST",
        redirect: "error",
        headers,
        body: JSON.stringify({
          model: model.modelId,
          messages,
          stream: false,
          response_format: { type: "json_object" },
          ...(parameters.temperature === undefined
            ? {}
            : { temperature: parameters.temperature }),
          ...(parameters.topP === undefined ? {} : { top_p: parameters.topP }),
          ...(parameters.maxTokens === undefined
            ? {}
            : { max_tokens: parameters.maxTokens }),
        }),
        signal,
      }),
    );
  }
  const latencyMs = Date.now() - started;
  const body = (await response.json()) as Record<string, unknown>;
  if (!response.ok)
    throw new Error(
      `provider_http_${response.status}:${JSON.stringify(body).slice(0, 800)}`,
    );
  let rawText = "";
  let finishReason: string | undefined;
  let providerRequestId: string | undefined;
  let usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  } = {};
  if (provider.protocol === "gemini") {
    const candidate = (
      body.candidates as Array<Record<string, unknown>> | undefined
    )?.[0];
    const content = candidate?.content as Record<string, unknown> | undefined;
    const part = (
      content?.parts as Array<Record<string, unknown>> | undefined
    )?.[0];
    rawText = text(part?.text) ?? "";
    finishReason = text(candidate?.finishReason);
    providerRequestId = text(body.responseId);
    const metadata = body.usageMetadata as Record<string, unknown> | undefined;
    usage = {
      inputTokens:
        typeof metadata?.promptTokenCount === "number"
          ? metadata.promptTokenCount
          : undefined,
      outputTokens:
        typeof metadata?.candidatesTokenCount === "number"
          ? metadata.candidatesTokenCount
          : undefined,
      totalTokens:
        typeof metadata?.totalTokenCount === "number"
          ? metadata.totalTokenCount
          : undefined,
    };
  } else {
    const choice = (
      body.choices as Array<Record<string, unknown>> | undefined
    )?.[0];
    const message = choice?.message as Record<string, unknown> | undefined;
    rawText = text(message?.content) ?? "";
    finishReason = text(choice?.finish_reason);
    providerRequestId = text(body.id);
    const apiUsage = body.usage as Record<string, unknown> | undefined;
    usage = {
      inputTokens:
        typeof apiUsage?.prompt_tokens === "number"
          ? apiUsage.prompt_tokens
          : undefined,
      outputTokens:
        typeof apiUsage?.completion_tokens === "number"
          ? apiUsage.completion_tokens
          : undefined,
      totalTokens:
        typeof apiUsage?.total_tokens === "number"
          ? apiUsage.total_tokens
          : undefined,
    };
  }
  if (!rawText) throw new Error("provider_returned_empty_output");
  if (rawText.length > LAB_MAX_OUTPUT_CHARS)
    throw new Error("provider_output_too_large");
  let parsedOutput: Record<string, unknown> | undefined;
  let validationErrors: string[] = [];
  try {
    parsedOutput = parseStructuredOutput(rawText);
    validationErrors = validateJsonSchema(
      parsedOutput,
      run.presetSnapshot.outputSchema,
    ).errors;
    if (
      validationErrors.length === 0 &&
      run.taskSlot === "l2_page_intent_draft"
    ) {
      validationErrors.push(
        ...validateL2IntentCandidate(parsedOutput, run.variables),
      );
    }
  } catch (error) {
    validationErrors = [
      error instanceof Error ? error.message : "invalid_json",
    ];
  }
  return {
    requestSnapshot,
    rawText,
    parsedOutput,
    schemaValid: validationErrors.length === 0,
    validationErrors,
    ...usage,
    latencyMs,
    finishReason,
    providerRequestId,
  };
}

export const executeModel = internalAction({
  args: { resultId: v.id("llmLabResults") },
  handler: async (ctx, args) => {
    const started = Date.now();
    try {
      const context = (await ctx.runQuery(internal.llmLab.getExecutionContext, {
        resultId: args.resultId,
      })) as ExecutionContext | null;
      if (!context) throw new Error("execution_context_not_found");
      const preliminary = {
        providerKey: context.provider.key,
        modelId: context.model.modelId,
      };
      await ctx.runMutation(internal.llmLab.markResultRunning, {
        resultId: args.resultId,
        requestSnapshot: preliminary,
      });
      const result = await invoke(context);
      await ctx.runMutation(internal.llmLab.completeResult, {
        resultId: args.resultId,
        ...result,
      });
    } catch (error) {
      await ctx.runMutation(internal.llmLab.failResult, {
        resultId: args.resultId,
        error:
          error instanceof Error ? error.message : "unknown_provider_error",
        latencyMs: Date.now() - started,
      });
    }
  },
});

export const providerStatuses = action({
  args: { token: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<
    Array<{ providerId: Id<"llmProviders">; configured: boolean }>
  > => {
    assertToken(args.token);
    const dashboard = (await ctx.runQuery(api.llmLab.listDashboard, {
      token: args.token,
      runLimit: 1,
    })) as {
      providers: Array<{ _id: Id<"llmProviders">; apiKeyEnvVar: string }>;
    };
    return dashboard.providers.map((provider) => ({
      providerId: provider._id,
      configured: Boolean(process.env[provider.apiKeyEnvVar]),
    }));
  },
});

export const testProvider = action({
  args: { token: v.string(), providerId: v.id("llmProviders") },
  handler: async (ctx, args): Promise<{ ok: true; status: number }> => {
    assertToken(args.token);
    const dashboard = (await ctx.runQuery(api.llmLab.listDashboard, {
      token: args.token,
      runLimit: 1,
    })) as {
      providers: Array<{
        _id: Id<"llmProviders">;
        protocol: "openai_compatible" | "gemini";
        baseUrl: string;
        apiKeyEnvVar: string;
        authMode: "bearer" | "api_key";
      }>;
    };
    const provider = dashboard.providers.find(
      (item) => item._id === args.providerId,
    );
    if (!provider) throw new Error("provider_not_found");
    const apiKey = process.env[provider.apiKeyEnvVar];
    if (!apiKey)
      throw new Error(`provider_key_missing:${provider.apiKeyEnvVar}`);
    const baseUrl = assertSafeProviderUrl(provider.baseUrl);
    const headers: Record<string, string> = {};
    let url = `${baseUrl}/models`;
    if (provider.protocol === "gemini") {
      headers["x-goog-api-key"] = apiKey;
      url = `${baseUrl}/models?pageSize=1`;
    } else {
      headers[provider.authMode === "api_key" ? "api-key" : "authorization"] =
        provider.authMode === "api_key" ? apiKey : `Bearer ${apiKey}`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok)
      throw new Error(`provider_connectivity_failed:${response.status}`);
    return { ok: true, status: response.status };
  },
});
