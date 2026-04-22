import type { Metadata } from "next";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { ArticleCard, Breadcrumb, FamilyCard, ProductCard } from "@/components/shared";
import { categoryUrl } from "@/lib/routes";
import { queryPublicPage } from "@/lib/metadata";
import { makeSearchResultsSchema } from "@/lib/schema";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type SearchCategoryResult = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
};

type SearchProductResult = {
  _id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  model?: string;
  skuCode?: string;
  summary?: string;
  mainImage?: string;
  family?: {
    slug: string;
    name: string;
  } | null;
  category?: {
    slug: string;
    name: string;
  } | null;
};

type SearchFamilyResult = {
  _id: string;
  slug: string;
  name: string;
  summary?: string;
  heroImage?: string;
  category?: {
    slug: string;
    name: string;
  } | null;
};

type SearchArticleResult = {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  type?: string;
  publishedAt?: number;
};

type SearchResults = {
  products: SearchProductResult[];
  families: SearchFamilyResult[];
  categories: SearchCategoryResult[];
  articles: SearchArticleResult[];
  suggestions: string[];
  popularSuggestions: string[];
};

function normalizeQuery(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = normalizeQuery(resolvedSearchParams.q);

  return {
    title: query ? `Search results for "${query}"` : "Search",
    description: query
      ? `Search results for ${query} across products, families, categories, and articles.`
      : "Search products, families, categories, and technical articles on Electri Terminal.",
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeQuery(resolvedSearchParams.q);
  const breadcrumbItems = [{ label: "Search", href: "/search" }];

  const results = query
    ? await queryPublicPage<SearchResults>("frontend:searchSiteContent", {
        query,
        limit: 8,
      })
    : {
        products: [],
        families: [],
        categories: [],
        articles: [],
        suggestions: [],
        popularSuggestions: [],
      };

  const totalResults =
    results.products.length +
    results.families.length +
    results.categories.length +
    results.articles.length;

  const structuredData =
    query && totalResults > 0
      ? makeSearchResultsSchema({
          query,
          items: [
            ...results.products.map((product) => ({
              name: product.shortTitle || product.title,
              url: `/products/${product.slug}`,
            })),
            ...results.families.map((family) => ({
              name: family.name,
              url: `/families/${family.slug}`,
            })),
            ...results.categories.map((category) => ({
              name: category.name,
              url: categoryUrl(category.slug),
            })),
            ...results.articles.map((article) => ({
              name: article.title,
              url: `/blog/${article.slug}`,
            })),
          ],
        })
      : null;

  return (
    <>
      {structuredData ? <JsonLd data={structuredData} /> : null}

      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="section border-b border-border">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-4xl font-semibold">Search</h1>
            <p className="mb-8 text-secondary">
              Search products, product families, categories, and technical articles.
            </p>
            <form action="/search" method="get" className="flex flex-col gap-4 sm:flex-row">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search by model, series, product name, or article title"
                className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!query ? (
            <div className="space-y-6 rounded-lg border border-border bg-muted p-8">
              <p className="text-secondary">
                Start with a product model, family name, or application keyword.
              </p>
              {results.popularSuggestions.length > 0 ? (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">
                    Suggested Searches
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {results.popularSuggestions.map((suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="rounded-full border border-border bg-white px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                      >
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : totalResults > 0 ? (
            <div className="space-y-12">
              <p className="text-sm text-secondary">
                {totalResults} results for{" "}
                <span className="font-medium text-foreground">&quot;{query}&quot;</span>
              </p>

              {results.suggestions.length > 0 ? (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">
                    Related Searches
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {results.suggestions.map((suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                      >
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {results.products.length > 0 ? (
                <section>
                  <h2 className="mb-6 text-2xl font-semibold">Products</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {results.products.map((product) => (
                      <ProductCard
                        key={product._id}
                        slug={product.slug}
                        title={product.title}
                        shortTitle={product.shortTitle}
                        mainImage={product.mainImage}
                        summary={product.summary}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {results.families.length > 0 ? (
                <section>
                  <h2 className="mb-6 text-2xl font-semibold">Product Families</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {results.families.map((family) => (
                      <FamilyCard
                        key={family._id}
                        slug={family.slug}
                        name={family.name}
                        summary={family.summary}
                        heroImage={family.heroImage}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {results.categories.length > 0 ? (
                <section>
                  <h2 className="mb-6 text-2xl font-semibold">Categories</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {results.categories.map((category) => (
                      <Link
                        key={category._id}
                        href={categoryUrl(category.slug)}
                        className="rounded-lg border border-border p-5 transition-colors hover:border-primary"
                      >
                        <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-secondary">
                          {category.description || "Published category page"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {results.articles.length > 0 ? (
                <section>
                  <h2 className="mb-6 text-2xl font-semibold">Articles</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {results.articles.map((article) => (
                      <ArticleCard
                        key={article._id}
                        slug={article.slug}
                        title={article.title}
                        excerpt={article.excerpt}
                        coverImage={article.coverImage}
                        type={article.type}
                        publishedAt={article.publishedAt}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6 rounded-lg border border-border bg-muted p-8 text-secondary">
              <p>
                No published results found for{" "}
                <span className="font-medium text-foreground">&quot;{query}&quot;</span>.
              </p>
              {results.suggestions.length > 0 ? (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">
                    Try One Of These
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {results.suggestions.map((suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="rounded-full border border-border bg-white px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                      >
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : results.popularSuggestions.length > 0 ? (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">
                    Popular Searches
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {results.popularSuggestions.map((suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="rounded-full border border-border bg-white px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                      >
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
