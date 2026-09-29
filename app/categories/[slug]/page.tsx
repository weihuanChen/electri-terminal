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
import { categoryUrl } from "@/lib/routes";
import { getCachedCategoryWithChildren } from "@/lib/publicCategory";

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

async function getCategoryRecord(slug: string) {
  return await getCachedCategoryWithChildren(slug) as CategoryMetadataRecord | null;
}

async function getCategoryMetadataRecord(slug: string) {
  return await queryPublicPage<CategoryMetadataRecord | null>("frontend:getCategoryMetadataBySlug", { slug });
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryMetadataRecord(slug);
  const resolvedSearchParams = await searchParams;
  const contentView = resolveCategoryContentView(resolvedSearchParams);
  const hasFilterQuery = Object.keys(resolvedSearchParams).some((key) => key.startsWith("filter_"));

  return buildPageMetadata({
    entity: resolveCategoryMetadataEntity(category),
    fallbackPath: categoryUrl(slug),
    fallbackTitle: category?.name || "Category",
    fallbackDescription: resolveCategoryMetadataDescription(category),
    image: {
      url: category?.image,
      alt: category?.name,
    },
    robots: hasFilterQuery
      ? { index: false, follow: true }
      : resolveCategoryMetadataRobots(category, contentView, {}),
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

  const content = await queryPublicPage<CategoryPageContent>("frontend:getCategoryContent", {
    categoryId: category._id,
    type: "all",
    limit: 100,
  });

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
