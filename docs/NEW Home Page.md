# New Homepage Prompt (Aligned Final Execution Draft)

## 1. Stage Alignment

This document is the homepage execution brief for MVP `P1`, aligned with:
- `P0`: truthful copy and promise boundary
- `P0.5`: visual system (dark neutral + orange + blue, 70/20/10)
- `P2`: cable gland remains light-marketing, no deep parameter promise

The homepage must not conflict with these boundaries.

---

## 2. Project Goal

Redesign the homepage into a minimal, industrial-style, SEO-friendly B2B landing page with:
- Primary positioning: Ring Terminals Manufacturer
- Secondary capability: Cable Gland Manufacturing (light marketing only)

This is an MVP homepage, not a full corporate portal.
Focus on conversion, clarity, trust, and factual communication.

---

## 3. Core Principles

1. Primary-Secondary Positioning
- Ring terminals are the homepage main narrative.
- Cable gland appears as one secondary capability block only.
- Remove unrelated/incomplete lines from primary homepage flow (for example old UK terminal block emphasis).

2. Minimal but Structured
- Use fewer sections, each with specific purpose.
- No decorative empty blocks.

3. Industrial and Authentic
- Use real factory/production/QA images.
- Avoid abstract “tech concept” visuals.

4. SEO-Friendly Content
- Keep strict H1/H2 hierarchy.
- Ensure key copy is HTML text, not embedded inside images.

5. Conversion-Oriented
- Keep CTA clear in hero and closing block.
- Keep contact and inquiry path visible.

6. Truthful Promise Boundary (Required)
- Use: `Custom product documentation available upon request.`
- Use: `MOQ and lead time are confirmed per item number and order quantity.`
- Use: `Certificates are available for selected models upon request.`
- Avoid fixed MOQ/lead-time promises, full ready-to-download catalog promises, or blanket certificate claims.

---

## 4. Visual Style Guidelines

### 4.1 Color System (aligned with P0.5 token direction)

- Dark neutral surfaces (70%): `#12161B` / `#1A1F26` / `#232A33`
- Light content surfaces (20%): `#FFFFFF` / `#EEF1F4`
- Accent colors (10%):
  - Primary CTA orange: `#F97316` (hover `#EA580C`)
  - Secondary blue: `#2F6EA8` (active `#245987`)

Rules:
- No large pure black (`#000000`) backgrounds.
- Orange is for primary conversion actions.
- Blue is for navigation active state, links, and secondary emphasis.
- Do not place orange/blue as competing primary CTAs in the same focal area.

### 4.2 Typography and Layout

- Clean sans-serif, industrial tone.
- Strong H1, medium H2, readable body.
- Max width 1200-1320px.
- Grid-based structure with clear spacing rhythm.
- Card radius 6-10px, controlled and not overly rounded.

### 4.3 UI Rules

- Avoid heavy glow, heavy gradient overlays, and 3D “futuristic tech” style.
- Keep interaction states clear and restrained.

---

## 5. Homepage Information Architecture and Copy Baseline (Synced)

Build sections in this order and use the following copy baseline.
Source baseline: `docs/new-home-page-seo.md`, with P0 factual boundary adjustments.

### 1) Hero
- H1: `Reliable Ring Terminal Manufacturer for Industrial Wiring`
- Subtext line 1: `High-quality copper ring terminals for secure and stable electrical connections.`
- Subtext line 2: `Custom solutions, flexible production, and fast response for global buyers.`
- Trust line: `Real Factory Production · Flexible MOQ · Custom Solutions · Fast Response`
- CTA Primary: `Request a Quote`
- CTA Secondary: `View Products`
- Mobile fallback: use static hero image when video impacts performance.

### 2) Product Focus (Ring Terminal Families)
- Title: `Explore Our Ring Terminal Range`
- Subtitle: `Designed for different materials, insulation types, and application needs.`
- 3-4 cards, ring terminal scope only.
- Recommended labels:
  - `Insulated Ring Terminals`
  - `Non-Insulated Ring Terminals`
  - `Copper Ring Terminals`
  - `Heavy Duty Ring Terminals`

### 3) Why Choose Us
- Title: `Why Work With Us`
- Point 1: `Real Production, Not Just Trading`
- Point 2: `Flexible Manufacturing`
- Point 3: `Fast Response & Sampling`
- Point 4: `Cost-Aware Production`

### 4) Factory in Action
- Title: `Inside Our Production`
- Text: `From raw material processing to finished terminals - real production, real control.`
- Real factory photo grid first, concise text.

### 5) Featured Ring Terminal Products
- Title: `Selected Ring Terminals`
- 6-8 product cards.
- Card guidance:
  - Show `Model: <item no.>`
  - Keep short description only (no long marketing paragraph)

### 6) Applications
- Title: `Applications`
- Suggested scope: `Control Cabinets / Automotive Wiring / Power Distribution / Industrial Equipment`

### 7) Secondary Capability: Cable Gland and Custom Support
- Title: `Custom Solutions & Extended Products`
- Text baseline:
  - `Beyond standard ring terminals, we also support cable glands, custom terminal designs, and project-based sourcing for special requirements.`
- Keep one text-led block only.
- Must keep phase boundary statement: no deep cable gland parameter library promise in this phase.

### 8) FAQ
- Title: `Frequently Asked Questions`
- Q1: `What are ring terminals used for?`
- Q2: `How do I choose the right ring terminal size?`
- Q3: `Do you support custom specifications?`
- Q4: `What materials are available?`
- Q5: `Do you provide certifications like UL?`

### 9) Final CTA
- Title: `Get a Quote for Your Project`
- Text: `Tell us your requirements. We will respond quickly with suitable options and pricing.`
- Keep factual extension in CTA/helper note:
  - `MOQ and lead time are confirmed per item number and order quantity.`
  - `Certificates are available for selected models upon request.`
- Contact path visible: form + email + WhatsApp.

---

## 6. Removal List

- Old UK terminal block-heavy homepage sections.
- Empty categories or placeholder modules.
- Generic statements like “we are professional manufacturer...” without proof context.
- Fake stock images in core trust blocks.

---

## 7. Mobile and Performance Requirements

### Mobile
- Vertical stacking with clear spacing.
- Maintain early CTA visibility.
- Preserve readable table/card density.

### Performance
- Compress and size images appropriately.
- Lazy load non-critical media.
- Keep animation lightweight and purposeful.

---

## 8. Acceptance Criteria (P1 Homepage Gate)

- In 5-8 seconds, users can identify:
  - what we primarily manufacture (ring terminals)
  - what secondary capability exists (cable gland, light mention)
  - what to do next (clear CTA)
- No copy conflicts with P0 truthful promise boundary.
- Visual implementation follows P0.5 style system.
- Homepage supports inquiry conversion without over-promising unavailable assets.

---

## 9. Component-Level Execution Doc

Implementation breakdown by component:
- `docs/16-homepage-component-execution-p1.md`
