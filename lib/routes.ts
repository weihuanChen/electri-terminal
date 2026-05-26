import { resolveFamilySlug } from "@/lib/familyRedirects";
import { resolveProductSlug } from "@/lib/productRedirects";

export function categoryUrl(slug: string) {
  return `/categories/${slug}`;
}

export function familyUrl(slug: string) {
  return `/families/${resolveFamilySlug(slug)}`;
}

export function productUrl(slug: string) {
  return `/products/${resolveProductSlug(slug)}`;
}
