import { describe, expect, it } from "vitest";

import {
  getPathLocale,
  normalizePublicPath,
  resolveAbsoluteUrl,
  resolveArticleUrl,
  resolveBlogPageUrl,
  resolveCanonicalUrl,
  resolveCategoryUrl,
  resolveEntityPath,
  resolveHreflangCluster,
  resolveInternalLinkTarget,
  resolveLanguageSwitcherTargets,
  resolveLocalizedPath,
  resolvePageIndexability,
  resolveProductUrl,
  resolveStaticPageUrl,
  resolveSitemapEligibility,
  stripLocalePrefix,
} from "./urlResolver";

describe("public URL resolution", () => {
  it.each([
    ["", "/"],
    [" products//uk-2-5/// ", "/products/uk-2-5"],
    ["/products/uk-2-5?tab=specs#rating", "/products/uk-2-5?tab=specs#rating"],
    ["https://electriterminal.com/ru/products/a?q=1#x", "/ru/products/a?q=1#x"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizePublicPath(input)).toBe(expected);
  });

  it("adds, replaces and removes locale prefixes", () => {
    expect(resolveLocalizedPath("/products/a", "ru")).toBe("/ru/products/a");
    expect(resolveLocalizedPath("/ru/products/a", "en")).toBe("/products/a");
    expect(resolveLocalizedPath("/en/products/a", "ru")).toBe("/ru/products/a");
    expect(resolveLocalizedPath("/", "ru")).toBe("/ru");
    expect(getPathLocale("/ru/products/a")).toBe("ru");
    expect(getPathLocale("/products/a")).toBeUndefined();
    expect(stripLocalePrefix("/ru")).toEqual({ locale: "ru", path: "/" });
  });

  it("builds entity paths and localized URLs", () => {
    expect(resolveEntityPath({ type: "category", slug: "terminals" })).toBe(
      "/categories/terminals"
    );
    expect(resolveCategoryUrl("terminals", { locale: "ru" })).toBe(
      "/ru/categories/terminals"
    );
    expect(resolveProductUrl("uk-2-5", { locale: "ru" })).toBe(
      "/ru/products/uk-2-5"
    );
    expect(resolveArticleUrl("guide", { locale: "ru" })).toBe("/ru/blog/guide");
    expect(resolveBlogPageUrl(1)).toBe("/blog");
    expect(resolveBlogPageUrl(3)).toBe("/blog/page/3");
    expect(resolveStaticPageUrl("contact", { absolute: true })).toBe(
      "https://electriterminal.com/contact"
    );
    expect(resolveEntityPath({ type: "customPath", path: "/custom" })).toBe("/custom");
  });

  it("keeps external absolute URLs unchanged and localizes internal absolute URLs", () => {
    expect(resolveAbsoluteUrl("https://electriterminal.com/products/a")).toBe(
      "https://electriterminal.com/products/a"
    );
    expect(resolveAbsoluteUrl("https://example.com/products/a", "ru")).toBe(
      "https://example.com/products/a"
    );
    expect(resolveAbsoluteUrl("https://electriterminal.com/products/a?q=1", "ru")).toBe(
      "https://electriterminal.com/ru/products/a?q=1"
    );
  });

  it("only emits canonical URLs for indexable pages", () => {
    expect(
      resolveCanonicalUrl({ fallbackPath: "/products/a", locale: "en" })
    ).toBe("https://electriterminal.com/products/a");
    expect(
      resolveCanonicalUrl({ fallbackPath: "/products/a", locale: "ru", indexable: false })
    ).toBeUndefined();
  });

  it("fails indexability closed", () => {
    expect(
      resolvePageIndexability({
        locale: "en",
        sourceStatus: "published",
        localizationStatus: "published",
      })
    ).toEqual({ indexable: true, reasons: [] });

    const blocked = resolvePageIndexability({
      locale: "ru",
      sourceStatus: "draft",
      localizationStatus: "missing",
      preview: true,
      robotsIndex: false,
    });
    expect(blocked.indexable).toBe(false);
    expect(blocked.reasons).toEqual(
      expect.arrayContaining([
        "preview",
        "language_not_published",
        "source_not_published",
        "translation_not_published",
        "localization_not_published",
        "robots_noindex",
      ])
    );
  });

  it("rejects sitemap entries with redirects or canonical mismatches", () => {
    const result = resolveSitemapEligibility({
      locale: "en",
      sourceStatus: "published",
      localizationStatus: "published",
      url: "https://electriterminal.com/products/a",
      canonicalUrl: "https://electriterminal.com/products/b",
      redirectTarget: "https://electriterminal.com/products/b",
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining(["url_requires_redirect", "canonical_mismatch"])
    );
  });

  it("accepts a clean English sitemap entry", () => {
    expect(
      resolveSitemapEligibility({
        locale: "en",
        sourceStatus: "published",
        localizationStatus: "published",
        url: "https://electriterminal.com/products/a",
        canonicalUrl: "https://electriterminal.com/products/a",
        redirectTarget: null,
      })
    ).toEqual({ eligible: true, reasons: [] });
  });

  it("does not expose draft Russian hreflang, switcher or internal links", () => {
    const entity = { type: "product", slug: "a" } as const;
    expect(
      resolveHreflangCluster({
        entity,
        localizationStatusByLocale: { en: "published", ru: "published" },
      })
    ).toEqual({
      en: "https://electriterminal.com/products/a",
      "x-default": "https://electriterminal.com/products/a",
    });
    expect(resolveLanguageSwitcherTargets({ entity })).toHaveLength(1);
    expect(
      resolveLanguageSwitcherTargets({ entity, currentLocale: "en" })[0]
    ).toMatchObject({ locale: "en", isCurrent: true, href: "/products/a" });
    expect(resolveInternalLinkTarget({ entity, locale: "ru" })).toBeNull();
    expect(
      resolveInternalLinkTarget({
        entity,
        locale: "ru",
        localizationStatusByLocale: { ru: "published" },
      })
    ).toBe("/ru/products/a");
  });
});
