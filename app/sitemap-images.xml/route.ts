import { buildImageSitemapXml } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  const xml = await buildImageSitemapXml();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
