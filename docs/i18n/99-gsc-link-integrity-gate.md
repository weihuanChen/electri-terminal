# GSC Link Integrity Gate

## 1. Purpose

This document defines the hard gate that prevents dirty multilingual links from being exposed to Google Search Console.

The rule is simple:

If the link graph is dirty, the language does not launch.

It is better to delay a language than to submit a sitemap or hreflang graph that creates thousands of invalid, redirected, missing, or mismatched URLs.

---

## 2. Gate Scope

The gate applies before:

- a language changes from `prelaunch` to `published`;
- a localized sitemap is generated publicly;
- hreflang alternates are emitted for that language;
- a language is shown in the public language switcher;
- GSC sitemap submission is enabled;
- a large LLM-generated content batch is published.
- a newly added product, category, family, or article is exposed in an already-published language.

The gate should also run after:

- bulk import;
- slug changes;
- source page unpublish;
- translation unpublish;
- route config changes;
- sitemap logic changes.

---

## 3. Dirty Link Definition

A dirty link is any URL reference that search engines or users can discover but the site cannot honor cleanly.

Blocker examples:

- sitemap URL returns 404, 500, or an unexpected redirect;
- sitemap URL is `noindex`;
- sitemap URL canonicalizes to another URL;
- sitemap URL belongs to a language that is not `published`;
- hreflang alternate points to a missing or draft page;
- hreflang cluster lacks self-reference;
- hreflang cluster is not reciprocal;
- `x-default` points to an invalid URL;
- localized page links to a missing same-language target;
- localized page links to an English fallback without explicit approval;
- JSON-LD contains a missing localized URL;
- breadcrumb contains a missing localized URL;
- language switcher points to an unpublished translation;
- old redirected slug remains in sitemap;
- article body contains `/ru/...` links to articles that are not published in Russian.

Warnings that should be fixed but may not block:

- optional low-value article missing translation;
- external URL timeout;
- image alt text missing localization;
- long translated title likely to wrap poorly.

The default stance should be strict. When in doubt, classify as blocker until there is a written exception.

---

## 4. Candidate URL Graph

Before publishing a language, the system must generate a candidate URL graph.

Inputs:

- language configuration;
- route configuration;
- static page registry;
- categories;
- product families;
- products;
- articles;
- navigation items;
- asset relations;
- redirects;
- canonical fields;
- localization records;
- internal links extracted from article content;
- JSON-LD URL references;
- sitemap candidates;
- hreflang candidates.

Output:

- all candidate public URLs;
- all sitemap URLs;
- all hreflang clusters;
- all internal links;
- all language switcher links;
- all structured-data URLs;
- all redirect sources and targets;
- all missing or invalid targets.

---

## 5. Required Checks

### 5.1 Language checks

Block if:

- language status is not `published`;
- sitemap is disabled but sitemap candidates exist;
- hreflang is enabled before required L1/L2 coverage passes;
- GSC submission is enabled before gate passes.

### 5.2 Page status checks

Block if any exposed page is not:

- source entity `published`;
- translation `published`;
- route-resolvable;
- indexable;
- canonical to itself;
- returning 200.

For already-published languages, this check applies to every newly added entity. A new English product with missing Russian translation is allowed to exist in English, but it is not an exposed Russian page and must not be referenced by Russian sitemap, listing pages, hreflang, internal links, search, or JSON-LD.

### 5.3 Sitemap checks

Block if:

- sitemap includes draft/prelaunch/missing/stale-blocked pages;
- sitemap includes redirected URLs;
- sitemap includes canonical mismatch URLs;
- sitemap includes `noindex` URLs;
- sitemap includes unsupported locale URLs;
- sitemap includes newly added catalog entities whose translation is not published for that locale;
- sitemap omits required L1/L2 URLs for a published language.

### 5.4 Hreflang checks

Block if:

- hreflang points to unpublished translation;
- hreflang points to 404 or redirect;
- hreflang target canonicalizes to a different URL;
- cluster does not include self-reference;
- cluster is not reciprocal;
- `x-default` is missing or invalid when required by the configured policy.

Rule:

- missing translations are omitted from hreflang clusters, not linked.

### 5.5 Internal link checks

Block if:

- localized page links to a missing same-language URL;
- localized L3 article links to missing localized L3 article without approved same-language fallback;
- internal link uses a draft or preview URL;
- internal link bypasses the URL resolver pattern;
- navigation links to an unpublished localized target;
- breadcrumbs link to an unpublished localized target.

### 5.6 Structured data checks

Block if JSON-LD references:

- missing localized URLs;
- draft localized URLs;
- redirected URLs;
- canonical-mismatch URLs;
- wrong-language breadcrumbs.

### 5.7 Content-language checks

Block if:

- a localized indexable page renders the English source body as the main content;
- key metadata remains English on a published localized page;
- L1 page primary CTA remains untranslated;
- product/category/family page has untranslated user-facing labels outside protected terms.

Protected terms such as SKU, model, standards, units, and certification names should not trigger this check.

---

## 6. Severity Levels

### Blocker

Must prevent publishing or GSC submission.

Examples:

- 404 in sitemap;
- invalid hreflang;
- non-reciprocal hreflang;
- indexable English fallback on localized URL;
- localized navigation to missing page;
- missing required L1 page.

### High

Should prevent release unless explicitly waived.

Examples:

- stale high-value product family page;
- missing SEO description on L1 page;
- many untranslated labels in L2 catalog page;
- repeated external resource failures in high-value pages.

### Medium

Can release with follow-up ticket.

Examples:

- optional article not translated;
- image alt text not localized;
- low-priority article meta description too short.

### Low

Informational.

Examples:

- title length warning;
- page copy may need market-specific refinement;
- non-critical external link could not be checked.

---

## 7. Release Decision

A language can move to `published` only when:

- blocker count is 0;
- high issues are 0 or explicitly waived;
- required L1 pages are published;
- required L2 coverage passes;
- sitemap preview is clean;
- hreflang preview is clean;
- language switcher preview is clean;
- internal link graph is clean;
- GSC submission flag is enabled only after final approval.

The release record should store:

- language;
- release timestamp;
- release owner;
- gate report ID;
- sitemap URL count;
- hreflang cluster count;
- blocker count;
- high issue count;
- waived issue list;
- generated sitemap checksum.

For an already-published language, a new product/category/family/article can enter that locale only when:

- source entity is published;
- locale translation is published;
- localized URL returns 200;
- localized URL is canonical to itself;
- localized URL is allowed in sitemap;
- all localized listing, related-item, breadcrumb, and structured-data references resolve cleanly;
- hreflang omits missing variants and includes only valid published variants.

---

## 8. GSC Submission Policy

No localized sitemap should be submitted to GSC until the gate passes.

Policy:

- `draft`: no sitemap, no hreflang, no language switcher.
- `prelaunch`: preview sitemap allowed only internally; must be `noindex` or inaccessible to crawlers.
- `published`: public sitemap allowed only after gate passes.
- `paused`: remove from sitemap and hreflang, disable GSC submission.

Do not submit partial dirty sitemaps to "see what happens." The cleanup cost grows quickly as languages and page counts multiply.

---

## 9. Recommended Gate Workflow

1. Build candidate graph.
2. Resolve all URLs through the centralized URL resolver.
3. Simulate sitemap.
4. Simulate hreflang clusters.
5. Extract internal links from rendered/static content.
6. Validate entity and translation statuses.
7. Validate canonical and redirect rules.
8. Validate indexability.
9. Validate content-language expectations.
10. Produce report.
11. Block or approve language release.

The report should be readable by admins and engineers.

Each issue should include:

- severity;
- source page;
- source locale;
- target URL;
- target entity if known;
- reason;
- recommended fix.

---

## 10. Article Link Policy

Articles are the most likely source of dirty multilingual links.

Rules for localized article body links:

- same-language article target exists: link to it;
- same-language article target missing: use approved same-language fallback or remove the link;
- product/category/family/static target missing: block release;
- English fallback link: not allowed by default;
- preview link: never allowed;
- redirected link: replace with final canonical URL.

Approved fallbacks:

- localized blog hub;
- localized category page;
- localized product family page;
- localized product page;
- no link.

Fallback selection should be stored in the translation record or link audit report.

---

## 11. Monitoring After Release

After a language launches:

- run the gate after every bulk content change;
- monitor GSC coverage and indexing reports;
- monitor 404 logs by locale;
- monitor redirect hits by locale;
- monitor pages with language mismatch signals;
- compare sitemap URL count with published translation count;
- alert when a published URL becomes missing, redirected, or noindex.

If a language starts producing dirty links:

1. pause new submissions;
2. remove affected URLs from sitemap;
3. fix link graph;
4. regenerate sitemap;
5. rerun gate;
6. resubmit only after clean report.

---

## 12. Implementation Note

The gate should be implemented as code later, but this document is the contract.

Any future implementation must preserve the main rule:

No clean gate, no GSC exposure.
