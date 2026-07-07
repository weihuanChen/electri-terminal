# P2 Localization Content Governance

## 1. Objective

P2 defines how localized content is stored, reviewed, and approved.

P2 should happen after or alongside P1, but it must not bypass P1 gates. The main result is a content governance system that tells the platform which pages are ready for each language.

P2 is successful when every localizable entity has:

- a source identity;
- a translation status per language;
- a clear owner or workflow;
- a review requirement;
- a release rule;
- a stale-content rule.

---

## 2. Translation Storage Principle

Use a separate translation layer instead of scattering locale fields into every core table.

Recommended model concept:

- source table remains the English/default source of truth;
- translation records reference source entity ID, entity type, and locale;
- localized fields are stored in the translation record;
- publication state lives on the translation record.

Example entity types:

- `static_page`
- `category`
- `product_family`
- `product`
- `article`
- `navigation`
- `asset`
- `seo_meta`

This keeps catalog data stable and makes it easier to audit one language at a time.

---

## 3. Page-Level Status Model

Each translation should move through these states:

- `missing`: not started.
- `draft`: manual or automated work in progress.
- `machine_ready`: generated and structurally valid.
- `review_required`: waiting for human review.
- `approved`: reviewed but not exposed to search.
- `published`: index-ready and allowed in sitemap/hreflang.
- `stale`: source changed after translation.

Only `published` can be exposed to public search surfaces.

`approved` is intentionally separate from `published`. This allows a language to prepare many pages and release them only when the whole language gate passes.

---

## 4. Source Change Tracking

Every translation should know which source version it was created from.

Required tracking:

- source entity ID;
- source updated timestamp;
- source content hash or field-level hash;
- localized updated timestamp;
- translation method: manual, LLM, import, external vendor;
- reviewer;
- review timestamp.

When source content changes:

- mark affected translations `stale`;
- show changed fields in admin;
- block release if the changed fields are required for that page class.

---

## 5. L1 Core Static Pages

### 5.1 Scope

Examples:

- homepage
- contact
- manufacturing
- selection-guide
- resources
- quality/certifications
- privacy-policy if published in the language
- future solutions pages

### 5.2 Governance

L1 pages require human review.

Rules:

- no raw machine translation can be published directly;
- page-level UX and sentence length must be checked;
- CTA wording must be localized, not translated literally;
- form labels and validation messages must match the locale;
- SEO title and description must be manually approved.

### 5.3 Release rule

A language cannot become `published` unless all required L1 pages are `published`.

Optional L1 pages may stay unpublished, but they must not be linked from the localized navigation.

---

## 6. L2 Catalog and Conversion Pages

### 6.1 Scope

Examples:

- category pages
- product family pages
- product pages
- product listing pages
- specification labels
- filter labels
- product badges and CTA microcopy

### 6.2 Governance

L2 pages can use automation heavily, but terminology rules are mandatory.

Protected fields:

- SKU and item number;
- model and normalized model;
- brand name;
- certification names;
- standards such as IEC, UL, CE, RoHS;
- units such as V, A, mm2, AWG;
- material grades;
- product series codes;
- drawing and datasheet file names.

Localized fields:

- title when not model-only;
- short title;
- summary;
- feature bullets;
- attribute labels;
- option labels when appropriate;
- SEO title;
- SEO description;
- family/category descriptive blocks;
- FAQ blocks.

### 6.3 Release rule

A language cannot become `published` unless required L2 coverage passes.

Recommended first rule:

- all public navigation categories must be localized;
- all product families linked from category pages must be localized;
- all products shown in localized product/family/category listings must be localized;
- all linked related products and related families must have published localized targets;
- specification labels and filter labels must be localized for exposed categories.

For the pilot language, prefer strict coverage over partial catalog exposure.

### 6.4 Post-launch incremental product gate

After a language is published, newly added catalog entities must pass an entity-level exposure gate for each locale.

Example:

- Existing products are fully localized in French, Russian, and German.
- A new English product group is added.
- The new products do not yet have French, Russian, or German translations.

Expected behavior:

- English product pages can be published if the English source is ready.
- French/Russian/German product URLs are not generated as public indexable pages.
- French/Russian/German sitemaps do not include the new products.
- French/Russian/German hreflang clusters omit the missing product versions.
- French/Russian/German category and family pages exclude those products from listings until translation is published.
- French/Russian/German related-product modules do not link to those products.
- French/Russian/German search results do not return those product URLs.
- Admin dashboards show the new products as missing translations for those locales.

This protects published languages from incremental dirty links.

The only acceptable exception is a deliberate locale-specific business decision to expose the product later than English. The missing translation must remain invisible to search until ready.

---

## 7. L3 Articles, Applications, and Guides

### 7.1 Scope

Examples:

- blog posts;
- technical guides;
- application articles;
- FAQ articles.

### 7.2 Governance

L3 pages may be partially published by language.

Rules:

- source structure should be preserved;
- headings, paragraphs, tables, images, and metadata should remain aligned;
- article title, excerpt, SEO title, SEO description, and slug should be handled together;
- internal links must be validated before publication;
- markdown/HTML structure must be parsed, not changed by ad hoc string replacement.

### 7.3 Release rule

Missing L3 translations do not block language release.

Published L3 translations must pass:

- article target exists;
- target language version exists or approved same-language fallback is used;
- product/category/static links point to published same-language targets;
- no draft or preview URL is linked;
- no English-only article is linked from localized body content unless explicitly approved.

---

## 8. Admin Workflow

Required admin views:

- language dashboard;
- per-language readiness summary;
- L1 required page checklist;
- L2 catalog coverage dashboard;
- L3 article translation queue;
- stale translation queue;
- internal link audit report;
- sitemap/hreflang preview;
- release gate result page;
- per-entity translation editor.

Recommended admin actions:

- create translation draft;
- run LLM generation;
- mark for review;
- approve;
- publish;
- unpublish;
- mark stale;
- compare source and localized fields;
- run link audit;
- run release gate.

---

## 9. Navigation Governance

Localized navigation must be generated from published localized targets only.

Rules:

- do not show a localized nav item if its target page is missing;
- do not show a localized language switcher target unless the current page has a published translation;
- custom URLs must be explicitly marked as locale-safe;
- external URLs must be excluded from internal link-gate rules but still checked for malformed URLs.

---

## 10. Asset Governance

Assets may be shared or localized.

Examples:

- product photos usually shared;
- datasheets may be language-specific;
- certificates may be language-neutral;
- alt text should be localized;
- downloadable labels should be localized.

Rules:

- a localized page can use shared images;
- image alt text should come from the localized translation where available;
- language-specific documents must not be linked unless the asset is public and published for that locale;
- missing localized datasheets should use neutral request-copy CTAs instead of broken download links.

---

## 11. P2 Deliverables

Required deliverables:

- translation entity model;
- page-level translation status model;
- source change and stale handling rules;
- L1/L2/L3 release criteria;
- glossary and protected-term rules;
- admin workflow design;
- internal link governance rules;
- asset localization rules;
- per-language readiness dashboard specification.

---

## 12. P2 Acceptance Criteria

P2 is complete when:

- every localizable page type has a defined translation record structure;
- every localized page can be classified as missing, draft, approved, published, or stale;
- language release readiness can be calculated from data, not manual judgment;
- L1 pages require human review;
- L2 pages enforce terminology and coverage rules;
- L3 pages can publish partially without creating dirty internal links.
