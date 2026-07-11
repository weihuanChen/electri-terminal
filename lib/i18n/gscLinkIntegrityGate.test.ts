import { describe, expect, it, vi } from "vitest";

vi.mock("./localizedRenderer", () => ({
  hasLocalizedRouteRenderer: (kind: string) =>
    ["category", "family", "product"].includes(kind),
}));

import { buildGscCandidate } from "@/tests/fixtures/i18n";

import {
  assertGscLinkIntegrityGate,
  resolveExpectedGscUrl,
  runGscLinkIntegrityGate,
} from "./gscLinkIntegrityGate";

function issueCodes(overrides: Parameters<typeof buildGscCandidate>[0] = {}) {
  return runGscLinkIntegrityGate([buildGscCandidate(overrides)]).issues.map(
    (issue) => issue.code
  );
}

describe("GSC link integrity gate", () => {
  it("passes a clean English candidate graph", () => {
    const checkedAt = "2026-07-10T00:00:00.000Z";
    const report = runGscLinkIntegrityGate([buildGscCandidate()], checkedAt);

    expect(report).toMatchObject({
      passed: true,
      blocksGscExposure: false,
      checkedAt,
      checkedLocaleCount: 1,
      candidateUrlCount: 1,
      sitemapUrlCount: 1,
      hreflangClusterCount: 1,
    });
    expect(report.issues).toEqual([]);
    expect(report.reportId).toMatch(/^gsc-link-integrity:fnv1a:/);
    expect(() => assertGscLinkIntegrityGate(report)).not.toThrow();
  });

  it.each([
    [{ url: "https://example.com/products/a" }, "invalid_or_external_candidate_url"],
    [{ locale: "ru" as const }, "candidate_locale_mismatch"],
    [{ url: "https://electriterminal.com/products/a?q=1" }, "sitemap_url_has_query_or_hash"],
    [{ indexable: false }, "candidate_noindex"],
    [{ sitemapEligible: false }, "candidate_not_sitemap_eligible"],
    [{ canonical: undefined }, "missing_canonical"],
    [
      { canonical: "https://electriterminal.com/products/other" },
      "canonical_mismatch",
    ],
    [
      { redirectTarget: "https://electriterminal.com/products/other" },
      "candidate_requires_redirect",
    ],
  ] as const)("reports %s", (overrides, expectedCode) => {
    expect(issueCodes(overrides)).toContain(expectedCode);
  });

  it("blocks draft-language candidates and missing localized renderers", () => {
    const url = "https://electriterminal.com/ru/contact";
    const codes = issueCodes({
      locale: "ru",
      url,
      canonical: url,
      entity: { type: "staticPage", key: "contact" },
      alternates: undefined,
    });

    expect(codes).toEqual(
      expect.arrayContaining([
        "language_not_published",
        "sitemap_disabled_with_candidates",
        "localized_renderer_not_configured",
      ])
    );
  });

  it("detects duplicate candidates", () => {
    const candidate = buildGscCandidate();
    const report = runGscLinkIntegrityGate([candidate, { ...candidate }]);
    expect(report.issues.map((issue) => issue.code)).toContain(
      "duplicate_gsc_candidate_url"
    );
  });

  it.each([
    [{ languages: { "x-default": "https://electriterminal.com/products/test-product" } }, "hreflang_missing_self_reference"],
    [{ languages: { en: "https://electriterminal.com/products/test-product" } }, "hreflang_missing_x_default"],
    [{ languages: { en: "https://example.com/products/a", "x-default": "https://electriterminal.com/products/test-product" } }, "invalid_hreflang_target"],
    [{ languages: { fr: "https://electriterminal.com/fr/products/a", en: "https://electriterminal.com/products/test-product", "x-default": "https://electriterminal.com/products/test-product" } }, "unsupported_hreflang_locale"],
  ] as const)("validates hreflang clusters", (alternates, expectedCode) => {
    expect(issueCodes({ alternates })).toContain(expectedCode);
  });

  it("rejects draft-language and query-bearing hreflang targets", () => {
    const target = "https://electriterminal.com/ru/products/test-product?q=1";
    const codes = issueCodes({
      alternates: {
        languages: {
          en: "https://electriterminal.com/products/test-product",
          ru: target,
          "x-default": "https://electriterminal.com/products/test-product",
        },
      },
    });

    expect(codes).toEqual(
      expect.arrayContaining([
        "hreflang_target_language_not_published",
        "hreflang_target_language_disabled",
        "hreflang_target_has_query_or_hash",
      ])
    );
  });

  it("throws an actionable error for failed reports", () => {
    const report = runGscLinkIntegrityGate([
      buildGscCandidate({ canonical: undefined }),
    ]);
    expect(() => assertGscLinkIntegrityGate(report)).toThrow(
      /GSC link integrity gate failed: missing_canonical/
    );
  });

  it("resolves expected localized GSC URLs", () => {
    expect(
      resolveExpectedGscUrl({ type: "product", slug: "test-product" }, "ru")
    ).toBe("https://electriterminal.com/ru/products/test-product");
  });
});
