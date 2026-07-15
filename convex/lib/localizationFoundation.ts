import { v } from "convex/values";

export const localizationPageClassValidator = v.union(
  v.literal("L1"),
  v.literal("L2"),
  v.literal("L3"),
);

export const canonicalIntentStatusValidator = v.union(
  v.literal("draft"),
  v.literal("review_required"),
  v.literal("approved"),
  v.literal("superseded"),
  v.literal("stale"),
);

export const languageProfileStatusValidator = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("paused"),
);

export const languageProfileVersionStatusValidator = v.union(
  v.literal("draft"),
  v.literal("approved"),
  v.literal("superseded"),
);

export const canonicalConceptStatusValidator = v.union(
  v.literal("draft"),
  v.literal("approved"),
  v.literal("deprecated"),
);

export const conceptLocaleRuleStatusValidator = v.union(
  v.literal("draft"),
  v.literal("approved"),
  v.literal("superseded"),
);

export const conceptBindingStatusValidator = v.union(
  v.literal("proposed"),
  v.literal("approved"),
  v.literal("rejected"),
);

export const conceptBindingRoleValidator = v.union(
  v.literal("primary"),
  v.literal("secondary"),
  v.literal("attribute"),
  v.literal("application"),
);

export const conceptBindingSourceValidator = v.union(
  v.literal("manual"),
  v.literal("rule"),
  v.literal("llm_suggested"),
);

export const intentAuthoringStatusValidator = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("paused"),
);

export const intentConfidenceBandValidator = v.union(
  v.literal("pending"),
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
);

export const intentConfidenceValidator = v.object({
  reported: v.optional(v.number()),
  system: v.optional(v.number()),
  evidenceCoverage: v.optional(v.number()),
  dimensions: v.record(v.string(), v.number()),
  reasons: v.array(v.string()),
  uncertainPaths: v.array(v.string()),
});

export const intentConflictCategoryValidator = v.union(
  v.literal("certification_conflict"),
  v.literal("material_conflict"),
  v.literal("rated_current_conflict"),
  v.literal("application_conflict"),
  v.literal("rated_voltage_conflict"),
  v.literal("standard_conflict"),
  v.literal("safety_claim_conflict"),
  v.literal("source_evidence_missing"),
  v.literal("protected_value_mismatch"),
  v.literal("other"),
);

export const intentConflictValidator = v.object({
  category: intentConflictCategoryValidator,
  severity: v.union(
    v.literal("blocker"),
    v.literal("high"),
    v.literal("medium"),
    v.literal("low"),
  ),
  message: v.string(),
  sourcePaths: v.array(v.string()),
  comparedValues: v.array(v.any()),
  affectedIntentPath: v.optional(v.string()),
  detectionMethod: v.string(),
  status: v.union(
    v.literal("open"),
    v.literal("resolved"),
    v.literal("accepted_exception"),
  ),
  reviewer: v.optional(v.string()),
  reviewNote: v.optional(v.string()),
  resolvedAt: v.optional(v.number()),
});

export const intentPatchTargetValidator = v.union(
  v.literal("pageRole"),
  v.literal("primaryAudience"),
  v.literal("buyerStage"),
  v.literal("primaryGoal"),
  v.literal("primaryConceptIds"),
  v.literal("secondaryConceptIds"),
  v.literal("mustCommunicate"),
  v.literal("verifiedClaims"),
  v.literal("prohibitedClaims"),
  v.literal("conversionIntent"),
  v.literal("sectionIntents"),
  v.literal("extensions"),
);

export const intentPatchOperationValidator = v.object({
  operation: v.union(
    v.literal("add"),
    v.literal("replace"),
    v.literal("remove"),
  ),
  target: intentPatchTargetValidator,
  itemKey: v.optional(v.string()),
  value: v.optional(v.any()),
  reason: v.string(),
  evidencePaths: v.array(v.string()),
});

const intentInheritanceOverrideTargetValidator = v.union(
  v.literal("pageRole"),
  v.literal("primaryAudience"),
  v.literal("buyerStage"),
  v.literal("primaryGoal"),
  v.literal("primaryConceptIds"),
  v.literal("secondaryConceptIds"),
  v.literal("mustCommunicate"),
  v.literal("verifiedClaims"),
  v.literal("prohibitedClaims"),
  v.literal("conversionIntent"),
  v.literal("sectionIntents"),
  v.literal("extensions"),
  v.literal("pageDelta"),
);

const intentInheritancePolicyV1Validator = v.object({
  schemaVersion: v.optional(v.literal(1)),
  allowedOverrideTargets: v.array(intentPatchTargetValidator),
  requiredEvidencePaths: v.array(v.string()),
  alwaysProductSpecificPaths: v.array(v.string()),
  excludedPaths: v.array(v.string()),
});

const intentInheritancePolicyV2Validator = v.object({
  schemaVersion: v.literal(2),
  allowedOverrideTargets: v.array(intentInheritanceOverrideTargetValidator),
  mergeTargets: v.array(intentPatchTargetValidator),
  alwaysSharedPaths: v.array(v.string()),
  alwaysProductSpecificPaths: v.array(v.string()),
  sharedWithPageDeltaPaths: v.array(v.string()),
  excludedPaths: v.array(v.string()),
  minimumMembershipEvidence: v.array(v.string()),
  minimumPageEvidence: v.array(v.string()),
  evidenceResolutionOrder: v.array(v.string()),
  missingEvidencePolicy: v.record(v.string(), v.string()),
});

export const intentInheritancePolicyValidator = v.union(
  intentInheritancePolicyV1Validator,
  intentInheritancePolicyV2Validator,
);

export const intentMembershipCriterionValidator = v.object({
  fieldPath: v.string(),
  operator: v.union(
    v.literal("equals"),
    v.literal("in"),
    v.literal("range"),
    v.literal("contains"),
    v.literal("exists"),
  ),
  values: v.array(v.any()),
  unit: v.optional(v.string()),
  required: v.boolean(),
});

export const intentGroupDifferentiatorValidator = v.object({
  key: v.string(),
  label: v.string(),
  sourcePaths: v.array(v.string()),
  values: v.array(v.any()),
  intentImpact: v.string(),
});

export const productIntentGroupMemberStatusValidator = v.union(
  v.literal("proposed"),
  v.literal("auto_inherited"),
  v.literal("quick_review"),
  v.literal("manual_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("unassigned"),
);

export const intentSampleReviewStatusValidator = v.union(
  v.literal("not_selected"),
  v.literal("pending"),
  v.literal("passed"),
  v.literal("failed"),
);

export const pageIntentDeltaBaseKindValidator = v.union(
  v.literal("l1_previous_revision"),
  v.literal("l1_policy_baseline"),
  v.literal("product_group_revision"),
);

export const foundationValidationIssueValidator = v.object({
  severity: v.union(
    v.literal("blocker"),
    v.literal("high"),
    v.literal("medium"),
    v.literal("low"),
  ),
  code: v.string(),
  message: v.string(),
  path: v.optional(v.string()),
  createdAt: v.number(),
  resolvedAt: v.optional(v.number()),
});

export const protectedSourceValueValidator = v.object({
  value: v.string(),
  kind: v.string(),
  fieldPath: v.optional(v.string()),
});

const verifiedClaimValidator = v.object({
  claimKey: v.string(),
  factPath: v.string(),
  allowedMeaning: v.string(),
});

const conversionIntentValidator = v.object({
  primaryAction: v.string(),
  secondaryAction: v.optional(v.string()),
});

const canonicalIntentPayloadV1Validator = v.object({
  schemaVersion: v.literal(1),
  pageRole: v.string(),
  primaryAudience: v.array(v.string()),
  buyerStage: v.array(v.string()),
  primaryGoal: v.string(),
  primaryConceptIds: v.array(v.string()),
  secondaryConceptIds: v.array(v.string()),
  mustCommunicate: v.array(
    v.object({
      key: v.string(),
      intent: v.string(),
      evidencePaths: v.array(v.string()),
    }),
  ),
  verifiedClaims: v.array(verifiedClaimValidator),
  prohibitedClaims: v.array(v.string()),
  conversionIntent: conversionIntentValidator,
  sectionIntents: v.array(
    v.object({
      sectionKey: v.string(),
      purpose: v.string(),
      requiredConceptIds: v.array(v.string()),
      requiredFactPaths: v.array(v.string()),
    }),
  ),
  extensions: v.optional(v.record(v.string(), v.any())),
});

const intentInheritanceModeValidator = v.union(
  v.literal("shared"),
  v.literal("shared_with_page_delta"),
  v.literal("page_specific"),
);

const canonicalIntentPayloadV2Validator = v.object({
  schemaVersion: v.literal(2),
  pageRole: v.string(),
  entityScope: v.string(),
  primaryAudience: v.array(v.string()),
  buyerStage: v.array(v.string()),
  primaryGoal: v.string(),
  primaryConceptIds: v.array(v.string()),
  secondaryConceptIds: v.array(v.string()),
  mustCommunicate: v.array(
    v.object({
      key: v.string(),
      intent: v.string(),
      inheritanceMode: intentInheritanceModeValidator,
      evidenceRequirement: v.string(),
    }),
  ),
  verifiedClaims: v.array(verifiedClaimValidator),
  prohibitedClaims: v.array(v.string()),
  conversionIntent: conversionIntentValidator,
  sectionIntents: v.array(
    v.object({
      sectionKey: v.string(),
      purpose: v.string(),
      inheritanceMode: intentInheritanceModeValidator,
      requiredEvidenceClass: v.string(),
    }),
  ),
  extensions: v.optional(v.record(v.string(), v.any())),
});

export const canonicalIntentPayloadValidator = v.union(
  canonicalIntentPayloadV1Validator,
  canonicalIntentPayloadV2Validator,
);

export const conceptTermValidator = v.object({
  text: v.string(),
  role: v.union(
    v.literal("primary"),
    v.literal("secondary"),
    v.literal("allowed"),
  ),
  contexts: v.array(v.string()),
  searchIntent: v.optional(v.string()),
  notes: v.optional(v.string()),
  maxUsage: v.optional(v.string()),
});

export function stableLocalizationValue(value: unknown): string {
  if (value === undefined) return "";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableLocalizationValue).join(",")}]`;
  }
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([key, child]) =>
        `${JSON.stringify(key)}:${stableLocalizationValue(child)}`,
    )
    .join(",")}}`;
}

export function hashLocalizationFoundationValue(value: unknown) {
  const input = stableLocalizationValue(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildSourceFieldHashes(sourcePayload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(sourcePayload).map(([key, value]) => [
      key,
      hashLocalizationFoundationValue(value),
    ]),
  );
}

export function normalizeFoundationKey(value: string, label: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  if (!normalized) throw new Error(`${label}_required`);
  return normalized;
}

export function normalizeLocale(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(normalized)) {
    throw new Error("invalid_locale");
  }
  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function assertCanonicalIntentContract(
  intent: unknown,
): asserts intent is CanonicalIntentPayload {
  if (!isRecord(intent)) {
    throw new Error("canonical_intent_object_required");
  }
  if (typeof intent.primaryGoal !== "string" || !intent.primaryGoal.trim())
    throw new Error("canonical_intent_primary_goal_required");
  if (
    !Array.isArray(intent.primaryAudience) ||
    intent.primaryAudience.length === 0
  ) {
    throw new Error("canonical_intent_audience_required");
  }
  if (
    !Array.isArray(intent.mustCommunicate) ||
    intent.mustCommunicate.length === 0
  ) {
    throw new Error("canonical_intent_must_communicate_required");
  }
  if (
    !Array.isArray(intent.sectionIntents) ||
    intent.sectionIntents.length === 0
  ) {
    throw new Error("canonical_intent_sections_required");
  }
  if (
    intent.mustCommunicate.some(
      (item) =>
        !isRecord(item) ||
        typeof item.key !== "string" ||
        !item.key.trim() ||
        typeof item.intent !== "string" ||
        !item.intent.trim(),
    )
  ) {
    throw new Error("canonical_intent_communication_invalid");
  }
  const communications = intent.mustCommunicate as Array<
    Record<string, unknown>
  >;
  const keys = communications.map((item) => String(item.key).trim());
  if (new Set(keys).size !== keys.length) {
    throw new Error("canonical_intent_duplicate_communication_key");
  }
  const schemaVersion = intent.schemaVersion ?? 1;
  if (schemaVersion === 1) {
    if (
      communications.some(
        (item) =>
          !Array.isArray(item.evidencePaths) || item.evidencePaths.length === 0,
      )
    ) {
      throw new Error("canonical_intent_communication_evidence_required");
    }
  } else if (schemaVersion === 2) {
    if (typeof intent.entityScope !== "string" || !intent.entityScope.trim()) {
      throw new Error("canonical_intent_entity_scope_required");
    }
    if (
      communications.some(
        (item) =>
          !["shared", "shared_with_page_delta", "page_specific"].includes(
            String(item.inheritanceMode),
          ) ||
          typeof item.evidenceRequirement !== "string" ||
          !item.evidenceRequirement.trim(),
      )
    ) {
      throw new Error("canonical_intent_v2_communication_policy_invalid");
    }
  } else {
    throw new Error("canonical_intent_schema_version_unsupported");
  }
  if (
    intent.sectionIntents.some(
      (item) =>
        !isRecord(item) ||
        typeof item.sectionKey !== "string" ||
        !item.sectionKey.trim() ||
        typeof item.purpose !== "string" ||
        !item.purpose.trim(),
    )
  ) {
    throw new Error("canonical_intent_section_invalid");
  }
  if (
    schemaVersion === 2 &&
    intent.sectionIntents.some(
      (item) =>
        !isRecord(item) ||
        !["shared", "shared_with_page_delta", "page_specific"].includes(
          String(item.inheritanceMode),
        ) ||
        typeof item.requiredEvidenceClass !== "string" ||
        !item.requiredEvidenceClass.trim(),
    )
  ) {
    throw new Error("canonical_intent_v2_section_policy_invalid");
  }
}

export type IntentPatchOperation = {
  operation: "add" | "replace" | "remove";
  target:
    | "pageRole"
    | "primaryAudience"
    | "buyerStage"
    | "primaryGoal"
    | "primaryConceptIds"
    | "secondaryConceptIds"
    | "mustCommunicate"
    | "verifiedClaims"
    | "prohibitedClaims"
    | "conversionIntent"
    | "sectionIntents"
    | "extensions";
  itemKey?: string;
  value?: unknown;
  reason: string;
  evidencePaths: string[];
};

type CanonicalIntentSharedFields = {
  pageRole: string;
  primaryAudience: string[];
  buyerStage: string[];
  primaryGoal: string;
  primaryConceptIds: string[];
  secondaryConceptIds: string[];
  verifiedClaims: Array<{
    claimKey: string;
    factPath: string;
    allowedMeaning: string;
  }>;
  prohibitedClaims: string[];
  conversionIntent: {
    primaryAction: string;
    secondaryAction?: string;
  };
  extensions?: Record<string, unknown>;
};

export type CanonicalIntentV1Payload = CanonicalIntentSharedFields & {
  schemaVersion: 1;
  mustCommunicate: Array<{
    key: string;
    intent: string;
    evidencePaths: string[];
  }>;
  sectionIntents: Array<{
    sectionKey: string;
    purpose: string;
    requiredConceptIds: string[];
    requiredFactPaths: string[];
  }>;
};

export type CanonicalIntentV2Payload = CanonicalIntentSharedFields & {
  schemaVersion: 2;
  entityScope: string;
  mustCommunicate: Array<{
    key: string;
    intent: string;
    inheritanceMode: "shared" | "shared_with_page_delta" | "page_specific";
    evidenceRequirement: string;
  }>;
  sectionIntents: Array<{
    sectionKey: string;
    purpose: string;
    inheritanceMode: "shared" | "shared_with_page_delta" | "page_specific";
    requiredEvidenceClass: string;
  }>;
};

export type CanonicalIntentPayload =
  CanonicalIntentV1Payload | CanonicalIntentV2Payload;

const KEYED_INTENT_TARGETS = new Set<IntentPatchOperation["target"]>([
  "mustCommunicate",
  "verifiedClaims",
  "sectionIntents",
]);

const INTENT_ITEM_KEY_FIELDS = {
  mustCommunicate: "key",
  verifiedClaims: "claimKey",
  sectionIntents: "sectionKey",
} as const;

const MANDATORY_REVIEW_CONFLICTS = new Set([
  "certification_conflict",
  "material_conflict",
  "rated_current_conflict",
  "application_conflict",
]);

export function getIntentConfidenceBand(score?: number) {
  if (score === undefined) return "pending" as const;
  if (!Number.isFinite(score) || score < 0 || score > 1) {
    throw new Error("intent_confidence_out_of_range");
  }
  if (score >= 0.9) return "high" as const;
  if (score >= 0.75) return "medium" as const;
  return "low" as const;
}

export function assertIntentPatchOperations(
  operations: IntentPatchOperation[],
) {
  for (const operation of operations) {
    if (!operation.reason.trim())
      throw new Error("intent_patch_reason_required");
    if (
      KEYED_INTENT_TARGETS.has(operation.target) &&
      !operation.itemKey?.trim()
    ) {
      throw new Error(`intent_patch_item_key_required:${operation.target}`);
    }
    if (operation.operation === "remove" && operation.value !== undefined) {
      throw new Error("intent_patch_remove_cannot_have_value");
    }
    if (operation.operation !== "remove" && operation.value === undefined) {
      throw new Error("intent_patch_value_required");
    }
  }
}

function cloneIntentValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function applyIntentPatch<T extends CanonicalIntentPayload>(
  baseIntent: T,
  operations: IntentPatchOperation[],
): T {
  assertIntentPatchOperations(operations);
  const resolved = cloneIntentValue(baseIntent);
  const document = resolved as unknown as Record<string, unknown>;

  for (const patch of operations) {
    if (patch.target in INTENT_ITEM_KEY_FIELDS) {
      const target = patch.target as keyof typeof INTENT_ITEM_KEY_FIELDS;
      const keyField = INTENT_ITEM_KEY_FIELDS[target];
      const items = document[target] as Array<Record<string, unknown>>;
      const itemKey = patch.itemKey as string;
      const index = items.findIndex((item) => item[keyField] === itemKey);

      if (patch.operation === "remove") {
        if (index < 0)
          throw new Error(`intent_patch_item_not_found:${target}:${itemKey}`);
        items.splice(index, 1);
        continue;
      }

      if (
        !patch.value ||
        typeof patch.value !== "object" ||
        Array.isArray(patch.value)
      ) {
        throw new Error(`intent_patch_item_must_be_object:${target}`);
      }
      const value = cloneIntentValue(patch.value as Record<string, unknown>);
      if (value[keyField] !== undefined && value[keyField] !== itemKey) {
        throw new Error(`intent_patch_item_key_mismatch:${target}:${itemKey}`);
      }
      value[keyField] = itemKey;
      if (patch.operation === "add") {
        if (index >= 0)
          throw new Error(`intent_patch_item_exists:${target}:${itemKey}`);
        items.push(value);
      } else {
        if (index < 0)
          throw new Error(`intent_patch_item_not_found:${target}:${itemKey}`);
        items[index] = value;
      }
      continue;
    }

    if (patch.operation === "remove") {
      throw new Error(
        `intent_patch_remove_requires_keyed_target:${patch.target}`,
      );
    }

    if (patch.operation === "add") {
      const current = document[patch.target];
      if (Array.isArray(current)) {
        const additions = Array.isArray(patch.value)
          ? patch.value
          : [patch.value];
        for (const addition of additions) {
          if (
            !current.some(
              (item) =>
                stableLocalizationValue(item) ===
                stableLocalizationValue(addition),
            )
          ) {
            current.push(cloneIntentValue(addition));
          }
        }
        continue;
      }
      if (patch.target === "extensions") {
        if (
          !patch.value ||
          typeof patch.value !== "object" ||
          Array.isArray(patch.value)
        ) {
          throw new Error("intent_patch_extensions_must_be_object");
        }
        document.extensions = {
          ...((document.extensions as Record<string, unknown> | undefined) ??
            {}),
          ...cloneIntentValue(patch.value as Record<string, unknown>),
        };
        continue;
      }
      throw new Error(`intent_patch_add_unsupported:${patch.target}`);
    }

    document[patch.target] = cloneIntentValue(patch.value);
  }

  assertCanonicalIntentContract(resolved);
  return resolved;
}

export function assertIntentDeltaBaseReference(args: {
  baseKind:
    "l1_previous_revision" | "l1_policy_baseline" | "product_group_revision";
  baseCanonicalIntentRevisionId?: string;
  baseProductGroupRevisionId?: string;
}) {
  const hasCanonical = Boolean(args.baseCanonicalIntentRevisionId);
  const hasGroup = Boolean(args.baseProductGroupRevisionId);
  if (args.baseKind === "l1_policy_baseline") {
    if (hasCanonical || hasGroup)
      throw new Error("intent_delta_policy_baseline_has_reference");
    return;
  }
  if (args.baseKind === "l1_previous_revision" && (!hasCanonical || hasGroup)) {
    throw new Error("intent_delta_canonical_base_required");
  }
  if (
    args.baseKind === "product_group_revision" &&
    (!hasGroup || hasCanonical)
  ) {
    throw new Error("intent_delta_product_group_base_required");
  }
}

export function requiresManualIntentReview(
  conflicts: Array<{
    category: string;
    status: "open" | "resolved" | "accepted_exception";
  }>,
) {
  return conflicts.some(
    (conflict) =>
      conflict.status === "open" &&
      MANDATORY_REVIEW_CONFLICTS.has(conflict.category),
  );
}
