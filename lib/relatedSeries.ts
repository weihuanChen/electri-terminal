import "server-only";
import { unstable_cache } from "next/cache";
import { queryPublicPage } from "@/lib/metadata";

export const getCachedRelatedSeries = unstable_cache(
  async (familyId: string, categoryId: string) => queryPublicPage<unknown>(
    "frontend:getRelatedSeriesForFamily", { familyId, categoryId }
  ),
  ["related-series-for-family-v1"],
  { revalidate: 300 },
);
