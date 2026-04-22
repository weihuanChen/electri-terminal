import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JsonLd from "@/components/seo/JsonLd";
import CategoryPageClient, {
  type CategoryPageContent,
  type CategoryPageData,
} from "./CategoryPageClient";
import CategoryHubClient from "./CategoryHubClient";
import {
  buildCategoryStructuredData,
  resolveCategoryActiveFilters,
  resolveCategoryContentView,
  resolveCategoryFilteredContent,
  resolveCategoryMetadataDescription,
  resolveCategoryMetadataEntity,
  resolveCategoryMetadataRobots,
} from "@/lib/categoryPage";
import { buildPageMetadata, queryPublicPage } from "@/lib/metadata";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CategoryMetadataRecord = CategoryPageData & {
  status?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
  image?: string;
};

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

async function getCategoryRecord(slug: string) {
  return await queryPublicPage<CategoryMetadataRecord | null>("frontend:getCategoryWithChildren", { slug });
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryRecord(slug);
  const resolvedSearchParams = await searchParams;
  const contentView = resolveCategoryContentView(resolvedSearchParams);
  const activeFilters = resolveCategoryActiveFilters(resolvedSearchParams, category || { filters: [] });

  return buildPageMetadata({
    entity: resolveCategoryMetadataEntity(category),
    fallbackPath: `/categories/${slug}`,
    fallbackTitle: category?.name || "Category",
    fallbackDescription: resolveCategoryMetadataDescription(category),
    image: {
      url: category?.image,
      alt: category?.name,
    },
    robots: resolveCategoryMetadataRobots(category, contentView, activeFilters),
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryRecord(slug);

  if (!category || category.status !== "published") {
    notFound();
  }

  if (category.slug === "terminals") {
    const hubFamilies = await queryPublicPage<CategoryPageContent>("frontend:getCategoryContent", {
      categoryId: category._id,
      type: "families",
      limit: 24,
    });

    return (
      <CategoryHubClient
        category={category}
        fallbackFamilies={hubFamilies.families}
      />
    );
  }

  const resolvedSearchParams = await searchParams;
  const contentView = resolveCategoryContentView(resolvedSearchParams);
  const activeFilters = resolveCategoryActiveFilters(resolvedSearchParams, category);

  const primaryContent = await queryPublicPage<CategoryPageContent>("frontend:getCategoryContent", {
    categoryId: category._id,
    type: "all",
    limit: 100,
  });

  const childCategoryIds = (category.children ?? []).map((child) => child._id);
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

  const content = mergeCategoryContentBuckets([primaryContent, ...childBuckets], 100);

  const filteredContent = resolveCategoryFilteredContent(content, activeFilters);
  const structuredData = buildCategoryStructuredData(category, filteredContent, slug);

  return (
    <>
      <JsonLd data={structuredData} />
      <CategoryPageClient
        category={category}
        content={filteredContent}
        contentView={contentView}
        activeFilters={activeFilters}
      />
    </>
  );
}
