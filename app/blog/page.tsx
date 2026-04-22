import BlogPageClient, { type BlogPageClientProps } from "./BlogPageClient";
import { queryPublicPage } from "@/lib/metadata";

type BlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const VALID_ARTICLE_TYPES = new Set(["blog", "guide", "faq", "application"]);

function readSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

async function getBlogInitialData() {
  try {
    const initialArticles = await queryPublicPage<
      NonNullable<BlogPageClientProps["initialArticles"]>
    >("frontend:listLatestArticles", { limit: 24 });
    return { initialArticles };
  } catch {
    return {};
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const typeParam = readSingleParam(resolvedSearchParams.type);
  const initialType =
    typeParam && VALID_ARTICLE_TYPES.has(typeParam)
      ? (typeParam as NonNullable<BlogPageClientProps["initialType"]>)
      : null;
  const initialQuery = readSingleParam(resolvedSearchParams.q);

  const initialData = await getBlogInitialData();
  return (
    <BlogPageClient
      key={`${initialType ?? "all"}:${initialQuery || "-"}`}
      {...initialData}
      initialType={initialType}
      initialQuery={initialQuery}
    />
  );
}
