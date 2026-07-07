import { defineRouting } from "next-intl/routing";

import {
  DEFAULT_LOCALE,
  LOCALE_PREFIXES,
  SUPPORTED_LOCALES,
} from "./config";

export const nextIntlRouting = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: {
    mode: "as-needed",
    prefixes: {
      en: "/en",
      ru: LOCALE_PREFIXES.ru,
    },
  },
  localeDetection: false,
  alternateLinks: false,
});
