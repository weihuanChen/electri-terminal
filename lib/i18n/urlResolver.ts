import { resolveFamilySlug } from "@/lib/familyRedirects";
import { resolveProductSlug } from "@/lib/productRedirects";
import { getSiteUrl, toAbsoluteSiteUrl } from "@/lib/site";

import {
  DEFAULT_LOCALE,
  LANGUAGE_CONFIGS,
  type Locale,
  type LocalizableEntityType,
  type StaticPageKey,
  canExposeLocaleToSearch,
  getHreflangLocales,
  getLanguageConfig,
  getLanguageSwitcherLocales,
  getStaticPageDefinition,
  isLocale,
} from "./config";

export type PublicUrlEntityType = LocalizableEntityType | "blogPage" | "customPath";

export type LocalizationStatus =
  | "missing"
  | "draft"
  | "machine_ready"
  | "review_required"
  | "approved"
  | "published"
  | "stale";

export type PublicUrlEntityRef =
  | { type: "staticPage"; key: StaticPageKey }
  | { type: "category"; slug: string }
  | { type: "family"; slug: string }
  | { type: "product"; slug: string }
  | { type: "article"; slug: string }
  | { type: "blogPage"; page: number }
  | { type: "customPath"; path: string };

export type UrlResolverOptions = {
  locale?: Locale;
  absolute?: boolean;
};

export type ResolvedUrl = {
  locale: Locale;
  path: string;
  absoluteUrl: string;
};

export type HreflangCluster = Record<Locale | "x-default", string>;

export type LanguageSwitcherTarget = {
  locale: Locale;
  label: string;
  nativeLabel: string;
  href: string;
  isCurrent: boolean;
};

export type PageIndexabilityInput = {
  locale?: Locale;
  sourceStatus?: string;
  localizationStatus?: LocalizationStatus;
  preview?: boolean;
  robotsIndex?: boolean;
};

export type PageIndexabilityResult = {
  indexable: boolean;
  reasons: string[];
};

export type SitemapEligibilityInput = PageIndexabilityInput & {
  url: string;
  canonicalUrl?: string;
  redirectTarget?: string | null;
};

export type SitemapEligibilityResult = {
  eligible: boolean;
  reasons: string[];
};

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function splitPathSuffix(path: string) {
  const suffixStart = path.search(/[?#]/);
  if (suffixStart === -1) {
    return { pathname: path, suffix: "" };
  }

  return {
    pathname: path.slice(0, suffixStart),
    suffix: path.slice(suffixStart),
  };
}

export function normalizePublicPath(path: string) {
  if (isAbsoluteUrl(path)) {
    const url = new URL(path);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const { pathname, suffix } = splitPathSuffix(withLeadingSlash);
  const normalizedPathname = pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "");

  return `${normalizedPathname || "/"}${suffix}`;
}

export function getPathLocale(path: string) {
  const normalizedPath = normalizePublicPath(path);
  const firstSegment = normalizedPath.split(/[/?#]/)[1];

  return firstSegment && isLocale(firstSegment) ? firstSegment : undefined;
}

export function stripLocalePrefix(path: string) {
  const normalizedPath = normalizePublicPath(path);
  const locale = getPathLocale(normalizedPath);

  if (!locale) {
    return { locale, path: normalizedPath };
  }

  const prefix = `/${locale}`;
  if (normalizedPath !== prefix && !normalizedPath.startsWith(`${prefix}/`)) {
    return { locale, path: normalizedPath };
  }

  const unprefixedPath = normalizedPath.slice(prefix.length);
  return {
    locale,
    path: unprefixedPath.startsWith("/") ? unprefixedPath : `/${unprefixedPath}`,
  };
}

export function resolveLocalizedPath(path: string, locale: Locale = DEFAULT_LOCALE) {
  const { path: unprefixedPath } = stripLocalePrefix(path);
  const normalizedPath = normalizePublicPath(unprefixedPath);
  const prefix = LANGUAGE_CONFIGS[locale].urlPrefix;

  if (!prefix) {
    return normalizedPath;
  }

  return normalizedPath === "/" ? prefix : `${prefix}${normalizedPath}`;
}

export function resolveAbsoluteUrl(pathOrUrl: string, locale?: Locale) {
  if (isAbsoluteUrl(pathOrUrl)) {
    if (!locale) {
      return new URL(pathOrUrl).toString();
    }

    const url = new URL(pathOrUrl);
    const siteUrl = new URL(getSiteUrl());
    if (url.origin !== siteUrl.origin) {
      return url.toString();
    }

    url.pathname = resolveLocalizedPath(url.pathname, locale);
    return url.toString();
  }

  const path = locale ? resolveLocalizedPath(pathOrUrl, locale) : normalizePublicPath(pathOrUrl);
  return toAbsoluteSiteUrl(path);
}

export function resolveEntityPath(entity: PublicUrlEntityRef) {
  switch (entity.type) {
    case "staticPage": {
      const page = getStaticPageDefinition(entity.key);
      if (!page) {
        throw new Error(`Unknown static page key: ${entity.key}`);
      }
      return page.path;
    }
    case "category":
      return `/categories/${entity.slug}`;
    case "family":
      return `/families/${resolveFamilySlug(entity.slug)}`;
    case "product":
      return `/products/${resolveProductSlug(entity.slug)}`;
    case "article":
      return `/blog/${entity.slug}`;
    case "blogPage":
      return entity.page <= 1 ? "/blog" : `/blog/page/${entity.page}`;
    case "customPath":
      return entity.path;
  }
}

export function resolveEntityUrl(entity: PublicUrlEntityRef, options: UrlResolverOptions = {}) {
  const locale = options.locale ?? DEFAULT_LOCALE;
  const path = resolveLocalizedPath(resolveEntityPath(entity), locale);
  const absoluteUrl = resolveAbsoluteUrl(path);
  const resolved: ResolvedUrl = { locale, path, absoluteUrl };

  return options.absolute ? resolved.absoluteUrl : resolved.path;
}

export function resolveStaticPageUrl(key: StaticPageKey, options?: UrlResolverOptions) {
  return resolveEntityUrl({ type: "staticPage", key }, options);
}

export function resolveCategoryUrl(slug: string, options?: UrlResolverOptions) {
  return resolveEntityUrl({ type: "category", slug }, options);
}

export function resolveFamilyUrl(slug: string, options?: UrlResolverOptions) {
  return resolveEntityUrl({ type: "family", slug }, options);
}

export function resolveProductUrl(slug: string, options?: UrlResolverOptions) {
  return resolveEntityUrl({ type: "product", slug }, options);
}

export function resolveArticleUrl(slug: string, options?: UrlResolverOptions) {
  return resolveEntityUrl({ type: "article", slug }, options);
}

export function resolveBlogPageUrl(page: number, options?: UrlResolverOptions) {
  return resolveEntityUrl({ type: "blogPage", page }, options);
}

export function resolveRedirectTarget(entity: PublicUrlEntityRef, options: UrlResolverOptions = {}) {
  if (entity.type === "family") {
    const resolvedSlug = resolveFamilySlug(entity.slug);
    return resolvedSlug === entity.slug ? null : resolveFamilyUrl(resolvedSlug, options);
  }

  if (entity.type === "product") {
    const resolvedSlug = resolveProductSlug(entity.slug);
    return resolvedSlug === entity.slug ? null : resolveProductUrl(resolvedSlug, options);
  }

  return null;
}

export function resolveCanonicalUrl({
  canonical,
  fallbackPath,
  locale = DEFAULT_LOCALE,
  indexable = true,
}: {
  canonical?: string;
  fallbackPath: string;
  locale?: Locale;
  indexable?: boolean;
}) {
  if (!indexable) {
    return undefined;
  }

  const canonicalPath = canonical?.trim() || fallbackPath;
  return resolveAbsoluteUrl(canonicalPath, locale);
}

export function resolveXDefaultUrl(entity: PublicUrlEntityRef) {
  return resolveEntityUrl(entity, {
    locale: DEFAULT_LOCALE,
    absolute: true,
  });
}

export function resolveHreflangCluster({
  entity,
  localizationStatusByLocale = {},
}: {
  entity: PublicUrlEntityRef;
  localizationStatusByLocale?: Partial<Record<Locale, LocalizationStatus>>;
}) {
  const cluster = {} as HreflangCluster;

  for (const locale of getHreflangLocales()) {
    const translationStatus = localizationStatusByLocale[locale];
    if (locale !== DEFAULT_LOCALE && translationStatus !== "published") {
      continue;
    }

    cluster[locale] = resolveEntityUrl(entity, {
      locale,
      absolute: true,
    });
  }

  cluster["x-default"] = resolveXDefaultUrl(entity);

  return cluster;
}

export function resolveHreflangAlternates({
  path,
  localizationStatusByLocale,
}: {
  path: string;
  localizationStatusByLocale?: Partial<Record<Locale, LocalizationStatus>>;
}) {
  return resolveHreflangCluster({
    entity: { type: "customPath", path },
    localizationStatusByLocale,
  });
}

export function resolvePageIndexability({
  locale = DEFAULT_LOCALE,
  sourceStatus,
  localizationStatus,
  preview = false,
  robotsIndex = true,
}: PageIndexabilityInput): PageIndexabilityResult {
  const reasons: string[] = [];
  const language = getLanguageConfig(locale);

  if (preview) {
    reasons.push("preview");
  }

  if (language.status !== "published") {
    reasons.push("language_not_published");
  }

  if (sourceStatus !== undefined && sourceStatus !== "published") {
    reasons.push("source_not_published");
  }

  if (locale !== DEFAULT_LOCALE && localizationStatus !== "published") {
    reasons.push("translation_not_published");
  }

  if (localizationStatus !== undefined && localizationStatus !== "published") {
    reasons.push("localization_not_published");
  }

  if (!robotsIndex) {
    reasons.push("robots_noindex");
  }

  return {
    indexable: reasons.length === 0,
    reasons,
  };
}

export function resolveSitemapEligibility({
  url,
  canonicalUrl,
  redirectTarget,
  ...indexabilityInput
}: SitemapEligibilityInput): SitemapEligibilityResult {
  const locale = indexabilityInput.locale ?? DEFAULT_LOCALE;
  const reasons = [...resolvePageIndexability(indexabilityInput).reasons];

  if (!canExposeLocaleToSearch(locale)) {
    reasons.push("locale_not_search_exposable");
  }

  if (redirectTarget) {
    reasons.push("url_requires_redirect");
  }

  if (canonicalUrl && canonicalUrl !== url) {
    reasons.push("canonical_mismatch");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export function resolveLanguageSwitcherTargets({
  entity,
  currentLocale = DEFAULT_LOCALE,
  localizationStatusByLocale = {},
}: {
  entity: PublicUrlEntityRef;
  currentLocale?: Locale;
  localizationStatusByLocale?: Partial<Record<Locale, LocalizationStatus>>;
}) {
  return getLanguageSwitcherLocales()
    .filter((locale) => {
      if (locale === DEFAULT_LOCALE) return true;
      return localizationStatusByLocale[locale] === "published";
    })
    .map((locale): LanguageSwitcherTarget => {
      const language = getLanguageConfig(locale);

      return {
        locale,
        label: language.displayName,
        nativeLabel: language.nativeDisplayName,
        href: resolveEntityUrl(entity, { locale }),
        isCurrent: locale === currentLocale,
      };
    });
}

export function resolveInternalLinkTarget({
  entity,
  locale = DEFAULT_LOCALE,
  localizationStatusByLocale = {},
}: {
  entity: PublicUrlEntityRef;
  locale?: Locale;
  localizationStatusByLocale?: Partial<Record<Locale, LocalizationStatus>>;
}) {
  if (locale !== DEFAULT_LOCALE && localizationStatusByLocale[locale] !== "published") {
    return null;
  }

  return resolveEntityUrl(entity, { locale });
}
