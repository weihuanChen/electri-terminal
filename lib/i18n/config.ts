export const DEFAULT_LOCALE = "en" as const;
export const PILOT_LOCALE = "ru" as const;
export const I18N_REQUEST_LOCALE_HEADER = "x-electri-locale" as const;

export const SUPPORTED_LOCALES = [DEFAULT_LOCALE, PILOT_LOCALE] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LocaleDirection = "ltr" | "rtl";
export type LocaleStatus = "draft" | "prelaunch" | "published" | "paused";
export type LocalizableEntityType =
  | "staticPage"
  | "category"
  | "family"
  | "product"
  | "article";
export type StaticPageKey =
  | "home"
  | "categories"
  | "products"
  | "manufacturing"
  | "selection-guide"
  | "resources"
  | "quality-certifications"
  | "blog"
  | "contact"
  | "privacy-policy";

export type StaticPageClass = "L1" | "L2" | "L3";

export type StaticPageDefinition = {
  key: StaticPageKey;
  path: string;
  pageClass: StaticPageClass;
  requiredForLanguageLaunch: boolean;
};

export type RequiredL2CoverageRule = {
  entityTypes: Extract<LocalizableEntityType, "category" | "family" | "product">[];
  minimumCoveragePercent: number;
  requirePublishedNavigationTargets: boolean;
  requirePublishedBreadcrumbTargets: boolean;
  blockNewEntitiesUntilTranslationPublished: boolean;
};

export type LanguageConfig = {
  locale: Locale;
  displayName: string;
  nativeDisplayName: string;
  urlPrefix: "" | `/${string}`;
  direction: LocaleDirection;
  status: LocaleStatus;
  defaultFallbackLocale: Locale;
  gscSubmissionEnabled: boolean;
  sitemapEnabled: boolean;
  hreflangEnabled: boolean;
  languageSwitcherEnabled: boolean;
  previewEnabled: boolean;
  requiredL1PageKeys: StaticPageKey[];
  requiredL2CoverageRule: RequiredL2CoverageRule;
  createdAt: string;
  updatedAt: string;
};

const I18N_CONFIG_CREATED_AT = "2026-07-06T00:00:00.000Z";

export const STATIC_PAGE_DEFINITIONS = [
  {
    key: "home",
    path: "/",
    pageClass: "L1",
    requiredForLanguageLaunch: true,
  },
  {
    key: "contact",
    path: "/contact",
    pageClass: "L1",
    requiredForLanguageLaunch: true,
  },
  {
    key: "manufacturing",
    path: "/manufacturing",
    pageClass: "L1",
    requiredForLanguageLaunch: true,
  },
  {
    key: "selection-guide",
    path: "/selection-guide",
    pageClass: "L1",
    requiredForLanguageLaunch: true,
  },
  {
    key: "resources",
    path: "/resources",
    pageClass: "L1",
    requiredForLanguageLaunch: true,
  },
  {
    key: "quality-certifications",
    path: "/quality-certifications",
    pageClass: "L1",
    requiredForLanguageLaunch: true,
  },
  {
    key: "categories",
    path: "/categories",
    pageClass: "L2",
    requiredForLanguageLaunch: true,
  },
  {
    key: "products",
    path: "/products",
    pageClass: "L2",
    requiredForLanguageLaunch: true,
  },
  {
    key: "blog",
    path: "/blog",
    pageClass: "L3",
    requiredForLanguageLaunch: false,
  },
  {
    key: "privacy-policy",
    path: "/privacy-policy",
    pageClass: "L1",
    requiredForLanguageLaunch: false,
  },
] as const satisfies readonly StaticPageDefinition[];

export const REQUIRED_L1_PAGE_KEYS = STATIC_PAGE_DEFINITIONS.filter(
  (page) => page.pageClass === "L1" && page.requiredForLanguageLaunch
).map((page) => page.key);

const DEFAULT_L2_COVERAGE_RULE: RequiredL2CoverageRule = {
  entityTypes: ["category", "family", "product"],
  minimumCoveragePercent: 100,
  requirePublishedNavigationTargets: true,
  requirePublishedBreadcrumbTargets: true,
  blockNewEntitiesUntilTranslationPublished: true,
};

export const LANGUAGE_CONFIGS = {
  en: {
    locale: "en",
    displayName: "English",
    nativeDisplayName: "English",
    urlPrefix: "",
    direction: "ltr",
    status: "published",
    defaultFallbackLocale: "en",
    gscSubmissionEnabled: true,
    sitemapEnabled: true,
    hreflangEnabled: true,
    languageSwitcherEnabled: true,
    previewEnabled: true,
    requiredL1PageKeys: REQUIRED_L1_PAGE_KEYS,
    requiredL2CoverageRule: DEFAULT_L2_COVERAGE_RULE,
    createdAt: I18N_CONFIG_CREATED_AT,
    updatedAt: I18N_CONFIG_CREATED_AT,
  },
  ru: {
    locale: "ru",
    displayName: "Russian",
    nativeDisplayName: "Русский",
    urlPrefix: "/ru",
    direction: "ltr",
    status: "draft",
    defaultFallbackLocale: "en",
    gscSubmissionEnabled: false,
    sitemapEnabled: false,
    hreflangEnabled: false,
    languageSwitcherEnabled: false,
    previewEnabled: false,
    requiredL1PageKeys: REQUIRED_L1_PAGE_KEYS,
    requiredL2CoverageRule: DEFAULT_L2_COVERAGE_RULE,
    createdAt: I18N_CONFIG_CREATED_AT,
    updatedAt: I18N_CONFIG_CREATED_AT,
  },
} as const satisfies Record<Locale, LanguageConfig>;

export const LOCALE_PREFIXES = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, LANGUAGE_CONFIGS[locale].urlPrefix])
) as Record<Locale, LanguageConfig["urlPrefix"]>;

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function resolveLocaleFromPathname(pathname: string): Locale {
  const firstSegment = pathname.split(/[/?#]/).filter(Boolean)[0];
  return firstSegment && isLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
}

export function isDefaultLocale(locale: Locale) {
  return locale === DEFAULT_LOCALE;
}

export function getLanguageConfig(locale: Locale) {
  return LANGUAGE_CONFIGS[locale];
}

export function getStaticPageDefinition(key: StaticPageKey) {
  return STATIC_PAGE_DEFINITIONS.find((page) => page.key === key);
}

export function getPublishedLocales() {
  return SUPPORTED_LOCALES.filter(
    (locale) => LANGUAGE_CONFIGS[locale].status === "published"
  );
}

export function getSitemapLocales() {
  return getPublishedLocales().filter(
    (locale) => LANGUAGE_CONFIGS[locale].sitemapEnabled
  );
}

export function getHreflangLocales() {
  return getPublishedLocales().filter(
    (locale) => LANGUAGE_CONFIGS[locale].hreflangEnabled
  );
}

export function getLanguageSwitcherLocales() {
  return getPublishedLocales().filter(
    (locale) => LANGUAGE_CONFIGS[locale].languageSwitcherEnabled
  );
}

export function canExposeLocaleToSearch(locale: Locale) {
  const config = LANGUAGE_CONFIGS[locale];
  return (
    config.status === "published" &&
    config.sitemapEnabled &&
    config.hreflangEnabled
  );
}

export function canRenderPrefixedLocale(locale: Locale) {
  const status: LocaleStatus = LANGUAGE_CONFIGS[locale].status;
  return !isDefaultLocale(locale) && status === "published";
}
