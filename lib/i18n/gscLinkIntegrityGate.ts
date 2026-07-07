import { getSiteUrl } from "@/lib/site";

import {
  DEFAULT_LOCALE,
  LANGUAGE_CONFIGS,
  type Locale,
  type LanguageConfig,
  getLanguageConfig,
  isLocale,
} from "./config";
import type {
  LocalizationStatus,
  PublicUrlEntityRef,
  UrlResolverOptions,
} from "./urlResolver";
import {
  getPathLocale,
  resolveEntityUrl,
  resolveRedirectTarget,
} from "./urlResolver";
import type { SeoOutput } from "./seoOutput";
import { hasLocalizedRouteRenderer } from "./localizedRenderer";
import type { LocalizedRouteKind } from "./localizedRoutes";

export type GscLinkIntegritySeverity = "blocker" | "high" | "medium" | "low";

export type GscLinkIntegrityIssue = {
  severity: GscLinkIntegritySeverity;
  code: string;
  message: string;
  source?: string;
  sourceLocale?: Locale;
  sourceUrl?: string;
  targetLocale?: Locale | "x-default";
  targetUrl?: string;
  entity?: PublicUrlEntityRef;
  reasons?: string[];
};

export type GscLinkIntegrityCandidateSource =
  | "sitemap"
  | "hreflang"
  | "metadata"
  | "language-switcher"
  | "internal-link"
  | "structured-data";

export type GscLinkIntegrityCandidate = {
  source: GscLinkIntegrityCandidateSource;
  locale: Locale;
  url: string;
  canonical?: string;
  entity?: PublicUrlEntityRef;
  indexable?: boolean;
  indexabilityReasons?: string[];
  sitemapEligible?: boolean;
  sitemapReasons?: string[];
  redirectTarget?: string | null;
  sourceStatus?: string;
  localizationStatus?: LocalizationStatus;
  alternates?: {
    languages?: Record<string, string>;
  };
};

export type GscLinkIntegrityReport = {
  passed: boolean;
  blocksGscExposure: boolean;
  issueCounts: Record<GscLinkIntegritySeverity, number>;
  issues: GscLinkIntegrityIssue[];
  checkedAt: string;
  checkedLocaleCount: number;
  candidateUrlCount: number;
  sitemapUrlCount: number;
  hreflangClusterCount: number;
  checksum: string;
  reportId: string;
};

type CandidateLocaleContext = {
  config: LanguageConfig;
  candidates: GscLinkIntegrityCandidate[];
};

function normalizeAbsoluteUrl(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value, `${getSiteUrl()}/`).toString();
  } catch {
    return null;
  }
}

function getInternalUrl(value?: string) {
  const absoluteUrl = normalizeAbsoluteUrl(value);
  if (!absoluteUrl) {
    return null;
  }

  const parsedUrl = new URL(absoluteUrl);
  const siteUrl = new URL(getSiteUrl());

  return parsedUrl.origin === siteUrl.origin ? parsedUrl : null;
}

function inferUrlLocale(url: URL) {
  return getPathLocale(`${url.pathname}${url.search}${url.hash}`) ?? DEFAULT_LOCALE;
}

function matchesLocalePrefix(locale: Locale, url: URL) {
  const config = getLanguageConfig(locale);
  const prefix = config.urlPrefix;

  if (!prefix) {
    return (
      inferUrlLocale(url) === DEFAULT_LOCALE &&
      url.pathname !== `/${locale}` &&
      !url.pathname.startsWith(`/${locale}/`)
    );
  }

  return url.pathname === prefix || url.pathname.startsWith(`${prefix}/`);
}

function hasSearchOrHash(url: URL) {
  return Boolean(url.search || url.hash);
}

function makeChecksum(values: string[]) {
  const input = values.sort().join("\n");
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function makeIssue(issue: GscLinkIntegrityIssue): GscLinkIntegrityIssue {
  return issue;
}

function countIssues(issues: GscLinkIntegrityIssue[]) {
  return issues.reduce<Record<GscLinkIntegritySeverity, number>>(
    (counts, issue) => {
      counts[issue.severity] += 1;
      return counts;
    },
    { blocker: 0, high: 0, medium: 0, low: 0 }
  );
}

function validateCandidateUrl(candidate: GscLinkIntegrityCandidate) {
  const issues: GscLinkIntegrityIssue[] = [];
  const parsedUrl = getInternalUrl(candidate.url);
  const normalizedUrl = normalizeAbsoluteUrl(candidate.url);

  if (!normalizedUrl || !parsedUrl) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "invalid_or_external_candidate_url",
        message: "GSC candidate URL must be a valid internal absolute URL.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: candidate.url,
        entity: candidate.entity,
      })
    );
    return issues;
  }

  const urlLocale = inferUrlLocale(parsedUrl);

  if (urlLocale !== candidate.locale || !matchesLocalePrefix(candidate.locale, parsedUrl)) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "candidate_locale_mismatch",
        message: "GSC candidate URL does not match its declared locale prefix.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: normalizedUrl,
        targetLocale: urlLocale,
        entity: candidate.entity,
      })
    );
  }

  if (candidate.source === "sitemap" && hasSearchOrHash(parsedUrl)) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "sitemap_url_has_query_or_hash",
        message: "Sitemap URLs must not include query strings or fragments.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: normalizedUrl,
        entity: candidate.entity,
      })
    );
  }

  return issues;
}

function validateCandidateSeo(candidate: GscLinkIntegrityCandidate) {
  const issues: GscLinkIntegrityIssue[] = [];
  const normalizedUrl = normalizeAbsoluteUrl(candidate.url);
  const normalizedCanonical = normalizeAbsoluteUrl(candidate.canonical);
  const redirectTarget =
    candidate.redirectTarget ??
    (candidate.entity
      ? resolveRedirectTarget(candidate.entity, {
          locale: candidate.locale,
          absolute: true,
        } satisfies UrlResolverOptions)
      : undefined) ??
    undefined;
  const normalizedRedirectTarget = normalizeAbsoluteUrl(redirectTarget);

  if (candidate.indexable === false) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "candidate_noindex",
        message: "GSC candidate is not indexable.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: normalizedUrl ?? candidate.url,
        entity: candidate.entity,
        reasons: candidate.indexabilityReasons,
      })
    );
  }

  if (candidate.sitemapEligible === false) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "candidate_not_sitemap_eligible",
        message: "GSC candidate is not eligible for sitemap exposure.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: normalizedUrl ?? candidate.url,
        entity: candidate.entity,
        reasons: candidate.sitemapReasons,
      })
    );
  }

  if (!normalizedCanonical) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "missing_canonical",
        message: "GSC candidate must have a canonical URL.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: normalizedUrl ?? candidate.url,
        entity: candidate.entity,
      })
    );
  } else if (normalizedUrl && normalizedCanonical !== normalizedUrl) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "canonical_mismatch",
        message: "GSC candidate must canonicalize to itself.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: normalizedUrl,
        targetUrl: normalizedCanonical,
        entity: candidate.entity,
      })
    );
  }

  if (normalizedRedirectTarget && normalizedRedirectTarget !== normalizedUrl) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "candidate_requires_redirect",
        message: "Redirect source URLs must not be exposed to GSC.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: normalizedUrl ?? candidate.url,
        targetUrl: normalizedRedirectTarget,
        entity: candidate.entity,
      })
    );
  }

  return issues;
}

function getLocalizedRendererKind(entity?: PublicUrlEntityRef): LocalizedRouteKind | null {
  if (!entity || entity.type === "customPath") {
    return null;
  }

  return entity.type;
}

function validateLocalizedRenderer(candidate: GscLinkIntegrityCandidate) {
  const issues: GscLinkIntegrityIssue[] = [];

  if (candidate.locale === DEFAULT_LOCALE) {
    return issues;
  }

  const rendererKind = getLocalizedRendererKind(candidate.entity);
  if (!rendererKind || hasLocalizedRouteRenderer(rendererKind)) {
    return issues;
  }

  issues.push(
    makeIssue({
      severity: "blocker",
      code: "localized_renderer_not_configured",
      message: "A non-default locale candidate must have a configured localized renderer.",
      source: candidate.source,
      sourceLocale: candidate.locale,
      sourceUrl: candidate.url,
      entity: candidate.entity,
      reasons: [rendererKind],
    })
  );

  return issues;
}

function validateAlternateTarget({
  candidate,
  alternateLocale,
  targetUrl,
}: {
  candidate: GscLinkIntegrityCandidate;
  alternateLocale: Locale | "x-default";
  targetUrl: string;
}) {
  const issues: GscLinkIntegrityIssue[] = [];
  const normalizedTargetUrl = normalizeAbsoluteUrl(targetUrl);
  const parsedTargetUrl = getInternalUrl(targetUrl);

  if (!normalizedTargetUrl || !parsedTargetUrl) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "invalid_hreflang_target",
        message: "Hreflang target must be a valid internal absolute URL.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: candidate.url,
        targetLocale: alternateLocale,
        targetUrl,
        entity: candidate.entity,
      })
    );
    return issues;
  }

  const expectedLocale = alternateLocale === "x-default" ? DEFAULT_LOCALE : alternateLocale;
  const targetLocale = inferUrlLocale(parsedTargetUrl);

  if (targetLocale !== expectedLocale || !matchesLocalePrefix(expectedLocale, parsedTargetUrl)) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "hreflang_locale_mismatch",
        message: "Hreflang target URL does not match its declared locale.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: candidate.url,
        targetLocale: alternateLocale,
        targetUrl: normalizedTargetUrl,
        entity: candidate.entity,
      })
    );
  }

  if (hasSearchOrHash(parsedTargetUrl)) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "hreflang_target_has_query_or_hash",
        message: "Hreflang targets must not include query strings or fragments.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: candidate.url,
        targetLocale: alternateLocale,
        targetUrl: normalizedTargetUrl,
        entity: candidate.entity,
      })
    );
  }

  return issues;
}

function validateCandidateHreflang(candidate: GscLinkIntegrityCandidate) {
  const issues: GscLinkIntegrityIssue[] = [];
  const languages = candidate.alternates?.languages;

  if (!languages) {
    return issues;
  }

  const selfUrl = normalizeAbsoluteUrl(candidate.url);
  const selfAlternateUrl = normalizeAbsoluteUrl(languages[candidate.locale]);

  if (!selfAlternateUrl || selfAlternateUrl !== selfUrl) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "hreflang_missing_self_reference",
        message: "Hreflang cluster must include a self-reference.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: selfUrl ?? candidate.url,
        targetLocale: candidate.locale,
        targetUrl: languages[candidate.locale],
        entity: candidate.entity,
      })
    );
  }

  if (!languages["x-default"]) {
    issues.push(
      makeIssue({
        severity: "blocker",
        code: "hreflang_missing_x_default",
        message: "Hreflang cluster must include x-default.",
        source: candidate.source,
        sourceLocale: candidate.locale,
        sourceUrl: selfUrl ?? candidate.url,
        targetLocale: "x-default",
        entity: candidate.entity,
      })
    );
  }

  for (const [localeKey, targetUrl] of Object.entries(languages)) {
    if (localeKey !== "x-default" && !isLocale(localeKey)) {
      issues.push(
        makeIssue({
          severity: "blocker",
          code: "unsupported_hreflang_locale",
          message: "Hreflang cluster references an unsupported locale.",
          source: candidate.source,
          sourceLocale: candidate.locale,
          sourceUrl: selfUrl ?? candidate.url,
          targetUrl,
          entity: candidate.entity,
        })
      );
      continue;
    }

    const alternateLocale = localeKey === "x-default" ? "x-default" : (localeKey as Locale);
    const expectedLocale = alternateLocale === "x-default" ? DEFAULT_LOCALE : alternateLocale;
    const config = getLanguageConfig(expectedLocale);

    if (alternateLocale !== "x-default" && config.status !== "published") {
      issues.push(
        makeIssue({
          severity: "blocker",
          code: "hreflang_target_language_not_published",
          message: "Hreflang target locale must be published.",
          source: candidate.source,
          sourceLocale: candidate.locale,
          sourceUrl: selfUrl ?? candidate.url,
          targetLocale: alternateLocale,
          targetUrl,
          entity: candidate.entity,
        })
      );
    }

    if (alternateLocale !== "x-default" && !config.hreflangEnabled) {
      issues.push(
        makeIssue({
          severity: "blocker",
          code: "hreflang_target_language_disabled",
          message: "Hreflang target locale must have hreflang enabled.",
          source: candidate.source,
          sourceLocale: candidate.locale,
          sourceUrl: selfUrl ?? candidate.url,
          targetLocale: alternateLocale,
          targetUrl,
          entity: candidate.entity,
        })
      );
    }

    issues.push(
      ...validateAlternateTarget({
        candidate,
        alternateLocale,
        targetUrl,
      })
    );
  }

  return issues;
}

function validateLanguageContexts(contexts: Map<Locale, CandidateLocaleContext>) {
  const issues: GscLinkIntegrityIssue[] = [];

  for (const [locale, context] of contexts) {
    if (!context.candidates.length) {
      continue;
    }

    if (context.config.status !== "published") {
      issues.push(
        makeIssue({
          severity: "blocker",
          code: "language_not_published",
          message: "Only published languages can expose GSC candidates.",
          sourceLocale: locale,
        })
      );
    }

    if (!context.config.sitemapEnabled) {
      issues.push(
        makeIssue({
          severity: "blocker",
          code: "sitemap_disabled_with_candidates",
          message: "A locale with sitemap disabled must not expose sitemap candidates.",
          sourceLocale: locale,
        })
      );
    }
  }

  return issues;
}

function validateDuplicateUrls(candidates: GscLinkIntegrityCandidate[]) {
  const issues: GscLinkIntegrityIssue[] = [];
  const seen = new Map<string, GscLinkIntegrityCandidate>();

  for (const candidate of candidates) {
    const normalizedUrl = normalizeAbsoluteUrl(candidate.url);
    if (!normalizedUrl) {
      continue;
    }

    const previousCandidate = seen.get(normalizedUrl);
    if (previousCandidate) {
      issues.push(
        makeIssue({
          severity: "blocker",
          code: "duplicate_gsc_candidate_url",
          message: "A GSC candidate URL can only appear once.",
          source: candidate.source,
          sourceLocale: candidate.locale,
          sourceUrl: normalizedUrl,
          entity: candidate.entity,
          targetUrl: previousCandidate.url,
        })
      );
      continue;
    }

    seen.set(normalizedUrl, candidate);
  }

  return issues;
}

function validateReciprocalHreflang(candidates: GscLinkIntegrityCandidate[]) {
  const issues: GscLinkIntegrityIssue[] = [];
  const candidateByUrl = new Map<string, GscLinkIntegrityCandidate>();

  for (const candidate of candidates) {
    const normalizedUrl = normalizeAbsoluteUrl(candidate.url);
    if (normalizedUrl) {
      candidateByUrl.set(normalizedUrl, candidate);
    }
  }

  for (const candidate of candidates) {
    const languages = candidate.alternates?.languages;
    const sourceUrl = normalizeAbsoluteUrl(candidate.url);
    if (!languages || !sourceUrl) {
      continue;
    }

    for (const [localeKey, targetUrl] of Object.entries(languages)) {
      if (localeKey === "x-default") {
        continue;
      }

      const alternateUrl = normalizeAbsoluteUrl(targetUrl);
      const alternateCandidate = alternateUrl ? candidateByUrl.get(alternateUrl) : undefined;
      if (!alternateCandidate?.alternates?.languages) {
        continue;
      }

      const reciprocalUrl = normalizeAbsoluteUrl(
        alternateCandidate.alternates.languages[candidate.locale]
      );

      if (reciprocalUrl !== sourceUrl) {
        issues.push(
          makeIssue({
            severity: "blocker",
            code: "hreflang_not_reciprocal",
            message: "Hreflang clusters must be reciprocal when both targets are exposed.",
            source: candidate.source,
            sourceLocale: candidate.locale,
            sourceUrl,
            targetUrl: alternateUrl ?? targetUrl,
            targetLocale: isLocale(localeKey) ? localeKey : undefined,
            entity: candidate.entity,
          })
        );
      }
    }
  }

  return issues;
}

function validateGscSubmissionFlags(
  contexts: Map<Locale, CandidateLocaleContext>,
  issues: GscLinkIntegrityIssue[]
) {
  const submissionIssues: GscLinkIntegrityIssue[] = [];

  for (const [locale, context] of contexts) {
    const localeHasBlockingIssues = issues.some(
      (issue) =>
        issue.sourceLocale === locale &&
        (issue.severity === "blocker" || issue.severity === "high")
    );

    if (!context.config.gscSubmissionEnabled) {
      continue;
    }

    if (localeHasBlockingIssues) {
      submissionIssues.push(
        makeIssue({
          severity: "blocker",
          code: "gsc_submission_enabled_before_gate_passes",
          message: "GSC submission cannot stay enabled while the gate has blocking issues.",
          sourceLocale: locale,
        })
      );
    }
  }

  return submissionIssues;
}

export function createGscLinkIntegrityCandidate({
  source,
  locale,
  entity,
  seo,
}: {
  source: GscLinkIntegrityCandidateSource;
  locale?: Locale;
  entity?: PublicUrlEntityRef;
  seo: SeoOutput;
}): GscLinkIntegrityCandidate {
  return {
    source,
    locale: locale ?? seo.locale,
    url: seo.url,
    canonical: seo.canonical,
    entity,
    indexable: seo.indexable,
    indexabilityReasons: seo.indexabilityReasons,
    sitemapEligible: seo.sitemapEligible,
    sitemapReasons: seo.sitemapReasons,
    alternates: seo.sitemapAlternates,
  };
}

export function runGscLinkIntegrityGate(
  candidates: GscLinkIntegrityCandidate[],
  checkedAt = new Date().toISOString()
): GscLinkIntegrityReport {
  const contexts = new Map<Locale, CandidateLocaleContext>();

  for (const locale of Object.keys(LANGUAGE_CONFIGS) as Locale[]) {
    contexts.set(locale, {
      config: getLanguageConfig(locale),
      candidates: [],
    });
  }

  for (const candidate of candidates) {
    contexts.get(candidate.locale)?.candidates.push(candidate);
  }

  let issues = [
    ...validateLanguageContexts(contexts),
    ...validateDuplicateUrls(candidates),
    ...validateReciprocalHreflang(candidates),
  ];

  for (const candidate of candidates) {
    issues = [
      ...issues,
      ...validateCandidateUrl(candidate),
      ...validateCandidateSeo(candidate),
      ...validateLocalizedRenderer(candidate),
      ...validateCandidateHreflang(candidate),
    ];
  }

  issues = [...issues, ...validateGscSubmissionFlags(contexts, issues)];

  const issueCounts = countIssues(issues);
  const blocksGscExposure = issueCounts.blocker > 0 || issueCounts.high > 0;
  const passed = !blocksGscExposure;
  const checksum = makeChecksum(
    candidates.map((candidate) =>
      [
        candidate.source,
        candidate.locale,
        normalizeAbsoluteUrl(candidate.url) ?? candidate.url,
        normalizeAbsoluteUrl(candidate.canonical) ?? candidate.canonical ?? "",
        candidate.indexable === false ? "noindex" : "index",
        candidate.sitemapEligible === false ? "not-sitemap-eligible" : "sitemap-eligible",
      ].join("|")
    )
  );

  return {
    passed,
    blocksGscExposure,
    issueCounts,
    issues,
    checkedAt,
    checkedLocaleCount: Array.from(contexts.values()).filter(
      (context) => context.candidates.length > 0
    ).length,
    candidateUrlCount: candidates.length,
    sitemapUrlCount: candidates.filter((candidate) => candidate.source === "sitemap").length,
    hreflangClusterCount: candidates.filter((candidate) => candidate.alternates?.languages).length,
    checksum,
    reportId: `gsc-link-integrity:${checksum}`,
  };
}

export function assertGscLinkIntegrityGate(report: GscLinkIntegrityReport) {
  if (!report.passed) {
    const issueSummary = report.issues
      .slice(0, 5)
      .map((issue) => `${issue.code}${issue.sourceUrl ? `:${issue.sourceUrl}` : ""}`)
      .join(", ");

    throw new Error(`GSC link integrity gate failed: ${issueSummary}`);
  }
}

export function resolveExpectedGscUrl(entity: PublicUrlEntityRef, locale: Locale) {
  return resolveEntityUrl(entity, { locale, absolute: true });
}
