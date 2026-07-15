import { ConvexHttpClient } from "convex/browser";

const url = process.env.CONVEX_SERVER_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) throw new Error("convex_url_required");

const actor = process.env.INTENT_SEED_ACTOR || "admin@admin.com";
const client = new ConvexHttpClient(url);

const families = [
  {
    id: "kn7ac44nnkvf9t7m60czbhayes83r2we",
    key: "angled_blade_terminals",
    name: "Angled Blade Terminals",
    definition: "angled blade terminals used where connection orientation and routing clearance affect product selection",
    selection: "conductor size, blade interface dimensions, connection orientation, and installation clearance",
    groups: [
      {
        key: "90_degree_non_insulated",
        name: "90 Degree Non-Insulated Blade Terminals",
        description: "Non-insulated blade terminal pages sharing a 90-degree connection orientation.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["90-degree-non-insulated-blade-terminals"], required: true }],
        differentiators: [{ key: "connection_orientation", label: "Connection orientation", sourcePaths: ["product.model"], values: ["90_degree"], intentImpact: "Emphasize routing clearance and mating-interface orientation during selection." }],
        goal: "Help buyers evaluate 90-degree non-insulated blade terminals for conductor fit, mating interface, and routing clearance",
        selectionIntent: "Guide selection by conductor range, blade interface dimensions, and available 90-degree routing clearance",
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
    groups: [
      {
        key: "sc_dtga_angled",
        name: "SC (DTGA) Angled Copper Lugs",
        description: "SC/DTGA copper lug pages sharing selection logic while offering 45-degree and 90-degree orientations.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["sc-dtga-copper-lugs"], required: true }],
        differentiators: [{ key: "connection_angle", label: "Connection angle", sourcePaths: ["product.model"], values: ["45_degree", "90_degree"], intentImpact: "Require buyers to verify cable approach direction and clearance in addition to conductor and stud fit." }],
        goal: "Help buyers select SC (DTGA) angled copper lugs by conductor fit, mounting interface, and required connection angle",
        selectionIntent: "Guide selection by conductor range, mounting-hole fit, and 45-degree or 90-degree cable approach",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "lyf_90_degree",
        name: "LYF 90 Degree Copper Lugs",
        description: "LYF-series copper lug pages with a 90-degree cable approach.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["90-degree-lyf-copper-lugs"], required: true }],
        differentiators: [{ key: "lug_series", label: "Lug series", sourcePaths: ["product.model", "product.seriesCode"], values: ["LYF"], intentImpact: "Keep series compatibility and documented dimensional fit explicit in product selection." }],
        goal: "Help buyers evaluate LYF 90-degree copper lugs using documented conductor, mounting, and dimensional fit",
        selectionIntent: "Guide selection within the LYF range without transferring dimensions or ratings from other lug series",
        evidencePaths: ["product.model", "product.seriesCode", "evidencePayload.variants"],
      },
      {
        key: "gph_90_degree",
        name: "GPH 90 Degree Copper Lugs",
        description: "GPH-series copper lug pages with a 90-degree cable approach.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["90-degree-gph-copper-lugs"], required: true }],
        differentiators: [{ key: "lug_series", label: "Lug series", sourcePaths: ["product.model", "product.seriesCode"], values: ["GPH"], intentImpact: "Keep series compatibility and documented dimensional fit explicit in product selection." }],
        goal: "Help buyers evaluate GPH 90-degree copper lugs using documented conductor, mounting, and dimensional fit",
        selectionIntent: "Guide selection within the GPH range without transferring dimensions or ratings from other lug series",
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
    groups: [
      {
        key: "90_degree_non_insulated_to_type",
        name: "90 Degree Non-Insulated Ring Terminals (TO Type)",
        description: "TO-type 90-degree non-insulated ring terminal pages split into specification ranges but sharing one buyer intent.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["90-degree-non-insulated-ring-terminals"], required: true }],
        differentiators: [{ key: "specification_range", label: "Conductor and stud range", sourcePaths: ["sourcePayload.title", "evidencePayload.variants"], values: ["g01", "g02"], intentImpact: "Changes the eligible conductor and stud combinations but not the shared page objective." }],
        goal: "Help buyers select TO-type 90-degree non-insulated ring terminals by conductor range, stud fit, and routing clearance",
        selectionIntent: "Guide selection across specification ranges while keeping each page's conductor and stud limits evidence-bound",
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
    groups: [
      {
        key: "non_insulated",
        name: "Non-Insulated Blade Terminals",
        description: "Standard blade terminals without an insulation sleeve.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["non-insulated-blade-terminals"], required: true }],
        differentiators: [{ key: "insulation_construction", label: "Insulation construction", sourcePaths: ["product.model", "sourcePayload.title"], values: ["none"], intentImpact: "Require selection and installation guidance to avoid implying insulation properties not provided by the terminal." }],
        goal: "Help buyers select non-insulated blade terminals by conductor fit, blade interface, and installation requirements",
        selectionIntent: "Guide selection without implying insulation, environmental, or safety performance not documented in the source",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
      {
        key: "nylon_insulated",
        name: "Nylon-Insulated Blade Terminals",
        description: "Standard blade terminals with a documented nylon insulation construction.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["nylon-insulated-blade-terminals"], required: true }],
        differentiators: [{ key: "insulation_construction", label: "Insulation construction", sourcePaths: ["product.model", "sourcePayload.title"], values: ["nylon"], intentImpact: "Make insulation construction and compatible conductor fit part of the selection decision without inventing safety ratings." }],
        goal: "Help buyers select nylon-insulated blade terminals by conductor fit, blade interface, and documented insulation construction",
        selectionIntent: "Guide selection by conductor and mating dimensions while keeping insulation claims within documented evidence",
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
    groups: [
      {
        key: "standard_inline_splice",
        name: "Standard Butt Splice Connectors",
        description: "Standard inline butt splice pages sharing conductor-to-barrel matching and installation intent.",
        criteria: [{ fieldPath: "product.model", operator: "contains", values: ["butt-splice-connectors"], required: true }],
        differentiators: [{ key: "conductor_range", label: "Supported conductor range", sourcePaths: ["sourcePayload.title", "evidencePayload.variants"], values: ["BNT0.5_to_BNT80"], intentImpact: "Determine eligible conductor sizes while retaining the same inline-splice page objective." }],
        goal: "Help buyers select butt splice connectors for an evidence-supported inline conductor joint",
        selectionIntent: "Guide selection by conductor-to-barrel fit and documented construction without inventing electrical or environmental ratings",
        evidencePaths: ["product.model", "sourcePayload.title", "evidencePayload.variants"],
      },
    ],
  },
];

function intentFor(family) {
  return {
    schemaVersion: 1,
    pageRole: "industrial_product_family_selection",
    primaryAudience: ["electrical_engineer", "panel_builder", "industrial_buyer"],
    buyerStage: ["product_discovery", "evaluation", "procurement"],
    primaryGoal: `Help industrial buyers understand and select ${family.name} using verified application and fit criteria`,
    primaryConceptIds: [],
    secondaryConceptIds: [],
    mustCommunicate: [
      { key: "product_definition", intent: `Define ${family.definition}`, evidencePaths: ["sourcePayload.summary", "sourcePayload.pageConfig.content.overview"] },
      { key: "selection_dimensions", intent: `Guide selection by ${family.selection}`, evidencePaths: ["sourcePayload.pageConfig.content.selectionGuide", "evidencePayload.products"] },
      { key: "application_fit", intent: "Help buyers evaluate whether the family is appropriate for the documented installation context", evidencePaths: ["sourcePayload.pageConfig.content.applications"] },
      { key: "evidence_boundary", intent: "Keep specifications, construction details, and performance implications tied to the exact product evidence", evidencePaths: ["evidencePayload.products", "protectedValues"] },
    ],
    verifiedClaims: [],
    prohibitedClaims: [
      "Unsupported certification, compliance, material, current, voltage, environmental, or safety claims",
      "Applying one product page's dimensions, ratings, or construction details to the entire family",
      "Unqualified best, leading, universal, or guaranteed-performance claims",
    ],
    conversionIntent: { primaryAction: "request_quote", secondaryAction: "contact_engineering" },
    sectionIntents: [
      { sectionKey: "overview", purpose: "Define the product family and the connection problem it addresses", requiredConceptIds: [], requiredFactPaths: ["sourcePayload.summary", "sourcePayload.pageConfig.content.overview"] },
      { sectionKey: "selection", purpose: "Explain the evidence-backed criteria needed to choose the correct product page and model range", requiredConceptIds: [], requiredFactPaths: ["sourcePayload.pageConfig.content.selectionGuide", "evidencePayload.products"] },
      { sectionKey: "applications", purpose: "Describe supported application contexts without extending beyond documented evidence", requiredConceptIds: [], requiredFactPaths: ["sourcePayload.pageConfig.content.applications"] },
      { sectionKey: "technical_evidence", purpose: "Present construction and fit evidence with explicit product-level boundaries", requiredConceptIds: [], requiredFactPaths: ["sourcePayload.pageConfig.content.technicalNotes", "evidencePayload.products"] },
    ],
  };
}

const inheritancePolicy = {
  allowedOverrideTargets: ["primaryGoal", "primaryConceptIds", "secondaryConceptIds", "mustCommunicate", "verifiedClaims", "prohibitedClaims", "conversionIntent", "sectionIntents", "extensions"],
  requiredEvidencePaths: ["sourcePayload.title", "evidencePayload.variants"],
  alwaysProductSpecificPaths: ["verifiedClaims", "mustCommunicate.selection_dimensions", "sectionIntents.selection"],
  excludedPaths: ["schemaVersion", "pageRole"],
};

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
        intentPatch: [
          {
            operation: "replace",
            target: "primaryGoal",
            value: group.goal,
            reason: "The product group has a more specific selection objective than the shared family template",
            evidencePaths: group.evidencePaths,
          },
          {
            operation: "replace",
            target: "mustCommunicate",
            itemKey: "selection_dimensions",
            value: {
              key: "selection_dimensions",
              intent: group.selectionIntent,
              evidencePaths: group.evidencePaths,
            },
            reason: "The group requires selection guidance tied to its defining product range",
            evidencePaths: group.evidencePaths,
          },
        ],
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
