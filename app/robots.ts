import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/test-sidebar",
          "/*?variant=*",
          "/*?itemNo=*",
          "/*?sku=*",
        ],
      },
    ],
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/sitemap-images.xml`],
    host: new URL(siteUrl).host,
  };
}
