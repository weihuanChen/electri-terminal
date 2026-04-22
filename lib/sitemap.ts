import "server-only";

import { getAdminConvexClient } from "@/lib/convex-admin";
import { getSiteUrl, toAbsoluteSiteUrl } from "@/lib/site";

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
};

export type SitemapImageEntry = {
  pageUrl: string;
  lastModified?: Date;
  images: Array<{
    url: string;
    title?: string;
  }>;
};

const STATIC_PAGE_ENTRIES: SitemapPageEntry[] = [
  { url: toAbsoluteSiteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: toAbsoluteSiteUrl("/categories"), changeFrequency: "weekly", priority: 0.9 },
  { url: toAbsoluteSiteUrl("/products"), changeFrequency: "weekly", priority: 0.9 },
  { url: toAbsoluteSiteUrl("/manufacturing"), changeFrequency: "weekly", priority: 0.8 },
  { url: toAbsoluteSiteUrl("/selection-guide"), changeFrequency: "weekly", priority: 0.8 },
  { url: toAbsoluteSiteUrl("/resources"), changeFrequency: "weekly", priority: 0.8 },
  { url: toAbsoluteSiteUrl("/blog"), changeFrequency: "weekly", priority: 0.8 },
  { url: toAbsoluteSiteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
  { url: toAbsoluteSiteUrl("/rfq"), changeFrequency: "monthly", priority: 0.6 },
];

function toDate(timestamp?: number) {
  return typeof timestamp === "number" ? new Date(timestamp) : undefined;
}

function normalizeCanonicalUrl(canonical?: string, fallbackPath?: string) {
  if (canonical?.trim()) {
    return toAbsoluteSiteUrl(canonical.trim());
  }
  if (!fallbackPath) {
    throw new Error("Missing sitemap fallback path.");
  }
  return toAbsoluteSiteUrl(fallbackPath);
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

  return images
    .map((image) => {
      const normalizedUrl = normalizeImageUrl(image.url);
      if (!normalizedUrl || seen.has(normalizedUrl)) {
        return null;
      }
      seen.add(normalizedUrl);
      return {
        url: normalizedUrl,
        title: image.title?.trim() || undefined,
      };
    })
    .filter((image): image is { url: string; title?: string } => Boolean(image));
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

export async function buildSitemapEntries() {
  const content = await fetchSitemapContent();

  return [
    ...STATIC_PAGE_ENTRIES,
    ...content.categories.map((category) => ({
      url: normalizeCanonicalUrl(category.canonical, `/categories/${category.slug}`),
      lastModified: toDate(category.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...content.families.map((family) => ({
      url: normalizeCanonicalUrl(family.canonical, `/families/${family.slug}`),
      lastModified: toDate(family.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...content.products.map((product) => ({
      url: normalizeCanonicalUrl(product.canonical, `/products/${product.slug}`),
      lastModified: toDate(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...content.articles.map((article) => ({
      url: normalizeCanonicalUrl(article.canonical, `/blog/${article.slug}`),
      lastModified: toDate(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

export async function buildImageSitemapEntries() {
  const content = await fetchSitemapContent();

  const entries: SitemapImageEntry[] = [];

  for (const category of content.categories) {
    const images = dedupeImages([{ url: category.image, title: category.slug }]);
    if (!images.length) continue;
    entries.push({
      pageUrl: normalizeCanonicalUrl(category.canonical, `/categories/${category.slug}`),
      lastModified: toDate(category.updatedAt),
      images,
    });
  }

  for (const family of content.families) {
    const images = dedupeImages(
      (family.mediaItems ?? []).map((item) => ({
        url: item.url,
        title: item.alt || family.slug,
      }))
    );
    if (!images.length) continue;
    entries.push({
      pageUrl: normalizeCanonicalUrl(family.canonical, `/families/${family.slug}`),
      lastModified: toDate(family.updatedAt),
      images,
    });
  }

  for (const product of content.products) {
    const images = dedupeImages(
      (product.mediaItems ?? []).map((item) => ({
        url: item.url,
        title: item.alt || product.slug,
      }))
    );
    if (!images.length) continue;
    entries.push({
      pageUrl: normalizeCanonicalUrl(product.canonical, `/products/${product.slug}`),
      lastModified: toDate(product.updatedAt),
      images,
    });
  }

  for (const article of content.articles) {
    const images = dedupeImages([{ url: article.coverImage, title: article.title }]);
    if (!images.length) continue;
    entries.push({
      pageUrl: normalizeCanonicalUrl(article.canonical, `/blog/${article.slug}`),
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
