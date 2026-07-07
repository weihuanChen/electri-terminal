# P1 Technical Foundation

## 1. Objective

P1 builds the multilingual infrastructure before content production starts.

The purpose of P1 is to make unfinished languages harmless:

- no unfinished language appears in sitemap;
- no unfinished page appears in hreflang;
- no draft localized URL is linked from public pages;
- no localized URL renders the wrong language as indexable content;
- no GSC submission can happen before link integrity passes.

P1 is not a translation phase. It is the search-safe publication foundation.

---

## 2. Routing Strategy

### 2.1 Recommended first implementation

Keep English at the current root paths and add locale prefixes for non-English languages.

Examples:

- English: `/products/uk-2-5-terminal-block`
- Russian: `/ru/products/uk-2-5-terminal-block`
- English: `/blog/how-to-select-terminal-blocks`
- Russian: `/ru/blog/how-to-select-terminal-blocks`

This strategy reduces migration risk because existing English URLs do not need to move.

### 2.2 Locale prefix rules

Rules:

- every non-default language must have a visible locale prefix;
- unsupported locale prefixes must return 404;
- draft/prelaunch locales must not be exposed in public navigation;
- middleware must not force-redirect deep URLs based on browser language;
- user-selected language preference may be stored, but URL remains the source of truth.

### 2.3 Pathname localization

Initial recommendation:

- keep structural path segments in English for P1, such as `/ru/products/...` and `/ru/blog/...`;
- defer translated pathnames such as `/ru/produkty/...` until the URL graph is stable.

Reason:

- path segment translation multiplies route mapping and redirect complexity;
- initial SEO benefit is lower than the cost of dirty link risk;
- product/category/family pages already have many dynamic slugs.

Later option:

- introduce localized pathnames through a centralized routing config after the first language proves stable.

---

## 3. Slug Strategy

### 3.1 Stable source identity

Every localizable page needs a stable source identity.

Examples:

- static page key: `home`, `contact`, `manufacturing`
- category ID
- product family ID
- product ID
- article ID

Do not use slug as the only translation relationship key.

### 3.2 Product, category, and family slugs

Recommended P1 rule:

- keep existing English slugs for product, category, and family pages in all languages.

Reasons:

- product slugs often include model, series, or industrial terms that are stable internationally;
- localized slugs add redirect and mapping risk;
- catalog pages have high internal-link density.

Localized slugs can be added later per entity only after redirect and sitemap validation are automated.

### 3.3 Article slugs

Article slugs may eventually be localized, but P1 should support both:

- inherited source slug;
- localized slug.

Rule:

- article translation lookup must use article ID plus locale, not slug alone.

If a localized article slug changes, the old localized slug must redirect to the new localized slug and must not remain in sitemap.

---

## 4. Language Configuration Center

The language center is the global control layer.

Required fields:

- locale code, such as `ru`
- display name, such as `Russian`
- native display name, such as `Русский`
- URL prefix, such as `/ru`
- direction, such as `ltr` or `rtl`
- global status: `draft`, `prelaunch`, `published`, `paused`
- default fallback locale, usually `en`
- GSC submission enabled flag
- sitemap enabled flag
- hreflang enabled flag
- required L1 page list
- required L2 coverage rule
- created/updated timestamps

The language center must control:

- sitemap inclusion;
- hreflang generation;
- language switcher visibility;
- admin publishing permissions;
- preview behavior;
- release-gate execution.

---

## 5. URL Resolver

P1 requires a single URL resolver used by frontend, metadata, sitemap, and admin validation.

Required functions:

- resolve canonical URL for an entity and locale;
- resolve localized URL for an entity and locale;
- resolve x-default URL;
- resolve hreflang cluster;
- resolve whether a page is indexable;
- resolve whether a page is eligible for sitemap;
- resolve internal link target;
- resolve redirect target for old slugs;
- resolve language switcher targets.

Hard rule:

- public components must not manually compose localized URLs.

Current project note:

- existing helpers such as `lib/routes.ts`, `lib/sitemap.ts`, and metadata builders should be consolidated into this resolver layer during implementation.

---

## 6. Metadata and SEO Rules

### 6.1 Canonical

Rules:

- every published localized page canonicalizes to itself;
- a Russian published page should not canonicalize to the English page;
- draft, preview, and machine-only pages must not emit indexable canonical metadata.

### 6.2 Hreflang

Rules:

- hreflang only includes published localized variants;
- each cluster must include a self-reference;
- each listed alternate must reciprocally list the same cluster;
- `x-default` should point to the default English URL or a neutral language selector;
- a missing translation is omitted from the cluster instead of linked.

### 6.3 HTML lang

Rules:

- `<html lang="...">` must reflect the route locale;
- page visible content must match the locale;
- metadata title and description must be localized for indexable pages.

### 6.4 Structured data

Rules:

- URLs inside JSON-LD must use the same localized URL resolver;
- breadcrumbs must point to published same-language URLs;
- product/category/article schema must not reference draft localized pages.

---

## 7. Sitemap Rules

### 7.1 Eligibility

A URL can appear in sitemap only when all conditions are true:

- language status is `published`;
- page localization status is `published`;
- URL returns 200;
- page is indexable;
- canonical URL equals the submitted URL;
- no redirect is required;
- hreflang cluster is valid if alternates are emitted.

These checks apply continuously, not only during the first language launch. If a new product is added after a language has launched, that product must still pass the same per-locale eligibility rules before it enters the localized sitemap.

### 7.2 Sitemap segmentation

Recommended structure:

- sitemap index;
- default English sitemap;
- per-locale sitemap;
- optional image sitemap per locale/entity type.

This keeps audits small and makes it easier to remove or pause one language without touching all other languages.

### 7.3 Static and dynamic content

Static page sitemap entries must be controlled by page keys and language states.

Dynamic entries must be controlled by:

- entity publication status;
- localization publication status;
- redirect maps;
- canonical rules.

---

## 8. Fallback and Edge Cases

### 8.1 Missing localized page

Behavior:

- public route returns 404;
- admin preview may show fallback context with `noindex`;
- no sitemap entry;
- no hreflang target;
- no language switcher target.

### 8.2 Existing localized page becomes unpublished

Behavior:

- remove from sitemap;
- remove from hreflang clusters;
- remove from language switcher;
- keep URL returning 404 or a noindex unavailable page;
- create admin alert for affected incoming internal links.

### 8.3 Source English page becomes unpublished

Behavior:

- all localized children are blocked from sitemap until reviewed;
- if the entity no longer exists, localized pages should be retired or redirected intentionally.

### 8.4 Slug changes

Behavior:

- old URL redirects to new canonical URL;
- old URL is never included in sitemap;
- hreflang only references final canonical URLs.

### 8.5 Unsupported locale

Behavior:

- return 404;
- do not redirect automatically to English except for explicitly designed root language selection flows.

---

## 9. P1 Deliverables

Required deliverables:

- locale configuration model;
- route and URL resolver design;
- sitemap eligibility rules;
- hreflang generation rules;
- x-default rules;
- preview/noindex behavior;
- redirect handling rules;
- link-integrity gate specification;
- admin language status workflow;
- implementation checklist for current App Router routes.

---

## 10. P1 Acceptance Criteria

P1 is complete when:

- a language can stay in `draft` or `prelaunch` without exposing any public search URLs;
- sitemap output contains only eligible published URLs;
- hreflang output contains only valid published reciprocal alternates;
- missing localized pages do not render indexable English fallback content;
- internal URL generation uses a centralized resolver;
- the GSC link integrity gate can block a language release.
