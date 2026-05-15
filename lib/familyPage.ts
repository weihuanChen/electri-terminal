import {
  makeBreadcrumbSchema,
  makeFAQPageSchema,
  makeItemListSchema,
  makeProductGroupSchema,
} from "@/lib/schema";
import {
  resolveFaqItems,
  resolveMetadataDescription,
  resolveMetadataEntity,
  resolveMetadataRobots,
  type BasicFaqRecord,
  type CTAConfig,
} from "@/lib/pageResolvers";

type EmbeddedFaqItem = {
  question: string;
  answer: string;
};

type FamilyOverviewContent = {
  intro?: string;
  details?: string[];
};

type FamilySectionList = {
  intro?: string;
  items?: string[];
};

type FamilySelectionGuide = {
  intro?: string;
  steps?: string[];
};

type FamilyProductRecord = {
  slug: string;
  title: string;
  shortTitle?: string;
  skuCode: string;
};

type FamilyResourceRecord = {
  title: string;
  fileUrl: string;
};

type FamilyRelatedCategoryRecord = {
  name: string;
  slug: string;
};

type FamilyRelatedRecord = {
  name: string;
  slug: string;
};

type FamilyRelatedArticleRecord = {
  title: string;
  slug: string;
};

type FamilyCategoryRecord = {
  name?: string;
  slug?: string;
};

type FamilyPageLike = {
  name: string;
  summary?: string;
  content?: string;
  manualHeroImage?: string;
  manualHeroImageAlt?: string;
  heroImage?: string;
  gallery?: string[];
  mediaItems?: Array<{
    type?: "product" | "dimension" | "packaging" | "application";
    url?: string;
    alt?: string;
    sortOrder?: number;
  }>;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  faqs?: BasicFaqRecord[];
  resources?: FamilyResourceRecord[];
  products?: FamilyProductRecord[];
  category?: FamilyCategoryRecord | null;
  relatedCategories?: FamilyRelatedCategoryRecord[];
  relatedFamilies?: FamilyRelatedRecord[];
  relatedArticles?: FamilyRelatedArticleRecord[];
  pageConfig?: {
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
      noindex?: boolean;
      ogImage?: string;
    };
    content?: {
      heroIntro?: string;
      overview?: FamilyOverviewContent;
      features?: FamilySectionList;
      applications?: FamilySectionList;
      selectionGuide?: FamilySelectionGuide | string;
      technicalNotes?: string[];
      overviewText?: string;
      featuresIntro?: string;
      featuresList?: string[];
      applicationsIntro?: string;
      applicationsList?: string[];
      technicalNote?: string;
    };
    longform?: {
      markdown?: string;
    };
    conversion?: {
      ctaPrimaryLabel?: string;
      ctaPrimaryHref?: string;
      ctaSecondaryLabel?: string;
      ctaSecondaryHref?: string;
    };
    seoBoost?: {
      faqMode?: "relation" | "embedded" | "mixed";
      embeddedFaqItems?: EmbeddedFaqItem[];
    };
    display?: {
      showOverview?: boolean;
      showFeatures?: boolean;
      showApplications?: boolean;
      showSelectionGuide?: boolean;
      showTechnicalNote?: boolean;
      showLongform?: boolean;
      showDownloads?: boolean;
      showFaq?: boolean;
      showRelatedLinks?: boolean;
      showBottomCta?: boolean;
    };
  };
};

function asNonEmptyString(value: string | undefined | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asStringArray(value: string[] | undefined | null) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => item.trim()).filter(Boolean);
}

function splitParagraphs(value: string | undefined) {
  if (!value) return [];
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value: string | undefined) {
  if (!value) return [];
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveOverviewContent(
  overview: FamilyOverviewContent | undefined,
  legacyOverviewText: string | undefined,
  legacyContent: string | undefined
) {
  const intro = asNonEmptyString(overview?.intro);
  const details = asStringArray(overview?.details);

  if (intro || details.length > 0) {
    return { intro, details };
  }

  return {
    intro: undefined,
    details: splitParagraphs(legacyOverviewText ?? legacyContent),
  };
}

function resolveSectionList(
  section: FamilySectionList | undefined,
  legacyIntro: string | undefined,
  legacyItems: string[] | undefined
) {
  return {
    intro: asNonEmptyString(section?.intro) ?? asNonEmptyString(legacyIntro),
    items: asStringArray(section?.items).length > 0 ? asStringArray(section?.items) : asStringArray(legacyItems),
  };
}

function resolveSelectionGuideContent(
  selectionGuide: FamilySelectionGuide | string | undefined
) {
  if (selectionGuide && typeof selectionGuide === "object") {
    return {
      intro: asNonEmptyString(selectionGuide.intro),
      steps: asStringArray(selectionGuide.steps),
    };
  }

  return {
    intro: asNonEmptyString(selectionGuide),
    steps: splitLines(selectionGuide),
  };
}

function resolveTechnicalNotes(
  technicalNotes: string[] | undefined,
  legacyTechnicalNote: string | undefined
) {
  return asStringArray(technicalNotes).length > 0
    ? asStringArray(technicalNotes)
    : splitLines(legacyTechnicalNote);
}

function getFirstFamilyProductMediaUrl(family: FamilyPageLike) {
  if (!family.mediaItems?.length) return undefined;

  const sorted = [...family.mediaItems]
    .filter((item): item is { type: "product" | "dimension" | "packaging" | "application"; url: string; sortOrder?: number } =>
      Boolean(item?.url)
    )
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

  return sorted.find((item) => item.type === "product")?.url;
}

export function resolveFamilyPrimaryImage(family: FamilyPageLike | null) {
  const manualHeroImage = asNonEmptyString(family?.manualHeroImage);
  if (manualHeroImage) return manualHeroImage;
  if (!family) return undefined;

  return (
    getFirstFamilyProductMediaUrl(family) ||
    asNonEmptyString(family.heroImage) ||
    (family.gallery || []).map((url) => asNonEmptyString(url)).find(Boolean)
  );
}

export function resolveFamilyPrimaryImageAlt(family: FamilyPageLike | null) {
  if (!family) return undefined;
  const primaryImage = resolveFamilyPrimaryImage(family);
  if (!primaryImage) return family.name;

  const manualHeroImage = asNonEmptyString(family.manualHeroImage);
  if (manualHeroImage && primaryImage === manualHeroImage) {
    return asNonEmptyString(family.manualHeroImageAlt) || family.name;
  }

  const mediaAlt = family.mediaItems
    ?.find((item) => item?.url === primaryImage)
    ?.alt;
  return asNonEmptyString(mediaAlt) || family.name;
}

export function resolveFamilyFaqItems(family: FamilyPageLike) {
  const faqMode = family.pageConfig?.seoBoost?.faqMode || "relation";
  const relationFaqs = resolveFaqItems(family.faqs);
  const embeddedFaqs = (family.pageConfig?.seoBoost?.embeddedFaqItems || []).map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  if (faqMode === "embedded") {
    return embeddedFaqs.filter((faq) => faq.question && faq.answer);
  }
  if (faqMode === "mixed") {
    return [...relationFaqs, ...embeddedFaqs].filter((faq) => faq.question && faq.answer);
  }
  return relationFaqs.filter((faq) => faq.question && faq.answer);
}

export function resolveFamilyPageViewModel(family: FamilyPageLike) {
  const pageContent = family.pageConfig?.content;
  const pageConversion = family.pageConfig?.conversion;
  const pageDisplay = family.pageConfig?.display;
  const overview = resolveOverviewContent(pageContent?.overview, pageContent?.overviewText, family.content);
  const features = resolveSectionList(
    pageContent?.features,
    pageContent?.featuresIntro,
    pageContent?.featuresList
  );
  const applications = resolveSectionList(
    pageContent?.applications,
    pageContent?.applicationsIntro,
    pageContent?.applicationsList
  );
  const selectionGuide = resolveSelectionGuideContent(pageContent?.selectionGuide);
  const technicalNotes = resolveTechnicalNotes(pageContent?.technicalNotes, pageContent?.technicalNote);

  return {
    heroIntro: pageContent?.heroIntro || family.summary,
    overviewIntro: overview.intro,
    overviewDetails: overview.details,
    featuresIntro: features.intro,
    featuresList: features.items,
    applicationsIntro: applications.intro,
    applicationsList: applications.items,
    selectionGuideIntro: selectionGuide.intro,
    selectionGuideSteps: selectionGuide.steps,
    technicalNotes,
    longformMarkdown: asNonEmptyString(family.pageConfig?.longform?.markdown),
    primaryCTA: {
      label: pageConversion?.ctaPrimaryLabel || "Request Quote",
      href: pageConversion?.ctaPrimaryHref || "/rfq",
    } satisfies CTAConfig,
    secondaryCTA: {
      label: pageConversion?.ctaSecondaryLabel || "Contact Sales",
      href: pageConversion?.ctaSecondaryHref || "/contact",
    } satisfies CTAConfig,
    showOverview: pageDisplay?.showOverview !== false,
    showFeatures: pageDisplay?.showFeatures !== false,
    showApplications: pageDisplay?.showApplications !== false,
    showSelectionGuide: pageDisplay?.showSelectionGuide !== false,
    showTechnicalNote: pageDisplay?.showTechnicalNote !== false,
    showLongform: pageDisplay?.showLongform !== false,
    showDownloads: pageDisplay?.showDownloads !== false,
    showFaq: pageDisplay?.showFaq !== false,
    showRelatedLinks: pageDisplay?.showRelatedLinks !== false,
    showBottomCta: pageDisplay?.showBottomCta !== false,
    faqItems: resolveFamilyFaqItems(family),
  };
}

export function resolveFamilyMetadataEntity(family: FamilyPageLike | null) {
  return resolveMetadataEntity(family, family?.pageConfig?.seo);
}

export function resolveFamilyMetadataDescription(family: FamilyPageLike | null) {
  const resolved = family ? resolveFamilyPageViewModel(family) : null;
  return resolveMetadataDescription(
    [
      family?.pageConfig?.seo?.metaDescription,
      family?.seoDescription,
      resolved?.heroIntro,
      resolved?.overviewIntro,
      resolved?.overviewDetails[0],
      family?.summary,
    ],
    "Explore this product family, available models, and application details."
  );
}

export function resolveFamilyMetadataImage(family: FamilyPageLike | null) {
  return family?.pageConfig?.seo?.ogImage || resolveFamilyPrimaryImage(family);
}

export function resolveFamilyMetadataRobots(family: FamilyPageLike | null) {
  return resolveMetadataRobots(family?.pageConfig?.seo?.noindex);
}

export function buildFamilyStructuredData(family: FamilyPageLike, slug: string) {
  const resolved = resolveFamilyPageViewModel(family);
  const structuredDescription =
    resolved.heroIntro ||
    resolved.overviewIntro ||
    resolved.overviewDetails[0] ||
    family.summary ||
    family.content;

  return [
    makeBreadcrumbSchema([
      { name: "Categories", path: "/categories" },
      ...(family.category?.slug
        ? [{ name: family.category.name || "Category", path: `/categories/${family.category.slug}` }]
        : []),
      { name: family.name, path: `/families/${slug}` },
    ]),
    makeProductGroupSchema({
      slug,
      name: family.name,
      description: structuredDescription,
      image: resolveFamilyPrimaryImage(family),
      categoryName: family.category?.name,
    }),
    ...((family.products || []).length > 0
      ? [
          makeItemListSchema({
            name: `${family.name} Available Products`,
            path: `/families/${slug}`,
            items: (family.products || []).map((product) => ({
              name: product.shortTitle || product.title,
              url: `/products/${product.slug}`,
            })),
          }),
        ]
      : []),
    ...(resolved.faqItems.length > 0
      ? [
          makeFAQPageSchema({
            path: `/families/${slug}`,
            items: resolved.faqItems,
          }),
        ]
      : []),
    ...((family.resources || []).length > 0
      ? [
          makeItemListSchema({
            name: `${family.name} Downloads`,
            path: `/families/${slug}`,
            items: (family.resources || []).map((resource) => ({
              name: resource.title,
              url: resource.fileUrl,
            })),
          }),
        ]
      : []),
    ...((family.relatedArticles || []).length > 0
      ? [
          makeItemListSchema({
            name: `${family.name} Related Articles`,
            path: `/families/${slug}`,
            items: family.relatedArticles.map((article) => ({
              name: article.title,
              url: `/blog/${article.slug}`,
            })),
          }),
        ]
      : []),
    ...((family.relatedFamilies || []).length > 0
      ? [
          makeItemListSchema({
            name: `${family.name} Related Families`,
            path: `/families/${slug}`,
            items: family.relatedFamilies.map((item) => ({
              name: item.name,
              url: `/families/${item.slug}`,
            })),
          }),
        ]
      : []),
  ];
}
