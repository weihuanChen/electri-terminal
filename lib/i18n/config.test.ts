import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  LANGUAGE_CONFIGS,
  REQUIRED_L1_PAGE_KEYS,
  canExposeLocaleToSearch,
  canRenderPrefixedLocale,
  getHreflangLocales,
  getLanguageSwitcherLocales,
  getPublishedLocales,
  getSitemapLocales,
  getStaticPageDefinition,
  isDefaultLocale,
  isLocale,
  resolveLocaleFromPathname,
} from "./config";

describe("i18n config", () => {
  it.each(["en", "ru"])("recognizes supported locale %s", (locale) => {
    expect(isLocale(locale)).toBe(true);
  });

  it.each(["fr", "en-US", "", "products"])(
    "rejects unsupported locale %s",
    (locale) => {
      expect(isLocale(locale)).toBe(false);
    }
  );

  it.each([
    ["/", "en"],
    ["/products/example", "en"],
    ["/ru", "ru"],
    ["/ru/products/example?preview=1", "ru"],
    ["/fr/products/example", "en"],
  ] as const)("resolves %s to %s", (pathname, locale) => {
    expect(resolveLocaleFromPathname(pathname)).toBe(locale);
  });

  it("keeps only English search-visible while Russian is draft", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(LANGUAGE_CONFIGS.en.status).toBe("published");
    expect(LANGUAGE_CONFIGS.ru.status).toBe("draft");
    expect(getPublishedLocales()).toEqual(["en"]);
    expect(getSitemapLocales()).toEqual(["en"]);
    expect(getHreflangLocales()).toEqual(["en"]);
    expect(getLanguageSwitcherLocales()).toEqual(["en"]);
    expect(canExposeLocaleToSearch("en")).toBe(true);
    expect(canExposeLocaleToSearch("ru")).toBe(false);
    expect(canRenderPrefixedLocale("en")).toBe(false);
    expect(canRenderPrefixedLocale("ru")).toBe(false);
  });

  it("defines the required L1 launch set", () => {
    expect(REQUIRED_L1_PAGE_KEYS).toEqual([
      "home",
      "contact",
      "manufacturing",
      "selection-guide",
      "resources",
      "quality-certifications",
    ]);
    expect(getStaticPageDefinition("home")?.path).toBe("/");
    expect(isDefaultLocale("en")).toBe(true);
    expect(isDefaultLocale("ru")).toBe(false);
  });
});
