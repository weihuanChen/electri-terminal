import { v } from "convex/values";

export const familyEmbeddedFaqItem = v.object({
  question: v.string(),
  answer: v.string(),
});

const familyOverviewContent = v.object({
  intro: v.optional(v.string()),
  details: v.optional(v.array(v.string())),
});

const familySectionList = v.object({
  intro: v.optional(v.string()),
  items: v.optional(v.array(v.string())),
});

const familySelectionGuide = v.object({
  intro: v.optional(v.string()),
  steps: v.optional(v.array(v.string())),
});

export const familyPageConfig = v.object({
  seo: v.optional(
    v.object({
      metaTitle: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
      canonicalUrl: v.optional(v.string()),
      noindex: v.optional(v.boolean()),
      ogImage: v.optional(v.string()),
    })
  ),
  content: v.optional(
    v.object({
      heroIntro: v.optional(v.string()),
      selectionReason: v.optional(v.string()),
      overview: v.optional(familyOverviewContent),
      features: v.optional(familySectionList),
      applications: v.optional(familySectionList),
      selectionGuide: v.optional(v.union(familySelectionGuide, v.string())),
      technicalNotes: v.optional(v.array(v.string())),
      overviewText: v.optional(v.string()),
      featuresIntro: v.optional(v.string()),
      featuresList: v.optional(v.array(v.string())),
      applicationsIntro: v.optional(v.string()),
      applicationsList: v.optional(v.array(v.string())),
      technicalNote: v.optional(v.string()),
    })
  ),
  longform: v.optional(
    v.object({
      markdown: v.optional(v.string()),
    })
  ),
  conversion: v.optional(
    v.object({
      ctaPrimaryLabel: v.optional(v.string()),
      ctaPrimaryHref: v.optional(v.string()),
      ctaSecondaryLabel: v.optional(v.string()),
      ctaSecondaryHref: v.optional(v.string()),
      downloadsMode: v.optional(v.union(v.literal("auto"), v.literal("manual"))),
      pinnedDownloadIds: v.optional(v.array(v.id("assets"))),
    })
  ),
  seoBoost: v.optional(
    v.object({
      faqMode: v.optional(
        v.union(v.literal("relation"), v.literal("embedded"), v.literal("mixed"))
      ),
      embeddedFaqItems: v.optional(v.array(familyEmbeddedFaqItem)),
    })
  ),
  linking: v.optional(
    v.object({
      relatedCategoryIds: v.optional(v.array(v.id("categories"))),
      relatedFamilyIds: v.optional(v.array(v.id("productFamilies"))),
      relatedArticleIds: v.optional(v.array(v.id("articles"))),
    })
  ),
  display: v.optional(
    v.object({
      showOverview: v.optional(v.boolean()),
      showFeatures: v.optional(v.boolean()),
      showApplications: v.optional(v.boolean()),
      showSelectionGuide: v.optional(v.boolean()),
      showTechnicalNote: v.optional(v.boolean()),
      showLongform: v.optional(v.boolean()),
      showDownloads: v.optional(v.boolean()),
      showFaq: v.optional(v.boolean()),
      showRelatedLinks: v.optional(v.boolean()),
      showBottomCta: v.optional(v.boolean()),
    })
  ),
});
