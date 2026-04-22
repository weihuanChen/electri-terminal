import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { validateAttributesAgainstCategory } from "../../lib/attributes";
import { familyPageConfig } from "../../lib/familyPageConfig";
import {
  assertUniqueFamilySlug,
  withCreatedAt,
  withUpdatedAt,
} from "../../lib/validators";
import { statusCommon } from "./shared";

const visualMediaType = v.union(
  v.literal("product"),
  v.literal("dimension"),
  v.literal("packaging"),
  v.literal("application")
);

const visualMediaItem = v.object({
  type: visualMediaType,
  url: v.string(),
  alt: v.optional(v.string()),
  sortOrder: v.optional(v.number()),
});

function mergeFamilyPageConfigFromLegacy(
  family: {
    summary?: string;
    content?: string;
    highlights?: string[];
    seoTitle?: string;
    seoDescription?: string;
    canonical?: string;
    pageConfig?: Record<string, unknown>;
  },
  overwrite = false
) {
  const current = (family.pageConfig ?? {}) as {
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
      noindex?: boolean;
      ogImage?: string;
    };
    content?: {
      heroIntro?: string;
      overview?: {
        intro?: string;
        details?: string[];
      };
      features?: {
        intro?: string;
        items?: string[];
      };
      applications?: {
        intro?: string;
        items?: string[];
      };
      selectionGuide?: {
        intro?: string;
        steps?: string[];
      };
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
      downloadsMode?: "auto" | "manual";
      pinnedDownloadIds?: string[];
    };
    seoBoost?: {
      faqMode?: "relation" | "embedded" | "mixed";
      embeddedFaqItems?: Array<{
        question: string;
        answer: string;
      }>;
    };
    linking?: {
      relatedCategoryIds?: string[];
      relatedFamilyIds?: string[];
      relatedArticleIds?: string[];
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

  return {
    ...current,
    seo: {
      ...(current.seo ?? {}),
      ...((overwrite || !current.seo?.metaTitle) && family.seoTitle
        ? { metaTitle: family.seoTitle }
        : {}),
      ...((overwrite || !current.seo?.metaDescription) && family.seoDescription
        ? { metaDescription: family.seoDescription }
        : {}),
      ...((overwrite || !current.seo?.canonicalUrl) && family.canonical
        ? { canonicalUrl: family.canonical }
        : {}),
    },
    content: {
      ...(current.content ?? {}),
      ...((overwrite || !current.content?.heroIntro) && family.summary
        ? { heroIntro: family.summary }
        : {}),
      ...((overwrite || !current.content?.overview?.intro) && family.content
        ? {
            overview: {
              ...(current.content?.overview ?? {}),
              intro: family.content,
            },
          }
        : {}),
      ...((overwrite || !current.content?.features?.items) &&
      family.highlights &&
      family.highlights.length > 0
        ? {
            features: {
              ...(current.content?.features ?? {}),
              items: family.highlights,
            },
          }
        : {}),
    },
  };
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function splitParagraphs(value: unknown) {
  if (typeof value !== "string") return [];
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value: unknown) {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNonEmptyString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function migrateFamilyPageConfigStructure(
  family: {
    summary?: string;
    content?: string;
    highlights?: string[];
    pageConfig?: Record<string, unknown>;
  },
  overwrite = false
) {
  const seeded = mergeFamilyPageConfigFromLegacy(family, overwrite);
  const current = seeded as {
    seo?: Record<string, unknown>;
    content?: {
      heroIntro?: string;
      overview?: {
        intro?: string;
        details?: string[];
      };
      features?: {
        intro?: string;
        items?: string[];
      };
      applications?: {
        intro?: string;
        items?: string[];
      };
      selectionGuide?:
        | {
            intro?: string;
            steps?: string[];
          }
        | string;
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
    conversion?: Record<string, unknown>;
    seoBoost?: Record<string, unknown>;
    linking?: Record<string, unknown>;
    display?: Record<string, unknown>;
  };

  const content = current.content ?? {};
  const overview = content.overview ?? {};
  const features = content.features ?? {};
  const applications = content.applications ?? {};
  const selectionGuide =
    content.selectionGuide && typeof content.selectionGuide === "object"
      ? content.selectionGuide
      : undefined;
  const migratedContent = {
    ...(content.heroIntro ? { heroIntro: content.heroIntro } : {}),
    ...(toNonEmptyString(overview.intro) || normalizeStringArray(overview.details).length > 0
      ? {
          overview: {
            ...(toNonEmptyString(overview.intro) ? { intro: toNonEmptyString(overview.intro) } : {}),
            ...(normalizeStringArray(overview.details).length > 0
              ? { details: normalizeStringArray(overview.details) }
              : {}),
          },
        }
      : splitParagraphs(content.overviewText ?? family.content).length > 0
        ? {
            overview: {
              details: splitParagraphs(content.overviewText ?? family.content),
            },
          }
        : {}),
    ...(toNonEmptyString(features.intro) || normalizeStringArray(features.items).length > 0
      ? {
          features: {
            ...(toNonEmptyString(features.intro) ? { intro: toNonEmptyString(features.intro) } : {}),
            ...(normalizeStringArray(features.items).length > 0
              ? { items: normalizeStringArray(features.items) }
              : {}),
          },
        }
      : toNonEmptyString(content.featuresIntro) ||
          normalizeStringArray(content.featuresList ?? family.highlights).length > 0
        ? {
            features: {
              ...(toNonEmptyString(content.featuresIntro)
                ? { intro: toNonEmptyString(content.featuresIntro) }
                : {}),
              ...(normalizeStringArray(content.featuresList ?? family.highlights).length > 0
                ? { items: normalizeStringArray(content.featuresList ?? family.highlights) }
                : {}),
            },
          }
        : {}),
    ...(toNonEmptyString(applications.intro) || normalizeStringArray(applications.items).length > 0
      ? {
          applications: {
            ...(toNonEmptyString(applications.intro)
              ? { intro: toNonEmptyString(applications.intro) }
              : {}),
            ...(normalizeStringArray(applications.items).length > 0
              ? { items: normalizeStringArray(applications.items) }
              : {}),
          },
        }
      : toNonEmptyString(content.applicationsIntro) ||
          normalizeStringArray(content.applicationsList).length > 0
        ? {
            applications: {
              ...(toNonEmptyString(content.applicationsIntro)
                ? { intro: toNonEmptyString(content.applicationsIntro) }
                : {}),
              ...(normalizeStringArray(content.applicationsList).length > 0
                ? { items: normalizeStringArray(content.applicationsList) }
                : {}),
            },
          }
        : {}),
    ...(selectionGuide && (toNonEmptyString(selectionGuide.intro) || normalizeStringArray(selectionGuide.steps).length > 0)
      ? {
          selectionGuide: {
            ...(toNonEmptyString(selectionGuide.intro)
              ? { intro: toNonEmptyString(selectionGuide.intro) }
              : {}),
            ...(normalizeStringArray(selectionGuide.steps).length > 0
              ? { steps: normalizeStringArray(selectionGuide.steps) }
              : {}),
          },
        }
      : toNonEmptyString(content.selectionGuide) || splitLines(content.selectionGuide).length > 0
        ? {
            selectionGuide: {
              ...(toNonEmptyString(content.selectionGuide)
                ? { intro: toNonEmptyString(content.selectionGuide) }
                : {}),
              ...(splitLines(content.selectionGuide).length > 0
                ? { steps: splitLines(content.selectionGuide) }
                : {}),
            },
          }
        : {}),
    ...(normalizeStringArray(content.technicalNotes).length > 0
      ? { technicalNotes: normalizeStringArray(content.technicalNotes) }
      : splitLines(content.technicalNote).length > 0
        ? { technicalNotes: splitLines(content.technicalNote) }
        : {}),
  };

  return {
    ...(current.seo ? { seo: current.seo } : {}),
    ...(Object.keys(migratedContent).length > 0 ? { content: migratedContent } : {}),
    ...(current.longform?.markdown ? { longform: { markdown: current.longform.markdown } } : {}),
    ...(current.conversion ? { conversion: current.conversion } : {}),
    ...(current.seoBoost ? { seoBoost: current.seoBoost } : {}),
    ...(current.linking ? { linking: current.linking } : {}),
    ...(current.display ? { display: current.display } : {}),
  };
}

export const createProductFamily = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    categoryId: v.id("categories"),
    brand: v.optional(v.string()),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    attributes: v.optional(v.record(v.string(), v.any())),
    highlights: v.optional(v.array(v.string())),
    manualHeroImage: v.optional(v.string()),
    manualHeroImageAlt: v.optional(v.string()),
    heroImage: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),
    mediaItems: v.optional(v.array(visualMediaItem)),
    status: v.optional(statusCommon),
    sortOrder: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
    pageConfig: v.optional(familyPageConfig),
  },
  handler: async (ctx, args) => {
    await assertUniqueFamilySlug(ctx, args.slug);
    await validateAttributesAgainstCategory(ctx, args.categoryId, args.attributes);

    return await ctx.db.insert(
      "productFamilies",
      withCreatedAt({
        ...args,
        status: args.status ?? "draft",
        sortOrder: args.sortOrder ?? 0,
      })
    );
  },
});

export const updateProductFamily = mutation({
  args: {
    id: v.id("productFamilies"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    brand: v.optional(v.string()),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    attributes: v.optional(v.record(v.string(), v.any())),
    highlights: v.optional(v.array(v.string())),
    manualHeroImage: v.optional(v.string()),
    manualHeroImageAlt: v.optional(v.string()),
    heroImage: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),
    mediaItems: v.optional(v.array(visualMediaItem)),
    status: v.optional(statusCommon),
    sortOrder: v.optional(v.number()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
    pageConfig: v.optional(familyPageConfig),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Product family not found");

    if (args.slug && args.slug !== current.slug) {
      await assertUniqueFamilySlug(ctx, args.slug, args.id);
    }

    await validateAttributesAgainstCategory(
      ctx,
      args.categoryId ?? current.categoryId,
      args.attributes
    );

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.name !== undefined ? { name: args.name } : {}),
        ...(args.slug !== undefined ? { slug: args.slug } : {}),
        ...(args.categoryId !== undefined ? { categoryId: args.categoryId } : {}),
        ...(args.brand !== undefined ? { brand: args.brand } : {}),
        ...(args.summary !== undefined ? { summary: args.summary } : {}),
        ...(args.content !== undefined ? { content: args.content } : {}),
        ...(args.attributes !== undefined ? { attributes: args.attributes } : {}),
        ...(args.highlights !== undefined ? { highlights: args.highlights } : {}),
        ...(args.manualHeroImage !== undefined
          ? { manualHeroImage: args.manualHeroImage }
          : {}),
        ...(args.manualHeroImageAlt !== undefined
          ? { manualHeroImageAlt: args.manualHeroImageAlt }
          : {}),
        ...(args.heroImage !== undefined ? { heroImage: args.heroImage } : {}),
        ...(args.gallery !== undefined ? { gallery: args.gallery } : {}),
        ...(args.mediaItems !== undefined ? { mediaItems: args.mediaItems } : {}),
        ...(args.status !== undefined ? { status: args.status } : {}),
        ...(args.sortOrder !== undefined ? { sortOrder: args.sortOrder } : {}),
        ...(args.seoTitle !== undefined ? { seoTitle: args.seoTitle } : {}),
        ...(args.seoDescription !== undefined
          ? { seoDescription: args.seoDescription }
          : {}),
        ...(args.canonical !== undefined ? { canonical: args.canonical } : {}),
        ...(args.pageConfig !== undefined ? { pageConfig: args.pageConfig } : {}),
      })
    );

    return args.id;
  },
});

export const deleteProductFamily = mutation({
  args: { id: v.id("productFamilies") },
  handler: async (ctx, args) => {
    const family = await ctx.db.get(args.id);
    if (!family) throw new Error("Product family not found");

    // Check for products in this family
    const products = await ctx.db
      .query("products")
      .withIndex("by_familyId", (q) => q.eq("familyId", args.id))
      .collect();

    if (products.length > 0) {
      throw new Error(
        `Cannot delete family with ${products.length} product(s). Please delete or reassign the products first.`
      );
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkUpdateProductFamilies = mutation({
  args: {
    ids: v.array(v.id("productFamilies")),
    updates: v.object({
      status: v.optional(statusCommon),
      categoryId: v.optional(v.id("categories")),
    }),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const updateData: {
        status?: "draft" | "published" | "archived";
        categoryId?: typeof args.updates.categoryId;
      } = {};
      if (args.updates.status !== undefined) {
        updateData.status = args.updates.status;
      }
      if (args.updates.categoryId !== undefined) {
        updateData.categoryId = args.updates.categoryId;
      }
      await ctx.db.patch(id, withUpdatedAt(updateData));
    }
  },
});

export const backfillFamilyPageConfigFromLegacy = mutation({
  args: {
    overwrite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const families = await ctx.db.query("productFamilies").collect();
    const overwrite = args.overwrite ?? false;
    let updated = 0;

    for (const family of families) {
      const nextPageConfig = mergeFamilyPageConfigFromLegacy(family, overwrite);
      const currentSerialized = JSON.stringify(family.pageConfig ?? {});
      const nextSerialized = JSON.stringify(nextPageConfig);

      if (currentSerialized === nextSerialized) {
        continue;
      }

      await ctx.db.patch(
        family._id,
        withUpdatedAt({
          pageConfig: nextPageConfig,
        })
      );
      updated += 1;
    }

    return {
      total: families.length,
      updated,
      overwrite,
    };
  },
});

export const migrateFamilyPageContentStructure = mutation({
  args: {
    overwrite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const families = await ctx.db.query("productFamilies").collect();
    const overwrite = args.overwrite ?? false;
    let updated = 0;

    for (const family of families) {
      const nextPageConfig = migrateFamilyPageConfigStructure(family, overwrite);
      const currentSerialized = JSON.stringify(family.pageConfig ?? {});
      const nextSerialized = JSON.stringify(nextPageConfig);

      if (currentSerialized === nextSerialized) {
        continue;
      }

      await ctx.db.patch(
        family._id,
        withUpdatedAt({
          pageConfig: nextPageConfig,
        })
      );
      updated += 1;
    }

    return {
      total: families.length,
      updated,
      overwrite,
    };
  },
});
