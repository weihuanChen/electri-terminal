import {
  filterCategoryProducts,
  hasCategoryRefinement,
  parseCategoryContentView,
  parseCategoryFilterState,
  type CategoryContentView,
  type CategoryFilterState,
} from "@/lib/categoryFilters";
import {
  makeBreadcrumbSchema,
  makeCollectionPageSchema,
  makeFAQPageSchema,
  makeItemListSchema,
} from "@/lib/schema";
import {
  resolveEmbeddedFaqItems,
  resolveMetadataEntity,
  resolveMetadataDescription,
  resolveMetadataRobots,
  type BasicFaqRecord,
  type CTAConfig,
} from "@/lib/pageResolvers";
import {
  categoriesUrl,
  categoryUrl,
  contactUrl,
  familyUrl,
  productUrl,
  requestQuoteUrl,
} from "@/lib/routes";
import type { UrlResolverOptions } from "@/lib/i18n/urlResolver";

type CategoryFilterOption = {
  value: string;
  label: string;
  count?: number;
};

type CategoryFilterGroup = {
  id: string;
  label: string;
  type?: "checkbox" | "radio";
  options: CategoryFilterOption[];
};

type CategoryChild = {
  _id: string;
  slug: string;
  name: string;
};

type CategoryFamily = {
  _id: string;
  slug: string;
  name: string;
  summary?: string;
  heroImage?: string;
  highlights?: string[];
  pageConfig?: {
    content?: {
      selectionReason?: string;
    };
  };
};

type CategoryProduct = {
  _id: string;
  slug: string;
  title: string;
  model?: string;
  shortTitle?: string;
  mainImage?: string;
  summary?: string;
  isFeatured?: boolean;
  attributes?: Record<string, unknown>;
};

type CategoryResource = {
  _id: string;
  title: string;
  fileUrl: string;
};

type CategoryTypesOverviewItem = {
  name: string;
  description?: string;
  link?: string;
};

type CategoryFeaturedFamilyItem = {
  familyId?: string;
  name: string;
  description?: string;
  image?: string;
  link: string;
};

type CategoryEmbeddedFaqItem = {
  question: string;
  answer: string;
};

type CategoryPageConfig = {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    noindex?: boolean;
    ogImage?: string;
  };
  content?: {
    summary?: string;
    heroIntro?: string;
    overview?: {
      intro?: string;
      keyPoints?: string[];
    };
    typesOverview?: CategoryTypesOverviewItem[];
    applications?: {
      intro?: string;
      items?: string[];
    };
    selectionGuide?: {
      intro?: string;
      steps?: string[];
    };
    featuredFamilies?: CategoryFeaturedFamilyItem[];
  };
  seoBoost?: {
    faqMode?: "relation" | "embedded" | "mixed";
    embeddedFaqItems?: CategoryEmbeddedFaqItem[];
  };
  display?: {
    showOverview?: boolean;
    showTypesOverview?: boolean;
    showApplications?: boolean;
    showSelectionGuide?: boolean;
    showFeaturedFamilies?: boolean;
    showFaq?: boolean;
    showDownloads?: boolean;
    showBottomCta?: boolean;
    collapsedFilterGroupKeys?: string[];
  };
};

type CategoryLike = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  status?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
  children?: CategoryChild[];
  resources?: CategoryResource[];
  faqs?: BasicFaqRecord[];
  filters?: CategoryFilterGroup[];
  pageConfig?: CategoryPageConfig;
};

type CategoryContentLike = {
  families: CategoryFamily[];
  products: CategoryProduct[];
};

export function resolveCategoryContentView(searchParams: Record<string, string | string[] | undefined>) {
  return parseCategoryContentView(searchParams.view);
}

export function resolveCategoryActiveFilters(
  searchParams: Record<string, string | string[] | undefined>,
  category: Pick<CategoryLike, "filters">
) {
  return parseCategoryFilterState(searchParams, category.filters || []);
}

export function resolveCategoryShouldNoindex(
  contentView: CategoryContentView,
  activeFilters: CategoryFilterState
) {
  return hasCategoryRefinement(contentView, activeFilters);
}

export function resolveCategoryFilteredContent(
  content: CategoryContentLike,
  activeFilters: CategoryFilterState
) {
  return {
    families: content.families,
    products: filterCategoryProducts(content.products, activeFilters),
  };
}

export function resolveCategoryMetadataDescription(category: CategoryLike | null) {
  return resolveMetadataDescription(
    [
      category?.pageConfig?.seo?.metaDescription,
      category?.seoDescription,
      category?.pageConfig?.content?.summary,
      category?.pageConfig?.content?.heroIntro,
      category?.description,
      category?.shortDescription,
    ],
    "Browse products, families, and technical resources in this category."
  );
}

export function resolveCategoryMetadataEntity(category: CategoryLike | null) {
  return resolveMetadataEntity(category, category?.pageConfig?.seo);
}

export function resolveCategoryMetadataRobots(
  category: CategoryLike | null,
  contentView: CategoryContentView,
  activeFilters: CategoryFilterState
) {
  const pageLevelNoindex = resolveMetadataRobots(category?.pageConfig?.seo?.noindex);
  if (pageLevelNoindex) {
    return pageLevelNoindex;
  }

  if (resolveCategoryShouldNoindex(contentView, activeFilters)) {
    return {
      index: false,
      follow: true,
    };
  }

  return undefined;
}

export function resolveCategoryFaqItems(category: Pick<CategoryLike, "pageConfig">) {
  return resolveEmbeddedFaqItems(category.pageConfig?.seoBoost?.embeddedFaqItems);
}

export function resolveCategoryPageViewModel(
  category: CategoryLike,
  content: CategoryContentLike,
  contentView: CategoryContentView,
  urlOptions?: UrlResolverOptions
) {
  const pageContent = category.pageConfig?.content;
  const visibleFamilies = contentView === "products" ? [] : content.families;
  const visibleProducts = contentView === "families" ? [] : content.products;
  const faqItems = resolveCategoryFaqItems(category);

  return {
    heroDescription: pageContent?.heroIntro || category.description,
    heroShortDescription: pageContent?.summary || category.shortDescription,
    overviewIntro: pageContent?.overview?.intro,
    overviewKeyPoints: pageContent?.overview?.keyPoints || [],
    typesOverview: pageContent?.typesOverview || [],
    applicationsIntro: pageContent?.applications?.intro,
    applicationsItems: pageContent?.applications?.items || [],
    selectionGuideIntro: pageContent?.selectionGuide?.intro,
    selectionGuideSteps: pageContent?.selectionGuide?.steps || [],
    featuredFamilies: pageContent?.featuredFamilies || [],
    collapsedFilterGroupKeys: category.pageConfig?.display?.collapsedFilterGroupKeys || [],
    filterGroups: category.filters || [],
    visibleFamilies,
    visibleProducts,
    faqItems,
    showFaq: faqItems.length > 0,
    showDownloads: (category.resources || []).length > 0,
    primaryCTA: {
      label: "Contact Us",
      href: contactUrl(urlOptions),
    } satisfies CTAConfig,
    secondaryCTA: {
      label: "Request Quote",
      href: requestQuoteUrl(urlOptions),
    } satisfies CTAConfig,
  };
}

export function buildCategoryStructuredData(
  category: CategoryLike,
  content: CategoryContentLike,
  slug: string,
  urlOptions?: UrlResolverOptions
) {
  const faqItems = resolveCategoryFaqItems(category);

  return [
    makeBreadcrumbSchema([
      { name: "Categories", path: categoriesUrl(urlOptions) },
      { name: category.name, path: categoryUrl(slug, urlOptions) },
    ]),
    makeCollectionPageSchema({
      name: category.name,
      description:
        category.pageConfig?.seo?.metaDescription ||
        category.seoDescription ||
        category.pageConfig?.content?.summary ||
        category.pageConfig?.content?.heroIntro ||
        category.description ||
        category.shortDescription,
      path: categoryUrl(slug, urlOptions),
    }),
    ...((category.pageConfig?.content?.featuredFamilies || []).length > 0
      ? [
          makeItemListSchema({
            name: `${category.name} Featured Families`,
            path: categoryUrl(slug, urlOptions),
            items: (category.pageConfig?.content?.featuredFamilies || []).map((item) => ({
              name: item.name,
              url: item.link,
            })),
          }),
        ]
      : []),
    ...((content.families || []).length > 0
      ? [
          makeItemListSchema({
            name: `${category.name} Families`,
            path: categoryUrl(slug, urlOptions),
            items: content.families.map((family) => ({
              name: family.name,
              url: familyUrl(family.slug, urlOptions),
            })),
          }),
        ]
      : []),
    ...((content.products || []).length > 0
      ? [
          makeItemListSchema({
            name: `${category.name} Products`,
            path: categoryUrl(slug, urlOptions),
            items: content.products.map((product) => ({
              name: product.shortTitle || product.title,
              url: productUrl(product.slug, urlOptions),
            })),
          }),
        ]
      : []),
    ...(faqItems.length > 0
      ? [
          makeFAQPageSchema({
            path: categoryUrl(slug, urlOptions),
            items: faqItems,
          }),
        ]
      : []),
    ...((category.resources || []).length > 0
      ? [
          makeItemListSchema({
            name: `${category.name} Downloads`,
            path: categoryUrl(slug, urlOptions),
            items: (category.resources || []).map((resource) => ({
              name: resource.title,
              url: resource.fileUrl,
            })),
          }),
        ]
      : []),
  ];
}
