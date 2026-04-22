# Frontend Style Rebuild Spec (MVP)

## 1. Visual Direction

Keywords:
- Clean
- Industrial
- Minimal
- Authentic
- Structured

Theme strategy:
- Dark-neutral dominant visual identity
- High-contrast content readability zones
- Limited but intentional accent usage

---

## 2. Color System (70 / 20 / 10)

## 2.1 Ratio
- 70% dark neutral surfaces (charcoal / deep gray, not pure black)
- 20% light content surfaces (white / light gray for reading density)
- 10% accent colors (high-voltage orange + blue accent)

## 2.2 Recommended palette
- `Neutral-950` (main dark): `#12161B`
- `Neutral-900`: `#1A1F26`
- `Neutral-800`: `#232A33`
- `Neutral-200` (light block border): `#D5DAE1`
- `Neutral-100` (light block bg): `#EEF1F4`
- `White`: `#FFFFFF`

- `Orange-500` (high pressure CTA): `#F97316`
- `Orange-600` (hover/active): `#EA580C`
- `Blue-500` (link/filter accent): `#2F6EA8`
- `Blue-600` (active state): `#245987`

Note:
- Avoid `#000000` as main background.
- Keep accents for actions and highlights, not large decorative fills.

---

## 3. Accent Allocation Inside the 10%

Recommended split inside accent usage:
- 7% orange (primary conversion action, key callouts)
- 3% blue (navigation active state, technical links, secondary emphasis)

Usage priority:
- Orange first: primary CTA, key conversion buttons, critical tags
- Blue second: active nav, anchors, secondary CTA, data highlight

---

## 4. Page Surface Model

## 4.1 Dark-neutral zones (70%)
- Header and global nav background
- Hero background and section separators
- Feature rail / capability strips
- Footer background

## 4.2 Light zones (20%)
- SEO-heavy content blocks
- Long-form technical copy area
- spec table container and FAQ container
- Blog article body container

## 4.3 Accent zones (10%)
- Primary and secondary CTA
- Hover states and active filters/tabs
- Key metric labels and section indicators

---

## 5. Component-Level Style Rules

## 5.1 Header / Navigation
- Dark-neutral fixed header
- Active nav uses blue accent + subtle underline
- Inquiry CTA uses orange

## 5.2 Buttons
- Primary button: orange background + dark text or white text by contrast check
- Secondary button: dark-neutral outline or blue outline depending context
- Avoid oversized rounded corners; keep controlled industrial radius

## 5.3 Cards and Tables
- Use clear border structure, low shadow, high information density
- Tables prioritize row readability and technical scan efficiency

## 5.4 Typography
- Keep hierarchy tight and structured
- Avoid large marketing headline gaps
- Body text in light zones should maintain strong contrast ratio

---

## 6. Imagery Rules (Authentic First)

- Factory and product real photos preferred over stock
- If stock must be used temporarily, isolate to non-core blocks and mark for replacement
- Maintain consistent treatment:
  - mild contrast boost
  - controlled saturation
  - no heavy stylized overlays

Image role order:
1. Real factory/process evidence
2. Real product and dimension context
3. Supporting atmosphere visuals

---

## 7. MVP Implementation Mapping

This style refactor is executed in `P0.5` before large page restructuring:
- Token and global style base
- Shared components (header/footer/button/card/table)
- Homepage key sections
- Category and product templates

Expected effect:
- Reduce duplicated restyling in P1-P3
- Ensure consistent visual output while content and structure evolve

---

## 8. QA Checklist

- No pure black large background blocks
- Color usage approximately follows 70/20/10
- Orange and blue are not used together in competing CTA within same visual focus area
- Content-heavy areas remain on light blocks for readability
- Mobile and desktop contrast/readability both pass
- Core conversion actions are visually obvious within first viewport

