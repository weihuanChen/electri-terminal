import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  isL2IntentDraftPresetVersionCompatible,
  L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET,
  L2_CANONICAL_INTENT_DRAFT_GEMINI_PRESET,
} from "../lib/i18n/l2-intent-preset";
import { localizationEntityTypeValidator } from "./lib/localization";

const providerKind = v.union(v.literal("official"), v.literal("gateway"));
const providerProtocol = v.union(
  v.literal("openai_compatible"),
  v.literal("gemini"),
);
const authMode = v.union(v.literal("bearer"), v.literal("api_key"));
const parameters = v.object({
  temperature: v.optional(v.number()),
  topP: v.optional(v.number()),
  maxTokens: v.optional(v.number()),
});

function assertToken(token: string) {
  const expected = process.env.LLM_LAB_INTERNAL_TOKEN;
  if (!expected || token !== expected) throw new Error("llm_lab_unauthorized");
}

function cleanText(value: string, label: string, max = 10_000) {
  const cleaned = value.trim();
  if (!cleaned) throw new Error(`${label}_required`);
  if (cleaned.length > max) throw new Error(`${label}_too_large`);
  return cleaned;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function updateRunStatus(ctx: MutationCtx, runId: Id<"llmLabRuns">) {
  const results = await ctx.db
    .query("llmLabResults")
    .withIndex("by_run", (q) => q.eq("runId", runId))
    .collect();
  const pending = results.some(
    (item) => item.status === "queued" || item.status === "running",
  );
  const completed = results.filter(
    (item) => item.status === "completed",
  ).length;
  const now = Date.now();
  await ctx.db.patch(runId, {
    status: pending
      ? "running"
      : completed === results.length
        ? "completed"
        : completed > 0
          ? "partial"
          : "failed",
    ...(pending ? {} : { completedAt: now }),
    updatedAt: now,
  });
}

export const seedDefaults = mutation({
  args: { token: v.string(), actor: v.string() },
  handler: async (ctx, args) => {
    assertToken(args.token);
    const now = Date.now();
    const definitions = [
      {
        key: "deepseek",
        name: "DeepSeek Official",
        kind: "official" as const,
        protocol: "openai_compatible" as const,
        baseUrl: "https://api.deepseek.com",
        apiKeyEnvVar: "DEEPSEEK_KEY",
        authMode: "bearer" as const,
        models: [
          ["deepseek-v4-flash", "DeepSeek V4 Flash"],
          ["deepseek-v4-pro", "DeepSeek V4 Pro"],
        ],
      },
      {
        key: "mimo",
        name: "Xiaomi MiMo Official",
        kind: "official" as const,
        protocol: "openai_compatible" as const,
        baseUrl: "https://api.xiaomimimo.com/v1",
        apiKeyEnvVar: "MIMO_KEY",
        authMode: "bearer" as const,
        models: [
          ["mimo-v2.5", "MiMo V2.5"],
          ["mimo-v2.5-pro", "MiMo V2.5 Pro"],
        ],
      },
      {
        key: "gemini",
        name: "Google Gemini Official",
        kind: "official" as const,
        protocol: "gemini" as const,
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        apiKeyEnvVar: "GEMINI_KEY",
        authMode: "api_key" as const,
        models: [
          ["gemini-2.5-flash", "Gemini 2.5 Flash"],
          ["gemini-2.5-pro", "Gemini 2.5 Pro"],
        ],
      },
    ];
    for (const definition of definitions) {
      let provider = await ctx.db
        .query("llmProviders")
        .withIndex("by_key", (q) => q.eq("key", definition.key))
        .unique();
      if (!provider) {
        const id = await ctx.db.insert("llmProviders", {
          key: definition.key,
          name: definition.name,
          kind: definition.kind,
          protocol: definition.protocol,
          baseUrl: definition.baseUrl,
          apiKeyEnvVar: definition.apiKeyEnvVar,
          authMode: definition.authMode,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        });
        provider = await ctx.db.get(id);
      }
      if (!provider) continue;
      for (const [modelId, displayName] of definition.models) {
        const existing = await ctx.db
          .query("llmModels")
          .withIndex("by_provider_model", (q) =>
            q.eq("providerId", provider!._id).eq("modelId", modelId),
          )
          .unique();
        if (!existing)
          await ctx.db.insert("llmModels", {
            providerId: provider._id,
            modelId,
            displayName,
            enabled: true,
            supportsStructuredOutput: true,
            supportsThinking: definition.key !== "gemini",
            supportsTemperature: true,
            minTemperature: 0,
            maxTemperature: 2,
            maxOutputTokens: 65_536,
            defaultTemperature: 0.2,
            defaultTopP: 0.95,
            defaultMaxTokens: 8_192,
            createdAt: now,
            updatedAt: now,
          });
      }
    }
    const preset = await ctx.db
      .query("llmPromptPresets")
      .withIndex("by_slug", (q) => q.eq("slug", "l1-static-page-localization"))
      .unique();
    if (!preset) {
      const presetId = await ctx.db.insert("llmPromptPresets", {
        name: "L1 Static Page Localization",
        slug: "l1-static-page-localization",
        purpose:
          "Translate L1 static page content while preserving its structure.",
        tags: ["i18n", "L1", "static-page"],
        currentVersion: 1,
        enabled: true,
        createdBy: args.actor,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("llmPromptPresetVersions", {
        presetId,
        version: 1,
        providerKeys: definitions.map((definition) => definition.key),
        systemPrompt:
          "You are a technical B2B localization editor. Return JSON only. Preserve product facts, URLs, identifiers, and content hierarchy. Do not invent claims.",
        userPromptTemplate:
          "Translate the following {{sourceLocale}} page content into {{targetLocale}}. Apply this terminology when relevant: {{terminology}}\n\nSOURCE CONTENT:\n{{sourceContent}}",
        inputVariables: [
          "sourceLocale",
          "targetLocale",
          "terminology",
          "sourceContent",
        ],
        outputSchema: {
          type: "object",
          required: [
            "title",
            "headline",
            "intro",
            "seoTitle",
            "seoDescription",
          ],
          properties: {
            title: { type: "string" },
            headline: { type: "string" },
            intro: { type: "string" },
            primaryCta: { type: "string" },
            secondaryCta: { type: "string" },
            seoTitle: { type: "string" },
            seoDescription: { type: "string" },
            content: { type: "object" },
          },
        },
        validationRules: [
          "Preserve URLs and block IDs",
          "Do not translate model numbers or standards",
        ],
        defaultTemperature: 0.2,
        defaultTopP: 0.95,
        defaultMaxTokens: 8192,
        changeNote: "Initial L1 localization spec",
        createdBy: args.actor,
        createdAt: now,
      });
    }
    return { seeded: true };
  },
});

export const ensureCanonicalPageIntentProviderPresets = mutation({
  args: { token: v.string(), actor: v.string() },
  handler: async (ctx, args) => {
    assertToken(args.token);
    const actor = cleanText(args.actor, "actor", 320);
    const now = Date.now();
    const legacyPreset = await ctx.db
      .query("llmPromptPresets")
      .withIndex("by_slug", (q) => q.eq("slug", "canonical-page-intent-draft"))
      .unique();
    let deepseekPreset = await ctx.db
      .query("llmPromptPresets")
      .withIndex("by_slug", (q) =>
        q.eq("slug", L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET.slug),
      )
      .unique();

    if (!deepseekPreset && legacyPreset) {
      await ctx.db.patch(legacyPreset._id, {
        name: L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET.name,
        slug: L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET.slug,
        purpose: L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET.purpose,
        tags: [...L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET.tags],
        updatedAt: now,
      });
      deepseekPreset = await ctx.db.get(legacyPreset._id);
    }

    const specs = [
      L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET,
      L2_CANONICAL_INTENT_DRAFT_GEMINI_PRESET,
    ];
    for (const spec of specs) {
      const provider = await ctx.db
        .query("llmProviders")
        .withIndex("by_key", (q) => q.eq("key", spec.providerKeys[0]))
        .unique();
      if (!provider)
        throw new Error(`provider_not_found:${spec.providerKeys[0]}`);
    }

    const ensured = [];
    for (const spec of specs) {
      let preset =
        spec.slug === L2_CANONICAL_INTENT_DRAFT_DEEPSEEK_PRESET.slug
          ? deepseekPreset
          : await ctx.db
              .query("llmPromptPresets")
              .withIndex("by_slug", (q) => q.eq("slug", spec.slug))
              .unique();
      if (!preset) {
        const presetId = await ctx.db.insert("llmPromptPresets", {
          name: spec.name,
          slug: spec.slug,
          purpose: spec.purpose,
          tags: [...spec.tags],
          currentVersion: 0,
          enabled: true,
          createdBy: actor,
          createdAt: now,
          updatedAt: now,
        });
        preset = await ctx.db.get(presetId);
      }
      if (!preset) throw new Error(`preset_create_failed:${spec.slug}`);
      const currentVersion =
        preset.currentVersion > 0
          ? await ctx.db
              .query("llmPromptPresetVersions")
              .withIndex("by_preset_version", (q) =>
                q
                  .eq("presetId", preset!._id)
                  .eq("version", preset!.currentVersion),
              )
              .unique()
          : null;
      const alreadyCurrent =
        currentVersion?.changeNote === spec.changeNote &&
        currentVersion.providerKeys?.length === 1 &&
        currentVersion.providerKeys[0] === spec.providerKeys[0];
      if (alreadyCurrent) {
        ensured.push({
          presetId: preset._id,
          versionId: currentVersion._id,
          version: currentVersion.version,
        });
        continue;
      }
      const version = preset.currentVersion + 1;
      const versionId = await ctx.db.insert("llmPromptPresetVersions", {
        presetId: preset._id,
        version,
        providerKeys: [...spec.providerKeys],
        systemPrompt: spec.systemPrompt,
        userPromptTemplate: spec.userPromptTemplate,
        inputVariables: [...spec.inputVariables],
        outputSchema: spec.outputSchema as Record<string, unknown>,
        validationRules: spec.validationRules.map((rule) => ({ ...rule })),
        defaultTemperature: spec.defaultTemperature,
        defaultTopP: spec.defaultTopP,
        defaultMaxTokens: spec.defaultMaxTokens,
        changeNote: spec.changeNote,
        createdBy: actor,
        createdAt: now,
      });
      await ctx.db.patch(preset._id, {
        name: spec.name,
        purpose: spec.purpose,
        tags: [...spec.tags],
        currentVersion: version,
        enabled: true,
        updatedAt: now,
      });
      ensured.push({ presetId: preset._id, versionId, version });
    }
    return { presets: ensured };
  },
});

export const listDashboard = query({
  args: { token: v.string(), runLimit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    assertToken(args.token);
    const [providers, models, presets, versions, runs] = await Promise.all([
      ctx.db.query("llmProviders").collect(),
      ctx.db.query("llmModels").collect(),
      ctx.db.query("llmPromptPresets").collect(),
      ctx.db.query("llmPromptPresetVersions").collect(),
      ctx.db
        .query("llmLabRuns")
        .withIndex("by_createdAt")
        .order("desc")
        .take(Math.min(args.runLimit ?? 30, 100)),
    ]);
    return { providers, models, presets, versions, runs };
  },
});

export const getRun = query({
  args: { token: v.string(), runId: v.id("llmLabRuns") },
  handler: async (ctx, args) => {
    assertToken(args.token);
    const run = await ctx.db.get(args.runId);
    if (!run) return null;
    const results = await ctx.db
      .query("llmLabResults")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
    return { run, results };
  },
});

export const createProvider = mutation({
  args: {
    token: v.string(),
    key: v.string(),
    name: v.string(),
    kind: providerKind,
    protocol: providerProtocol,
    baseUrl: v.string(),
    apiKeyEnvVar: v.string(),
    authMode,
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    assertToken(args.token);
    const key = slugify(args.key);
    if (!key) throw new Error("provider_key_required");
    if (
      await ctx.db
        .query("llmProviders")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique()
    )
      throw new Error("provider_key_exists");
    const now = Date.now();
    return await ctx.db.insert("llmProviders", {
      key,
      name: cleanText(args.name, "provider_name", 120),
      kind: args.kind,
      protocol: args.protocol,
      baseUrl: cleanText(args.baseUrl, "base_url", 500),
      apiKeyEnvVar: cleanText(args.apiKeyEnvVar, "api_key_env_var", 120),
      authMode: args.authMode,
      enabled: args.enabled,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createModel = mutation({
  args: {
    token: v.string(),
    providerId: v.id("llmProviders"),
    modelId: v.string(),
    displayName: v.string(),
    enabled: v.boolean(),
    supportsStructuredOutput: v.boolean(),
    supportsThinking: v.boolean(),
    supportsTemperature: v.boolean(),
    maxOutputTokens: v.optional(v.number()),
    defaultTemperature: v.optional(v.number()),
    defaultTopP: v.optional(v.number()),
    defaultMaxTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    assertToken(args.token);
    if (!(await ctx.db.get(args.providerId)))
      throw new Error("provider_not_found");
    const modelId = cleanText(args.modelId, "model_id", 200);
    if (
      await ctx.db
        .query("llmModels")
        .withIndex("by_provider_model", (q) =>
          q.eq("providerId", args.providerId).eq("modelId", modelId),
        )
        .unique()
    )
      throw new Error("model_exists");
    const now = Date.now();
    return await ctx.db.insert("llmModels", {
      providerId: args.providerId,
      modelId,
      displayName: cleanText(args.displayName, "display_name", 200),
      enabled: args.enabled,
      supportsStructuredOutput: args.supportsStructuredOutput,
      supportsThinking: args.supportsThinking,
      supportsTemperature: args.supportsTemperature,
      minTemperature: 0,
      maxTemperature: 2,
      maxOutputTokens: args.maxOutputTokens,
      defaultTemperature: args.defaultTemperature,
      defaultTopP: args.defaultTopP,
      defaultMaxTokens: args.defaultMaxTokens,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const setProviderEnabled = mutation({
  args: {
    token: v.string(),
    providerId: v.id("llmProviders"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    assertToken(args.token);
    if (!(await ctx.db.get(args.providerId)))
      throw new Error("provider_not_found");
    await ctx.db.patch(args.providerId, {
      enabled: args.enabled,
      updatedAt: Date.now(),
    });
  },
});

export const setModelEnabled = mutation({
  args: { token: v.string(), modelId: v.id("llmModels"), enabled: v.boolean() },
  handler: async (ctx, args) => {
    assertToken(args.token);
    if (!(await ctx.db.get(args.modelId))) throw new Error("model_not_found");
    await ctx.db.patch(args.modelId, {
      enabled: args.enabled,
      updatedAt: Date.now(),
    });
  },
});

export const createPresetVersion = mutation({
  args: {
    token: v.string(),
    actor: v.string(),
    presetId: v.optional(v.id("llmPromptPresets")),
    name: v.string(),
    slug: v.string(),
    purpose: v.optional(v.string()),
    tags: v.array(v.string()),
    providerKeys: v.array(v.string()),
    systemPrompt: v.string(),
    userPromptTemplate: v.string(),
    inputVariables: v.array(v.string()),
    outputSchema: v.record(v.string(), v.any()),
    validationRules: v.array(v.any()),
    defaultTemperature: v.optional(v.number()),
    defaultTopP: v.optional(v.number()),
    defaultMaxTokens: v.optional(v.number()),
    changeNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertToken(args.token);
    const now = Date.now();
    const providerKeys = [
      ...new Set(args.providerKeys.map((key) => key.trim()).filter(Boolean)),
    ];
    if (providerKeys.length === 0)
      throw new Error("provider_selection_required");
    for (const providerKey of providerKeys) {
      if (
        !(await ctx.db
          .query("llmProviders")
          .withIndex("by_key", (q) => q.eq("key", providerKey))
          .unique())
      ) {
        throw new Error(`provider_not_found:${providerKey}`);
      }
    }
    let presetId = args.presetId;
    let version = 1;
    if (presetId) {
      const preset = await ctx.db.get(presetId);
      if (!preset) throw new Error("preset_not_found");
      version = preset.currentVersion + 1;
      await ctx.db.patch(presetId, {
        name: cleanText(args.name, "preset_name", 160),
        purpose: args.purpose?.trim(),
        tags: args.tags,
        currentVersion: version,
        updatedAt: now,
      });
    } else {
      const slug = slugify(args.slug || args.name);
      if (
        await ctx.db
          .query("llmPromptPresets")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique()
      )
        throw new Error("preset_slug_exists");
      presetId = await ctx.db.insert("llmPromptPresets", {
        name: cleanText(args.name, "preset_name", 160),
        slug,
        purpose: args.purpose?.trim(),
        tags: args.tags,
        currentVersion: 1,
        enabled: true,
        createdBy: args.actor,
        createdAt: now,
        updatedAt: now,
      });
    }
    const versionId = await ctx.db.insert("llmPromptPresetVersions", {
      presetId,
      version,
      providerKeys,
      systemPrompt: cleanText(args.systemPrompt, "system_prompt", 50_000),
      userPromptTemplate: cleanText(
        args.userPromptTemplate,
        "user_prompt_template",
        100_000,
      ),
      inputVariables: args.inputVariables,
      outputSchema: args.outputSchema,
      validationRules: args.validationRules,
      defaultTemperature: args.defaultTemperature,
      defaultTopP: args.defaultTopP,
      defaultMaxTokens: args.defaultMaxTokens,
      changeNote: args.changeNote?.trim(),
      createdBy: args.actor,
      createdAt: now,
    });
    return { presetId, versionId, version };
  },
});

export const startRun = mutation({
  args: {
    token: v.string(),
    actor: v.string(),
    sourceLocale: v.string(),
    targetLocale: v.string(),
    presetId: v.id("llmPromptPresets"),
    presetVersionId: v.id("llmPromptPresetVersions"),
    variables: v.record(v.string(), v.string()),
    sourceContent: v.string(),
    parameters,
    modelIds: v.array(v.id("llmModels")),
    taskContext: v.optional(
      v.object({
        taskSlot: v.string(),
        entityType: localizationEntityTypeValidator,
        sourceId: v.string(),
        sourceSnapshotId: v.id("localizationSourceSnapshots"),
        familyId: v.optional(v.id("productFamilies")),
      }),
    ),
  },
  handler: async (ctx, args) => {
    assertToken(args.token);
    if (args.sourceContent.length > 180_000)
      throw new Error("source_content_too_large");
    if (args.modelIds.length < 1 || args.modelIds.length > 6)
      throw new Error("model_count_out_of_range");
    const uniqueModelIds = [...new Set(args.modelIds)];
    if (uniqueModelIds.length !== args.modelIds.length)
      throw new Error("duplicate_models");
    const [preset, version] = await Promise.all([
      ctx.db.get(args.presetId),
      ctx.db.get(args.presetVersionId),
    ]);
    if (!preset || !version || version.presetId !== preset._id)
      throw new Error("preset_version_mismatch");
    if (args.taskContext) {
      const snapshot = await ctx.db.get(args.taskContext.sourceSnapshotId);
      if (
        !snapshot ||
        snapshot.entityType !== args.taskContext.entityType ||
        snapshot.sourceId !== args.taskContext.sourceId
      ) {
        throw new Error("task_context_source_snapshot_mismatch");
      }
      if (
        args.taskContext.taskSlot === "l2_page_intent_draft" &&
        (!isL2IntentDraftPresetVersionCompatible(preset, version) ||
          args.taskContext.entityType !== "product")
      ) {
        throw new Error("l2_intent_task_requires_compatible_preset");
      }
    }
    const targets: Array<{
      model: Doc<"llmModels">;
      provider: Doc<"llmProviders">;
    }> = [];
    for (const modelId of uniqueModelIds) {
      const model = await ctx.db.get(modelId);
      if (!model || !model.enabled) throw new Error("model_not_available");
      const provider = await ctx.db.get(model.providerId);
      if (!provider || !provider.enabled)
        throw new Error("provider_not_available");
      if (
        version.providerKeys?.length &&
        !version.providerKeys.includes(provider.key)
      ) {
        throw new Error(`model_provider_not_allowed_by_preset:${provider.key}`);
      }
      targets.push({ model, provider });
    }
    const now = Date.now();
    const runId = await ctx.db.insert("llmLabRuns", {
      actor: args.actor,
      status: "queued",
      sourceLocale: cleanText(args.sourceLocale, "source_locale", 24),
      targetLocale: cleanText(args.targetLocale, "target_locale", 24),
      presetId: args.presetId,
      presetVersionId: args.presetVersionId,
      presetSnapshot: {
        name: preset.name,
        slug: preset.slug,
        version: version.version,
        providerKeys: version.providerKeys ?? [],
        systemPrompt: version.systemPrompt,
        userPromptTemplate: version.userPromptTemplate,
        inputVariables: version.inputVariables,
        outputSchema: version.outputSchema,
        validationRules: version.validationRules,
      },
      variables: {
        ...args.variables,
        sourceLocale: args.sourceLocale,
        targetLocale: args.targetLocale,
        sourceContent: args.sourceContent,
      },
      sourceContent: args.sourceContent,
      parameters: args.parameters,
      modelIds: uniqueModelIds,
      ...(args.taskContext
        ? {
            taskSlot: cleanText(args.taskContext.taskSlot, "task_slot", 120),
            contextEntityType: args.taskContext.entityType,
            contextSourceId: args.taskContext.sourceId,
            contextSourceSnapshotId: args.taskContext.sourceSnapshotId,
            contextFamilyId: args.taskContext.familyId,
          }
        : {}),
      createdAt: now,
      updatedAt: now,
    });
    for (const { model, provider } of targets) {
      const resultId = await ctx.db.insert("llmLabResults", {
        runId,
        providerId: provider._id,
        modelId: model._id,
        providerKey: provider.key,
        providerName: provider.name,
        modelIdentifier: model.modelId,
        modelDisplayName: model.displayName,
        status: "queued",
        createdAt: now,
        updatedAt: now,
      });
      await ctx.scheduler.runAfter(0, internal.actions.llmLab.executeModel, {
        resultId,
      });
    }
    await ctx.db.patch(runId, { status: "running", updatedAt: Date.now() });
    return runId;
  },
});

export const selectResult = mutation({
  args: {
    token: v.string(),
    runId: v.id("llmLabRuns"),
    resultId: v.id("llmLabResults"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertToken(args.token);
    const result = await ctx.db.get(args.resultId);
    if (!result || result.runId !== args.runId)
      throw new Error("result_not_in_run");
    if (result.status !== "completed" || result.schemaValid !== true)
      throw new Error("result_not_selectable");
    await ctx.db.patch(args.runId, {
      selectedResultId: result._id,
      selectionNote: args.note?.trim(),
      selectedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return result._id;
  },
});

export const retryResult = mutation({
  args: { token: v.string(), resultId: v.id("llmLabResults") },
  handler: async (ctx, args) => {
    assertToken(args.token);
    const previous = await ctx.db.get(args.resultId);
    if (!previous) throw new Error("result_not_found");
    const run = await ctx.db.get(previous.runId);
    if (!run) throw new Error("run_not_found");
    const now = Date.now();
    const resultId = await ctx.db.insert("llmLabResults", {
      runId: previous.runId,
      providerId: previous.providerId,
      modelId: previous.modelId,
      providerKey: previous.providerKey,
      providerName: previous.providerName,
      modelIdentifier: previous.modelIdentifier,
      modelDisplayName: `${previous.modelDisplayName} · retry`,
      status: "queued",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(run._id, {
      status: "running",
      completedAt: undefined,
      updatedAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.actions.llmLab.executeModel, {
      resultId,
    });
    return resultId;
  },
});

export const getExecutionContext = internalQuery({
  args: { resultId: v.id("llmLabResults") },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.resultId);
    if (!result) return null;
    const [run, model, provider] = await Promise.all([
      ctx.db.get(result.runId),
      ctx.db.get(result.modelId),
      ctx.db.get(result.providerId),
    ]);
    return run && model && provider ? { result, run, model, provider } : null;
  },
});

export const markResultRunning = internalMutation({
  args: { resultId: v.id("llmLabResults"), requestSnapshot: v.any() },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.resultId, {
      status: "running",
      requestSnapshot: args.requestSnapshot,
      startedAt: now,
      updatedAt: now,
    });
  },
});

export const completeResult = internalMutation({
  args: {
    resultId: v.id("llmLabResults"),
    requestSnapshot: v.optional(v.any()),
    rawText: v.string(),
    parsedOutput: v.optional(v.any()),
    schemaValid: v.boolean(),
    validationErrors: v.array(v.string()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    latencyMs: v.number(),
    finishReason: v.optional(v.string()),
    providerRequestId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.resultId);
    if (!result) return;
    const now = Date.now();
    await ctx.db.patch(args.resultId, {
      status: "completed",
      requestSnapshot: args.requestSnapshot,
      rawText: args.rawText,
      parsedOutput: args.parsedOutput,
      schemaValid: args.schemaValid,
      validationErrors: args.validationErrors,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      totalTokens: args.totalTokens,
      latencyMs: args.latencyMs,
      finishReason: args.finishReason,
      providerRequestId: args.providerRequestId,
      completedAt: now,
      updatedAt: now,
    });
    await updateRunStatus(ctx, result.runId);
  },
});

export const failResult = internalMutation({
  args: {
    resultId: v.id("llmLabResults"),
    error: v.string(),
    latencyMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.resultId);
    if (!result) return;
    const now = Date.now();
    await ctx.db.patch(args.resultId, {
      status: "failed",
      error: args.error.slice(0, 2000),
      latencyMs: args.latencyMs,
      completedAt: now,
      updatedAt: now,
    });
    await updateRunStatus(ctx, result.runId);
  },
});
