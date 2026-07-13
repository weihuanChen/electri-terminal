import { notFound } from "next/navigation";

import JsonLd from "@/components/seo/JsonLd";
import CategoryHubClient from "@/app/categories/[slug]/CategoryHubClient";
import CategoryPageClient, {
  type CategoryPageContent,
  type CategoryPageData,
} from "@/app/categories/[slug]/CategoryPageClient";
import FamilyPageClient, {
  type FamilyPageData,
} from "@/app/families/[slug]/FamilyPageClient";
import ProductPageClient, {
  type ProductPageData,
} from "@/app/products/[slug]/ProductPageClient";
import LocalizedStaticPage from "@/components/i18n/LocalizedStaticPage";
import {
  buildCategoryStructuredData,
  resolveCategoryActiveFilters,
  resolveCategoryContentView,
  resolveCategoryFilteredContent,
} from "@/lib/categoryPage";
import { buildFamilyStructuredData } from "@/lib/familyPage";
import { queryPublicPage } from "@/lib/metadata";
import { buildProductStructuredData } from "@/lib/productPage";
import {
  DEFAULT_LOCALE,
  type Locale,
  type LocalizableEntityType,
} from "@/lib/i18n/config";
import {
  applyCategoryLocalization,
  applyCollectionLocalizations,
  applyFamilyLocalization,
  applyProductLocalization,
  buildLocalizationMap,
  getPublishedLocalization,
  hasPublishedLocalization,
} from "@/lib/i18n/localizedContentOverlay";
import type { LocalizationRecordV2 } from "@/lib/i18n/localizationModel";
import { isStaticPageStructuredContent } from "@/lib/i18n/staticPageContent";
import {
  type LocalizedRendererContext,
  registerLocalizedRouteRenderer,
} from "@/lib/i18n/localizedRenderer";

type CategoryRecord = CategoryPageData & {
  status?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
  image?: string;
} & Parameters<typeof buildCategoryStructuredData>[0];

type FamilyRecord = FamilyPageData & {
  _id: string;
  status?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
};

type ProductRecord = ProductPageData & {
  status?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
};

type L2LocalizationMaps = {
  category: Map<string, LocalizationRecordV2>;
  family: Map<string, LocalizationRecordV2>;
  product: Map<string, LocalizationRecordV2>;
  article: Map<string, LocalizationRecordV2>;
};

async function renderLocalizedStaticPage({ locale, route }: LocalizedRendererContext) {
  if (route.kind !== "staticPage") notFound();
  const localization = await queryPublicPage<LocalizationRecordV2 | null>(
    "queries/modules/localizations:getLocalizationByEntityLocale",
    { entityType: "staticPage", sourceId: route.pageKey, locale }
  );
  const content = localization?.localizedFields?.content;
  if (localization?.status !== "published" || !isStaticPageStructuredContent(content)) {
    notFound();
  }
  if (content.pageKey !== route.pageKey || content.sourcePath !== route.path) {
    notFound();
  }
  return <LocalizedStaticPage content={content} locale={locale} />;
}

async function listPublishedLocalizations(
  locale: Locale,
  entityType: LocalizableEntityType
) {
  if (locale === DEFAULT_LOCALE) {
    return [];
  }

  return await queryPublicPage<LocalizationRecordV2[]>(
    "queries/modules/localizations:listLocalizations",
    {
      locale,
      entityType,
      status: "published",
      limit: 500,
    }
  );
}

async function loadL2LocalizationMaps(locale: Locale): Promise<L2LocalizationMaps> {
  const [categories, families, products, articles] = await Promise.all([
    listPublishedLocalizations(locale, "category"),
    listPublishedLocalizations(locale, "family"),
    listPublishedLocalizations(locale, "product"),
    listPublishedLocalizations(locale, "article"),
  ]);

  return {
    category: buildLocalizationMap(categories),
    family: buildLocalizationMap(families),
    product: buildLocalizationMap(products),
    article: buildLocalizationMap(articles),
  };
}

function requirePublishedLocalization(
  maps: L2LocalizationMaps,
  entityType: keyof L2LocalizationMaps,
  sourceId?: string
) {
  const localization = getPublishedLocalization(maps[entityType], sourceId);
  if (!localization) {
    notFound();
  }

  return localization;
}

function localizeCategoryRecord(category: CategoryRecord, maps: L2LocalizationMaps) {
  const localization = requirePublishedLocalization(maps, "category", category._id);
  const children = applyCollectionLocalizations(
    category.children,
    maps.category,
    applyCategoryLocalization
  );

  return {
    ...applyCategoryLocalization(category, localization),
    children,
    faqs: [],
  };
}

function localizeCategoryContent(
  content: CategoryPageContent,
  maps: L2LocalizationMaps
): CategoryPageContent {
  return {
    families: applyCollectionLocalizations(
      content.families,
      maps.family,
      applyFamilyLocalization
    ),
    products: applyCollectionLocalizations(
      content.products,
      maps.product,
      applyProductLocalization
    ),
  };
}

function mergeCategoryContentBuckets(
  buckets: CategoryPageContent[],
  limit: number
): CategoryPageContent {
  const familyMap = new Map<string, CategoryPageContent["families"][number]>();
  const productMap = new Map<string, CategoryPageContent["products"][number]>();

  for (const bucket of buckets) {
    for (const family of bucket.families) {
      if (!familyMap.has(family._id)) {
        familyMap.set(family._id, family);
      }
    }
    for (const product of bucket.products) {
      if (!productMap.has(product._id)) {
        productMap.set(product._id, product);
      }
    }
  }

  return {
    families: Array.from(familyMap.values()).slice(0, limit),
    products: Array.from(productMap.values()).slice(0, limit),
  };
}

async function renderLocalizedCategory({
  locale,
  route,
  searchParams = {},
}: LocalizedRendererContext) {
  if (route.kind !== "category") {
    notFound();
  }

  const [category, maps] = await Promise.all([
    queryPublicPage<CategoryRecord | null>("frontend:getCategoryWithChildren", {
      slug: route.slug,
    }),
    loadL2LocalizationMaps(locale),
  ]);

  if (!category || category.status !== "published") {
    notFound();
  }

  const localizedCategory = localizeCategoryRecord(category, maps);

  if (localizedCategory.slug === "terminals") {
    const hubFamilies = await queryPublicPage<CategoryPageContent>(
      "frontend:getCategoryContent",
      {
        categoryId: localizedCategory._id,
        type: "families",
        limit: 24,
      }
    );

    return (
      <CategoryHubClient
        category={localizedCategory}
        fallbackFamilies={localizeCategoryContent(hubFamilies, maps).families}
        locale={locale}
      />
    );
  }

  const contentView = resolveCategoryContentView(searchParams);
  const activeFilters = resolveCategoryActiveFilters(searchParams, localizedCategory);
  const primaryContent = await queryPublicPage<CategoryPageContent>(
    "frontend:getCategoryContent",
    {
      categoryId: localizedCategory._id,
      type: "all",
      limit: 100,
    }
  );
  const childCategoryIds = (localizedCategory.children ?? []).map((child) => child._id);
  const childBuckets =
    childCategoryIds.length > 0
      ? await Promise.all(
          childCategoryIds.map((childCategoryId) =>
            queryPublicPage<CategoryPageContent>("frontend:getCategoryContent", {
              categoryId: childCategoryId,
              type: "all",
              limit: 100,
            })
          )
        )
      : [];
  const content = mergeCategoryContentBuckets(
    [primaryContent, ...childBuckets].map((bucket) =>
      localizeCategoryContent(bucket, maps)
    ),
    100
  );
  const filteredContent = resolveCategoryFilteredContent(content, activeFilters);
  const structuredData = buildCategoryStructuredData(
    localizedCategory,
    filteredContent,
    route.slug,
    { locale }
  );

  return (
    <>
      <JsonLd data={structuredData} />
      <CategoryPageClient
        category={localizedCategory}
        content={filteredContent}
        contentView={contentView}
        activeFilters={activeFilters}
        locale={locale}
      />
    </>
  );
}

function localizeFamilyRecord(family: FamilyRecord, maps: L2LocalizationMaps) {
  const localization = requirePublishedLocalization(maps, "family", family._id);
  const category =
    family.category && family.category._id
      ? hasPublishedLocalization(maps.category, family.category._id)
        ? applyCategoryLocalization(
            family.category,
            requirePublishedLocalization(maps, "category", family.category._id)
          )
        : null
      : family.category;

  if (family.category && !category) {
    notFound();
  }

  return {
    ...applyFamilyLocalization(family, localization),
    category,
    products: applyCollectionLocalizations(
      family.products,
      maps.product,
      applyProductLocalization
    ),
    relatedCategories: applyCollectionLocalizations(
      family.relatedCategories,
      maps.category,
      applyCategoryLocalization
    ),
    relatedFamilies: applyCollectionLocalizations(
      family.relatedFamilies,
      maps.family,
      applyFamilyLocalization
    ),
    relatedArticles: [],
    faqs: [],
  };
}

async function renderLocalizedFamily({ locale, route }: LocalizedRendererContext) {
  if (route.kind !== "family") {
    notFound();
  }

  const [family, maps] = await Promise.all([
    queryPublicPage<FamilyRecord | null>("frontend:getFamilyWithProducts", {
      slug: route.slug,
    }),
    loadL2LocalizationMaps(locale),
  ]);

  if (!family || family.status !== "published") {
    notFound();
  }

  const localizedFamily = localizeFamilyRecord(family, maps);
  const structuredData = buildFamilyStructuredData(localizedFamily, route.slug, {
    locale,
  });

  return (
    <>
      <JsonLd data={structuredData} />
      <FamilyPageClient family={localizedFamily} locale={locale} />
    </>
  );
}

function localizeProductRecord(product: ProductRecord, maps: L2LocalizationMaps) {
  const localization = requirePublishedLocalization(maps, "product", product._id);
  const category =
    product.category && product.category._id
      ? hasPublishedLocalization(maps.category, product.category._id)
        ? applyCategoryLocalization(
            product.category,
            requirePublishedLocalization(maps, "category", product.category._id)
          )
        : null
      : product.category;
  const family =
    product.family && product.family._id
      ? hasPublishedLocalization(maps.family, product.family._id)
        ? applyFamilyLocalization(
            product.family,
            requirePublishedLocalization(maps, "family", product.family._id)
          )
        : null
      : product.family;

  if ((product.category && !category) || (product.family && !family)) {
    notFound();
  }

  return {
    ...applyProductLocalization(product, localization),
    category,
    family,
    relatedSeries: applyCollectionLocalizations(
      product.relatedSeries,
      maps.family,
      applyFamilyLocalization
    ),
    faqs: [],
  };
}

async function renderLocalizedProduct({ locale, route }: LocalizedRendererContext) {
  if (route.kind !== "product") {
    notFound();
  }

  const [product, maps] = await Promise.all([
    queryPublicPage<ProductRecord | null>("frontend:getProductBySlug", {
      slug: route.slug,
    }),
    loadL2LocalizationMaps(locale),
  ]);

  if (!product || product.status !== "published") {
    notFound();
  }

  const localizedProduct = localizeProductRecord(product, maps);
  const structuredData = buildProductStructuredData(localizedProduct, route.slug, {
    locale,
  });

  return (
    <>
      <JsonLd data={structuredData} />
      <ProductPageClient product={localizedProduct} locale={locale} />
    </>
  );
}

registerLocalizedRouteRenderer("category", renderLocalizedCategory);
registerLocalizedRouteRenderer("family", renderLocalizedFamily);
registerLocalizedRouteRenderer("product", renderLocalizedProduct);
registerLocalizedRouteRenderer("staticPage", renderLocalizedStaticPage);
