import "server-only";

import type { Doc } from "@/convex/_generated/dataModel";
import { actionAdmin, queryAdmin } from "@/lib/convex-admin";

export type LabDashboardData = {
  providers: Doc<"llmProviders">[];
  models: Doc<"llmModels">[];
  presets: Doc<"llmPromptPresets">[];
  versions: Doc<"llmPromptPresetVersions">[];
  runs: Doc<"llmLabRuns">[];
};

export type LabRunData = {
  run: Doc<"llmLabRuns">;
  results: Doc<"llmLabResults">[];
};

export function getLlmLabToken() {
  const token = process.env.LLM_LAB_INTERNAL_TOKEN;
  if (!token) throw new Error("Missing LLM_LAB_INTERNAL_TOKEN in the Next.js and Convex environments.");
  return token;
}

export function getLabDashboard(runLimit = 30) {
  return queryAdmin<LabDashboardData>("llmLab:listDashboard", {
    token: getLlmLabToken(),
    runLimit,
  });
}

export function getLabRun(runId: string) {
  return queryAdmin<LabRunData | null>("llmLab:getRun", {
    token: getLlmLabToken(),
    runId,
  });
}

export async function getProviderStatuses() {
  return actionAdmin<Array<{ providerId: string; configured: boolean }>>(
    "actions/llmLab:providerStatuses",
    { token: getLlmLabToken() }
  );
}
