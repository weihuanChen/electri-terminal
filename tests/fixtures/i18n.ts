import type { GscLinkIntegrityCandidate } from "@/lib/i18n/gscLinkIntegrityGate";
import type { LocalizationRecordV2 } from "@/lib/i18n/localizationModel";

export function buildLocalization(
  overrides: Partial<LocalizationRecordV2> = {}
): LocalizationRecordV2 {
  return {
    entityType: "product",
    sourceId: "product-1",
    locale: "ru",
    status: "published",
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    ...overrides,
  };
}

export function buildGscCandidate(
  overrides: Partial<GscLinkIntegrityCandidate> = {}
): GscLinkIntegrityCandidate {
  const url = "https://electriterminal.com/products/test-product";

  return {
    source: "sitemap",
    locale: "en",
    url,
    canonical: url,
    entity: { type: "product", slug: "test-product" },
    indexable: true,
    sitemapEligible: true,
    alternates: {
      languages: {
        en: url,
        "x-default": url,
      },
    },
    ...overrides,
  };
}
