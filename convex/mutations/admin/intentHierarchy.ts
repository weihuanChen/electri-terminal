import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import { mutation, type MutationCtx } from "../../_generated/server";
import {
  applyIntentPatch,
  assertCanonicalIntentContract,
  assertIntentDeltaBaseReference,
  assertIntentPatchOperations,
  canonicalIntentPayloadValidator,
  hashLocalizationFoundationValue,
  intentGroupDifferentiatorValidator,
  intentInheritancePolicyValidator,
  intentMembershipCriterionValidator,
  intentPatchOperationValidator,
  normalizeFoundationKey,
  type CanonicalIntentPayload,
  type IntentPatchOperation,
} from "../../lib/localizationFoundation";

const DEFAULT_FAMILY_INHERITANCE_POLICY = {
  schemaVersion: 2 as const,
  allowedOverrideTargets: [
    "primaryGoal",
    "primaryConceptIds",
    "secondaryConceptIds",
    "conversionIntent",
    "verifiedClaims",
    "prohibitedClaims",
    "extensions",
    "pageDelta",
  ] as Array<IntentPatchOperation["target"] | "pageDelta">,
  mergeTargets: [
    "mustCommunicate",
    "sectionIntents",
  ] as IntentPatchOperation["target"][],
  alwaysSharedPaths: [
    "buyerStage",
    "primaryAudience",
    "pageRole",
    "mustCommunicate.product_definition",
    "mustCommunicate.application_fit",
    "mustCommunicate.evidence_boundary",
    "sectionIntents.overview",
    "sectionIntents.applications",
  ],
  alwaysProductSpecificPaths: [
    "verifiedClaims",
    "pageDelta",
    "extensions.selectionCriteria",
    "extensions.supportedRanges",
    "extensions.pageDifferentiators",
    "extensions.productEvidence",
  ],
  sharedWithPageDeltaPaths: [
    "mustCommunicate.selection_logic",
    "sectionIntents.selection",
  ],
  excludedPaths: ["schemaVersion", "pageRole", "entityScope"],
  minimumMembershipEvidence: ["sourcePayload.title", "evidencePayload.model"],
  minimumPageEvidence: ["evidencePayload.variants"],
  evidenceResolutionOrder: [
    "protectedValues",
    "pageEvidence",
    "approvedGroupEvidence",
    "approvedFamilyEvidence",
    "sourceContent",
  ],
  missingEvidencePolicy: {
    shared_intent_missing_page_evidence: "inherit_without_conflict",
    page_specific_claim_missing_evidence: "high_conflict",
    optional_section_missing_evidence: "warning",
    group_membership_missing_evidence: "high_conflict",
  },
};

function requiredText(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label}_required`);
  return normalized;
}

function hasOpenBlocker(
  issues: Array<{ severity: string; resolvedAt?: number }>,
) {
  return issues.some(
    (issue) => issue.severity === "blocker" && !issue.resolvedAt,
  );
}

async function nextRevision(
  ctx: MutationCtx,
  table:
    | "familyIntentTemplateRevisions"
    | "productIntentGroupRevisions"
    | "pageIntentDeltaRevisions",
  index: "by_template_revision" | "by_group_revision" | "by_delta_revision",
  field: "templateId" | "groupId" | "pageIntentDeltaId",
  id:
    | Id<"familyIntentTemplates">
    | Id<"productIntentGroups">
    | Id<"pageIntentDeltas">,
) {
  const latest = await ctx.db
    .query(table)
    // The three revision tables share the same parent/revision index shape.
    .withIndex(index as never, (q) =>
      (q as never as { eq: (field: string, value: string) => typeof q }).eq(
        field,
        id,
      ),
    )
    .order("desc")
    .first();
  return ((latest as { revision?: number } | null)?.revision ?? 0) + 1;
}

async function staleDeltasForGroupRevision(
  ctx: MutationCtx,
  revisionId: Id<"productIntentGroupRevisions">,
  now: number,
) {
  const revisions = await ctx.db
    .query("pageIntentDeltaRevisions")
    .withIndex("by_base_group_revision", (q) =>
      q.eq("baseProductGroupRevisionId", revisionId),
    )
    .collect();
  for (const revision of revisions) {
    if (revision.status !== "approved") continue;
    await ctx.db.patch(revision._id, { status: "stale", updatedAt: now });
    const delta = await ctx.db.get(revision.pageIntentDeltaId);
    if (delta?.approvedRevisionId === revision._id) {
      await ctx.db.patch(delta._id, {
        status: "draft",
        approvedRevisionId: undefined,
        updatedAt: now,
      });
    }
  }
}

async function staleGroupsForTemplateRevision(
  ctx: MutationCtx,
  revisionId: Id<"familyIntentTemplateRevisions">,
  now: number,
) {
  const revisions = await ctx.db
    .query("productIntentGroupRevisions")
    .withIndex("by_template_revision", (q) =>
      q.eq("familyIntentTemplateRevisionId", revisionId),
    )
    .collect();
  for (const revision of revisions) {
    if (revision.status !== "approved") continue;
    await ctx.db.patch(revision._id, { status: "stale", updatedAt: now });
    await staleDeltasForGroupRevision(ctx, revision._id, now);
    const group = await ctx.db.get(revision.groupId);
    if (group?.approvedRevisionId === revision._id) {
      await ctx.db.patch(group._id, {
        status: "draft",
        approvedRevisionId: undefined,
        updatedAt: now,
      });
    }
  }
}

export const createFamilyIntentTemplate = mutation({
  args: {
    familyId: v.id("productFamilies"),
    key: v.string(),
    name: v.string(),
    owner: v.optional(v.string()),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(await ctx.db.get(args.familyId)))
      throw new Error("product_family_not_found");
    const key = normalizeFoundationKey(args.key, "template_key");
    const duplicate = await ctx.db
      .query("familyIntentTemplates")
      .withIndex("by_family_key", (q) =>
        q.eq("familyId", args.familyId).eq("key", key),
      )
      .unique();
    if (duplicate) throw new Error("family_intent_template_key_exists");
    const now = Date.now();
    return await ctx.db.insert("familyIntentTemplates", {
      familyId: args.familyId,
      key,
      name: requiredText(args.name, "template_name"),
      status: "draft",
      owner: args.owner?.trim() || undefined,
      createdBy: requiredText(args.actor, "actor"),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createFamilyIntentTemplateRevision = mutation({
  args: {
    templateId: v.id("familyIntentTemplates"),
    sourceSnapshotIds: v.array(v.id("localizationSourceSnapshots")),
    intent: canonicalIntentPayloadValidator,
    inheritancePolicy: intentInheritancePolicyValidator,
    coverageEvidence: v.record(v.string(), v.any()),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("family_intent_template_not_found");
    assertCanonicalIntentContract(args.intent);
    if (!args.sourceSnapshotIds.length)
      throw new Error("template_source_snapshot_required");
    for (const id of args.sourceSnapshotIds) {
      const snapshot = await ctx.db.get(id);
      if (
        !snapshot ||
        (snapshot.entityType !== "family" && snapshot.entityType !== "product")
      ) {
        throw new Error("invalid_template_source_snapshot");
      }
    }
    const revision = await nextRevision(
      ctx,
      "familyIntentTemplateRevisions",
      "by_template_revision",
      "templateId",
      template._id,
    );
    const now = Date.now();
    const revisionId = await ctx.db.insert("familyIntentTemplateRevisions", {
      templateId: template._id,
      revision,
      sourceSnapshotIds: args.sourceSnapshotIds,
      schemaVersion: args.intent.schemaVersion,
      status: "draft",
      intent: args.intent,
      inheritancePolicy: args.inheritancePolicy,
      coverageEvidence: args.coverageEvidence,
      validationIssues: [],
      createdBy: requiredText(args.actor, "actor"),
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(template._id, {
      currentRevisionId: revisionId,
      updatedAt: now,
    });
    return revisionId;
  },
});

export const promoteSelectedL2ResultToFamilyTemplateDraft = mutation({
  args: {
    templateId: v.id("familyIntentTemplates"),
    runId: v.id("llmLabRuns"),
    resultId: v.id("llmLabResults"),
    familySourceSnapshotId: v.id("localizationSourceSnapshots"),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const [template, run, result, familySnapshot] = await Promise.all([
      ctx.db.get(args.templateId),
      ctx.db.get(args.runId),
      ctx.db.get(args.resultId),
      ctx.db.get(args.familySourceSnapshotId),
    ]);
    if (!template) throw new Error("family_intent_template_not_found");
    if (!run || run.taskSlot !== "l2_page_intent_draft") {
      throw new Error("promotion_requires_l2_intent_run");
    }
    if (
      !result ||
      result.runId !== run._id ||
      run.selectedResultId !== result._id ||
      result.status !== "completed" ||
      result.schemaValid !== true
    ) {
      throw new Error("promotion_requires_selected_valid_result");
    }
    if (
      run.contextEntityType !== "product" ||
      !run.contextSourceId ||
      !run.contextSourceSnapshotId
    ) {
      throw new Error("promotion_requires_product_context");
    }
    const [product, productSnapshot] = await Promise.all([
      ctx.db.get(run.contextSourceId as Id<"products">),
      ctx.db.get(run.contextSourceSnapshotId),
    ]);
    if (!product || product.familyId !== template.familyId) {
      throw new Error("promotion_family_mismatch");
    }
    if (
      !productSnapshot ||
      productSnapshot.entityType !== "product" ||
      productSnapshot.sourceId !== String(product._id)
    ) {
      throw new Error("promotion_product_snapshot_mismatch");
    }
    if (
      !familySnapshot ||
      familySnapshot.entityType !== "family" ||
      familySnapshot.sourceId !== String(template.familyId)
    ) {
      throw new Error("promotion_family_snapshot_mismatch");
    }

    const existingRevisions = await ctx.db
      .query("familyIntentTemplateRevisions")
      .withIndex("by_template_revision", (q) =>
        q.eq("templateId", template._id),
      )
      .collect();
    const existing = existingRevisions.find(
      (revision) =>
        revision.generationProvenance?.resultId === String(result._id),
    );
    if (existing) return { revisionId: existing._id, created: false };

    const output = result.parsedOutput;
    if (!output || typeof output !== "object" || Array.isArray(output)) {
      throw new Error("promotion_result_output_missing");
    }
    const record = output as Record<string, unknown>;
    const intent = record.intent as CanonicalIntentPayload | undefined;
    assertCanonicalIntentContract(intent);
    const recommendation =
      record.hierarchyRecommendation &&
      typeof record.hierarchyRecommendation === "object" &&
      !Array.isArray(record.hierarchyRecommendation)
        ? (record.hierarchyRecommendation as Record<string, unknown>)
        : {};
    const confidence =
      record.confidence &&
      typeof record.confidence === "object" &&
      !Array.isArray(record.confidence)
        ? (record.confidence as Record<string, unknown>)
        : {};
    const scope =
      typeof recommendation.scope === "string"
        ? recommendation.scope
        : "unknown";
    const now = Date.now();
    const validationIssues = [
      {
        severity: "high" as const,
        code: "llm_product_candidate_promoted_to_family",
        message:
          "This Family Template draft originated from one product page. Confirm every intent item is shared by the full family before locking.",
        path: "intent",
        createdAt: now,
      },
      ...(intent.verifiedClaims.length
        ? [
            {
              severity: "high" as const,
              code: "promoted_family_verified_claims_require_review",
              message:
                "Verified claims are product-specific by default and must be proven family-wide or moved to Product Group/Page Delta.",
              path: "intent.verifiedClaims",
              createdAt: now,
            },
          ]
        : []),
      ...(scope !== "family_template"
        ? [
            {
              severity: "medium" as const,
              code: "promotion_scope_requires_review",
              message: `The model recommended hierarchy scope '${scope}', not a Family Template.`,
              path: "hierarchyRecommendation.scope",
              createdAt: now,
            },
          ]
        : []),
    ];
    const currentRevision = template.currentRevisionId
      ? await ctx.db.get(template.currentRevisionId)
      : null;
    const revision = await nextRevision(
      ctx,
      "familyIntentTemplateRevisions",
      "by_template_revision",
      "templateId",
      template._id,
    );
    const revisionId = await ctx.db.insert("familyIntentTemplateRevisions", {
      templateId: template._id,
      revision,
      sourceSnapshotIds: [familySnapshot._id, productSnapshot._id],
      schemaVersion: intent.schemaVersion,
      status: "draft",
      intent,
      inheritancePolicy:
        currentRevision?.inheritancePolicy ?? DEFAULT_FAMILY_INHERITANCE_POLICY,
      coverageEvidence: {
        mode: "llm_selected_result_promotion",
        runId: String(run._id),
        resultId: String(result._id),
        productId: String(product._id),
        recommendationScope: scope,
        reportedConfidence:
          typeof confidence.reported === "number" ? confidence.reported : null,
        evidenceCoverage:
          typeof confidence.evidenceCoverage === "number"
            ? confidence.evidenceCoverage
            : null,
        reviewRequired: record.reviewRequired === true,
        conflictCount: Array.isArray(record.conflicts)
          ? record.conflicts.length
          : 0,
      },
      generationProvenance: {
        source: "llm_lab_selected_result",
        runId: String(run._id),
        resultId: String(result._id),
        presetId: String(run.presetId),
        presetVersionId: String(run.presetVersionId),
        modelId: String(result.modelId),
        providerKey: result.providerKey,
        productId: String(product._id),
      },
      validationIssues,
      createdBy: requiredText(args.actor, "actor"),
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(template._id, {
      currentRevisionId: revisionId,
      status: "draft",
      updatedAt: now,
    });
    return { revisionId, created: true };
  },
});

export const approveFamilyIntentTemplateRevision = mutation({
  args: {
    revisionId: v.id("familyIntentTemplateRevisions"),
    actor: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const revision = await ctx.db.get(args.revisionId);
    if (!revision) throw new Error("family_intent_template_revision_not_found");
    if (revision.status !== "draft" && revision.status !== "review_required")
      throw new Error("template_revision_not_reviewable");
    if (hasOpenBlocker(revision.validationIssues))
      throw new Error("template_revision_has_unresolved_blockers");
    const template = await ctx.db.get(revision.templateId);
    if (!template) throw new Error("family_intent_template_not_found");
    const now = Date.now();
    if (
      template.approvedRevisionId &&
      template.approvedRevisionId !== revision._id
    ) {
      await staleGroupsForTemplateRevision(
        ctx,
        template.approvedRevisionId,
        now,
      );
      await ctx.db.patch(template.approvedRevisionId, {
        status: "superseded",
        updatedAt: now,
      });
    }
    const actor = requiredText(args.actor, "actor");
    await ctx.db.patch(revision._id, {
      status: "approved",
      reviewedBy: actor,
      reviewedAt: now,
      reviewNote: args.note?.trim() || undefined,
      lockedBy: actor,
      lockedAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(template._id, {
      status: "active",
      approvedRevisionId: revision._id,
      currentRevisionId: revision._id,
      updatedAt: now,
    });
    return revision._id;
  },
});

export const createProductIntentGroup = mutation({
  args: {
    templateId: v.id("familyIntentTemplates"),
    key: v.string(),
    name: v.string(),
    description: v.string(),
    owner: v.optional(v.string()),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("family_intent_template_not_found");
    const key = normalizeFoundationKey(args.key, "group_key");
    const duplicate = await ctx.db
      .query("productIntentGroups")
      .withIndex("by_template_key", (q) =>
        q.eq("familyIntentTemplateId", template._id).eq("key", key),
      )
      .unique();
    if (duplicate) throw new Error("product_intent_group_key_exists");
    const now = Date.now();
    return await ctx.db.insert("productIntentGroups", {
      familyIntentTemplateId: template._id,
      familyId: template.familyId,
      key,
      name: requiredText(args.name, "group_name"),
      description: requiredText(args.description, "group_description"),
      status: "draft",
      owner: args.owner?.trim() || undefined,
      createdBy: requiredText(args.actor, "actor"),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createProductIntentGroupRevision = mutation({
  args: {
    groupId: v.id("productIntentGroups"),
    membershipCriteria: v.array(intentMembershipCriterionValidator),
    differentiators: v.array(intentGroupDifferentiatorValidator),
    intentPatch: v.array(intentPatchOperationValidator),
    requiredEvidencePaths: v.array(v.string()),
    sampleMinimumCount: v.number(),
    samplePercentage: v.number(),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("product_intent_group_not_found");
    const template = await ctx.db.get(group.familyIntentTemplateId);
    if (!template?.approvedRevisionId)
      throw new Error("approved_family_template_required");
    const templateRevision = await ctx.db.get(template.approvedRevisionId);
    if (!templateRevision || templateRevision.status !== "approved")
      throw new Error("approved_family_template_required");
    assertIntentPatchOperations(args.intentPatch as IntentPatchOperation[]);
    applyIntentPatch(
      templateRevision.intent,
      args.intentPatch as IntentPatchOperation[],
    );
    if (!args.membershipCriteria.length)
      throw new Error("membership_criteria_required");
    if (!args.differentiators.length)
      throw new Error("group_differentiators_required");
    if (
      args.sampleMinimumCount < 0 ||
      args.samplePercentage < 0 ||
      args.samplePercentage > 100
    )
      throw new Error("invalid_sample_policy");
    const revision = await nextRevision(
      ctx,
      "productIntentGroupRevisions",
      "by_group_revision",
      "groupId",
      group._id,
    );
    const now = Date.now();
    const revisionId = await ctx.db.insert("productIntentGroupRevisions", {
      groupId: group._id,
      revision,
      familyIntentTemplateRevisionId: templateRevision._id,
      schemaVersion: templateRevision.schemaVersion,
      status: "draft",
      membershipCriteria: args.membershipCriteria,
      differentiators: args.differentiators,
      intentPatch: args.intentPatch,
      requiredEvidencePaths: args.requiredEvidencePaths,
      confidenceDistribution: {
        high: 0,
        medium: 0,
        low: 0,
        pending: 0,
        total: 0,
      },
      conflictSummary: {
        blocker: 0,
        high: 0,
        medium: 0,
        low: 0,
        unresolved: 0,
      },
      samplePolicy: {
        minimumCount: args.sampleMinimumCount,
        percentage: args.samplePercentage,
        includeBoundaryMembers: true,
        includeDistinctFactCombinations: true,
        frozen: false,
      },
      validationIssues: [],
      createdBy: requiredText(args.actor, "actor"),
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(group._id, {
      currentRevisionId: revisionId,
      updatedAt: now,
    });
    return revisionId;
  },
});

export const approveProductIntentGroupRevision = mutation({
  args: {
    revisionId: v.id("productIntentGroupRevisions"),
    actor: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const revision = await ctx.db.get(args.revisionId);
    if (!revision) throw new Error("product_intent_group_revision_not_found");
    if (revision.status !== "draft" && revision.status !== "review_required")
      throw new Error("group_revision_not_reviewable");
    if (hasOpenBlocker(revision.validationIssues))
      throw new Error("group_revision_has_unresolved_blockers");
    const templateRevision = await ctx.db.get(
      revision.familyIntentTemplateRevisionId,
    );
    if (!templateRevision || templateRevision.status !== "approved")
      throw new Error("group_template_revision_is_stale");
    applyIntentPatch(
      templateRevision.intent,
      revision.intentPatch as IntentPatchOperation[],
    );
    const group = await ctx.db.get(revision.groupId);
    if (!group) throw new Error("product_intent_group_not_found");
    const now = Date.now();
    if (group.approvedRevisionId && group.approvedRevisionId !== revision._id) {
      await staleDeltasForGroupRevision(ctx, group.approvedRevisionId, now);
      await ctx.db.patch(group.approvedRevisionId, {
        status: "superseded",
        updatedAt: now,
      });
    }
    const actor = requiredText(args.actor, "actor");
    await ctx.db.patch(revision._id, {
      status: "approved",
      reviewedBy: actor,
      reviewedAt: now,
      reviewNote: args.note?.trim() || undefined,
      lockedBy: actor,
      lockedAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(group._id, {
      status: "active",
      approvedRevisionId: revision._id,
      currentRevisionId: revision._id,
      updatedAt: now,
    });
    return revision._id;
  },
});

export const assignProductToIntentGroup = mutation({
  args: {
    productId: v.id("products"),
    groupId: v.id("productIntentGroups"),
    sourceSnapshotId: v.id("localizationSourceSnapshots"),
    assignmentReason: v.string(),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const [product, group, snapshot] = await Promise.all([
      ctx.db.get(args.productId),
      ctx.db.get(args.groupId),
      ctx.db.get(args.sourceSnapshotId),
    ]);
    if (!product) throw new Error("product_not_found");
    if (!group?.approvedRevisionId)
      throw new Error("approved_product_group_required");
    if (product.familyId !== group.familyId)
      throw new Error("product_group_family_mismatch");
    if (
      !snapshot ||
      snapshot.entityType !== "product" ||
      snapshot.sourceId !== String(product._id)
    )
      throw new Error("product_source_snapshot_mismatch");
    const groupRevision = await ctx.db.get(group.approvedRevisionId);
    if (!groupRevision || groupRevision.status !== "approved")
      throw new Error("approved_product_group_required");
    const existing = await ctx.db
      .query("productIntentGroupMembers")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    const now = Date.now();
    for (const member of existing) {
      if (
        [
          "approved",
          "auto_inherited",
          "quick_review",
          "manual_review",
        ].includes(member.status)
      ) {
        await ctx.db.patch(member._id, { status: "rejected", updatedAt: now });
      }
    }
    return await ctx.db.insert("productIntentGroupMembers", {
      productId: product._id,
      sourceSnapshotId: snapshot._id,
      groupId: group._id,
      groupRevisionId: groupRevision._id,
      status: "approved",
      confidence: {
        dimensions: {},
        reasons: ["manual_assignment"],
        uncertainPaths: [],
      },
      confidenceBand: "pending",
      assignmentReason: requiredText(
        args.assignmentReason,
        "assignment_reason",
      ),
      extractedDifferentiators: {},
      conflicts: [],
      selectedForSample: false,
      sampleReviewStatus: "not_selected",
      reviewer: requiredText(args.actor, "actor"),
      reviewedAt: now,
      createdBy: requiredText(args.actor, "actor"),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createProductPageDeltaRevision = mutation({
  args: {
    productId: v.id("products"),
    sourceSnapshotId: v.id("localizationSourceSnapshots"),
    baseProductGroupRevisionId: v.id("productIntentGroupRevisions"),
    patchOperations: v.array(intentPatchOperationValidator),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const [product, snapshot, groupRevision] = await Promise.all([
      ctx.db.get(args.productId),
      ctx.db.get(args.sourceSnapshotId),
      ctx.db.get(args.baseProductGroupRevisionId),
    ]);
    if (!product) throw new Error("product_not_found");
    if (
      !snapshot ||
      snapshot.entityType !== "product" ||
      snapshot.sourceId !== String(product._id)
    )
      throw new Error("product_source_snapshot_mismatch");
    if (!groupRevision || groupRevision.status !== "approved")
      throw new Error("approved_product_group_revision_required");
    const group = await ctx.db.get(groupRevision.groupId);
    if (!group || group.familyId !== product.familyId)
      throw new Error("product_group_family_mismatch");
    const templateRevision = await ctx.db.get(
      groupRevision.familyIntentTemplateRevisionId,
    );
    if (!templateRevision || templateRevision.status !== "approved")
      throw new Error("approved_family_template_required");
    assertIntentDeltaBaseReference({
      baseKind: "product_group_revision",
      baseProductGroupRevisionId: String(groupRevision._id),
    });
    assertIntentPatchOperations(args.patchOperations as IntentPatchOperation[]);
    const groupIntent = applyIntentPatch(
      templateRevision.intent,
      groupRevision.intentPatch as IntentPatchOperation[],
    );
    applyIntentPatch(
      groupIntent,
      args.patchOperations as IntentPatchOperation[],
    );
    let delta = await ctx.db
      .query("pageIntentDeltas")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "product").eq("sourceId", String(product._id)),
      )
      .unique();
    const now = Date.now();
    if (!delta) {
      const id = await ctx.db.insert("pageIntentDeltas", {
        pageClass: "L2",
        entityType: "product",
        sourceId: String(product._id),
        baseKind: "product_group_revision",
        status: "draft",
        createdBy: requiredText(args.actor, "actor"),
        createdAt: now,
        updatedAt: now,
      });
      delta = await ctx.db.get(id);
    }
    if (!delta) throw new Error("page_intent_delta_creation_failed");
    const revision = await nextRevision(
      ctx,
      "pageIntentDeltaRevisions",
      "by_delta_revision",
      "pageIntentDeltaId",
      delta._id,
    );
    const revisionId = await ctx.db.insert("pageIntentDeltaRevisions", {
      pageIntentDeltaId: delta._id,
      revision,
      sourceSnapshotId: snapshot._id,
      baseKind: "product_group_revision",
      baseProductGroupRevisionId: groupRevision._id,
      schemaVersion: groupRevision.schemaVersion,
      status: "draft",
      patchOperations: args.patchOperations,
      confidence: {
        dimensions: {},
        reasons: ["manual_delta"],
        uncertainPaths: [],
      },
      confidenceBand: "pending",
      conflicts: [],
      validationIssues: [],
      createdBy: requiredText(args.actor, "actor"),
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(delta._id, {
      currentRevisionId: revisionId,
      status: "draft",
      updatedAt: now,
    });
    return revisionId;
  },
});

export const approveProductPageDeltaRevision = mutation({
  args: {
    revisionId: v.id("pageIntentDeltaRevisions"),
    actor: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const revision = await ctx.db.get(args.revisionId);
    if (!revision) throw new Error("page_intent_delta_revision_not_found");
    if (revision.status !== "draft" && revision.status !== "review_required")
      throw new Error("delta_revision_not_reviewable");
    if (
      hasOpenBlocker(revision.validationIssues) ||
      revision.conflicts.some(
        (item) =>
          item.status === "open" && ["blocker", "high"].includes(item.severity),
      )
    ) {
      throw new Error("delta_revision_requires_manual_resolution");
    }
    if (!revision.baseProductGroupRevisionId)
      throw new Error("delta_group_base_required");
    const groupRevision = await ctx.db.get(revision.baseProductGroupRevisionId);
    if (!groupRevision || groupRevision.status !== "approved")
      throw new Error("delta_group_base_is_stale");
    const templateRevision = await ctx.db.get(
      groupRevision.familyIntentTemplateRevisionId,
    );
    if (!templateRevision || templateRevision.status !== "approved")
      throw new Error("delta_template_base_is_stale");
    const resolved = applyIntentPatch(
      applyIntentPatch(
        templateRevision.intent,
        groupRevision.intentPatch as IntentPatchOperation[],
      ),
      revision.patchOperations as IntentPatchOperation[],
    );
    const delta = await ctx.db.get(revision.pageIntentDeltaId);
    if (!delta) throw new Error("page_intent_delta_not_found");
    const now = Date.now();
    if (delta.approvedRevisionId && delta.approvedRevisionId !== revision._id) {
      await ctx.db.patch(delta.approvedRevisionId, {
        status: "superseded",
        updatedAt: now,
      });
    }
    const actor = requiredText(args.actor, "actor");
    await ctx.db.patch(revision._id, {
      status: "approved",
      resolvedIntentHash: hashLocalizationFoundationValue(resolved),
      reviewedBy: actor,
      reviewedAt: now,
      reviewNote: args.note?.trim() || undefined,
      lockedBy: actor,
      lockedAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(delta._id, {
      status: "active",
      approvedRevisionId: revision._id,
      currentRevisionId: revision._id,
      updatedAt: now,
    });
    return revision._id;
  },
});

async function nextCanonicalRevision(
  ctx: MutationCtx,
  id: Id<"canonicalIntents">,
) {
  const latest = await ctx.db
    .query("canonicalIntentRevisions")
    .withIndex("by_parent_revision", (q) => q.eq("canonicalIntentId", id))
    .order("desc")
    .first();
  return (latest?.revision ?? 0) + 1;
}

export const materializeProductCanonicalIntent = mutation({
  args: {
    productId: v.id("products"),
    actor: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("product_not_found");
    const members = await ctx.db
      .query("productIntentGroupMembers")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    const member = members
      .filter((item) => item.status === "approved" && item.groupRevisionId)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];
    if (!member?.groupRevisionId)
      throw new Error("approved_product_group_assignment_required");
    if (
      member.conflicts.some(
        (item) =>
          item.status === "open" && ["blocker", "high"].includes(item.severity),
      )
    ) {
      throw new Error("product_assignment_has_unresolved_conflicts");
    }
    const groupRevision = await ctx.db.get(member.groupRevisionId);
    if (!groupRevision || groupRevision.status !== "approved")
      throw new Error("product_group_assignment_is_stale");
    const templateRevision = await ctx.db.get(
      groupRevision.familyIntentTemplateRevisionId,
    );
    if (!templateRevision || templateRevision.status !== "approved")
      throw new Error("family_template_assignment_is_stale");
    let resolved = applyIntentPatch(
      templateRevision.intent,
      groupRevision.intentPatch as IntentPatchOperation[],
    );
    const delta = await ctx.db
      .query("pageIntentDeltas")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "product").eq("sourceId", String(product._id)),
      )
      .unique();
    let deltaRevision: Doc<"pageIntentDeltaRevisions"> | null = null;
    if (delta?.approvedRevisionId) {
      deltaRevision = await ctx.db.get(delta.approvedRevisionId);
      if (
        deltaRevision?.baseProductGroupRevisionId !== groupRevision._id ||
        deltaRevision.status !== "approved"
      ) {
        throw new Error("approved_product_delta_is_stale");
      }
      resolved = applyIntentPatch(
        resolved,
        deltaRevision.patchOperations as IntentPatchOperation[],
      );
    }
    assertCanonicalIntentContract(resolved);
    let identity = await ctx.db
      .query("canonicalIntents")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "product").eq("sourceId", String(product._id)),
      )
      .unique();
    const now = Date.now();
    if (!identity) {
      const id = await ctx.db.insert("canonicalIntents", {
        entityType: "product",
        sourceId: String(product._id),
        createdAt: now,
        updatedAt: now,
      });
      identity = await ctx.db.get(id);
    }
    if (!identity) throw new Error("canonical_intent_identity_creation_failed");
    if (identity.approvedRevisionId) {
      await ctx.db.patch(identity.approvedRevisionId, {
        status: "superseded",
        updatedAt: now,
      });
    }
    const actor = requiredText(args.actor, "actor");
    const revisionId = await ctx.db.insert("canonicalIntentRevisions", {
      canonicalIntentId: identity._id,
      revision: await nextCanonicalRevision(ctx, identity._id),
      sourceSnapshotId: member.sourceSnapshotId,
      schemaVersion: resolved.schemaVersion,
      status: "approved",
      intent: resolved,
      generationProvenance: {
        mode: "manual_hierarchy",
        templateRevisionId: String(templateRevision._id),
        groupRevisionId: String(groupRevision._id),
        ...(deltaRevision
          ? { deltaRevisionId: String(deltaRevision._id) }
          : {}),
      },
      validationIssues: [],
      createdBy: actor,
      reviewedBy: actor,
      reviewedAt: now,
      reviewNote:
        args.note?.trim() || "Materialized from approved manual hierarchy",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(identity._id, {
      currentRevisionId: revisionId,
      approvedRevisionId: revisionId,
      updatedAt: now,
    });
    return revisionId;
  },
});
