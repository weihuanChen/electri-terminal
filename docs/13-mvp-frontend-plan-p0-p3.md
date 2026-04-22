# MVP Frontend Plan (P0-P3)

## 1. Scope and Positioning

### Primary positioning
- Ring Terminals Manufacturer
- Small vertical authority site, not broad catalogue site

### Secondary positioning
- Cable Gland Manufacturer
- Light marketing only in MVP phase (factory capability + real images + inquiry CTA)
- No commitment to full cable gland parameter library in current stage

### MVP objective
- Build a trustworthy, conversion-capable frontend for B2B inquiry
- Align every public promise with current real delivery capability
- Deliver page depth for ring terminals first, then expand

---

## 2. Updated Phase Structure

This plan keeps `P0-P3`, and inserts one new stage `P0.5` to avoid visual rework during later implementation.

- `P0`: Truthful copy and promise alignment
- `P0.5` (new): Visual foundation refactor (dark neutral + orange + blue system)
- `P1`: Homepage repositioning (primary ring terminals, secondary cable gland)
- `P2`: Category reinforcement (3+ pages) + cable gland light-marketing landing
- `P3`: Product page completion (10-20 pages) with application guidance and stronger conversion

---

## 3. Phase Details

## P0 - Truthful Copy Alignment

### Goal
Remove over-promising and align public content with current operational reality.

### Core copy rules
- Use: `Custom product documentation available upon request.`
- Use: `MOQ and lead time are confirmed per item number and order quantity.`
- Use: `Certificates are available for selected models upon request.`
- Avoid unconditional claims about downloadable full catalog, fixed MOQ, fixed lead time, full certification package.

### Page scope
- Homepage trust/download/certification sections
- Resources page copy and CTA wording
- Category/Product CTA and helper notes
- Header/Footer support wording (remove misleading documentation promises)

### Deliverables
- Unified copy baseline document for all frontend sections
- Updated copy in key templates and shared components

### Acceptance
- No hard promise remains for unavailable assets
- Copy tone is technical, concise, factual

---

## P0.5 - Visual Foundation Refactor (New)

### Goal
Establish one stable visual system before structural page changes.

### Why this phase is inserted
- Current components contain mixed historical styles.
- If style refactor starts after P1/P2, component rework will duplicate effort.

### Core work
- Define color tokens and usage budget (70/20/10)
- Refactor global variables and base component tokens
- Standardize button, card, border, typography hierarchy
- Normalize dark-neutral backgrounds and light reading blocks

### Deliverables
- Frontend style spec document (linked in `docs/14-frontend-style-rebuild-spec.md`)
- P0.5 execution summary document (linked in `docs/15-p0.5-visual-foundation-summary.md`)
- Updated `globals.css` token system design plan
- Component-level style migration checklist

### Acceptance
- Same visual language on homepage/category/product/blog templates
- Accent colors used only for intent (CTA, states, highlights), not large surfaces

---

## P1 - Homepage Repositioning

### Goal
Turn homepage into a focused entry point for ring terminals authority, with cable gland as secondary capability.

### Information hierarchy
- Hero: Ring Terminals Manufacturer (clear positioning, no empty slogan)
- Proof block: ring families and product depth
- Real factory visuals: production and QA authenticity
- Secondary capability block: cable gland manufacturing capability (light marketing)
- Strong CTA pair:
  - Browse Ring Terminal Products
  - Request Quote with Item No.

### Content principles
- Real images first (factory and product)
- Replace generic stock-first storytelling
- Keep structured industrial tone

### Deliverables
- New homepage section order and content map
- Updated hero and conversion modules
- Cable gland secondary block with clear scope statement

### Acceptance
- Homepage can explain in 5-8 seconds: what we manufacture, what user can do next
- Clear separation: ring terminals primary, cable gland secondary

---

## P2 - Category Reinforcement

### Goal
Deliver minimum category-layer authority pages that support SEO and inquiry conversion.

### Required category targets
- At least 3 categories fully completed
- Recommended first set:
  - ring-terminals
  - fork-terminals
  - spade-terminals

### Required sections per category
- Intro copy (technical, non-generic)
- Product/series listing
- FAQ block (4-6 Q&A minimum)

### Cable gland treatment in P2
- Add one cable gland landing/category page for light marketing
- Include:
  - manufacturing capability summary
  - typical use scenarios
  - image-led credibility
  - inquiry CTA
- Do not force deep technical tables before parameter data is ready

### Deliverables
- 3+ production-ready category pages
- FAQ content batch (category-specific)
- 1 cable gland light-marketing page

### Acceptance
- Category pages satisfy: intro + listing + FAQ
- Cable gland page can receive qualified inquiry without over-promising specs

---

## P3 - Product Page Completion (10-20 pages)

### Goal
Make ring terminal product pages decision-ready and inquiry-ready.

### Scope
- 10-20 product pages first (ring terminals cluster)
- Ensure consistency in structure and data expression

### Required sections
- Technical parameters (spec table + variant rows)
- Real product photos / drawing media
- Application guidance (new required block)
- Inquiry path with item number context

### Conversion logic updates
- Inquiry CTA wording optimized for B2B sourcing workflow
- Reduce generic download dependency
- Keep documentation/certificate request as on-demand support action

### Deliverables
- Product page module spec including application section
- 10-20 published pages with complete core blocks

### Acceptance
- User can complete evaluation path: identify model -> confirm key specs -> submit inquiry
- Product pages match factual capability and current data readiness

---

## 4. Governance and Quality Gate

### Shared quality standards
- Clean / Industrial / Minimal / Authentic / Structured
- No marketing exaggeration
- No placeholder-like dead links in core conversion path
- Mobile and desktop readability both pass

### Validation per phase
- `P0`: copy QA pass
- `P0.5`: visual token and component consistency QA pass
- `P1`: homepage hierarchy and CTA clarity pass
- `P2`: category completeness checklist pass
- `P3`: product completeness and conversion flow pass

---

## 5. Out of Scope for P0-P3

- Large-scale blog expansion beyond minimum architecture linkage
- Full cable gland parameter system and deep SKU technical matrix
- Multi-language rollout

These can be moved into next phase (P4+).
