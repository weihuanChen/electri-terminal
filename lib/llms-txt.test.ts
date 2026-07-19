import { describe, expect, it } from "vitest";

import {
  buildLlmsTxt,
  normalizeLlmsDescription,
  scoreLlmsTxtCandidate,
  selectLlmsTxtPages,
  type LlmsTxtPageCandidate,
} from "./llms-txt";

const NOW = Date.UTC(2026, 6, 19);

function candidate(
  overrides: Partial<LlmsTxtPageCandidate> = {}
): LlmsTxtPageCandidate {
  const id = overrides.id ?? "test";
  return {
    id,
    kind: "article",
    section: "guides",
    title: `Page ${id}`,
    description: "A useful technical description for industrial buyers.",
    url: `https://electriterminal.com/blog/${id}`,
    ...overrides,
  };
}

describe("llms.txt generation", () => {
  it("normalizes markdown, whitespace, and long descriptions", () => {
    const normalized = normalizeLlmsDescription(
      `## Guide\n\nRead [the full reference](https://example.com) with **technical details**. ${"word ".repeat(50)}`
    );

    expect(normalized).not.toMatch(/[#*\[\]]/);
    expect(normalized).toContain("Read the full reference");
    expect(normalized.length).toBeLessThanOrEqual(180);
    expect(normalized.endsWith("…")).toBe(true);
  });

  it("scores curated, complete, connected, and recent pages higher", () => {
    const basic = candidate({ kind: "family", section: "families" });
    const strong = candidate({
      kind: "family",
      section: "families",
      featured: true,
      visibleInNavigation: true,
      contentSignalCount: 3,
      relatedCount: 8,
      updatedAt: NOW - 30 * 24 * 60 * 60 * 1000,
    });

    expect(scoreLlmsTxtCandidate(strong, NOW)).toBeGreaterThan(
      scoreLlmsTxtCandidate(basic, NOW)
    );
  });

  it("enforces section quotas and per-family diversity", () => {
    const pages = selectLlmsTxtPages(
      Array.from({ length: 20 }, (_, index) =>
        candidate({
          id: `product-${index}`,
          kind: "product",
          section: "products",
          groupId: `family-${Math.floor(index / 2)}`,
          featured: true,
          sortOrder: index,
          url: `https://electriterminal.com/products/product-${index}`,
        })
      ),
      NOW
    );

    expect(pages).toHaveLength(6);
    const familyCounts = pages.reduce<Record<string, number>>((counts, page) => {
      const group = page.groupId ?? "none";
      counts[group] = (counts[group] ?? 0) + 1;
      return counts;
    }, {});
    expect(Math.max(...Object.values(familyCounts))).toBeLessThanOrEqual(2);
  });

  it("rejects external, query-bearing, and duplicate canonical URLs", () => {
    const pages = selectLlmsTxtPages(
      [
        candidate({ id: "valid" }),
        candidate({ id: "external", url: "https://example.com/page" }),
        candidate({
          id: "query",
          url: "https://electriterminal.com/products/a?variant=1",
        }),
        candidate({
          id: "duplicate",
          canonical: "https://electriterminal.com/blog/valid",
        }),
      ],
      NOW
    );

    expect(pages.map((page) => page.id)).toEqual(["valid"]);
  });

  it("renders the official heading order and Optional section", () => {
    const output = buildLlmsTxt(
      [
        candidate({
          id: "selection",
          kind: "static",
          section: "core",
          title: "Selection [Guide]",
          url: "https://electriterminal.com/selection-guide",
          baseScore: 100,
        }),
        candidate({
          id: "resources",
          kind: "static",
          section: "optional",
          title: "Resources",
          url: "https://electriterminal.com/resources",
        }),
      ],
      NOW
    );

    expect(output).toMatch(/^# Electri Terminal\n\n> /);
    expect(output).toContain("## Engineering & Capabilities");
    expect(output).toContain("## Optional");
    expect(output).toContain(
      "[Selection Guide](https://electriterminal.com/selection-guide)"
    );
    expect(output).not.toContain("## Featured Products");
    expect(output.endsWith("\n")).toBe(true);
  });
});
