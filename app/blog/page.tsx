import type { Metadata } from "next";

import BlogPageClient from "./BlogPageClient";
import {
  BLOG_PAGE_SIZE,
  buildBlogMetadata,
  getBlogInitialData,
  resolveBlogInitialFilters,
  type BlogSearchParams,
} from "./blogIndex";

type BlogPageProps = {
  searchParams: Promise<BlogSearchParams>;
};

export const metadata: Metadata = buildBlogMetadata(1);

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const { initialType, initialQuery } = resolveBlogInitialFilters(resolvedSearchParams);
  const initialData = await getBlogInitialData();

  return (
    <BlogPageClient
      key={`${initialType ?? "all"}:${initialQuery || "-"}:1`}
      {...initialData}
      currentPage={1}
      initialType={initialType}
      initialQuery={initialQuery}
      pageSize={BLOG_PAGE_SIZE}
    />
  );
}
