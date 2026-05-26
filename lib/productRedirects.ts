export const PRODUCT_REDIRECTS = [
  {
    sourceSlug: "easy-entry-insulated-spade-terminals-g03",
    destinationSlug: "vinyl-insulated-blade-terminals-g01",
  },
  {
    sourceSlug: "non-insulated-spade-terminals-g01",
    destinationSlug: "non-insulated-ring-terminals-g05",
  },
  {
    sourceSlug: "non-insulated-spade-terminals-g02",
    destinationSlug: "non-insulated-ring-terminals-g06",
  },
] as const;

const redirectedProductSlugs = new Set<string>(
  PRODUCT_REDIRECTS.map((redirect) => redirect.sourceSlug)
);

const productRedirectDestinationBySourceSlug = new Map<string, string>(
  PRODUCT_REDIRECTS.map((redirect) => [redirect.sourceSlug, redirect.destinationSlug])
);

export function isRedirectedProductSlug(slug: string) {
  return redirectedProductSlugs.has(slug);
}

export function resolveProductSlug(slug: string) {
  return productRedirectDestinationBySourceSlug.get(slug) ?? slug;
}
