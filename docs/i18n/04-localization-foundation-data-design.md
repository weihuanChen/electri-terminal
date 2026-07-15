# i18n Batch Localization Foundation Data Design

## 1. Decision summary

The proposed direction is sound and fits the existing i18n governance model, but the four conceptual layers should not become four unrelated content stores.

The recommended foundation is:

1. `Source Snapshot`: immutable English source content and structured product facts for a specific revision.
2. `Canonical Intent`: locale-neutral meaning, claims, audience, conversion goal, and section intent for one source revision.
3. `Language Profile`: versioned locale/market policy maintained by humans.
4. `Concept Registry`: stable product and industry concepts with locale- and context-specific term rules.
5. `Localized Brief`: a derived, reviewable plan combining Canonical Intent, Language Profile, and Concept rules.
6. `Localized Content`: generated short fields and body modules, ultimately projected into the existing `localizations` publication record.

The first implementation phase should build and review items 1–4. Presets and automated generation can be added after these inputs are stable.

## 2. Architecture correction

`Language Profile` is upstream of localized generation, but it must not be upstream of `Canonical Intent`.

`Canonical Intent` answers:

- What is this page?
- Who is it for?
- Which verified facts and distinctions matter?
- What should a visitor understand or do?
- What is each page section intended to accomplish?

`Language Profile` answers:

- How should this meaning be expressed for a locale and target market?
- Which tone, SEO emphasis, CTA convention, structure, and terminology policy apply?

The two inputs meet when producing a `Localized Brief`. This avoids locale drift in the canonical meaning while still allowing Russian, German, French, and Spanish pages to emphasize different buyer needs.

```text
Source Snapshot ──> Canonical Intent ──────────┐
                                               ├──> Localized Brief ──> Localized Content
Language Profile ──> active profile version ──┤
Concept Registry ──> locale/context rules ────┘
```

Market-specific additions must be marked explicitly in the Localized Brief. They may change emphasis or ordering, but may not invent product facts, certifications, performance claims, or applications.

## 3. Layer responsibilities

### 3.1 Source Snapshot

Source Snapshot is not another editable English CMS record. It is an immutable production input captured from current source tables.

It contains:

- `entityType` and stable `sourceId`;
- `pageClass` (`L1`, `L2`; `L3` reserved);
- source revision/hash;
- localizable English fields;
- protected values such as SKU, model, standards, units, URLs, and IDs;
- structured product/category/family data used as evidence;
- source field hashes for stale detection;
- snapshot time and schema version.

Why it is necessary:

- a generated intent must always identify the exact source revision it used;
- a later source edit must not silently alter the evidence behind an approved intent;
- Prompt Lab comparisons need identical inputs;
- stale detection can be field-level instead of page-level only.

### 3.2 Canonical Intent

Canonical Intent stores meaning, not publishable copy.

It may contain short labels and IDs needed to identify concepts, but must not contain target-language sentences, SEO copy, CTA copy, or translated body text.

Recommended schema:

```json
{
  "schemaVersion": 1,
  "pageRole": "family_detail",
  "primaryAudience": ["industrial_buyer", "electrical_engineer"],
  "buyerStage": ["evaluation", "sourcing"],
  "primaryGoal": "help buyers determine fit and request a quote",
  "primaryConceptIds": ["ring_terminal"],
  "secondaryConceptIds": ["crimp_connection", "copper_conductor"],
  "mustCommunicate": [
    {
      "key": "product_scope",
      "intent": "Define which ring-terminal variants belong to this family",
      "evidencePaths": [
        "family.name",
        "family.summary",
        "products[*].attributes"
      ]
    }
  ],
  "verifiedClaims": [
    {
      "claimKey": "material",
      "factPath": "products[*].attributes.material",
      "allowedMeaning": "State the source material without adding performance claims"
    }
  ],
  "prohibitedClaims": ["unverified performance superlatives"],
  "conversionIntent": {
    "primaryAction": "request_quote",
    "secondaryAction": "review_specifications"
  },
  "sectionIntents": [
    {
      "sectionKey": "overview",
      "purpose": "define the family and its selection boundary",
      "requiredConceptIds": ["ring_terminal"],
      "requiredFactPaths": ["family.summary"]
    }
  ]
}
```

Canonical Intent should be generated once per meaningful source revision and manually reviewed. Similar products may share an intent template, but each public page still needs a resolved intent record that references its actual source snapshot.

### 3.3 Language Profile

There is one active profile version per locale and optional market scope. The profile is maintained by humans and changes infrequently.

Do not make the locale itself the primary key. Use a stable profile plus immutable versions so old generations remain reproducible.

Recommended hard rules:

- protected-token and transliteration policy;
- CTA mapping and CTA length constraints;
- SEO title/description limits and keyword-placement rules;
- units, decimal separators, punctuation, capitalization, and typography;
- forbidden claims and forbidden wording;
- required regulatory or market wording;
- fallback and unresolved-term policy.

Recommended soft rules:

- tone dimensions rather than only adjectives;
- preferred information order;
- marketing intensity;
- technical depth;
- trust emphasis;
- sentence and paragraph density;
- preferred body length ranges;
- SEO emphasis;
- examples of desired and undesired style.

Example:

```json
{
  "schemaVersion": 1,
  "locale": "ru",
  "market": "global-ru",
  "hardRules": {
    "ctaPolicy": {
      "request_quote": "Запросить коммерческое предложение"
    },
    "protectedPatterns": ["SKU", "IEC", "UL", "RoHS", "AWG"],
    "unresolvedConceptPolicy": "block"
  },
  "softRules": {
    "tone": ["industrial", "engineering", "professional"],
    "marketingIntensity": "low",
    "technicalDepth": "high",
    "trustEmphasis": ["manufacturer", "engineering", "OEM"],
    "preferredInformationOrder": [
      "definition",
      "specification",
      "application",
      "selection",
      "RFQ"
    ]
  }
}
```

Preferred product terms do not belong directly in this document. They belong to the Concept Registry because they require concept identity, context, hierarchy, and reuse across pages.

### 3.4 Concept Registry

The Concept Registry is the stable terminology layer for L2. It prevents 120+ pages from independently deciding how to name the same product.

A concept is not an English string. It is a stable business meaning with optional parent/child relationships.

For example, if the catalog genuinely contains both connector-style ring terminals and heavier cable-lug products, model them as distinct narrower concepts under an optional shared parent. Do not force both products onto one `ring_terminal` concept and expect the model to infer the distinction from prose.

```text
ring_connection_product
├── ring_terminal_connector
└── ring_cable_lug
```

Each locale can then define multiple terms with usage policy:

```json
{
  "conceptId": "ring_terminal_connector",
  "locale": "ru",
  "terms": [
    {
      "text": "кольцевая клемма",
      "role": "primary",
      "contexts": ["title", "h1", "seo_title", "summary"],
      "searchIntent": "connector_terminal",
      "notes": "Primary connector/terminal wording"
    },
    {
      "text": "кольцевой наконечник",
      "role": "secondary",
      "contexts": ["body", "selection_guide", "procurement"],
      "searchIntent": "industrial_procurement",
      "maxUsage": "natural_only"
    }
  ],
  "avoidTerms": [],
  "status": "approved"
}
```

Important rules:

- `preferred` is not always globally singular; preference may depend on field and context.
- product/entity bindings must identify the correct concept before generation;
- terms inherit from parent concepts only when explicitly allowed;
- unresolved required concepts block machine-ready status;
- concept rules are versioned or snapshotted into every localization run;
- keyword frequency is guidance, never mechanical substitution.

### 3.5 Localized Brief

Localized Brief is a derived artifact, not a new source of product truth. It makes the combination step visible and reviewable before expensive long-form generation.

It should resolve:

- intended audience and conversion goal for the locale;
- primary and secondary terms by field/context;
- SEO focus and search intent;
- section order, depth, and length budgets;
- localized CTA intent;
- claims allowed from Canonical Intent;
- required facts and protected tokens;
- warnings or unresolved decisions.

This artifact is especially valuable for comparing models and presets later. A preset may generate a brief, short fields, SEO fields, or body modules independently without being responsible for the entire page.

### 3.6 Localized Content

Short content and body content are separate generation passes, but they should remain versions of one localized page rather than unrelated top-level entities.

Recommended passes:

1. `short_fields`: title, H1/headline, summary, CTA labels, SEO title, SEO description, slug proposal.
2. `body_sections`: overview, features, applications, selection guide, technical notes, FAQ, and long-form modules.

The accepted result is projected into the existing `localizations.localizedFields` record. The existing record remains the publication aggregate used by routing, sitemap, hreflang, and release gates.

## 4. Recommended Convex tables

### 4.1 `localizationSourceSnapshots`

One immutable record per captured source revision.

| Field                    | Type             | Purpose                           |
| ------------------------ | ---------------- | --------------------------------- |
| `entityType`             | validator        | Existing localizable entity type  |
| `sourceId`               | string           | Stable source entity ID           |
| `pageClass`              | `L1 \| L2 \| L3` | Governance class                  |
| `schemaVersion`          | number           | Snapshot payload schema           |
| `sourceUpdatedAt`        | number           | Source revision timestamp         |
| `sourceContentHash`      | string           | Deduplication/stale identity      |
| `sourceFieldHashes`      | record           | Field-level stale detection       |
| `sourcePayload`          | object           | Localizable English fields        |
| `evidencePayload`        | object           | Structured facts and relations    |
| `protectedValues`        | array            | Exact strings/values not to alter |
| `createdAt`, `createdBy` | audit            | Provenance                        |

Indexes:

- `by_entity_hash(entityType, sourceId, sourceContentHash)`
- `by_entity_created(entityType, sourceId, createdAt)`

### 4.2 `canonicalIntents`

One mutable identity record per source entity, pointing to its active approved revision.

| Field                    | Type        | Purpose                                |
| ------------------------ | ----------- | -------------------------------------- |
| `entityType`, `sourceId` | identity    | One canonical intent identity per page |
| `currentRevisionId`      | optional ID | Latest working revision                |
| `approvedRevisionId`     | optional ID | Revision allowed for production        |
| `createdAt`, `updatedAt` | audit       | Lifecycle                              |

Index: `by_entity(entityType, sourceId)`; uniqueness is enforced in mutations.

### 4.3 `canonicalIntentRevisions`

Immutable intent revisions.

| Field                  | Type            | Purpose                                                       |
| ---------------------- | --------------- | ------------------------------------------------------------- |
| `canonicalIntentId`    | ID              | Parent identity                                               |
| `revision`             | number          | Monotonic revision                                            |
| `sourceSnapshotId`     | ID              | Exact evidence revision                                       |
| `schemaVersion`        | number          | Intent JSON schema                                            |
| `status`               | enum            | `draft`, `review_required`, `approved`, `superseded`, `stale` |
| `intent`               | object          | Structured canonical meaning                                  |
| `generationProvenance` | optional object | Lab/model/result reference                                    |
| `validationIssues`     | array           | Structural/evidence issues                                    |
| review/audit fields    | audit           | Generator, reviewer, timestamps                               |

Indexes:

- `by_parent_revision(canonicalIntentId, revision)`
- `by_status(status)`
- `by_snapshot(sourceSnapshotId)`

### 4.4 `languageProfiles`

Stable profile identity.

| Field              | Type        | Purpose                                                        |
| ------------------ | ----------- | -------------------------------------------------------------- |
| `locale`           | string      | BCP-47 application locale                                      |
| `market`           | string      | For example `global-ru`; avoids future locale/market collision |
| `currentVersionId` | optional ID | Latest working version                                         |
| `activeVersionId`  | optional ID | Version used by production generation                          |
| `status`           | enum        | `draft`, `active`, `paused`                                    |
| audit fields       | audit       | Ownership                                                      |

Index: `by_locale_market(locale, market)`.

The existing `siteSettings.languageWorkflows` continues to control language publication. A Language Profile controls writing policy; it must not control sitemap or release state.

### 4.5 `languageProfileVersions`

Immutable policy versions.

| Field           | Type            | Purpose                           |
| --------------- | --------------- | --------------------------------- |
| `profileId`     | ID              | Parent profile                    |
| `version`       | number          | Monotonic version                 |
| `schemaVersion` | number          | Policy JSON schema                |
| `hardRules`     | object          | Deterministic/blocking policy     |
| `softRules`     | object          | Style and emphasis guidance       |
| `changeNote`    | optional string | Human-readable reason             |
| `status`        | enum            | `draft`, `approved`, `superseded` |
| audit fields    | audit           | Author/reviewer                   |

Index: `by_profile_version(profileId, version)`.

### 4.6 `canonicalConcepts`

Stable, locale-neutral industry concepts.

Suggested fields:

- `key`, `kind`, `parentId`, `canonicalLabel`, `definition`;
- `distinguishingCriteria` and `protected`;
- `status`: `draft`, `approved`, `deprecated`;
- replacement ID for deprecated concepts;
- audit fields.

Indexes: `by_key(key)`, `by_parent(parentId)`, `by_status(status)`.

### 4.7 `conceptLocaleRules`

One rule set per concept, locale, and market.

Suggested fields:

- `conceptId`, `locale`, `market`, `version`, `status`;
- `terms[]` with role, contexts, search intent, usage notes, and optional limits;
- `avoidTerms[]`, transliteration policy, grammatical notes, examples;
- reviewer and timestamps.

Indexes:

- `by_concept_locale_market(conceptId, locale, market)`
- `by_locale_status(locale, status)`

### 4.8 `entityConceptBindings`

Deterministic mapping from a source entity to concepts.

Suggested fields:

- `entityType`, `sourceId`, `conceptId`;
- `role`: `primary`, `secondary`, `attribute`, `application`;
- optional `fieldPaths` and `contextTags`;
- `source`: `manual`, `rule`, `llm_suggested`;
- `status`: `proposed`, `approved`, `rejected`;
- audit fields.

Only approved bindings may supply required L2 terminology to production generation.

Indexes:

- `by_entity(entityType, sourceId)`
- `by_concept(conceptId)`
- `by_entity_status(entityType, sourceId, status)`

### 4.9 Later tables, not required for the foundation phase

Reserve the following concepts but do not build them until generation workflow design begins:

- `localizedBriefs` / immutable brief revisions;
- `localizationGenerationJobs`;
- `localizationArtifacts` for pass-level outputs and provenance;
- translation-memory segments;
- model/preset quality scorecards.

Prompt Lab runs already preserve preset/model/request/output snapshots. Later production jobs should reference Lab assets where useful, not duplicate the provider/model registry.

## 5. Relationship to the existing `localizations` table

Do not replace `localizations` in this phase.

Its role should become clearer:

- exactly one current publication aggregate per `entityType + sourceId + locale`;
- holds accepted localized fields and publication workflow state;
- continues to drive current routing, readiness, sitemap, hreflang, and exposure gates;
- references the accepted upstream revisions in a future additive migration.

Recommended future reference fields:

```ts
sourceSnapshotId?: Id<"localizationSourceSnapshots">
canonicalIntentRevisionId?: Id<"canonicalIntentRevisions">
languageProfileVersionId?: Id<"languageProfileVersions">
localizedBriefRevisionId?: Id<"localizedBriefRevisions">
acceptedArtifactIds?: Id<"localizationArtifacts">[]
```

This separates production history from the materialized published document. Avoid storing every generation attempt directly inside `localizedFields`.

## 6. Status and approval rules

### Canonical Intent

`draft -> review_required -> approved -> stale/superseded`

- only `approved` may feed production localization;
- a changed source snapshot marks the approved revision stale only when relevant field hashes changed;
- stale intent cannot feed a new generation job without explicit override;
- an already published localization follows the current stale policy and is queued for review rather than automatically removed.

### Language Profile

`draft -> approved -> active -> superseded`

- one active version per locale/market;
- activation requires schema validation and human approval;
- changing the active profile does not automatically mark all published pages stale;
- it does mark them `policy_outdated` in a future audit queue when the changed rules are relevant.

### Concepts and terms

`draft/proposed -> approved -> deprecated`

- L2 production blocks when a required primary concept has no approved locale rule;
- deprecated terms remain in historical snapshots;
- term changes produce audit candidates, not blind full-site regeneration.

## 7. L1 and L2 handling

### L1

- one Source Snapshot and one Canonical Intent per page;
- intent is page-specific and fully human-reviewed;
- Language Profile supplies locale policy;
- concepts are used mainly for shared business terms, CTA intents, trust claims, and product references;
- every localized page requires human review before approval.

### L2

Separate reusable family/category intent from page resolution:

- a shared intent template may describe a page archetype or product concept;
- every page receives a resolved Canonical Intent tied to its actual source snapshot;
- concept bindings are assigned at category/family level and inherited only through explicit rules;
- product-level overrides handle real semantic differences;
- repeated specification differences remain structured facts, not newly generated prose intent;
- first batches per concept/locale receive human review; later repetitive pages may use sampled review once quality evidence exists.

For the two Russian ring-product usages, the required first step is a catalog classification decision. Decide which entities are connector-style terminals and which are cable-lug/wire-end products. The terminology system can enforce that decision but should not make it implicitly during copy generation.

## 8. Validation gates for the foundation

Before presets or bulk jobs are designed, the foundation should support these checks:

1. Every target source entity can produce a deterministic Source Snapshot.
2. Snapshot hashes are stable and field-level changes are detectable.
3. Canonical Intent JSON validates against a versioned schema.
4. Every intent claim points to evidence or is marked as non-factual communication intent.
5. No target-language publishable copy appears in Canonical Intent.
6. Exactly one active Language Profile version exists per locale/market.
7. Hard and soft rules are structurally separated.
8. Every required L2 primary concept has an approved entity binding.
9. Every required concept has an approved target-locale rule.
10. Every later generated artifact can record exact snapshot, intent, profile, concept-rule, preset, and model provenance.

## 9. Foundation implementation sequence

### Phase A — contracts and sample data

- define JSON schemas/TypeScript validators for Source Snapshot, Canonical Intent, Language Profile, and concept rules;
- choose 1 Russian L1 page and 3–5 representative L2 families/products;
- manually create expected examples, including both ring-product meanings;
- confirm which source fields are localizable, evidence-only, protected, or non-localizable.

Exit criterion: the examples can be reviewed without looking at prompts or model details.

### Phase B — storage and versioning

- add the eight foundation tables;
- add admin-only create/revise/review/activate mutations;
- enforce logical uniqueness in mutations;
- add immutable revision and audit behavior;
- add source snapshot capture and field hashing.

Exit criterion: approved upstream inputs are reproducible and cannot be silently overwritten.

### Phase C — concept coverage

- classify the L2 taxonomy into stable concepts;
- add entity concept bindings at category/family level;
- add explicit product overrides where meanings differ;
- author the first Russian concept rules;
- report missing or ambiguous concept coverage.

Exit criterion: the pilot L2 set has no unresolved required concept.

### Phase D — review surfaces

- Source Snapshot diff;
- Canonical Intent editor/reviewer with evidence links;
- Language Profile version editor with hard/soft separation;
- concept tree, locale terms, and entity-binding review;
- readiness report for missing/stale/ambiguous inputs.

Exit criterion: a human can approve every production input before any preset is run.

### Phase E — only then design production presets

- Localized Brief pass;
- short-field/SEO pass;
- body-section pass;
- automated validation and cost/quality scorecards;
- accepted-output projection into `localizations`.

## 10. Scope recommendation

For the next engineering milestone, implement only:

- Source Snapshot contracts and capture;
- Canonical Intent identities/revisions;
- Language Profile identities/versions;
- Concept Registry, locale rules, and entity bindings;
- their validation and review states.

Do not yet implement:

- bulk generation orchestration;
- preset selection logic;
- automatic publishing;
- translation memory;
- automated term-frequency optimization;
- L3 article localization.

This creates a stable, auditable foundation while keeping model cost and localization quality measurable later.

## 11. Phase-one implementation record

The phase-one backend foundation is now implemented.

Implemented storage:

- `localizationSourceSnapshots`;
- `canonicalIntents` and immutable `canonicalIntentRevisions`;
- `languageProfiles` and immutable `languageProfileVersions`;
- `canonicalConcepts`;
- versioned `conceptLocaleRules`;
- `entityConceptBindings`.

Implemented governance behavior:

- deterministic source and field hashing;
- source-snapshot deduplication;
- automatic invalidation of an approved Canonical Intent when a different source snapshot is captured;
- Canonical Intent draft, review, approval, stale, and superseded transitions;
- one active Language Profile version per locale and market;
- one approved locale-rule version per concept, locale, and market;
- required primary terminology for concept locale rules;
- manual/rule bindings can be approved directly, while LLM-suggested bindings require review;
- readiness reporting for missing active profiles, concept rules, and approved intents.

Implemented Convex mutation surface:

- `captureLocalizationSourceSnapshot`;
- `captureCatalogSourceSnapshot`, which resolves L2 content and evidence directly from Convex catalog entities;
- `createCanonicalIntentRevision` and `moveCanonicalIntentRevisionStatus`;
- `createLanguageProfileVersion`, `approveLanguageProfileVersion`, `activateLanguageProfileVersion`, and `setLanguageProfileStatus`;
- `createCanonicalConcept`, `updateDraftCanonicalConcept`, and `moveCanonicalConceptStatus`;
- `createConceptLocaleRuleVersion` and `approveConceptLocaleRule`;
- `upsertEntityConceptBinding` and `reviewEntityConceptBinding`.

Implemented query surface:

- per-entity foundation context;
- Language Profile and version history;
- concept registry listing;
- concept locale-rule history and approved rule resolution;
- locale/market foundation readiness.

The Language Profile foundation now has an admin management surface at `/admin/localizations/strategy`. It is driven by existing Language Workflow records, supports version creation, approval, activation, pause/resume, and does not permit strategy creation for a locale without a workflow.

The remaining foundation admin surfaces, production presets, generation jobs, Localized Brief storage, and localized content generation are still outside this phase.
