# P3 LLM Localization Pipeline

## 1. Objective

P3 introduces LLM-assisted localization after the P1/P2 governance layer exists.

The purpose is to improve production speed and cost efficiency without reducing search quality, terminology consistency, or conversion quality.

LLM output is not allowed to bypass:

- translation status workflow;
- glossary rules;
- protected-term rules;
- internal link validation;
- sitemap and hreflang gates;
- human review requirements for L1 pages.

---

## 2. Production Principle

LLM localization should be structured generation, not free-form page rewriting.

Each job should have:

- source entity ID;
- source fields;
- locale;
- page class;
- glossary;
- protected terms;
- required output schema;
- link map;
- review policy;
- validation report.

The output should be saved as a draft or machine-ready translation record, not directly published.

---

## 3. Shared Inputs

Every localization job should receive:

- locale and target market context;
- page type and business purpose;
- source content;
- field schema;
- brand tone rules;
- terminology glossary;
- protected terms;
- forbidden translation list;
- units and standards policy;
- internal link map;
- SEO title/description constraints.

Recommended glossary categories:

- product names;
- product family names;
- electrical terms;
- standards and certifications;
- material names;
- manufacturing process terms;
- CTA phrases;
- form and RFQ terms.

---

## 4. Shared Validation

All LLM output must pass automated validation before review.

Validation rules:

- output matches required JSON or markdown schema;
- required fields are present;
- protected terms are preserved;
- units and numbers are unchanged unless explicitly allowed;
- SKU/model/item numbers are unchanged;
- links resolve through the URL resolver;
- markdown/HTML syntax remains valid;
- title and meta description fit configured length ranges;
- no draft or missing localized URL is referenced;
- no unexpected English fallback remains in primary localized content.

Failed output returns to draft or regeneration. It cannot move to `machine_ready`.

---

## 5. P3.1 L1 Static Pages

### 5.1 Scope

Examples:

- homepage;
- contact;
- manufacturing;
- selection-guide;
- resources;
- future solutions pages.

### 5.2 Recommended workflow

Use LLMs as an assistant, not as an automatic publisher.

Workflow:

1. Extract page copy into structured content blocks.
2. Generate localized draft based on target-market context.
3. Review CTA, trust claims, form copy, and technical terms manually.
4. Check layout for text expansion.
5. Approve.
6. Publish only when the language release gate passes.

### 5.3 Content extraction

The current project is not fully headless. Static pages may contain copy inside React components.

Recommended direction:

- gradually move static page copy into typed content modules or CMS-like records;
- avoid asking an LLM to rewrite TSX directly;
- keep layout code separate from localized copy;
- store source copy snapshots for diff and stale detection.

XML is only necessary if integrating with an external translation management system. For internal workflow, typed JSON/TS content modules or Convex records are simpler.

---

## 6. P3.2 L2 Catalog Pages

### 6.1 Scope

Examples:

- product pages;
- category pages;
- product family pages;
- attribute labels;
- option labels;
- filters;
- SEO snippets.

### 6.2 Recommended workflow

L2 is the best fit for batch automation.

Workflow:

1. Export structured source fields by entity.
2. Attach glossary and protected-term rules.
3. Batch-generate localized fields.
4. Validate schema and protected terms.
5. Run sample review by category/family.
6. Mark valid results `machine_ready`.
7. Approve or bulk-approve under configured rules.
8. Publish only after L2 coverage gate passes.

### 6.3 Quality rules

Rules:

- do not translate SKU, item number, model, and series code;
- keep standards and certification labels consistent;
- keep measurement units stable;
- translate user-facing labels and explanatory copy;
- keep short technical phrases concise;
- avoid marketing inflation in product descriptions;
- preserve B2B sourcing intent.

### 6.4 Batch strategy

Recommended batch order:

1. attribute definitions and labels;
2. category names and descriptions;
3. product family names, summaries, and page blocks;
4. product titles, summaries, bullets, and SEO fields;
5. related-product labels and CTA microcopy.

This order reduces inconsistency because products can reuse category/family terminology.

---

## 7. P3.3 L3 Articles, Applications, and Guides

### 7.1 Scope

Examples:

- blog articles;
- technical guides;
- application articles;
- long-form FAQs.

### 7.2 Recommended workflow

Workflow:

1. Parse article into structured blocks.
2. Extract internal links and build target map.
3. Translate title, excerpt, SEO fields, headings, body blocks, image alt text.
4. Rewrite internal links through the localized URL resolver.
5. Validate markdown/HTML.
6. Validate internal links.
7. Mark `machine_ready`.
8. Publish selected articles only after link audit.

### 7.3 Link fallback policy

For article internal links:

- if same-language target exists, use it;
- if target is L1/L2 and missing, block release because L1/L2 should be prepared first;
- if target is another L3 article and missing, use an approved same-language fallback or remove/replace the link;
- do not silently link to the English article from localized body copy.

Approved L3 fallbacks:

- localized blog hub;
- localized category page;
- localized product family page;
- no link, if the sentence still reads naturally.

---

## 8. Model and Cost Strategy

Use different model tiers by page class.

Recommended approach:

- L1: stronger model plus human review.
- L2: cost-effective batch model with strict schema validation and glossary.
- L3: cost-effective batch model, with stronger model used only for high-value articles or failed validations.

Cost should be controlled by:

- batching;
- content hashing to avoid retranslating unchanged fields;
- translation memory;
- glossary reuse;
- field-level regeneration instead of full-page regeneration;
- prioritizing high-value pages first.

---

## 9. Review Strategy

### 9.1 Human review required

Required for:

- L1 pages;
- homepage hero and CTA copy;
- contact/RFQ form copy;
- high-value product family pages;
- first batch of each new language;
- any page with legal, compliance, certification, or safety claims.

### 9.2 Sampling review acceptable

Acceptable for:

- repeated product pages;
- attribute labels after glossary validation;
- low-risk articles after the first batch passes.

Sampling should still include:

- random products;
- top traffic products;
- top conversion products;
- pages with long generated text;
- pages with many internal links.

---

## 10. P3 Deliverables

Required deliverables:

- prompt templates by page class;
- glossary and protected-term files;
- batch job format;
- validation scripts/specifications;
- admin generation queue;
- review UI requirements;
- stale regeneration workflow;
- link rewriting workflow;
- cost tracking dashboard.

---

## 11. P3 Acceptance Criteria

P3 is complete when:

- LLM jobs produce structured draft translations;
- protected terms are enforced automatically;
- output cannot publish without validation;
- L1 pages require human approval;
- L2 batch localization can prepare a language catalog safely;
- L3 articles can be localized partially without dirty links;
- failed validations produce actionable reports instead of silent bad output.
