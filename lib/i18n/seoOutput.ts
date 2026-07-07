import type { Metadata } from "next";

import { DEFAULT_LOCALE, type Locale } from "./config";
import {
  type LocalizationStatus,
  type PublicUrlEntityRef,
  resolveAbsoluteUrl,
  resolveCanonicalUrl,
  resolveEntityUrl,
  resolveHreflangCluster,
  resolvePageIndexability,
  resolveRedirectTarget,
  resolveSitemapEligibility,
} from "./urlResolver";

export type SeoOutputInput = {
  locale?: Locale;
  entity?: PublicUrlEntityRef;
  fallbackPath: string;
  canonical?: string;
  sourceStatus?: string;
  localizationStatus?: LocalizationStatus;
  localizationStatusByLocale?: Partial<Record<Locale, LocalizationStatus>>;
  preview?: boolean;
  robots?: Metadata["robots"];
};

export type SeoOutput = {
  locale: Locale;
  url: string;
  canonical?: string;
  metadataAlternates?: Metadata["alternates"];
  sitemapAlternates?: {
    languages?: Record<string, string>;
  };
  robots: Metadata["robots"];
  indexable: boolean;
  indexabilityReasons: string[];
  sitemapEligible: boolean;
  sitemapReasons: string[];
};

export function makeSeoRobots(indexable: boolean): Metadata["robots"] {
  return {
    index: indexable,
    follow: indexable,
    googleBot: {
      index: indexable,
      follow: indexable,
      "max-image-preview": indexable ? "large" : "none",
      "max-snippet": indexable ? -1 : 0,
      "max-video-preview": indexable ? -1 : 0,
    },
  };
}

export function isRobotsIndexable(robots: Metadata["robots"]) {
  if (!robots || typeof robots !== "object" || Array.isArray(robots)) {
    return true;
  }

  return robots.index !== false;
}

function getSeoEntity(input: Pick<SeoOutputInput, "entity" | "fallbackPath">) {
  return input.entity ?? ({ type: "customPath", path: input.fallbackPath } as const);
}

function getSubmittedUrl({
  entity,
  fallbackPath,
  locale,
}: {
  entity?: PublicUrlEntityRef;
  fallbackPath: string;
  locale: Locale;
}) {
  return entity
    ? resolveEntityUrl(entity, { locale, absolute: true })
    : resolveAbsoluteUrl(fallbackPath, locale);
}

export function resolveSeoOutput({
  locale = DEFAULT_LOCALE,
  entity,
  fallbackPath,
  canonical,
  sourceStatus,
  localizationStatus,
  localizationStatusByLocale = {},
  preview = false,
  robots,
}: SeoOutputInput): SeoOutput {
  const effectiveLocalizationStatus =
    localizationStatus ?? (locale === DEFAULT_LOCALE ? "published" : "missing");
  const indexability = resolvePageIndexability({
    locale,
    sourceStatus,
    localizationStatus: effectiveLocalizationStatus,
    preview,
    robotsIndex: isRobotsIndexable(robots),
  });
  const resolvedRobots = robots ?? makeSeoRobots(indexability.indexable);
  const url = getSubmittedUrl({ entity, fallbackPath, locale });
  const canonicalUrl = resolveCanonicalUrl({
    canonical,
    fallbackPath,
    locale,
    indexable: indexability.indexable,
  });
  const hreflangStatuses = {
    ...localizationStatusByLocale,
    [locale]: effectiveLocalizationStatus,
  };
  const hreflangCluster = indexability.indexable
    ? resolveHreflangCluster({
        entity: getSeoEntity({ entity, fallbackPath }),
        localizationStatusByLocale: hreflangStatuses,
      })
    : undefined;
  const redirectTarget = entity
    ? resolveRedirectTarget(entity, { locale, absolute: true })
    : null;
  const sitemapEligibility = resolveSitemapEligibility({
    url,
    canonicalUrl,
    redirectTarget,
    locale,
    sourceStatus,
    localizationStatus: effectiveLocalizationStatus,
    preview,
    robotsIndex: isRobotsIndexable(resolvedRobots),
  });

  return {
    locale,
    url,
    canonical: canonicalUrl,
    metadataAlternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
          languages: hreflangCluster,
        }
      : undefined,
    sitemapAlternates: hreflangCluster
      ? {
          languages: hreflangCluster,
        }
      : undefined,
    robots: resolvedRobots,
    indexable: indexability.indexable,
    indexabilityReasons: indexability.reasons,
    sitemapEligible: sitemapEligibility.eligible,
    sitemapReasons: sitemapEligibility.reasons,
  };
}
