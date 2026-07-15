"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { mutateAdmin, queryAdmin } from "@/lib/convex-admin";
import { getLlmLabToken } from "@/lib/llm-lab-admin";

const PAGE_PATH = "/admin/intents/families-products";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseJson(formData: FormData, key: string) {
  return JSON.parse(value(formData, key)) as unknown;
}

function parseArray(formData: FormData, key: string) {
  const parsed = parseJson(formData, key);
  if (!Array.isArray(parsed)) throw new Error(`${key}_must_be_array`);
  return parsed;
}

function parseObject(formData: FormData, key: string) {
  const parsed = parseJson(formData, key);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${key}_must_be_object`);
  }
  return parsed as Record<string, unknown>;
}

function parseAnalysisRoute(formData: FormData) {
  const parts = value(formData, "analysisRoute").split(":");
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error("analysis_route_invalid");
  }
  const [presetId, presetVersionId, modelId] = parts;
  return { presetId, presetVersionId, modelId };
}

function errorMessage(error: unknown) {
  if (error instanceof SyntaxError) return "invalid_json";
  if (error instanceof Error) {
    const match = error.message.match(/Uncaught Error: ([^\n]+)/);
    return match?.[1] ?? error.message;
  }
  return "unknown_error";
}

function finish(
  familyId: string,
  result: { success?: string; error?: string },
) {
  const search = new URLSearchParams({ familyId });
  if (result.success) search.set("success", result.success);
  if (result.error) search.set("error", result.error);
  redirect(`${PAGE_PATH}?${search}`);
}

async function execute(
  familyId: string,
  success: string,
  operation: (actor: string) => Promise<unknown>,
) {
  const admin = await requireAdmin();
  try {
    await operation(admin.email);
  } catch (error) {
    finish(familyId, { error: errorMessage(error) });
  }
  revalidatePath(PAGE_PATH);
  finish(familyId, { success });
}

export async function createFamilyTemplateAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  await execute(familyId, "template_created", (actor) =>
    mutateAdmin("mutations/admin/intentHierarchy:createFamilyIntentTemplate", {
      familyId,
      key: value(formData, "key"),
      name: value(formData, "name"),
      owner: actor,
      actor,
    }),
  );
}

export async function createFamilyTemplateRevisionAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  await execute(familyId, "template_revision_created", async (actor) => {
    const sourceSnapshotId = await mutateAdmin<string>(
      "mutations/admin/localizationFoundation:captureCatalogSourceSnapshot",
      { entityType: "family", sourceId: familyId, actor },
    );
    return mutateAdmin(
      "mutations/admin/intentHierarchy:createFamilyIntentTemplateRevision",
      {
        templateId: value(formData, "templateId"),
        sourceSnapshotIds: [sourceSnapshotId],
        intent: parseObject(formData, "intent"),
        inheritancePolicy: parseObject(formData, "inheritancePolicy"),
        coverageEvidence: {
          mode: "manual",
          note:
            value(formData, "coverageNote") ||
            "Family source reviewed manually",
        },
        actor,
      },
    );
  });
}

export async function approveFamilyTemplateRevisionAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  await execute(familyId, "template_revision_locked", (actor) =>
    mutateAdmin(
      "mutations/admin/intentHierarchy:approveFamilyIntentTemplateRevision",
      {
        revisionId: value(formData, "revisionId"),
        note: value(formData, "note") || undefined,
        actor,
      },
    ),
  );
}

export async function promoteSelectedResultToFamilyTemplateAction(
  formData: FormData,
) {
  const familyId = value(formData, "familyId");
  await execute(familyId, "result_promoted_to_family_draft", async (actor) => {
    const familySourceSnapshotId = await mutateAdmin<string>(
      "mutations/admin/localizationFoundation:captureCatalogSourceSnapshot",
      { entityType: "family", sourceId: familyId, actor },
    );
    return mutateAdmin(
      "mutations/admin/intentHierarchy:promoteSelectedL2ResultToFamilyTemplateDraft",
      {
        templateId: value(formData, "templateId"),
        runId: value(formData, "runId"),
        resultId: value(formData, "resultId"),
        familySourceSnapshotId,
        actor,
      },
    );
  });
}

export async function createProductGroupAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  await execute(familyId, "group_created", (actor) =>
    mutateAdmin("mutations/admin/intentHierarchy:createProductIntentGroup", {
      templateId: value(formData, "templateId"),
      key: value(formData, "key"),
      name: value(formData, "name"),
      description: value(formData, "description"),
      owner: actor,
      actor,
    }),
  );
}

export async function createProductGroupRevisionAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  await execute(familyId, "group_revision_created", (actor) =>
    mutateAdmin(
      "mutations/admin/intentHierarchy:createProductIntentGroupRevision",
      {
        groupId: value(formData, "groupId"),
        membershipCriteria: parseArray(formData, "membershipCriteria"),
        differentiators: parseArray(formData, "differentiators"),
        intentPatch: parseArray(formData, "intentPatch"),
        requiredEvidencePaths: parseArray(formData, "requiredEvidencePaths"),
        sampleMinimumCount: Number(value(formData, "sampleMinimumCount") || 2),
        samplePercentage: Number(value(formData, "samplePercentage") || 10),
        actor,
      },
    ),
  );
}

export async function approveProductGroupRevisionAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  await execute(familyId, "group_revision_locked", (actor) =>
    mutateAdmin(
      "mutations/admin/intentHierarchy:approveProductIntentGroupRevision",
      {
        revisionId: value(formData, "revisionId"),
        note: value(formData, "note") || undefined,
        actor,
      },
    ),
  );
}

export async function assignProductToGroupAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  const productId = value(formData, "productId");
  await execute(familyId, "product_assigned", async (actor) => {
    const sourceSnapshotId = await mutateAdmin<string>(
      "mutations/admin/localizationFoundation:captureCatalogSourceSnapshot",
      { entityType: "product", sourceId: productId, actor },
    );
    return mutateAdmin(
      "mutations/admin/intentHierarchy:assignProductToIntentGroup",
      {
        productId,
        groupId: value(formData, "groupId"),
        sourceSnapshotId,
        assignmentReason:
          value(formData, "assignmentReason") || "Manual hierarchy assignment",
        actor,
      },
    );
  });
}

export async function createProductDeltaRevisionAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  const productId = value(formData, "productId");
  await execute(familyId, "delta_revision_created", async (actor) => {
    const sourceSnapshotId = await mutateAdmin<string>(
      "mutations/admin/localizationFoundation:captureCatalogSourceSnapshot",
      { entityType: "product", sourceId: productId, actor },
    );
    return mutateAdmin(
      "mutations/admin/intentHierarchy:createProductPageDeltaRevision",
      {
        productId,
        sourceSnapshotId,
        baseProductGroupRevisionId: value(formData, "groupRevisionId"),
        patchOperations: parseArray(formData, "patchOperations"),
        actor,
      },
    );
  });
}

export async function approveProductDeltaRevisionAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  await execute(familyId, "delta_revision_locked", (actor) =>
    mutateAdmin(
      "mutations/admin/intentHierarchy:approveProductPageDeltaRevision",
      {
        revisionId: value(formData, "revisionId"),
        note: value(formData, "note") || undefined,
        actor,
      },
    ),
  );
}

export async function materializeProductIntentAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  await execute(familyId, "canonical_intent_materialized", (actor) =>
    mutateAdmin(
      "mutations/admin/intentHierarchy:materializeProductCanonicalIntent",
      {
        productId: value(formData, "productId"),
        note: value(formData, "note") || undefined,
        actor,
      },
    ),
  );
}

type L2AnalysisInput = {
  sourceSnapshot: Record<string, unknown>;
  terminology: unknown[];
  hierarchyContext: Record<string, unknown>;
};

export async function startL2IntentAnalysisAction(formData: FormData) {
  const familyId = value(formData, "familyId");
  const productId = value(formData, "productId");
  await execute(familyId, "l2_intent_analysis_started", async (actor) => {
    const route = parseAnalysisRoute(formData);
    const sourceSnapshotId = await mutateAdmin<string>(
      "mutations/admin/localizationFoundation:captureCatalogSourceSnapshot",
      { entityType: "product", sourceId: productId, actor },
    );
    const input = await queryAdmin<L2AnalysisInput>(
      "queries/modules/intentHierarchy:getL2IntentAnalysisInput",
      { productId, sourceSnapshotId },
    );
    const sourceContent = JSON.stringify(input.sourceSnapshot);
    const terminology = JSON.stringify(input.terminology);
    const hierarchyContext = JSON.stringify(input.hierarchyContext);
    return mutateAdmin("llmLab:startRun", {
      token: getLlmLabToken(),
      actor,
      sourceLocale: "en",
      targetLocale: "canonical",
      presetId: route.presetId,
      presetVersionId: route.presetVersionId,
      variables: {
        sourceLocale: "en",
        sourceContent,
        terminology,
        hierarchyContext,
      },
      sourceContent,
      parameters: {},
      modelIds: [route.modelId],
      taskContext: {
        taskSlot: "l2_page_intent_draft",
        entityType: "product",
        sourceId: productId,
        sourceSnapshotId,
        familyId,
      },
    });
  });
}
