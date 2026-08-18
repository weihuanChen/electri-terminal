import { ConvexHttpClient } from "convex/browser";

const url = process.env.CONVEX_SERVER_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) throw new Error("convex_url_required");

const actor = process.env.INTENT_MIGRATION_ACTOR || "admin@admin.com";
const client = new ConvexHttpClient(url);

const familyId = "kn7ac44nnkvf9t7m60czbhayes83r2we";
const groupKey = "90_degree_non_insulated";
const primaryGoal =
  "Help buyers understand and select 90-degree non-insulated blade terminal configurations based on conductor compatibility, mating-interface dimensions, and installation clearance.";
const prohibitedVariantGeneralization =
  "Applying one variant's dimensions, ratings, or construction details to all variants or configurations without exact evidence";
const selectionLogic = {
  key: "selection_logic",
  intent:
    "Define the shared selection criteria for 90-degree non-insulated blade terminal configurations, including conductor compatibility, blade interface, and routing clearance.",
  inheritanceMode: "shared_with_page_delta",
  evidenceRequirement: "shared_selection_logic_plus_page_specific_ranges",
};

function currentApprovedRevision(bundle) {
  return bundle.revisions.find(
    (revision) => String(revision._id) === String(bundle.template.approvedRevisionId),
  );
}

function currentApprovedGroupRevision(bundle) {
  return bundle.revisions.find(
    (revision) => String(revision._id) === String(bundle.group.approvedRevisionId),
  );
}

function updatedFamilyIntent(intent) {
  if (intent.schemaVersion !== 2) {
    throw new Error("angled_blade_template_v2_required");
  }
  const prohibitedClaims = intent.prohibitedClaims.map((claim) =>
    claim.startsWith("Applying one product page's") ||
    claim.startsWith("Applying one variant's")
      ? prohibitedVariantGeneralization
      : claim,
  );
  if (!prohibitedClaims.includes(prohibitedVariantGeneralization)) {
    prohibitedClaims.push(prohibitedVariantGeneralization);
  }
  return {
    ...intent,
    prohibitedClaims,
    extensions: {
      ...Object.fromEntries(
        Object.entries(intent.extensions ?? {}).filter(
          ([key]) => key !== "pageSpecificSelectionRequired",
        ),
      ),
      pageSpecificSelectionMode: "optional_until_multiple_members",
      pageSpecificTechnicalEvidenceRequired: true,
      sharedApplicationStatus: "pending_approved_evidence",
    },
  };
}

function updatedGroupPatch(patch) {
  return patch.map((operation) => {
    if (operation.target === "primaryGoal") {
      return {
        ...operation,
        value: primaryGoal,
        reason:
          "The singleton product group currently resolves to one precise product-page selection objective while retaining future expansion compatibility.",
      };
    }
    if (
      operation.target === "mustCommunicate" &&
      operation.itemKey === "selection_logic"
    ) {
      return {
        ...operation,
        value: selectionLogic,
        reason:
          "The shared selection logic is stable, while exact ranges remain page-evidence-bound and optional until the group has multiple members.",
      };
    }
    return operation;
  });
}

const workspace = await client.query(
  "queries/modules/intentHierarchy:getIntentHierarchyWorkspace",
  { familyId },
);
const templateBundle = workspace.templates.find(
  ({ template }) => String(template.familyId) === familyId,
);
const groupBundle = workspace.groups.find(({ group }) => group.key === groupKey);
const productRow = workspace.products[0];
if (!templateBundle || !groupBundle || !productRow) {
  throw new Error("angled_blade_hierarchy_incomplete");
}
if (workspace.products.length !== 1) {
  throw new Error("angled_blade_singleton_assumption_failed");
}

let templateRevision = currentApprovedRevision(templateBundle);
let groupRevision = currentApprovedGroupRevision(groupBundle);
if (!templateRevision || !groupRevision) {
  throw new Error("approved_angled_blade_hierarchy_required");
}

const nextIntent = updatedFamilyIntent(templateRevision.intent);
const familyNeedsRevision =
  JSON.stringify(nextIntent) !== JSON.stringify(templateRevision.intent);

if (familyNeedsRevision) {
  const revisionId = await client.mutation(
    "mutations/admin/intentHierarchy:createFamilyIntentTemplateRevision",
    {
      templateId: templateBundle.template._id,
      sourceSnapshotIds: templateRevision.sourceSnapshotIds,
      intent: nextIntent,
      inheritancePolicy: templateRevision.inheritancePolicy,
      coverageEvidence: {
        ...templateRevision.coverageEvidence,
        singletonPolicyReview: "angled_blade_single_product_2026_07_17",
      },
      actor,
    },
  );
  await client.mutation(
    "mutations/admin/intentHierarchy:approveFamilyIntentTemplateRevision",
    {
      revisionId,
      actor,
      note: "Adopt singleton product-page selection and evidence-status policy",
    },
  );
  templateRevision = { ...templateRevision, _id: revisionId, intent: nextIntent };
}

const nextPatch = updatedGroupPatch(groupRevision.intentPatch);
const currentPrimaryGoal = groupRevision.intentPatch.find(
  (operation) => operation.target === "primaryGoal",
);
const currentSelectionLogic = groupRevision.intentPatch.find(
  (operation) =>
    operation.target === "mustCommunicate" &&
    operation.itemKey === "selection_logic",
);
const currentSelectionValue = currentSelectionLogic?.value;
const groupNeedsRevision =
  familyNeedsRevision ||
  currentPrimaryGoal?.value !== primaryGoal ||
  currentSelectionValue?.key !== selectionLogic.key ||
  currentSelectionValue?.intent !== selectionLogic.intent ||
  currentSelectionValue?.inheritanceMode !== selectionLogic.inheritanceMode ||
  currentSelectionValue?.evidenceRequirement !==
    selectionLogic.evidenceRequirement ||
  groupRevision.samplePolicy.minimumCount !== 1;

if (groupNeedsRevision) {
  const revisionId = await client.mutation(
    "mutations/admin/intentHierarchy:createProductIntentGroupRevision",
    {
      groupId: groupBundle.group._id,
      membershipCriteria: groupRevision.membershipCriteria,
      differentiators: groupRevision.differentiators,
      intentPatch: nextPatch,
      requiredEvidencePaths: groupRevision.requiredEvidencePaths,
      sampleMinimumCount: 1,
      samplePercentage: groupRevision.samplePolicy.percentage,
      actor,
    },
  );
  await client.mutation(
    "mutations/admin/intentHierarchy:approveProductIntentGroupRevision",
    {
      revisionId,
      actor,
      note: "Align singleton group intent and sampling policy",
    },
  );
  groupRevision = { ...groupRevision, _id: revisionId, intentPatch: nextPatch };
}

if (!productRow.sourceSnapshot?._id) {
  throw new Error("angled_blade_product_snapshot_required");
}
if (groupNeedsRevision || productRow.member?.status !== "approved") {
  await client.mutation(
    "mutations/admin/intentHierarchy:assignProductToIntentGroup",
    {
      productId: productRow.product._id,
      groupId: groupBundle.group._id,
      sourceSnapshotId: productRow.sourceSnapshot._id,
      assignmentReason: "Singleton group retained for future expansion compatibility",
      actor,
    },
  );
}

const canonicalEntityScope =
  productRow.canonicalRevision?.intent?.entityScope ?? null;
let canonicalRevisionId = productRow.canonicalRevision?._id ?? null;
if (familyNeedsRevision || groupNeedsRevision || canonicalEntityScope !== "product_page") {
  canonicalRevisionId = await client.mutation(
    "mutations/admin/intentHierarchy:materializeProductCanonicalIntent",
    {
      productId: productRow.product._id,
      actor,
      note: "Materialized singleton-compatible product-page Canonical Intent",
    },
  );
}

console.log(
  JSON.stringify(
    {
      familyRevisionCreated: familyNeedsRevision,
      groupRevisionCreated: groupNeedsRevision,
      canonicalRevisionId,
      productId: productRow.product._id,
    },
    null,
    2,
  ),
);
