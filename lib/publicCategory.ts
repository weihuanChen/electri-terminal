import "server-only";
import { unstable_cache } from "next/cache";
import { queryPublicPage } from "@/lib/metadata";

// Category facets scan all products in the category. Cache the assembled
// category across requests so metadata, English, and localized pages share it.
export const getCachedCategoryWithChildren = unstable_cache(
  async (slug: string) => queryPublicPage<unknown>("frontend:getCategoryWithChildren", { slug }),
  ["public-category-with-children-v1"],
  { revalidate: 300 },
);
