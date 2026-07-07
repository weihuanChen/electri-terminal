import "server-only";

import { getAdminConvexClient } from "@/lib/convex-admin";
import { BLOG_PAGE_SIZE, getBlogPageCount } from "@/lib/blogPagination";
import { isRedirectedFamilySlug } from "@/lib/familyRedirects";
import {
  DEFAULT_LOCALE,
  STATIC_PAGE_DEFINITIONS,
  type Locale,
  type PublicUrlEntityRef,
  type StaticPageKey,
  createGscLinkIntegrityCandidate,
  matchLocalizedRoute,
  resolveEntityPath,
  resolveSeoOutput,
  resolveTranslationEligibility,
  runGscLinkIntegrityGate,
} from "@/lib/i18n";
import { isRedirectedProductSlug } from "@/lib/productRedirects";
import { getSiteUrl } from "@/lib/site";

type SitemapImage = {
  url?: string;
  alt?: string;
};

type SitemapContent = {
  categories: Array<{
    slug: string;
    canonical?: string;
    updatedAt: number;
    image?: string;
  }>;
  families: Array<{
    slug: string;
    canonical?: string;
    updatedAt: number;
    mediaItems?: SitemapImage[];
  }>;
  products: Array<{
    slug: string;
    canonical?: string;
    updatedAt: number;
    mediaItems?: SitemapImage[];
  }>;
  articles: Array<{
    slug: string;
    canonical?: string;
    updatedAt: number;
    coverImage?: string;
    title: string;
  }>;
};

export type SitemapPageEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
};

export type SitemapImageEntry = {
  pageUrl: string;
  lastModified?: Date;
  images: Array<{
    url: string;
    title?: string;
  }>;
};

const STATIC_PAGE_ENTRY_CONFIGS: Array<
  Omit<SitemapPageEntry, "url" | "alternates"> & { key: StaticPageKey }
> = [
  { key: "home", changeFrequency: "weekly", priority: 1 },
  { key: "categories", changeFrequency: "weekly", priority: 0.9 },
  { key: "products", changeFrequency: "weekly", priority: 0.9 },
  { key: "manufacturing", changeFrequency: "weekly", priority: 0.8 },
  { key: "selection-guide", changeFrequency: "weekly", priority: 0.8 },
  { key: "resources", changeFrequency: "weekly", priority: 0.8 },
  { key: "blog", changeFrequency: "weekly", priority: 0.8 },
  { key: "contact", changeFrequency: "monthly", priority: 0.6 },
  { key: "privacy-policy", changeFrequency: "yearly", priority: 0.4 },
];

const STATIC_PAGE_ENTRIES: SitemapPageEntry[] = STATIC_PAGE_ENTRY_CONFIGS.map(
  ({ key, ...entry }) =>
    buildSitemapPageEntry({
      ...entry,
      entity: { type: "staticPage", key },
      fallbackPath: getStaticPageFallbackPath(key),
    })
).filter((entry): entry is SitemapPageEntry => Boolean(entry));

function toDate(timestamp?: number) {
  return typeof timestamp === "number" ? new Date(timestamp) : undefined;
}

function getStaticPageFallbackPath(key: StaticPageKey) {
  return resolveEntityPath({ type: "staticPage", key });
}

function buildSitemapPageEntry({
  entity,
  fallbackPath,
  canonical,
  lastModified,
  changeFrequency,
  priority,
}: Omit<SitemapPageEntry, "url" | "alternates"> & {
  entity: PublicUrlEntityRef;
  fallbackPath: string;
  canonical?: string;
}): SitemapPageEntry | null {
  const seo = resolveSeoOutput({
    locale: DEFAULT_LOCALE,
    entity,
    fallbackPath,
    canonical,
    sourceStatus: "published",
    localizationStatus: "published",
  });

  if (!seo.sitemapEligible || !seo.canonical) {
    return null;
  }

  const gateReport = runGscLinkIntegrityGate([
    createGscLinkIntegrityCandidate({
      source: "sitemap",
      entity,
      seo,
    }),
  ]);

  if (!gateReport.passed) {
    return null;
  }

  const entry: SitemapPageEntry = {
    url: seo.canonical,
  };

  if (lastModified) {
    entry.lastModified = lastModified;
  }

  if (changeFrequency) {
    entry.changeFrequency = changeFrequency;
  }

  if (priority !== undefined) {
    entry.priority = priority;
  }

  if (seo.sitemapAlternates) {
    entry.alternates = seo.sitemapAlternates;
  }

  return entry;
}

function resolveSitemapPageUrl(
  entity: PublicUrlEntityRef,
  fallbackPath: string,
  canonical?: string
) {
  return (
    buildSitemapPageEntry({
      entity,
      fallbackPath,
      canonical,
    })?.url ?? null
  );
}

function normalizeImageUrl(url?: string) {
  if (!url?.trim()) {
    return null;
  }

  try {
    const absoluteUrl = new URL(url, `${getSiteUrl()}/`).toString();
    return absoluteUrl.startsWith("http://") || absoluteUrl.startsWith("https://")
      ? absoluteUrl
      : null;
  } catch {
    return null;
  }
}

function dedupeImages(images: Array<{ url?: string; title?: string }>) {
  const seen = new Set<string>();
  const dedupedImages: Array<{ url: string; title?: string }> = [];

  for (const image of images) {
    const normalizedUrl = normalizeImageUrl(image.url);
    if (!normalizedUrl || seen.has(normalizedUrl)) {
      continue;
    }
    seen.add(normalizedUrl);
    const title = image.title?.trim();
    dedupedImages.push({
      url: normalizedUrl,
      ...(title ? { title } : {}),
    });
  }

  return dedupedImages;
}

function buildBlogPaginationSitemapEntries(articleCount: number): SitemapPageEntry[] {
  const pageCount = getBlogPageCount(articleCount, BLOG_PAGE_SIZE);

  if (pageCount <= 1) {
    return [];
  }

  return Array.from({ length: pageCount - 1 }, (_, index) => {
    const page = index + 2;
    return buildSitemapPageEntry({
      entity: { type: "blogPage", page },
      fallbackPath: resolveEntityPath({ type: "blogPage", page }),
      changeFrequency: "weekly" as const,
      priority: Number(Math.max(0.3, 0.7 - index * 0.05).toFixed(2)),
    });
  }).filter((entry): entry is SitemapPageEntry => Boolean(entry));
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function fetchSitemapContent() {
  return (await getAdminConvexClient().query("frontend:listSitemapContent", {})) as SitemapContent;
}

function buildSitemapGscCandidatesFromEntries(entries: SitemapPageEntry[]) {
  return entries.map((entry) => ({
    source: "sitemap" as const,
    locale: DEFAULT_LOCALE,
    url: entry.url,
    canonical: entry.url,
    indexable: true,
    sitemapEligible: true,
    alternates: entry.alternates,
  }));
}

async function buildLocaleReleaseCandidate({
  locale,
  entity,
  fallbackPath,
}: {
  locale: Locale;
  entity: PublicUrlEntityRef;
  fallbackPath: string;
}) {
  const route = matchLocalizedRoute(locale, fallbackPath);
  const eligibility =
    locale === DEFAULT_LOCALE || !route
      ? null
      : await resolveTranslationEligibility(locale, route);
  const localizationStatus =
    locale === DEFAULT_LOCALE ? "published" : eligibility?.localizationStatus ?? "missing";
  const sourceStatus =
    locale === DEFAULT_LOCALE ? "published" : eligibility?.sourceStatus ?? "missing";
  const seo = resolveSeoOutput({
    locale,
    entity,
    fallbackPath,
    sourceStatus,
    localizationStatus,
    localizationStatusByLocale: {
      [locale]: localizationStatus,
    },
  });

  return createGscLinkIntegrityCandidate({
    source: "sitemap",
    locale,
    entity,
    seo,
  });
}

export async function buildSitemapEntries() {
  const content = await fetchSitemapContent();
  const sitemapFamilies = content.families.filter((family) => !isRedirectedFamilySlug(family.slug));
  const sitemapProducts = content.products.filter((product) => !isRedirectedProductSlug(product.slug));

  return [
    ...STATIC_PAGE_ENTRIES,
    ...buildBlogPaginationSitemapEntries(content.articles.length),
    ...content.categories.map((category) =>
      buildSitemapPageEntry({
        entity: { type: "category", slug: category.slug },
        fallbackPath: resolveEntityPath({ type: "category", slug: category.slug }),
        canonical: category.canonical,
        lastModified: toDate(category.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    ),
    ...sitemapFamilies.map((family) =>
      buildSitemapPageEntry({
        entity: { type: "family", slug: family.slug },
        fallbackPath: resolveEntityPath({ type: "family", slug: family.slug }),
        canonical: family.canonical,
        lastModified: toDate(family.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    ),
    ...sitemapProducts.map((product) =>
      buildSitemapPageEntry({
        entity: { type: "product", slug: product.slug },
        fallbackPath: resolveEntityPath({ type: "product", slug: product.slug }),
        canonical: product.canonical,
        lastModified: toDate(product.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })
    ),
    ...content.articles.map((article) =>
      buildSitemapPageEntry({
        entity: { type: "article", slug: article.slug },
        fallbackPath: resolveEntityPath({ type: "article", slug: article.slug }),
        canonical: article.canonical,
        lastModified: toDate(article.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })
    ),
  ].filter((entry): entry is SitemapPageEntry => Boolean(entry));
}

export async function buildSitemapGscLinkIntegrityReport() {
  const entries = await buildSitemapEntries();
  const candidates = buildSitemapGscCandidatesFromEntries(entries);

  return runGscLinkIntegrityGate(candidates);
}

export async function buildLocaleReleaseGscLinkIntegrityReport(locale: Locale) {
  if (locale === DEFAULT_LOCALE) {
    return buildSitemapGscLinkIntegrityReport();
  }

  const content = await fetchSitemapContent();
  const sitemapFamilies = content.families.filter((family) => !isRedirectedFamilySlug(family.slug));
  const sitemapProducts = content.products.filter((product) => !isRedirectedProductSlug(product.slug));
  const requiredStaticCandidates = STATIC_PAGE_DEFINITIONS.filter(
    (page) => page.requiredForLanguageLaunch
  ).map((page) =>
    buildLocaleReleaseCandidate({
      locale,
      entity: { type: "staticPage", key: page.key },
      fallbackPath: page.path,
    })
  );
  const catalogCandidates = [
    ...content.categories.map((category) =>
      buildLocaleReleaseCandidate({
        locale,
        entity: { type: "category", slug: category.slug },
        fallbackPath: resolveEntityPath({ type: "category", slug: category.slug }),
      })
    ),
    ...sitemapFamilies.map((family) =>
      buildLocaleReleaseCandidate({
        locale,
        entity: { type: "family", slug: family.slug },
        fallbackPath: resolveEntityPath({ type: "family", slug: family.slug }),
      })
    ),
    ...sitemapProducts.map((product) =>
      buildLocaleReleaseCandidate({
        locale,
        entity: { type: "product", slug: product.slug },
        fallbackPath: resolveEntityPath({ type: "product", slug: product.slug }),
      })
    ),
  ];
  const candidates = await Promise.all([
    ...requiredStaticCandidates,
    ...catalogCandidates,
  ]);

  return runGscLinkIntegrityGate(candidates);
}

export async function buildImageSitemapEntries() {
  const content = await fetchSitemapContent();
  const sitemapFamilies = content.families.filter((family) => !isRedirectedFamilySlug(family.slug));
  const sitemapProducts = content.products.filter((product) => !isRedirectedProductSlug(product.slug));

  const entries: SitemapImageEntry[] = [];

  for (const category of content.categories) {
    const images = dedupeImages([{ url: category.image, title: category.slug }]);
    if (!images.length) continue;
    const pageUrl = resolveSitemapPageUrl(
      { type: "category", slug: category.slug },
      resolveEntityPath({ type: "category", slug: category.slug }),
      category.canonical
    );
    if (!pageUrl) continue;
    entries.push({
      pageUrl,
      lastModified: toDate(category.updatedAt),
      images,
    });
  }

  for (const family of sitemapFamilies) {
    const images = dedupeImages(
      (family.mediaItems ?? []).map((item) => ({
        url: item.url,
        title: item.alt || family.slug,
      }))
    );
    if (!images.length) continue;
    const pageUrl = resolveSitemapPageUrl(
      { type: "family", slug: family.slug },
      resolveEntityPath({ type: "family", slug: family.slug }),
      family.canonical
    );
    if (!pageUrl) continue;
    entries.push({
      pageUrl,
      lastModified: toDate(family.updatedAt),
      images,
    });
  }

  for (const product of sitemapProducts) {
    const images = dedupeImages(
      (product.mediaItems ?? []).map((item) => ({
        url: item.url,
        title: item.alt || product.slug,
      }))
    );
    if (!images.length) continue;
    const pageUrl = resolveSitemapPageUrl(
      { type: "product", slug: product.slug },
      resolveEntityPath({ type: "product", slug: product.slug }),
      product.canonical
    );
    if (!pageUrl) continue;
    entries.push({
      pageUrl,
      lastModified: toDate(product.updatedAt),
      images,
    });
  }

  for (const article of content.articles) {
    const images = dedupeImages([{ url: article.coverImage, title: article.title }]);
    if (!images.length) continue;
    const pageUrl = resolveSitemapPageUrl(
      { type: "article", slug: article.slug },
      resolveEntityPath({ type: "article", slug: article.slug }),
      article.canonical
    );
    if (!pageUrl) continue;
    entries.push({
      pageUrl,
      lastModified: toDate(article.updatedAt),
      images,
    });
  }

  return entries;
}

export async function buildImageSitemapXml() {
  const entries = await buildImageSitemapEntries();

  const xmlBody = entries
    .map((entry) => {
      const imageNodes = entry.images
        .map((image) => {
          const titleNode = image.title
            ? `<image:title>${escapeXml(image.title)}</image:title>`
            : "";

          return `<image:image><image:loc>${escapeXml(image.url)}</image:loc>${titleNode}</image:image>`;
        })
        .join("");

      const lastModifiedNode = entry.lastModified
        ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>`
        : "";

      return `<url><loc>${escapeXml(entry.pageUrl)}</loc>${lastModifiedNode}${imageNodes}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">` +
    `${xmlBody}</urlset>`;
}
