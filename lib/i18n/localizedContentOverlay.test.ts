import { describe, expect, it } from "vitest";

import { buildLocalization } from "@/tests/fixtures/i18n";

import {
  applyCategoryLocalization,
  applyCollectionLocalizations,
  applyFamilyLocalization,
  applyProductLocalization,
  buildLocalizationMap,
  getPublishedLocalization,
  hasPublishedLocalization,
} from "./localizedContentOverlay";

describe("localized content overlay", () => {
  it("applies published product copy without replacing source identity", () => {
    const source = {
      _id: "product-1",
      slug: "uk-2-5",
      sku: "UK-2.5",
      title: "English title",
      summary: "English summary",
    };
    const result = applyProductLocalization(
      source,
      buildLocalization({
        title: "Русский заголовок",
        seoTitle: "Русский SEO",
        localizedFields: {
          summary: "Русское описание",
          featureBullets: [" Первый пункт ", "", 42],
        },
      })
    );

    expect(result).toMatchObject({
      _id: "product-1",
      slug: "uk-2-5",
      sku: "UK-2.5",
      title: "Русский заголовок",
      summary: "Русское описание",
      seoTitle: "Русский SEO",
      featureBullets: ["Первый пункт"],
    });
  });

  it("does not apply fields from a non-published localization", () => {
    const source = { _id: "product-1", title: "English", summary: "Source" };
    const draft = buildLocalization({
      status: "draft",
      title: "Черновик",
      localizedFields: { summary: "Черновое описание" },
    });

    expect(applyProductLocalization(source, draft)).toEqual(source);
    expect(applyCategoryLocalization(source, null)).toEqual(source);
    expect(applyFamilyLocalization(source, draft)).toEqual(source);
  });

  it("ignores empty and malformed optional localized fields", () => {
    const source = {
      _id: "product-1",
      title: "English",
      pageConfig: "source-config",
    };
    const result = applyProductLocalization(
      source,
      buildLocalization({
        localizedFields: {
          title: "   ",
          featureBullets: "not-an-array",
          pageConfig: ["not-an-object"],
          seoDescription: "Localized description",
        },
      })
    );

    expect(result).toEqual({
      ...source,
      seoDescription: "Localized description",
    });
  });

  it("merges structured category and family fields", () => {
    const category = applyCategoryLocalization(
      {
        _id: "category-1",
        name: "English category",
        pageConfig: { content: { heroIntro: "Source", keep: true } },
      },
      buildLocalization({
        entityType: "category",
        sourceId: "category-1",
        title: "Категория",
        localizedFields: {
          summary: "Краткое описание",
          pageConfig: { content: { heroIntro: "Локализовано" } },
        },
      })
    );
    const family = applyFamilyLocalization(
      { _id: "family-1", name: "English", highlights: ["Source"] },
      buildLocalization({
        entityType: "family",
        sourceId: "family-1",
        localizedFields: { name: "Семейство", highlights: ["Преимущество"] },
      })
    );

    expect(category.pageConfig).toEqual({
      content: {
        heroIntro: "Локализовано",
        keep: true,
        summary: "Краткое описание",
      },
    });
    expect(family).toMatchObject({
      name: "Семейство",
      highlights: ["Преимущество"],
    });
  });

  it("indexes only published records and filters missing collection items", () => {
    const published = buildLocalization({ sourceId: "product-1" });
    const draft = buildLocalization({ sourceId: "product-2", status: "draft" });
    const map = buildLocalizationMap([published, draft]);

    expect(hasPublishedLocalization(map, "product-1")).toBe(true);
    expect(hasPublishedLocalization(map, "product-2")).toBe(false);
    expect(hasPublishedLocalization(map)).toBe(false);
    expect(getPublishedLocalization(map, "product-1")).toBe(published);
    expect(getPublishedLocalization(map, "product-2")).toBeUndefined();
    expect(getPublishedLocalization(map)).toBeUndefined();

    const localized = applyCollectionLocalizations(
      [
        { _id: "product-1", title: "One" },
        { _id: "product-2", title: "Two" },
      ],
      map,
      applyProductLocalization
    );
    expect(localized).toHaveLength(1);
    expect(applyCollectionLocalizations(undefined, map, applyProductLocalization)).toEqual([]);
  });
});
