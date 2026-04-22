export type BasicFaqRecord = {
  title: string;
  content?: string;
  excerpt?: string;
};

export type ResolvedFaqItem = {
  question: string;
  answer: string;
};

export type CTAConfig = {
  label: string;
  href: string;
};

export type BasicMetadataEntity = {
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
};

export type SeoOverride = {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  ogImage?: string;
};

export function resolveFaqItems(records?: BasicFaqRecord[]) {
  return (records || [])
    .map((faq) => ({
      question: faq.title,
      answer: faq.content || faq.excerpt || "",
    }))
    .filter((faq) => faq.question && faq.answer);
}

export function resolveMetadataEntity<T extends BasicMetadataEntity>(
  entity: T | null,
  seo?: SeoOverride
) {
  if (!entity) return null;

  return {
    ...entity,
    seoTitle: seo?.metaTitle || entity.seoTitle,
    seoDescription: seo?.metaDescription || entity.seoDescription,
    canonical: seo?.canonicalUrl || entity.canonical,
  };
}

export function resolveMetadataDescription(
  candidates: Array<string | undefined>,
  fallback: string
) {
  return candidates.find((value) => typeof value === "string" && value.trim()) || fallback;
}

export function resolveMetadataRobots(noindex?: boolean) {
  if (!noindex) {
    return undefined;
  }

  return {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-image-preview": "none" as const,
      "max-snippet": 0 as const,
      "max-video-preview": 0 as const,
    },
  };
}
