export const FAMILY_REDIRECTS = [
  {
    sourceSlug: "cold-press-ring-terminals",
    destinationSlug: "standard-ring-terminals",
  },
  {
    sourceSlug: "fully-insulated-quick-disconnects",
    destinationSlug: "fully-insulated-terminals",
  },
] as const;

const redirectedFamilySlugs = new Set<string>(
  FAMILY_REDIRECTS.map((redirect) => redirect.sourceSlug)
);

const familyRedirectDestinationBySourceSlug = new Map<string, string>(
  FAMILY_REDIRECTS.map((redirect) => [redirect.sourceSlug, redirect.destinationSlug])
);

export function isRedirectedFamilySlug(slug: string) {
  return redirectedFamilySlugs.has(slug);
}

export function resolveFamilySlug(slug: string) {
  return familyRedirectDestinationBySourceSlug.get(slug) ?? slug;
}
