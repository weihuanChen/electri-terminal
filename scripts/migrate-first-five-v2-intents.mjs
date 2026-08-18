import { ConvexHttpClient } from "convex/browser";
import {
  families,
  groupPatchFor,
  inheritancePolicy,
  intentFor,
} from "./seed-first-five-intent-hierarchy.mjs";

const url = process.env.CONVEX_SERVER_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) throw new Error("convex_url_required");

const actor = process.env.INTENT_MIGRATION_ACTOR || "admin@admin.com";
const client = new ConvexHttpClient(url);

function stable(value) {
  if (value === undefined) return "";
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(",")}]`;
  }
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`)
    .join(",")}}`;
}

function approvedTemplateRevision(bundle) {
  return bundle.revisions.find(
    (revision) =>
      String(revision._id) === String(bundle.template.approvedRevisionId),
  );
}

function approvedGroupRevision(bundle) {
  return bundle.revisions.find(
    (revision) =>
      String(revision._id) === String(bundle.group.approvedRevisionId),
  );
}

const results = [];

for (const familyDefinition of families) {
  const workspace = await client.query(
    "queries/modules/intentHierarchy:getIntentHierarchyWorkspace",
    { familyId: familyDefinition.id },
  );
  const templateBundle = workspace.templates[0];
  if (!templateBundle) {
    throw new Error(`family_template_missing:${familyDefinition.key}`);
  }
  const currentTemplateRevision = approvedTemplateRevision(templateBundle);
  if (!currentTemplateRevision) {
    throw new Error(`approved_template_missing:${familyDefinition.key}`);
  }

  const desiredIntent = intentFor(familyDefinition);
  const templateNeedsRevision =
    currentTemplateRevision.schemaVersion !== 2 ||
    stable(currentTemplateRevision.intent) !== stable(desiredIntent) ||
    stable(currentTemplateRevision.inheritancePolicy) !==
      stable(inheritancePolicy);

  let templateRevisionId = currentTemplateRevision._id;
  if (templateNeedsRevision) {
    templateRevisionId = await client.mutation(
      "mutations/admin/intentHierarchy:createFamilyIntentTemplateRevision",
      {
        templateId: templateBundle.template._id,
        sourceSnapshotIds: currentTemplateRevision.sourceSnapshotIds,
        intent: desiredIntent,
        inheritancePolicy,
        coverageEvidence: {
          ...currentTemplateRevision.coverageEvidence,
          formatAlignment: "angled_blade_v2_family_template",
          familyKey: familyDefinition.key,
        },
        actor,
      },
    );
    await client.mutation(
      "mutations/admin/intentHierarchy:approveFamilyIntentTemplateRevision",
      {
        revisionId: templateRevisionId,
        actor,
        note: "Align first-five Family Template with the approved v2 format",
      },
    );
  }

  const groupResults = [];
  const productsById = new Map(
    workspace.products.map((row) => [String(row.product._id), row]),
  );
  for (const groupDefinition of familyDefinition.groups) {
    const groupBundle = workspace.groups.find(
      ({ group }) => group.key === groupDefinition.key,
    );
    if (!groupBundle) {
      throw new Error(
        `product_group_missing:${familyDefinition.key}:${groupDefinition.key}`,
      );
    }
    const currentGroupRevision = approvedGroupRevision(groupBundle);
    if (!currentGroupRevision) {
      throw new Error(
        `approved_group_missing:${familyDefinition.key}:${groupDefinition.key}`,
      );
    }
    const desiredPatch = groupPatchFor(groupDefinition);
    const groupNeedsRevision =
      templateNeedsRevision ||
      currentGroupRevision.schemaVersion !== 2 ||
      stable(currentGroupRevision.intentPatch) !== stable(desiredPatch) ||
      currentGroupRevision.samplePolicy.minimumCount !== 1;

    let groupRevisionId = currentGroupRevision._id;
    if (groupNeedsRevision) {
      groupRevisionId = await client.mutation(
        "mutations/admin/intentHierarchy:createProductIntentGroupRevision",
        {
          groupId: groupBundle.group._id,
          membershipCriteria: groupDefinition.criteria,
          differentiators: groupDefinition.differentiators,
          intentPatch: desiredPatch,
          requiredEvidencePaths: groupDefinition.evidencePaths,
          sampleMinimumCount: 1,
          samplePercentage: currentGroupRevision.samplePolicy.percentage,
          actor,
        },
      );
      await client.mutation(
        "mutations/admin/intentHierarchy:approveProductIntentGroupRevision",
        {
          revisionId: groupRevisionId,
          actor,
          note: "Align Product Group with the approved v2 patch format",
        },
      );

      const approvedMembers = groupBundle.members.filter(
        (member) => member.status === "approved",
      );
      for (const member of approvedMembers) {
        const productRow = productsById.get(String(member.productId));
        if (!productRow?.sourceSnapshot?._id) {
          throw new Error(
            `approved_member_snapshot_missing:${familyDefinition.key}:${member.productId}`,
          );
        }
        await client.mutation(
          "mutations/admin/intentHierarchy:assignProductToIntentGroup",
          {
            productId: member.productId,
            groupId: groupBundle.group._id,
            sourceSnapshotId: productRow.sourceSnapshot._id,
            assignmentReason:
              "Preserve approved membership during v2 template alignment",
            actor,
          },
        );
        await client.mutation(
          "mutations/admin/intentHierarchy:materializeProductCanonicalIntent",
          {
            productId: member.productId,
            actor,
            note: "Materialized after first-five v2 template alignment",
          },
        );
      }
    }

    groupResults.push({
      key: groupDefinition.key,
      revisionCreated: groupNeedsRevision,
      revisionId: groupRevisionId,
    });
  }

  results.push({
    family: familyDefinition.name,
    templateRevisionCreated: templateNeedsRevision,
    templateRevisionId,
    groups: groupResults,
  });
}

console.log(JSON.stringify(results, null, 2));
