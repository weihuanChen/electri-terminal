import {
  type UrlResolverOptions,
  resolveEntityUrl,
  resolveArticleUrl,
  resolveBlogPageUrl,
  resolveCategoryUrl,
  resolveFamilyUrl,
  resolveProductUrl,
  resolveStaticPageUrl,
} from "@/lib/i18n/urlResolver";
import type { StaticPageKey } from "@/lib/i18n/config";

type Fragment = `#${string}` | string;
type PublicUrlQuery = Record<string, string | number | boolean | null | undefined>;

function appendQueryString(href: string, query?: PublicUrlQuery) {
  if (!query) {
    return href;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();

  if (!queryString) {
    return href;
  }

  return `${href}${href.includes("?") ? "&" : "?"}${queryString}`;
}

function appendFragment(href: string, fragment?: Fragment) {
  if (!fragment) {
    return href;
  }

  const normalizedFragment = fragment.startsWith("#") ? fragment : `#${fragment}`;
  return `${href}${normalizedFragment}`;
}

export function staticPageUrl(key: StaticPageKey, options?: UrlResolverOptions) {
  return resolveStaticPageUrl(key, options);
}

export function homeUrl(options?: UrlResolverOptions) {
  return staticPageUrl("home", options);
}

export function categoriesUrl(options?: UrlResolverOptions) {
  return staticPageUrl("categories", options);
}

export function productsUrl(options?: UrlResolverOptions) {
  return staticPageUrl("products", options);
}

export function manufacturingUrl(options?: UrlResolverOptions) {
  return staticPageUrl("manufacturing", options);
}

export function selectionGuideUrl(options?: UrlResolverOptions) {
  return staticPageUrl("selection-guide", options);
}

export function resourcesUrl(options?: UrlResolverOptions) {
  return staticPageUrl("resources", options);
}

export function qualityCertificationsUrl(options?: UrlResolverOptions) {
  return staticPageUrl("quality-certifications", options);
}

export function blogUrl(options?: UrlResolverOptions) {
  return staticPageUrl("blog", options);
}

export function contactUrl(
  options?: UrlResolverOptions & { fragment?: Fragment; query?: PublicUrlQuery }
) {
  const { fragment, query, ...urlOptions } = options ?? {};
  return appendFragment(appendQueryString(staticPageUrl("contact", urlOptions), query), fragment);
}

export function requestQuoteUrl(options?: UrlResolverOptions & { query?: PublicUrlQuery }) {
  return contactUrl({ ...options, fragment: "request-quote" });
}

export function privacyPolicyUrl(options?: UrlResolverOptions) {
  return staticPageUrl("privacy-policy", options);
}

export function searchUrl(query?: string, options?: UrlResolverOptions) {
  const href = resolveEntityUrl({ type: "customPath", path: "/search" }, options);
  const normalizedQuery = query?.trim();
  return normalizedQuery ? `${href}?q=${encodeURIComponent(normalizedQuery)}` : href;
}

export function categoryUrl(slug: string, options?: UrlResolverOptions) {
  return resolveCategoryUrl(slug, options);
}

export function familyUrl(slug: string, options?: UrlResolverOptions) {
  return resolveFamilyUrl(slug, options);
}

export function productUrl(slug: string, options?: UrlResolverOptions) {
  return resolveProductUrl(slug, options);
}

export function articleUrl(slug: string, options?: UrlResolverOptions) {
  return resolveArticleUrl(slug, options);
}

export function blogPageUrl(page: number, options?: UrlResolverOptions) {
  return resolveBlogPageUrl(page, options);
}
