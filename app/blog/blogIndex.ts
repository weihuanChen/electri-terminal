import type { Metadata } from "next";

import type { BlogPageClientProps } from "./BlogPageClient";
import { queryPublicPage } from "@/lib/metadata";
import { BLOG_PAGE_SIZE, getBlogPagePath } from "@/lib/blogPagination";

export const BLOG_METADATA_TITLE =
  "Electrical Terminal Industry Blog & Technical Resources | Electri Terminal";
export const BLOG_METADATA_DESCRIPTION =
  "Technical articles and industry insights covering electrical terminals, crimping systems, copper connectors, wiring standards, OEM manufacturing, and industrial electrical applications.";

export const VALID_ARTICLE_TYPES = new Set(["blog", "guide", "faq", "application"]);

export type BlogSearchParams = Record<string, string | string[] | undefined>;

export function readSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export function resolveBlogInitialFilters(searchParams: BlogSearchParams) {
  const typeParam = readSingleParam(searchParams.type);
  const initialType =
    typeParam && VALID_ARTICLE_TYPES.has(typeParam)
      ? (typeParam as NonNullable<BlogPageClientProps["initialType"]>)
      : null;
  const initialQuery = readSingleParam(searchParams.q);

  return { initialType, initialQuery };
}

export function buildBlogMetadata(page: number): Metadata {
  const canonicalPath = getBlogPagePath(page);
  const title =
    page > 1 ? `${BLOG_METADATA_TITLE} - Page ${page}` : BLOG_METADATA_TITLE;
  const description =
    page > 1
      ? `${BLOG_METADATA_DESCRIPTION} Browse page ${page} of the Electri Terminal technical resource library.`
      : BLOG_METADATA_DESCRIPTION;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalPath,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export async function getBlogInitialData() {
  try {
    const initialArticles = await queryPublicPage<
      NonNullable<BlogPageClientProps["initialArticles"]>
    >("queries/modules/articles:listArticles", { status: "published", limit: 200 });
    return { initialArticles };
  } catch {
    return { initialArticles: [] };
  }
}

export { BLOG_PAGE_SIZE };
