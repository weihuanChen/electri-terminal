import { getSiteUrl } from "@/lib/site";

import { DEFAULT_LOCALE, type Locale } from "./config";
import { matchLocalizedRoute } from "./localizedRoutes";
import { stripLocalePrefix } from "./urlResolver";

type EntityType = "staticPage" | "category" | "family" | "product" | "article";

export type InternalLinkLocalizationRecord = {
  entityType: EntityType;
  sourceId: string;
  locale: string;
  status: string;
  localizedSlug?: string;
  localizedFields?: Record<string, unknown>;
};

export type InternalLinkSource = {
  entityType: Exclude<EntityType, "staticPage">;
  sourceId: string;
  slug: string;
};

export type InternalLinkIssue = {
  code:
    | "internal_link_target_not_published"
    | "internal_link_target_not_found"
    | "internal_link_locale_mismatch";
  sourceType: EntityType;
  sourceId: string;
  fieldPath: string;
  href: string;
  target?: string;
};

const LINK_FIELD = /(?:href|url|link)$/i;
const MARKDOWN_LINK = /\[[^\]]*\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g;
const HTML_LINK = /\bhref\s*=\s*["']([^"']+)["']/gi;

function collectLinks(value: unknown, path = "localizedFields"): Array<{ href: string; fieldPath: string }> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectLinks(item, `${path}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
      const fieldPath = `${path}.${key}`;
      if (typeof item === "string" && LINK_FIELD.test(key)) {
        return [{ href: item, fieldPath }, ...collectEmbeddedLinks(item, fieldPath)];
      }
      return collectLinks(item, fieldPath);
    });
  }
  return typeof value === "string" ? collectEmbeddedLinks(value, path) : [];
}

function collectEmbeddedLinks(value: string, fieldPath: string) {
  const links: Array<{ href: string; fieldPath: string }> = [];
  for (const pattern of [MARKDOWN_LINK, HTML_LINK]) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value))) links.push({ href: match[1], fieldPath });
  }
  return links;
}

function normalizeInternalHref(href: string) {
  const value = href.trim();
  if (!value || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(value)) return null;
  if (value.startsWith("//")) return null;
  if (/^https?:/i.test(value)) {
    const url = new URL(value);
    if (url.origin !== new URL(getSiteUrl()).origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  }
  return value.startsWith("/") ? value : null;
}

export function auditLocalizedInternalLinks(args: {
  locale: Locale;
  records: InternalLinkLocalizationRecord[];
  sources: InternalLinkSource[];
}): InternalLinkIssue[] {
  if (args.locale === DEFAULT_LOCALE) return [];
  const published = args.records.filter(
    (record) => record.locale === args.locale && record.status === "published"
  );
  const publishedTargets = new Set(
    published.map((record) => `${record.entityType}:${record.sourceId}`)
  );
  const sourceByRoute = new Map<string, InternalLinkSource>();
  for (const source of args.sources) {
    sourceByRoute.set(`${source.entityType}:${source.slug}`, source);
    const localization = published.find(
      (record) => record.entityType === source.entityType && record.sourceId === source.sourceId
    );
    if (localization?.localizedSlug) {
      sourceByRoute.set(`${source.entityType}:${localization.localizedSlug}`, source);
    }
  }

  return published.flatMap<InternalLinkIssue>((source) =>
    collectLinks(source.localizedFields).flatMap<InternalLinkIssue>(({ href, fieldPath }) => {
      const internalHref = normalizeInternalHref(href);
      if (!internalHref) return [];
      const explicitLocale = stripLocalePrefix(internalHref).locale;
      if (explicitLocale && explicitLocale !== args.locale) {
        return [{
          code: "internal_link_locale_mismatch" as const,
          sourceType: source.entityType,
          sourceId: source.sourceId,
          fieldPath,
          href,
        }];
      }
      const path = stripLocalePrefix(internalHref).path.split(/[?#]/)[0] || "/";
      const route = matchLocalizedRoute(args.locale, path);
      if (!route || route.kind === "blogPage") {
        const blogPublished = route?.kind === "blogPage" && publishedTargets.has("staticPage:blog");
        return blogPublished ? [] : [{
          code: "internal_link_target_not_found" as const,
          sourceType: source.entityType,
          sourceId: source.sourceId,
          fieldPath,
          href,
        }];
      }
      const target = route.kind === "staticPage"
        ? `staticPage:${route.pageKey}`
        : sourceByRoute.get(`${route.kind}:${route.slug}`)
          ? `${route.kind}:${sourceByRoute.get(`${route.kind}:${route.slug}`)!.sourceId}`
          : undefined;
      if (!target) {
        return [{
          code: "internal_link_target_not_found" as const,
          sourceType: source.entityType,
          sourceId: source.sourceId,
          fieldPath,
          href,
        }];
      }
      return publishedTargets.has(target) ? [] : [{
        code: "internal_link_target_not_published" as const,
        sourceType: source.entityType,
        sourceId: source.sourceId,
        fieldPath,
        href,
        target,
      }];
    })
  );
}
