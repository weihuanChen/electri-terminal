import { v } from "convex/values";

const categoryEmbeddedFaqItem = v.object({
  question: v.string(),
  answer: v.string(),
});

const categoryOverviewContent = v.object({
  intro: v.optional(v.string()),
  keyPoints: v.optional(v.array(v.string())),
});

const categorySectionList = v.object({
  intro: v.optional(v.string()),
  items: v.optional(v.array(v.string())),
});

const categorySelectionGuide = v.object({
  intro: v.optional(v.string()),
  steps: v.optional(v.array(v.string())),
});

const categoryTypesOverviewItem = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  link: v.optional(v.string()),
});

const categoryFeaturedFamilyItem = v.object({
  familyId: v.optional(v.id("productFamilies")),
  name: v.string(),
  description: v.optional(v.string()),
  image: v.optional(v.string()),
  link: v.string(),
});

export const categoryPageConfig = v.object({
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
      summary: v.optional(v.string()),
      heroIntro: v.optional(v.string()),
      overview: v.optional(categoryOverviewContent),
      typesOverview: v.optional(v.array(categoryTypesOverviewItem)),
      applications: v.optional(categorySectionList),
      selectionGuide: v.optional(categorySelectionGuide),
      featuredFamilies: v.optional(v.array(categoryFeaturedFamilyItem)),
    })
  ),
  seoBoost: v.optional(
    v.object({
      faqMode: v.optional(
        v.union(v.literal("relation"), v.literal("embedded"), v.literal("mixed"))
      ),
      embeddedFaqItems: v.optional(v.array(categoryEmbeddedFaqItem)),
    })
  ),
  display: v.optional(
    v.object({
      showOverview: v.optional(v.boolean()),
      showTypesOverview: v.optional(v.boolean()),
      showApplications: v.optional(v.boolean()),
      showSelectionGuide: v.optional(v.boolean()),
      showFeaturedFamilies: v.optional(v.boolean()),
      showFaq: v.optional(v.boolean()),
      showDownloads: v.optional(v.boolean()),
      showBottomCta: v.optional(v.boolean()),
      collapsedFilterGroupKeys: v.optional(v.array(v.string())),
    })
  ),
});
