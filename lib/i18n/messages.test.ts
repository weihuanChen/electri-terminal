import { describe, expect, it } from "vitest";
import { SUPPORTED_LOCALES } from "./config";
import { LANGUAGE_MAPPINGS } from "./languageMap";
import { TERMINOLOGY } from "./terminology";
import en from "../../messages/en.json";
import ru from "../../messages/ru.json";

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      Object.entries(flatten(child, prefix ? `${prefix}.${key}` : key))
    )
  );
}

describe("shared i18n messages", () => {
  const english = flatten(en);
  const russian = flatten(ru);

  it("keeps message keys in parity and values non-empty", () => {
    expect(Object.keys(russian).sort()).toEqual(Object.keys(english).sort());
    expect(Object.values(english).every((value) => value.trim().length > 0)).toBe(true);
    expect(Object.values(russian).every((value) => value.trim().length > 0)).toBe(true);
  });

  it("maps every supported locale", () => {
    expect(Object.keys(LANGUAGE_MAPPINGS).sort()).toEqual([...SUPPORTED_LOCALES].sort());
  });

  it("keeps preferred UI terms aligned with the catalogs", () => {
    expect(TERMINOLOGY.productFamily.preferred).toEqual({
      en: english["common.productFamily"],
      ru: russian["common.productFamily"],
    });
    expect(TERMINOLOGY.specifications.preferred).toEqual({
      en: english["catalog.specifications"],
      ru: russian["catalog.specifications"],
    });
    expect(TERMINOLOGY.requestQuote.preferred).toEqual({
      en: english["catalog.requestQuote"],
      ru: russian["catalog.requestQuote"],
    });
  });

  it("does not translate protected technical tokens", () => {
    for (const entry of Object.values(TERMINOLOGY)) {
      if ("protected" in entry && entry.protected) {
        expect(entry.preferred.ru).toBe(entry.preferred.en);
      }
    }
  });
});
