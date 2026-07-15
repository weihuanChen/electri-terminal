"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { actionAdmin, mutateAdmin } from "@/lib/convex-admin";
import { assertSafeProviderUrl } from "@/lib/llm-lab";
import { getLlmLabToken } from "@/lib/llm-lab-admin";
import { getLabRun } from "@/lib/llm-lab-admin";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalNumber(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) throw new Error(`${key}_must_be_number`);
  return parsed;
}

function checked(formData: FormData, key: string) {
  return ["true", "1", "on", "yes"].includes(value(formData, key).toLowerCase());
}

function lines(formData: FormData, key: string) {
  return value(formData, key).split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function stringList(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return [];
  if (raw.startsWith("[")) {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      throw new Error(`${key}_must_be_string_array`);
    }
    return parsed.map((item) => item.trim()).filter(Boolean);
  }
  return raw.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function jsonObject(formData: FormData, key: string) {
  const parsed = JSON.parse(value(formData, key)) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`${key}_must_be_object`);
  return parsed as Record<string, unknown>;
}

function jsonArrayValue(formData: FormData, key: string) {
  const parsed = JSON.parse(value(formData, key)) as unknown;
  if (!Array.isArray(parsed)) throw new Error(`${key}_must_be_array`);
  return parsed;
}

function validationRulesValue(formData: FormData) {
  const rules = jsonArrayValue(formData, "validationRulesJson");
  for (const rule of rules) {
    if (typeof rule === "string" && rule.trim()) continue;
    if (rule && typeof rule === "object" && !Array.isArray(rule)) {
      const item = rule as Record<string, unknown>;
      if (
        typeof item.id === "string" && item.id.trim() &&
        (item.severity === "error" || item.severity === "warning") &&
        typeof item.rule === "string" && item.rule.trim()
      ) continue;
    }
    throw new Error("validation_rule_must_be_string_or_id_severity_rule_object");
  }
  return rules;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "unknown_error";
}

function labRedirect(path: string, result: { success?: string; error?: string; run?: string }) {
  const params = new URLSearchParams();
  Object.entries(result).forEach(([key, item]) => item && params.set(key, item));
  redirect(`${path}${params.size ? `?${params}` : ""}`);
}

export async function initializePromptLabAction() {
  const admin = await requireAdmin();
  try {
    await mutateAdmin("llmLab:seedDefaults", { token: getLlmLabToken(), actor: admin.email });
  } catch (error) {
    labRedirect("/admin/prompt-lab", { error: errorMessage(error) });
  }
  revalidatePath("/admin/prompt-lab");
  labRedirect("/admin/prompt-lab", { success: "lab_initialized" });
}

export async function createProviderAction(formData: FormData) {
  await requireAdmin();
  try {
    const baseUrl = assertSafeProviderUrl(value(formData, "baseUrl"));
    await mutateAdmin("llmLab:createProvider", {
      token: getLlmLabToken(), key: value(formData, "key"), name: value(formData, "name"),
      kind: value(formData, "kind"), protocol: value(formData, "protocol"), baseUrl,
      apiKeyEnvVar: value(formData, "apiKeyEnvVar"), authMode: value(formData, "authMode"), enabled: true,
    });
  } catch (error) {
    labRedirect("/admin/prompt-lab/providers", { error: errorMessage(error) });
  }
  revalidatePath("/admin/prompt-lab/providers");
  labRedirect("/admin/prompt-lab/providers", { success: "provider_created" });
}

export async function createModelAction(formData: FormData) {
  await requireAdmin();
  try {
    await mutateAdmin("llmLab:createModel", {
      token: getLlmLabToken(), providerId: value(formData, "providerId"), modelId: value(formData, "modelId"), displayName: value(formData, "displayName"),
      enabled: true, supportsStructuredOutput: checked(formData, "supportsStructuredOutput"),
      supportsThinking: checked(formData, "supportsThinking"), supportsTemperature: checked(formData, "supportsTemperature"),
      maxOutputTokens: optionalNumber(formData, "maxOutputTokens"), defaultTemperature: optionalNumber(formData, "defaultTemperature"),
      defaultTopP: optionalNumber(formData, "defaultTopP"), defaultMaxTokens: optionalNumber(formData, "defaultMaxTokens"),
    });
  } catch (error) {
    labRedirect("/admin/prompt-lab/providers", { error: errorMessage(error) });
  }
  revalidatePath("/admin/prompt-lab/providers");
  labRedirect("/admin/prompt-lab/providers", { success: "model_created" });
}

export async function savePresetVersionAction(formData: FormData) {
  const admin = await requireAdmin();
  try {
    await mutateAdmin("llmLab:createPresetVersion", {
      token: getLlmLabToken(), actor: admin.email, presetId: value(formData, "presetId") || undefined,
      name: value(formData, "name"), slug: value(formData, "slug"), purpose: value(formData, "purpose") || undefined,
      tags: stringList(formData, "tags"), providerKeys: formData.getAll("providerKeys").map(String), systemPrompt: value(formData, "systemPrompt"), userPromptTemplate: value(formData, "userPromptTemplate"),
      inputVariables: lines(formData, "inputVariables"), outputSchema: jsonObject(formData, "outputSchema"),
      validationRules: validationRulesValue(formData), defaultTemperature: optionalNumber(formData, "defaultTemperature"),
      defaultTopP: optionalNumber(formData, "defaultTopP"), defaultMaxTokens: optionalNumber(formData, "defaultMaxTokens"), changeNote: value(formData, "changeNote") || undefined,
    });
  } catch (error) {
    labRedirect("/admin/prompt-lab/presets", { error: errorMessage(error) });
  }
  revalidatePath("/admin/prompt-lab");
  revalidatePath("/admin/prompt-lab/presets");
  labRedirect("/admin/prompt-lab/presets", { success: "preset_version_saved" });
}

export async function startLabRunAction(formData: FormData) {
  const admin = await requireAdmin();
  let runId = "";
  try {
    const sourceContent = value(formData, "sourceContent");
    const sourceLocale = value(formData, "sourceLocale");
    const targetLocale = value(formData, "targetLocale");
    runId = await mutateAdmin<string>("llmLab:startRun", {
      token: getLlmLabToken(), actor: admin.email, sourceLocale, targetLocale,
      presetId: value(formData, "presetId"), presetVersionId: value(formData, "presetVersionId"),
      variables: { sourceLocale, targetLocale, sourceContent, terminology: value(formData, "terminology") },
      sourceContent,
      parameters: { temperature: optionalNumber(formData, "temperature"), topP: optionalNumber(formData, "topP"), maxTokens: optionalNumber(formData, "maxTokens") },
      modelIds: formData.getAll("modelIds").map(String),
    });
  } catch (error) {
    labRedirect("/admin/prompt-lab", { error: errorMessage(error) });
  }
  revalidatePath("/admin/prompt-lab");
  labRedirect("/admin/prompt-lab", { run: runId });
}

export async function selectLabResultAction(formData: FormData) {
  await requireAdmin();
  const runId = value(formData, "runId");
  try {
    await mutateAdmin("llmLab:selectResult", { token: getLlmLabToken(), runId, resultId: value(formData, "resultId"), note: value(formData, "note") || undefined });
  } catch (error) {
    labRedirect("/admin/prompt-lab", { run: runId, error: errorMessage(error) });
  }
  revalidatePath("/admin/prompt-lab");
  labRedirect("/admin/prompt-lab", { run: runId, success: "result_selected" });
}

export async function setProviderEnabledAction(formData: FormData) {
  await requireAdmin();
  await mutateAdmin("llmLab:setProviderEnabled", { token: getLlmLabToken(), providerId: value(formData, "providerId"), enabled: checked(formData, "enabled") });
  revalidatePath("/admin/prompt-lab/providers");
}

export async function setModelEnabledAction(formData: FormData) {
  await requireAdmin();
  await mutateAdmin("llmLab:setModelEnabled", { token: getLlmLabToken(), modelId: value(formData, "modelId"), enabled: checked(formData, "enabled") });
  revalidatePath("/admin/prompt-lab/providers");
}

export async function testProviderAction(formData: FormData) {
  await requireAdmin();
  try {
    await actionAdmin("actions/llmLab:testProvider", { token: getLlmLabToken(), providerId: value(formData, "providerId") });
  } catch (error) {
    labRedirect("/admin/prompt-lab/providers", { error: errorMessage(error) });
  }
  labRedirect("/admin/prompt-lab/providers", { success: "provider_connection_ok" });
}

export async function retryLabResultAction(formData: FormData) {
  await requireAdmin();
  const runId = value(formData, "runId");
  try {
    await mutateAdmin("llmLab:retryResult", { token: getLlmLabToken(), resultId: value(formData, "resultId") });
  } catch (error) {
    labRedirect("/admin/prompt-lab", { run: runId, error: errorMessage(error) });
  }
  labRedirect("/admin/prompt-lab", { run: runId });
}

export async function cloneLabRunAction(formData: FormData) {
  const admin = await requireAdmin();
  try {
    const sourceRunId = value(formData, "runId");
    const data = await getLabRun(sourceRunId);
    if (!data) throw new Error("run_not_found");
    const runId = await mutateAdmin<string>("llmLab:startRun", {
      token: getLlmLabToken(), actor: admin.email,
      sourceLocale: data.run.sourceLocale, targetLocale: data.run.targetLocale,
      presetId: data.run.presetId, presetVersionId: data.run.presetVersionId,
      variables: data.run.variables, sourceContent: data.run.sourceContent,
      parameters: data.run.parameters, modelIds: data.run.modelIds,
    });
    labRedirect("/admin/prompt-lab", { run: runId, success: "run_cloned" });
  } catch (error) {
    labRedirect("/admin/prompt-lab/history", { error: errorMessage(error) });
  }
}
