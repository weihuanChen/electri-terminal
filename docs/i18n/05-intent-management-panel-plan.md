# Intent Management Panel Plan

## 1. Objective

Build an admin control surface for drafting, grouping, reviewing, resolving, and locking Canonical Intent before localized content generation begins.

This phase plans the panel and supporting domain model only. It does not connect presets or execute LLM jobs yet.

The panel must support two different production patterns:

- L1: a small number of structurally different, high-value pages that require page-level human review.
- L2: 120+ database-driven product pages where shared intent should be approved at family/group level and humans should only handle samples, ambiguous assignments, and factual conflicts.

## 2. Core architecture decision

The existing `canonicalIntents` and immutable `canonicalIntentRevisions` remain the final page-level source of truth.

Templates, groups, and deltas are authoring layers. They do not replace the resolved Canonical Intent.

```text
L1 Source Snapshot
  -> Full LLM Candidate
  -> Page Review / Page Delta View
  -> Locked Canonical Intent Revision

L2 Family Intent Template Revision
  -> Product Group Intent Revision
  -> Page Delta Revision
  -> Resolved Full Candidate
  -> Locked Canonical Intent Revision
```

Every resolved candidate must record the exact revisions used:

- Source Snapshot;
- Family Intent Template;
- Product Group Intent;
- Page Delta, if present;
- preset/model/run/result provenance when LLM integration is added.

This prevents an upstream template edit from silently changing an already locked page Intent.

## 3. L1 model

### 3.1 Recommended interpretation of Page Delta

L1 pages differ too much for a shared content template to create meaningful storage savings. Homepage, manufacturing, selection guide, resources, certifications, and contact pages have different roles and conversion goals.

For L1:

- the LLM generates a complete candidate Intent from the English Source Snapshot;
- the database stores the complete candidate in `canonicalIntentRevisions`;
- the panel displays a Page Delta against the currently locked revision, or against a minimal L1 policy baseline for the first revision;
- the reviewer approves the complete resolved candidate;
- the approved immutable revision is displayed as `Locked` in the UI.

Page Delta therefore means “what is truly different and needs reviewer attention,” not “the only persisted Intent data.”

### 3.2 L1 workflow

```text
Missing snapshot
  -> Snapshot ready
  -> LLM candidate requested
  -> Candidate ready
  -> Human review required
  -> Locked
  -> Stale when relevant source fields change
```

Required human review for every L1 page:

- page role and audience;
- primary and secondary conversion actions;
- claims and evidence paths;
- trust, certification, compliance, and safety meaning;
- section intent and required facts;
- conflicts and low-confidence fields.

## 4. L2 inheritance model

### 4.1 Family Intent Template

Family Intent Template stores the stable page objectives shared by products in one product family or a manually defined equivalent family scope.

This is an authoring template for child product pages. It is not the Canonical Intent of the public family landing page itself. Public family/category pages continue to own separate page-level Canonical Intents; a later phase may introduce a separate hub-page template if evidence shows enough reuse.

It should contain:

- page role;
- common audience and buyer stage;
- common conversion goal;
- shared primary/secondary concepts;
- shared must-communicate goals;
- common prohibited claims;
- common section intents;
- allowed inheritance fields;
- fields that always require product evidence;
- family scope rule and source family ID.

It must not contain product-specific current, material, certification, size, or application claims unless they are proven common across every member.

### 4.2 Product Group Intent

Product Group Intent represents a verified subset of a family whose specification range or use case changes the page emphasis.

Examples of group differentiators:

- conductor/wire range;
- rated current or voltage band;
- material or plating;
- insulation type;
- certification set;
- mounting/connection method;
- industrial application or buyer use case.

The Product Group Intent stores a patch against an exact Family Intent Template revision. It should explain:

- which differentiators define membership;
- why these differences change the page goal;
- which inherited goals remain unchanged;
- which section intents are added, replaced, or removed;
- which facts must be present on every member page.

### 4.3 Product Page Delta

Each L2 product page stores only the differences from an exact approved Product Group Intent revision.

Typical outcomes:

- empty delta: product fully inherits the group;
- small delta: one specification/application distinction changes emphasis;
- exception delta: product does not safely fit the group and requires direct review;
- unassigned: no approved group is suitable.

The resolved complete Intent is still materialized into the existing page-level `canonicalIntentRevisions` table when the page is locked.

### 4.4 Inheritance precedence

```text
Canonical Intent schema defaults
  < Family Intent Template
  < Product Group Intent patch
  < Product Page Delta
```

Merge behavior must be schema-aware:

- scalar fields: replace;
- keyed intent arrays: merge by stable key, never by array position;
- claims: add/replace/remove only with explicit operation;
- protected facts: cannot be overridden by a delta without evidence;
- section intents: merge by `sectionKey`;
- removed items: require an explicit tombstone operation.

Plain recursive JSON merge is not safe enough for this hierarchy.

## 5. Proposed data additions

### 5.1 `familyIntentTemplates`

Stable identity per family scope.

Suggested fields:

- `familyId`;
- `key`, `name`;
- `currentRevisionId`, `approvedRevisionId`;
- `status`: `draft`, `active`, `paused`;
- owner and audit fields.

Logical uniqueness: one active template identity per family unless an explicit scope rule allows more than one.

### 5.2 `familyIntentTemplateRevisions`

Immutable template versions.

Suggested fields:

- parent template ID and revision;
- source snapshot IDs used as evidence;
- full shared Intent payload;
- inheritance policy;
- coverage evidence;
- status: `draft`, `review_required`, `approved`, `superseded`, `stale`;
- validation issues and provenance;
- reviewer/locked audit fields.

### 5.3 `productIntentGroups`

Stable group identity under one Family Intent Template.

Suggested fields:

- `familyIntentTemplateId` and `familyId`;
- `key`, `name`, `description`;
- `currentRevisionId`, `approvedRevisionId`;
- group lifecycle status;
- owner and timestamps.

### 5.4 `productIntentGroupRevisions`

Immutable group definition versions.

Suggested fields:

- exact `familyIntentTemplateRevisionId`;
- structured membership criteria;
- structured differentiators;
- Intent patch operations;
- required evidence fields;
- aggregate confidence distribution;
- conflict summary;
- status and review provenance.

### 5.5 `productIntentGroupMembers`

Assignment of a product page to a group.

Suggested fields:

- product/source entity ID;
- Source Snapshot ID;
- Product Group ID/revision;
- assignment status: `proposed`, `auto_inherited`, `quick_review`, `manual_review`, `approved`, `rejected`, `unassigned`;
- `confidence` from `0` to `1`;
- `confidenceBand` derived by code;
- per-dimension confidence;
- assignment reason and extracted differentiators;
- conflict flags;
- sample-review selection and result;
- reviewer/audit fields.

Only one current approved group assignment is allowed per product page.

### 5.6 `pageIntentDeltas`

Stable page-delta identity for L1 and L2.

Suggested fields:

- page class, entity type, source ID;
- base kind: `l1_previous_revision`, `l1_policy_baseline`, or `product_group_revision`;
- current/approved revision pointers;
- status and audit fields.

### 5.7 `pageIntentDeltaRevisions`

Immutable delta versions.

Suggested fields:

- exact base revision ID and Source Snapshot ID;
- structured patch operations;
- resolved Intent hash;
- confidence and per-dimension confidence;
- conflict flags;
- LLM provenance;
- status and review fields.

### 5.8 Later LLM orchestration records

Do not build these for the panel-only phase, but reserve the UI and relationships:

- `intentAnalysisRuns`;
- `intentAnalysisCandidates`;
- clustering run and cluster-candidate records;
- preset assignment by task type;
- sampling-policy configuration;
- quality/cost scorecards.

Prompt Lab remains the place to compare presets/models. Intent Management consumes an approved preset version later; it should not become another preset editor.

## 6. Confidence and conflict policy

### 6.1 Confidence bands

| Confidence  | Derived band | Default handling                                                    |
| ----------- | ------------ | ------------------------------------------------------------------- |
| `0.90–1.00` | High         | Auto-inherit after group approval; include in configurable sampling |
| `0.75–0.89` | Medium       | Human quick-review queue                                            |
| `< 0.75`    | Low          | Mandatory human decision; no inheritance approval                   |

Boundary behavior is exact:

- `0.90` belongs to High;
- `0.75` belongs to Medium;
- values must be clamped or rejected outside `0–1`.

### 6.2 Confidence must not be a single unexplained number

Every candidate should output:

- overall confidence;
- family/template match confidence;
- group assignment confidence;
- delta completeness confidence;
- evidence coverage confidence;
- concise reasons and uncertain fields.

The overall score is used for queue routing. Reviewers need the component scores and evidence to understand it.

The LLM-reported score should be stored as `reportedConfidence`, but it should not be trusted as the final routing score. A later deterministic scorer should calculate `systemConfidence` from:

- schema completeness;
- evidence-path coverage;
- normalized feature/cluster distance;
- agreement between extracted facts and source data;
- required-field availability;
- conflict penalties;
- historical performance of the selected preset/model on reviewed samples.

The queue uses `systemConfidence`. Before calibration exists, use the lower of reported confidence and evidence coverage rather than the model score alone.

### 6.3 Mandatory conflict flags

The following conflicts force `manual_review` regardless of confidence:

- `certification_conflict`;
- `material_conflict`;
- `rated_current_conflict`;
- `application_conflict`.

Recommended additional blockers:

- `rated_voltage_conflict`;
- `standard_conflict`;
- `safety_claim_conflict`;
- `source_evidence_missing`;
- `protected_value_mismatch`.

Conflict flags must contain:

- code and severity;
- source paths and compared values;
- affected Intent key/claim/section;
- detection method;
- resolution status and reviewer note.

An unresolved blocker disables auto-inherit, bulk approval, and locking.

### 6.4 Sampling policy

High-confidence does not mean no review. Sampling is selected when a group revision is approved.

Recommended configurable first-batch default:

- sample at least 5 pages per group or 10% of members, whichever is larger;
- include the lowest-confidence High member;
- include specification-range boundary members;
- include every distinct certification/material combination;
- randomize the remaining sample.

If a sample reveals a material error:

- freeze auto-inheritance for that group revision;
- move all unresolved members into quick/manual review according to severity;
- revise the group or extraction rules before resuming.

Sampling rates should later be reducible only after measured group-level quality history exists.

## 7. Recommended LLM workflow later

Do not ask one prompt to analyze and cluster all 120+ products at once.

Use a staged hybrid pipeline:

1. Capture deterministic Source Snapshots.
2. Run structured per-page feature/evidence extraction in batches.
3. Hard-partition by approved family/primary concept, then cluster inside each partition using normalized structured features plus embeddings/distance rules.
4. Ask an LLM to name, explain, and draft Intent for cluster candidates.
5. Human reviews/merges/splits proposed groups.
6. Lock Family Template and Product Group revisions.
7. Generate page deltas against exact group revisions.
8. Route members by confidence/conflicts.
9. Resolve and materialize full page Canonical Intent revisions.

Recommended future preset task slots:

- `l1_full_intent_draft`;
- `l2_feature_extraction`;
- `l2_group_intent_draft`;
- `l2_page_delta_draft`;
- `intent_conflict_check`.

Each slot references one approved Prompt Lab preset version. Different tasks can use different providers/models.

## 8. Panel information architecture

Add `Intent Management` under Localizations, separate from Localization Strategy.

```text
Localizations
├── Overview
├── Localization Strategy
├── Intent Management
│   ├── Overview
│   ├── L1 Pages
│   ├── Family Templates
│   ├── Product Groups
│   ├── Review Queue
│   └── Runs & Provenance (enabled with LLM integration)
├── L1 Static Pages
├── Categories
├── Families
└── Products
```

One route can initially implement these as tabs:

- `/admin/localizations/intents`
- `/admin/localizations/intents/l1`
- `/admin/localizations/intents/templates`
- `/admin/localizations/intents/groups`
- `/admin/localizations/intents/review`

## 9. Panel screens

### 9.1 Intent Overview

Purpose: show whether Intent foundation is ready before localization generation.

Primary metrics:

- L1 locked / total;
- families with approved templates;
- approved/proposed Product Groups;
- L2 products assigned / unassigned;
- High/Medium/Low confidence counts;
- unresolved mandatory conflicts;
- stale dependencies;
- pages with resolved locked Canonical Intent.

Pipeline visualization:

```text
Snapshots -> Templates -> Groups -> Page Deltas -> Resolved Intents
```

Primary actions later:

- Analyze L1 pages;
- Analyze selected families;
- Run clustering;
- open Review Queue.

Until LLM integration, these actions are shown as disabled task slots with preset-readiness explanations.

### 9.2 L1 Pages

Table columns:

- page;
- Source Snapshot status/hash;
- candidate status;
- confidence;
- conflict count;
- locked revision;
- source stale state;
- owner/action.

L1 detail reviewer:

- left: Source Snapshot and evidence paths;
- center: full candidate Intent editor/viewer;
- right: confidence, conflicts, provenance, and review decision;
- Page Delta tab: candidate vs locked revision, grouped by Intent key;
- revision history and lock action.

No bulk lock action for L1.

### 9.3 Family Templates

List families rather than raw template records.

Columns/cards:

- family and product count;
- Source Snapshot coverage;
- template status/revision;
- number of proposed/approved groups;
- member coverage;
- unresolved conflicts;
- stale downstream groups/pages.

Template editor sections:

- shared page goal;
- shared audience/buyer stage;
- common concepts;
- common claims and evidence coverage;
- section intents;
- inheritance permissions;
- excluded/non-shared fields;
- revision history and lock action.

### 9.4 Product Groups

Default view is grouped by family.

Each group summary shows:

- group name and defining specification range;
- member count;
- confidence distribution;
- mandatory conflict count;
- unreviewed sample count;
- group revision/status;
- membership coverage.

Group reviewer supports:

- side-by-side Family Template and Group patch;
- member specification matrix;
- merge group;
- split selected members into another group;
- move member;
- reject group candidate;
- approve/lock group revision;
- configure/select sample.

Merge/split operations create new group revisions and preserve the original candidate history.

### 9.5 Review Queue

One queue for L1 and L2 with saved filters.

Default queues:

- Mandatory conflicts;
- Low confidence;
- Medium quick review;
- High-confidence sample;
- Unassigned products;
- Stale after template/group/source change;
- L1 awaiting full review.

Columns:

- entity/group;
- family;
- queue reason;
- confidence and band;
- conflict badges;
- source/template/group revisions;
- age/owner;
- review action.

Quick-review actions:

- approve inheritance;
- move to another group;
- create/edit page delta;
- mark exception;
- escalate to full review.

Bulk actions are disabled whenever selected rows contain unresolved blockers.

## 10. Review and locking rules

### Family Template

Can lock only when:

- all shared claims have evidence coverage;
- no product-specific fact is incorrectly declared shared;
- no unresolved blocker exists;
- inheritance policy is explicit;
- reviewer is recorded.

### Product Group

Can lock only when:

- base Family Template revision is locked;
- membership criteria and differentiators are structured;
- required evidence exists for every proposed member or the member is excluded;
- mandatory conflicts are resolved;
- sample policy is configured.

### Product member/page

Can auto-inherit only when:

- group revision is locked;
- confidence is at least `0.90`;
- no mandatory conflict exists;
- required source fields are present;
- member is not selected for pending sample review.

Medium and Low candidates require their corresponding review path.

### Final Canonical Intent

Locking materializes a full immutable `canonicalIntentRevision` with:

- resolved Intent payload;
- Source Snapshot ID;
- template/group/delta provenance;
- confidence and conflict summary;
- approval basis: `page_review`, `group_policy`, or `manual_exception`;
- reviewer or group-policy authorizer.

## 11. Dependency and stale behavior

- Source Snapshot relevant-field change: page delta and resolved Intent become stale.
- Family Template revision change: dependent Product Groups become `dependency_stale`.
- Product Group revision change: dependent page deltas and unresolved Intent candidates become `dependency_stale`.
- locked historical Canonical Intent revisions never mutate.
- published localization is not automatically removed; existing stale localization governance still applies.
- regeneration must always use the latest explicitly approved dependency chain, never “latest record by timestamp.”

The panel must show a dependency impact preview before approving a new template/group revision.

## 12. Panel-only implementation phases

### P1 — Read-only control plane

- add Intent Management submenu and routes;
- show existing Source Snapshots and Canonical Intent coverage;
- show L1 and L2 inventory;
- render confidence/conflict placeholders;
- show future preset task slots without executing them.

### P2 — Manual hierarchy management

- add Family Template and Product Group identities/revisions;
- manually create/edit/review/lock templates and groups;
- manually assign products and create page deltas;
- implement schema-aware resolver and materialize full Canonical Intent candidates;
- implement dependency-stale propagation.

### P3 — Review operations

- Review Queue;
- confidence routing;
- mandatory conflict gate;
- sample selection and sample-failure freeze;
- merge/split/move operations with audit history;
- batch approval under group policy.

### P4 — LLM integration

- bind approved Prompt Lab preset versions to task slots;
- add analysis/clustering/delta runs;
- persist confidence dimensions, reasons, conflict evidence, token cost, and provenance;
- enable retry/regenerate on selected scope;
- add quality/cost scorecards.

## 13. Recommended immediate next step

Implement P1 and the manual data contracts from P2 before connecting LLMs.

The first usable panel should let a reviewer inspect:

- all L1 pages and current Canonical Intent state;
- families and their product counts;
- manually defined Family Templates;
- manually defined Product Groups and members;
- resolved full Intent preview from Template + Group + Delta;
- confidence/conflict fields populated manually or left pending.

This validates the inheritance and review UX with real catalog data before model output begins shaping the workflow.

## 14. Data-contract implementation record

The manual hierarchy data contracts are now implemented in Convex.

Implemented tables:

- `familyIntentTemplates` and immutable `familyIntentTemplateRevisions`;
- `productIntentGroups` and immutable `productIntentGroupRevisions`;
- `productIntentGroupMembers`;
- `pageIntentDeltas` and immutable `pageIntentDeltaRevisions`.

Implemented shared contracts:

- schema-aware `add`, `replace`, and `remove` Intent patch operations;
- stable `itemKey` requirements for `mustCommunicate`, `verifiedClaims`, and `sectionIntents`;
- inheritance policy and evidence requirements;
- structured group membership criteria and differentiators;
- reported/system/evidence confidence fields plus an indexable derived confidence band;
- exact High/Medium/Low confidence boundaries;
- structured conflicts and mandatory manual-review detection;
- sample-review policy and freeze state;
- explicit L1 baseline, previous-revision, and Product Group revision base kinds;
- exact base revision references for Page Delta revisions;
- locked/reviewed audit and generation-provenance fields.

The manual hierarchy implementation now includes CRUD/review mutations, dependency-stale propagation, schema-aware resolution, and full Canonical Intent materialization. Relational rules that span fields—such as matching a Page Delta base kind to exactly one base revision or ensuring only one current approved group membership per product—are enforced by those mutations.

## 15. Initial L2 Prompt Lab integration record

`Canonical Page Intent Draft` v3 is the first bound L2 analysis preset.

Its output is an analysis-only candidate envelope containing:

- a complete `CanonicalIntentPayload` under `intent`;
- existing membership-criterion and differentiator contracts;
- existing schema-aware Group and Page Delta patch operations;
- reported confidence, evidence coverage, component dimensions, reasons, and uncertain paths;
- existing structured conflict categories and explicit `reviewRequired` routing.

The Intent Management product workspace can start v3 against a newly captured Product Source Snapshot plus the current approved Template/Group hierarchy and approved concept bindings. The resulting Prompt Lab run is linked back to the product for review and provenance.

This integration deliberately does not write model output into Template, Group, Delta, or Canonical Intent records. A selected model result remains a candidate until a later reviewed-import operation is implemented. Automatic clustering, batch routing, quality/cost scorecards, and production approval remain later P3/P4 work.
