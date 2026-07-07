import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import BlogPageClient from "../../BlogPageClient";
import {
  BLOG_PAGE_SIZE,
  buildBlogMetadata,
  getBlogInitialData,
  resolveBlogInitialFilters,
  type BlogSearchParams,
} from "../../blogIndex";
import { getBlogPageCount, parseBlogPageParam } from "@/lib/blogPagination";
import { blogUrl } from "@/lib/routes";

type BlogPaginatedPageProps = {
  params: Promise<{
    page: string;
  }>;
  searchParams: Promise<BlogSearchParams>;
};

export async function generateMetadata({ params }: BlogPaginatedPageProps): Promise<Metadata> {
  const { page: pageParam } = await params;
  const page = parseBlogPageParam(pageParam);

  return buildBlogMetadata(page ?? 1);
}

export default async function BlogPaginatedPage({
  params,
  searchParams,
}: BlogPaginatedPageProps) {
  const { page: pageParam } = await params;
  const page = parseBlogPageParam(pageParam);

  if (!page) {
    notFound();
  }

  if (page === 1) {
    redirect(blogUrl());
  }

  const [resolvedSearchParams, initialData] = await Promise.all([
    searchParams,
    getBlogInitialData(),
  ]);

  if (initialData.initialArticles) {
    const totalPages = getBlogPageCount(initialData.initialArticles.length, BLOG_PAGE_SIZE);
    if (page > totalPages) {
      notFound();
    }
  }

  const { initialType, initialQuery } = resolveBlogInitialFilters(resolvedSearchParams);

  return (
    <BlogPageClient
      key={`${initialType ?? "all"}:${initialQuery || "-"}:${page}`}
      {...initialData}
      currentPage={page}
      initialType={initialType}
      initialQuery={initialQuery}
      pageSize={BLOG_PAGE_SIZE}
    />
  );
}
