import { NextResponse } from "next/server";

import { queryPublicPage } from "@/lib/metadata";

type SearchSuggestionPayload = {
  suggestions: string[];
  popularSuggestions: string[];
};

function normalizeLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 8;
  }
  return Math.min(Math.floor(parsed), 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  const limit = normalizeLimit(searchParams.get("limit"));

  const result = await queryPublicPage<SearchSuggestionPayload>("frontend:searchSiteContent", {
    query,
    limit,
  });

  return NextResponse.json(
    {
      query,
      suggestions: result.suggestions.slice(0, limit),
      popularSuggestions: result.popularSuggestions.slice(0, limit),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    }
  );
}
