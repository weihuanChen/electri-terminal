import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JsonLd from "@/components/seo/JsonLd";
import ArticlePageClient, { type ArticlePageData } from "./ArticlePageClient";
import { buildPageMetadata, queryPublicPage } from "@/lib/metadata";
import { makeArticleSchema, makeBreadcrumbSchema } from "@/lib/schema";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ArticleMetadataRecord = ArticlePageData & {
  status?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
};

async function getArticleRecord(slug: string) {
  return await queryPublicPage<ArticleMetadataRecord | null>("frontend:getArticleBySlug", { slug });
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleRecord(slug);

  return buildPageMetadata({
    entity: article,
    fallbackPath: `/blog/${slug}`,
    fallbackTitle: article?.title || "Article",
    fallbackDescription:
      article?.seoDescription ||
      article?.excerpt ||
      "Read the full article, related resources, and product references.",
    openGraphType: "article",
    image: {
      url: article?.coverImage,
      alt: article?.title,
    },
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleRecord(slug);

  if (!article || article.status !== "published") {
    notFound();
  }

  const structuredData = [
    makeBreadcrumbSchema([
      { name: "Blog", path: "/blog" },
      { name: article.title, path: `/blog/${slug}` },
    ]),
    makeArticleSchema({
      slug,
      title: article.title,
      description: article.excerpt,
      image: article.coverImage,
      publishedAt: article.publishedAt || article.createdAt,
      updatedAt: article.updatedAt,
    }),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <ArticlePageClient article={article} />
    </>
  );
}
