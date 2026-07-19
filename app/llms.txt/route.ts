import {
  buildDynamicLlmsTxt,
  buildStaticLlmsTxt,
} from "@/lib/llms-txt-server";

// Generate on the first request at the CDN rather than during `next build`.
// This prevents a frontend-before-Convex deployment from pinning the static
// fallback into the build output.
export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  try {
    return new Response(await buildDynamicLlmsTxt(), {
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    console.error("Failed to build dynamic llms.txt; serving static fallback", error);

    return new Response(buildStaticLlmsTxt(), {
      headers: {
        ...CACHE_HEADERS,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-LLMS-Txt-Fallback": "static",
      },
    });
  }
}
