import { ConvexHttpClient } from "convex/browser";
import { pathToFileURL } from "node:url";

export const families = [
  {
    id: "kn7ac44nnkvf9t7m60czbhayes83r2we",
    key: "angled_blade_terminals",
    name: "Angled Blade Terminals",
    definition: "angled blade terminals used where connection orientation and routing clearance affect product selection",
    selection: "conductor size, blade interface dimensions, connection orientation, and installation clearance",
    template: {
      goal: "Help industrial buyers understand and select angled blade terminals using verified fit, orientation, and application criteria.",
      definition: "Define angled blade terminals and explain the installation problem addressed by their connection orientation.",
      selection: "Guide selection by conductor size, blade interface, connection orientation, and installation clearance.",
      application: "Help buyers evaluate suitability for documented installation and wiring contexts.",
      overview: "Define the product group and explain the connection-orientation problem it addresses.",
      selectionSection: "Explain shared selection logic and apply page-specific conductor, blade, and clearance limits.",
      applicationsSection: "Describe only approved application contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, and fit evidence without generalizing across the group.",
    },
    groups: [
      {
        key: "90_degree_non_insulated",
        name: "90 Degree Non-Insulated Blade Terminals",
        description: "Non-insulated blade terminal pages sharing a 90-degree connection orientation.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["90-degree-non-insulated-blade-terminals"], required: true }],
        differentiators: [{ key: "connection_orientation", label: "Connection orientation", sourcePaths: ["product.model"], values: ["90_degree"], intentImpact: "Emphasize routing clearance and mating-interface orientation during selection." }],
        goal: "Help buyers understand and select 90-degree non-insulated blade terminal configurations based on conductor compatibility, mating-interface dimensions, and installation clearance.",
        selectionIntent: "Define the shared selection criteria for 90-degree non-insulated blade terminal configurations, including conductor compatibility, blade interface, and routing clearance.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn77e5xh56efp9ces8q3xz383n83sr0j",
    key: "angled_copper_lugs",
    name: "Angled Copper Lugs",
    definition: "angled copper lugs for cable termination where conductor size, mounting interface, and cable approach direction affect selection",
    selection: "conductor size, stud or bolt interface, lug series, connection angle, and cable-routing clearance",
    template: {
      goal: "Help industrial buyers understand and select angled copper lug configurations using verified conductor fit, mounting interface, connection angle, series, and routing-clearance criteria.",
      definition: "Define angled copper lugs and explain how cable-approach angle affects termination layout, mounting access, and routing clearance.",
      selection: "Guide selection by conductor compatibility, stud or bolt mounting interface, lug series, connection angle, and cable-routing clearance.",
      application: "Help buyers evaluate suitability for documented cable-termination, equipment, panel, and routing contexts.",
      overview: "Define angled copper lug configurations and explain the cable-approach and mounting problem they address.",
      selectionSection: "Explain shared lug-selection logic and apply page-specific conductor, mounting-hole, series, angle, and clearance limits.",
      applicationsSection: "Describe only approved cable-termination and routing contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, mounting, and fit evidence without generalizing across lug series or angles.",
    },
    groups: [
      {
        key: "sc_dtga_angled",
        name: "SC (DTGA) Angled Copper Lugs",
        description: "SC/DTGA copper lug pages sharing selection logic while offering 45-degree and 90-degree orientations.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["sc-dtga-copper-lugs"], required: true }],
        differentiators: [{ key: "connection_angle", label: "Connection angle", sourcePaths: ["product.model"], values: ["45_degree", "90_degree"], intentImpact: "Require buyers to verify cable approach direction and clearance in addition to conductor and stud fit." }],
        goal: "Help buyers understand and select SC (DTGA) angled copper lug configurations based on conductor compatibility, mounting-hole dimensions, required connection angle, and cable-routing clearance.",
        selectionIntent: "Define the shared selection criteria for SC (DTGA) angled copper lug configurations, including conductor range, mounting-hole fit, 45-degree or 90-degree cable approach, and routing clearance.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "lyf_90_degree",
        name: "LYF 90 Degree Copper Lugs",
        description: "LYF-series copper lug pages with a 90-degree cable approach.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["90-degree-lyf-copper-lugs"], required: true }],
        differentiators: [{ key: "lug_series", label: "Lug series", sourcePaths: ["product.model", "product.seriesCode"], values: ["LYF"], intentImpact: "Keep series compatibility and documented dimensional fit explicit in product selection." }],
        goal: "Help buyers understand and select 90-degree LYF copper lug configurations based on conductor compatibility, mounting-hole dimensions, and installation clearance.",
        selectionIntent: "Define the shared selection criteria for 90-degree LYF copper lug configurations while keeping conductor ranges, mounting dimensions, and ratings bound to exact LYF evidence.",
        evidencePaths: ["product.model", "product.seriesCode", "evidencePayload.variants"],
      },
      {
        key: "gph_90_degree",
        name: "GPH 90 Degree Copper Lugs",
        description: "GPH-series copper lug pages with a 90-degree cable approach.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["90-degree-gph-copper-lugs"], required: true }],
        differentiators: [{ key: "lug_series", label: "Lug series", sourcePaths: ["product.model", "product.seriesCode"], values: ["GPH"], intentImpact: "Keep series compatibility and documented dimensional fit explicit in product selection." }],
        goal: "Help buyers understand and select 90-degree GPH copper lug configurations based on conductor compatibility, mounting-hole dimensions, and installation clearance.",
        selectionIntent: "Define the shared selection criteria for 90-degree GPH copper lug configurations while keeping conductor ranges, mounting dimensions, and ratings bound to exact GPH evidence.",
        evidencePaths: ["product.model", "product.seriesCode", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn7c8d6bntnjya0ynfsxnh8jk983swfz",
    key: "angled_ring_terminals",
    name: "Angled Ring Terminals",
    definition: "angled ring terminals for wire-to-stud connections where conductor fit, stud opening, and routing orientation affect selection",
    selection: "conductor size, stud or screw size, terminal range, connection orientation, and routing clearance",
    template: {
      goal: "Help industrial buyers understand and select angled ring terminal configurations using verified conductor fit, stud or screw interface, connection orientation, and routing-clearance criteria.",
      definition: "Define angled ring terminals and explain how their orientation affects wire-to-stud connection layout and routing clearance.",
      selection: "Guide selection by conductor compatibility, stud or screw size, terminal range, connection orientation, and routing clearance.",
      application: "Help buyers evaluate suitability for documented wire-to-stud, panel, equipment, and constrained-routing contexts.",
      overview: "Define angled ring terminal configurations and explain the wire-to-stud routing problem they address.",
      selectionSection: "Explain shared ring-terminal selection logic and apply page-specific conductor, stud, specification-range, and clearance limits.",
      applicationsSection: "Describe only approved wire-to-stud and routing contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, stud-fit, and conductor-fit evidence without generalizing across specification ranges.",
    },
    groups: [
      {
        key: "90_degree_non_insulated_to_type",
        name: "90 Degree Non-Insulated Ring Terminals (TO Type)",
        description: "TO-type 90-degree non-insulated ring terminal pages split into specification ranges but sharing one buyer intent.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["90-degree-non-insulated-ring-terminals"], required: true }],
        differentiators: [{ key: "specification_range", label: "Conductor and stud range", sourcePaths: ["sourcePayload.title", "evidencePayload.variants"], values: ["g01", "g02"], intentImpact: "Changes the eligible conductor and stud combinations but not the shared page objective." }],
        goal: "Help buyers understand and select TO-type 90-degree non-insulated ring terminal configurations based on conductor compatibility, stud or screw fit, specification range, and routing clearance.",
        selectionIntent: "Define the shared selection criteria for TO-type 90-degree non-insulated ring terminal configurations while keeping conductor and stud limits bound to each specification-range page.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn7ccsykrrkzbr1d05q54z5c1183rnzf",
    key: "standard_blade_terminals",
    name: "Blade Terminals (Standard Type)",
    definition: "standard blade terminals selected by conductor fit, blade interface, insulation construction, and installation conditions",
    selection: "conductor size, blade dimensions, mating interface, insulation construction, and environmental compatibility",
    template: {
      goal: "Help industrial buyers understand and select standard blade terminal configurations using verified conductor fit, blade interface, insulation construction, and installation criteria.",
      definition: "Define standard blade terminals and explain how conductor fit, blade geometry, mating interface, and insulation construction shape product selection.",
      selection: "Guide selection by conductor compatibility, blade dimensions, mating interface, documented insulation construction, and installation conditions.",
      application: "Help buyers evaluate suitability for documented wiring, mating-interface, insulation, and installation contexts.",
      overview: "Define standard blade terminal configurations and explain the blade-style mating connection they provide.",
      selectionSection: "Explain shared blade-terminal selection logic and apply page-specific conductor, blade, mating-interface, and insulation limits.",
      applicationsSection: "Describe only approved wiring and mating contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific construction, dimensional, insulation, and fit evidence without transferring claims between insulated and non-insulated groups.",
    },
    groups: [
      {
        key: "non_insulated",
        name: "Non-Insulated Blade Terminals",
        description: "Standard blade terminals without an insulation sleeve.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["non-insulated-blade-terminals"], required: true }],
        differentiators: [{ key: "insulation_construction", label: "Insulation construction", sourcePaths: ["product.model", "sourcePayload.title"], values: ["none"], intentImpact: "Require selection and installation guidance to avoid implying insulation properties not provided by the terminal." }],
        goal: "Help buyers understand and select non-insulated blade terminal configurations based on conductor compatibility, blade-interface dimensions, and installation requirements.",
        selectionIntent: "Define the shared selection criteria for non-insulated blade terminal configurations while keeping dimensional, environmental, and safety implications bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "nylon_insulated",
        name: "Nylon-Insulated Blade Terminals",
        description: "Standard blade terminals with a documented nylon insulation construction.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["nylon-insulated-blade-terminals"], required: true }],
        differentiators: [{ key: "insulation_construction", label: "Insulation construction", sourcePaths: ["product.model", "sourcePayload.title"], values: ["nylon"], intentImpact: "Make insulation construction and compatible conductor fit part of the selection decision without inventing safety ratings." }],
        goal: "Help buyers understand and select nylon-insulated blade terminal configurations based on conductor compatibility, blade-interface dimensions, and documented nylon insulation construction.",
        selectionIntent: "Define the shared selection criteria for nylon-insulated blade terminal configurations while keeping conductor ranges, mating dimensions, and insulation claims bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
  {
    id: "kn72mexav1g4bs0streskkc7hd83rtvw",
    key: "butt_splice_connectors",
    name: "Butt Splice Connectors",
    definition: "butt splice connectors for joining two conductors inline where barrel fit and installation conditions affect selection",
    selection: "conductor size, barrel fit, insulation arrangement, material or plating evidence, and installation environment",
    template: {
      goal: "Help industrial buyers understand and select butt splice connector configurations using verified conductor compatibility, barrel fit, insulation arrangement, construction, and installation criteria.",
      definition: "Define butt splice connectors and explain how they create an inline joint between two conductors through compatible barrel fit and installation.",
      selection: "Guide selection by conductor compatibility at both ends, barrel fit, insulation arrangement, documented material or plating, and installation environment.",
      application: "Help buyers evaluate suitability for documented inline conductor-splicing and installation contexts.",
      overview: "Define butt splice connector configurations and explain the inline conductor-joint problem they address.",
      selectionSection: "Explain shared splice-selection logic and apply page-specific conductor, barrel, insulation, and construction limits.",
      applicationsSection: "Describe only approved inline-splicing contexts supported by group-level or page-level evidence.",
      technicalSection: "Present page-specific barrel, construction, dimensional, and conductor-fit evidence without generalizing across variants.",
    },
    groups: [
      {
        key: "standard_inline_splice",
        name: "Standard Butt Splice Connectors",
        description: "Standard inline butt splice pages sharing conductor-to-barrel matching and installation intent.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["butt-splice-connectors"], required: true }],
        differentiators: [{ key: "conductor_range", label: "Supported conductor range", sourcePaths: ["sourcePayload.title", "evidencePayload.variants"], values: ["BNT0.5_to_BNT80"], intentImpact: "Determine eligible conductor sizes while retaining the same inline-splice page objective." }],
        goal: "Help buyers understand and select standard butt splice connector configurations based on conductor compatibility, barrel fit, documented construction, and installation conditions.",
        selectionIntent: "Define the shared selection criteria for standard butt splice connector configurations while keeping conductor ranges, barrel dimensions, construction, and ratings bound to exact evidence.",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
];

export function intentFor(family) {
  return {
    schemaVersion: 2,
    pageRole: "industrial_product_selection",
    entityScope: "product_group",
    primaryAudience: ["electrical_engineer", "panel_builder", "industrial_buyer"],
    buyerStage: ["product_discovery", "evaluation", "procurement"],
    primaryGoal: family.template.goal,
    primaryConceptIds: [],
    secondaryConceptIds: [],
    mustCommunicate: [
      { key: "product_definition", intent: family.template.definition, inheritanceMode: "shared", evidenceRequirement: "approved_group_or_page_evidence" },
      { key: "selection_logic", intent: family.template.selection, inheritanceMode: "shared_with_page_delta", evidenceRequirement: "shared_selection_logic_plus_page_specific_ranges" },
      { key: "application_fit", intent: family.template.application, inheritanceMode: "shared", evidenceRequirement: "approved_group_or_page_evidence" },
      { key: "evidence_boundary", intent: "Keep dimensions, construction details, ratings, and performance implications tied to exact product evidence.", inheritanceMode: "shared", evidenceRequirement: "mandatory_page_evidence_for_specific_claims" },
    ],
    verifiedClaims: [],
    prohibitedClaims: [
      "Unsupported certification, compliance, material, current, voltage, environmental, or safety claims",
      "Applying one variant's dimensions, ratings, or construction details to all variants or configurations without exact evidence",
      "Unqualified best, leading, universal, or guaranteed-performance claims",
    ],
    conversionIntent: { primaryAction: "request_quote", secondaryAction: "contact_engineering" },
    sectionIntents: [
      { sectionKey: "overview", purpose: family.template.overview, inheritanceMode: "shared", requiredEvidenceClass: "group_definition" },
      { sectionKey: "selection", purpose: family.template.selectionSection, inheritanceMode: "shared_with_page_delta", requiredEvidenceClass: "page_selection_data" },
      { sectionKey: "applications", purpose: family.template.applicationsSection, inheritanceMode: "shared", requiredEvidenceClass: "approved_application_evidence" },
      { sectionKey: "technical_evidence", purpose: family.template.technicalSection, inheritanceMode: "page_specific", requiredEvidenceClass: "page_product_evidence" },
    ],
    extensions: {
      pageSpecificSelectionMode: "optional_until_multiple_members",
      pageSpecificTechnicalEvidenceRequired: true,
      sharedApplicationStatus: "pending_approved_evidence",
      sharedDefinitionStatus: "approved",
    },
  };
}

export const inheritancePolicy = {
  schemaVersion: 2,
  allowedOverrideTargets: ["primaryGoal", "primaryConceptIds", "secondaryConceptIds", "conversionIntent", "verifiedClaims", "prohibitedClaims", "extensions", "pageDelta"],
  mergeTargets: ["mustCommunicate", "sectionIntents"],
  alwaysSharedPaths: ["buyerStage", "primaryAudience", "pageRole", "mustCommunicate.product_definition", "mustCommunicate.application_fit", "mustCommunicate.evidence_boundary", "sectionIntents.overview", "sectionIntents.applications"],
  alwaysProductSpecificPaths: ["verifiedClaims", "pageDelta", "extensions.selectionCriteria", "extensions.supportedRanges", "extensions.pageDifferentiators", "extensions.productEvidence"],
  sharedWithPageDeltaPaths: ["mustCommunicate.selection_logic", "sectionIntents.selection"],
  excludedPaths: ["schemaVersion", "pageRole", "entityScope"],
  minimumMembershipEvidence: ["sourcePayload.title", "evidencePayload.model"],
  minimumPageEvidence: ["evidencePayload.variants"],
  evidenceResolutionOrder: ["protectedValues", "pageEvidence", "approvedGroupEvidence", "approvedFamilyEvidence", "sourceContent"],
  missingEvidencePolicy: {
    shared_intent_missing_page_evidence: "inherit_without_conflict",
    page_specific_claim_missing_evidence: "high_conflict",
    optional_section_missing_evidence: "warning",
    group_membership_missing_evidence: "high_conflict",
  },
};

export function groupPatchFor(group) {
  return [
    {
      operation: "replace",
      target: "primaryGoal",
      value: group.goal,
      reason:
        "The product group has a more specific selection objective than the shared family template.",
      evidencePaths: group.evidencePaths,
    },
    {
      operation: "replace",
      target: "mustCommunicate",
      itemKey: "selection_logic",
      value: {
        key: "selection_logic",
        intent: group.selectionIntent,
        inheritanceMode: "shared_with_page_delta",
        evidenceRequirement:
          "shared_selection_logic_plus_page_specific_ranges",
      },
      reason:
        "The product group requires selection guidance tied to its defining configuration range.",
      evidencePaths: group.evidencePaths,
    },
  ];
}

async function main() {
  const url =
    process.env.CONVEX_SERVER_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("convex_url_required");
  const actor = process.env.INTENT_SEED_ACTOR || "admin@admin.com";
  const client = new ConvexHttpClient(url);
  const results = [];
for (const family of families) {
  const workspace = await client.query(
    "queries/modules/intentHierarchy:getIntentHierarchyWorkspace",
    { familyId: family.id },
  );
  if (workspace.templates.length || workspace.groups.length) {
    throw new Error(`hierarchy_already_exists:${family.name}`);
  }
  const templateId = await client.mutation(
    "mutations/admin/intentHierarchy:createFamilyIntentTemplate",
    { familyId: family.id, key: family.key, name: `${family.name} Shared Intent`, owner: actor, actor },
  );
  const snapshotId = await client.mutation(
    "mutations/admin/localizationFoundation:captureCatalogSourceSnapshot",
    { entityType: "family", sourceId: family.id, actor },
  );
  const templateRevisionId = await client.mutation(
    "mutations/admin/intentHierarchy:createFamilyIntentTemplateRevision",
    {
      templateId,
      sourceSnapshotIds: [snapshotId],
      intent: intentFor(family),
      inheritancePolicy,
      coverageEvidence: {
        mode: "manual_catalog_review",
        familyName: family.name,
        sourcePaths: ["sourcePayload.summary", "sourcePayload.pageConfig", "evidencePayload.products"],
      },
      actor,
    },
  );
  await client.mutation(
    "mutations/admin/intentHierarchy:approveFamilyIntentTemplateRevision",
    { revisionId: templateRevisionId, actor, note: "Initial manually reviewed L2 family template" },
  );

  const groupResults = [];
  for (const group of family.groups) {
    const groupId = await client.mutation(
      "mutations/admin/intentHierarchy:createProductIntentGroup",
      {
        templateId,
        key: group.key,
        name: group.name,
        description: group.description,
        owner: actor,
        actor,
      },
    );
    const groupRevisionId = await client.mutation(
      "mutations/admin/intentHierarchy:createProductIntentGroupRevision",
      {
        groupId,
        membershipCriteria: group.criteria,
        differentiators: group.differentiators,
        intentPatch: groupPatchFor(group),
        requiredEvidencePaths: group.evidencePaths,
        sampleMinimumCount: 1,
        samplePercentage: 20,
        actor,
      },
    );
    await client.mutation(
      "mutations/admin/intentHierarchy:approveProductIntentGroupRevision",
      { revisionId: groupRevisionId, actor, note: "Initial manually reviewed L2 product group" },
    );
    groupResults.push({ key: group.key, groupId, groupRevisionId });
  }
  results.push({ family: family.name, templateId, templateRevisionId, groups: groupResults });
}

  console.log(JSON.stringify(results, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
