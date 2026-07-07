import type { MetadataRoute } from "next";

import {
  LANGUAGE_CONFIGS,
  SUPPORTED_LOCALES,
  canExposeLocaleToSearch,
} from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/site";

function getDisallowedLocalePrefixes() {
  return SUPPORTED_LOCALES.flatMap((locale) => {
    const prefix = LANGUAGE_CONFIGS[locale].urlPrefix;
    if (!prefix || canExposeLocaleToSearch(locale)) {
      return [];
    }

    return [prefix, `${prefix}/`];
  });
}

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
          ...getDisallowedLocalePrefixes(),
        ],
      },
    ],
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/sitemap-images.xml`],
    host: new URL(siteUrl).host,
  };
}
