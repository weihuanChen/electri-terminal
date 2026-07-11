import type { Locale } from "./config";

export type LanguageMapping = {
  locale: Locale;
  bcp47: string;
  htmlLang: string;
  ogLocale: string;
  schemaLanguage: string;
  displayName: string;
  nativeName: string;
  fallbackLocale: Locale;
};

export const LANGUAGE_MAPPINGS = {
  en: {
    locale: "en",
    bcp47: "en",
    htmlLang: "en",
    ogLocale: "en_US",
    schemaLanguage: "en",
    displayName: "English",
    nativeName: "English",
    fallbackLocale: "en",
  },
  ru: {
    locale: "ru",
    bcp47: "ru",
    htmlLang: "ru",
    ogLocale: "ru_RU",
    schemaLanguage: "ru",
    displayName: "Russian",
    nativeName: "Русский",
    fallbackLocale: "en",
  },
} as const satisfies Record<Locale, LanguageMapping>;

export function getLanguageMapping(locale: Locale): LanguageMapping {
  return LANGUAGE_MAPPINGS[locale];
}
