import { describe, expect, it } from "vitest";

import { isRobotsIndexable, makeSeoRobots, resolveSeoOutput } from "./seoOutput";

describe("SEO output", () => {
  it("produces a self-canonical indexable English page", () => {
    const output = resolveSeoOutput({
      locale: "en",
      entity: { type: "product", slug: "test-product" },
      fallbackPath: "/products/test-product",
      sourceStatus: "published",
      localizationStatus: "published",
    });

    expect(output.indexable).toBe(true);
    expect(output.sitemapEligible).toBe(true);
    expect(output.url).toBe("https://electriterminal.com/products/test-product");
    expect(output.canonical).toBe(output.url);
    expect(output.metadataAlternates?.languages).toEqual({
      en: output.url,
      "x-default": output.url,
    });
  });

  it("fails a draft Russian translation closed", () => {
    const output = resolveSeoOutput({
      locale: "ru",
      entity: { type: "product", slug: "test-product" },
      fallbackPath: "/products/test-product",
      sourceStatus: "published",
      localizationStatus: "draft",
    });

    expect(output.indexable).toBe(false);
    expect(output.sitemapEligible).toBe(false);
    expect(output.canonical).toBeUndefined();
    expect(output.metadataAlternates).toBeUndefined();
    expect(output.indexabilityReasons).toEqual(
      expect.arrayContaining([
        "language_not_published",
        "translation_not_published",
        "localization_not_published",
      ])
    );
  });

  it("honors explicit noindex robots", () => {
    const robots = makeSeoRobots(false);
    expect(isRobotsIndexable(undefined)).toBe(true);
    expect(isRobotsIndexable("noindex")).toBe(true);
    expect(isRobotsIndexable(robots)).toBe(false);

    const output = resolveSeoOutput({
      fallbackPath: "/contact",
      sourceStatus: "published",
      localizationStatus: "published",
      robots,
    });
    expect(output.indexable).toBe(false);
    expect(output.indexabilityReasons).toContain("robots_noindex");
  });
});
