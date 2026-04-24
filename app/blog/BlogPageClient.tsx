"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { ArrowRight, CalendarDays, Clock3, Search } from "lucide-react";

import { Breadcrumb } from "@/components/shared";
import { api } from "@/convex/_generated/api";

type ArticleType = "blog" | "guide" | "faq" | "application";

type BlogArticle = {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  content?: string;
  tagNames?: string[];
  featured?: boolean;
  type: ArticleType;
  publishedAt?: number;
  updatedAt?: number;
  createdAt: number;
};

const ARTICLE_TYPES: ArticleType[] = ["guide", "blog", "faq", "application"];

const TYPE_LABEL: Record<ArticleType, string> = {
  guide: "Guide",
  blog: "Blog",
  faq: "FAQ",
  application: "Application",
};

const TOPIC_SHORTCUTS = [
  { label: "Wire Terminal Types", query: "wire terminal types" },
  { label: "Insulation Guide", query: "insulation guide" },
  { label: "Crimping Standards", query: "crimping standards" },
  { label: "Wire Size Selection", query: "wire size selection" },
] as const;

const PRODUCT_TOPIC_LINKS = [
  { label: "Ring Terminals", href: "/categories/ring-terminals" },
  { label: "Spade Terminals", href: "/categories/spade-terminals" },
  { label: "Wire Ferrules", href: "/categories/cord-end-terminals" },
];

export type BlogPageClientProps = {
  initialArticles?: BlogArticle[];
  initialType?: BlogArticle["type"] | null;
  initialQuery?: string;
};

function formatUpdatedDate(article: BlogArticle) {
  const date = getArticleTimestamp(article);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getArticleTimestamp(article: BlogArticle) {
  return article.updatedAt ?? article.publishedAt ?? article.createdAt;
}

function getReadTime(article: BlogArticle) {
  const rawText = `${article.title} ${article.excerpt ?? ""} ${article.content ?? ""}`.trim();
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const minutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 220)) : 5;
  return `${minutes} min read`;
}

function ArticleBadge({ type }: { type: ArticleType }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-primary dark:border-primary/50 dark:bg-primary/15 dark:text-blue-300">
      {TYPE_LABEL[type]}
    </span>
  );
}

function DenseArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-[0_14px_36px_-24px_rgba(15,23,42,0.55)] dark:border-slate-800 dark:bg-slate-900/95 dark:hover:shadow-[0_18px_36px_-22px_rgba(2,6,23,0.9)]"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(120deg,#f8fafc_0%,#e2e8f0_100%)] px-4 text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
            {TYPE_LABEL[article.type]}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <ArticleBadge type={article.type} />
        <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100 dark:group-hover:text-blue-300">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
          {article.excerpt || "Technical guidance, practical setup notes, and field-ready tips."}
        </p>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {getReadTime(article)}
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatUpdatedDate(article)}
          </span>
        </div>

        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary dark:text-blue-300">
          Read More
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function FeaturedMainCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex h-[340px] md:h-[360px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-20px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-none"
    >
      <div className="relative h-40 overflow-hidden bg-slate-100 md:h-44 dark:bg-slate-800">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(120deg,#f8fafc_0%,#e2e8f0_100%)] text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:bg-[linear-gradient(120deg,#1e293b_0%,#0f172a_100%)] dark:text-slate-300">
            Featured
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <ArticleBadge type={article.type} />
        <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-7 text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100 dark:group-hover:text-blue-300">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
          {article.excerpt || "Featured technical guide with practical selection and implementation notes."}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {getReadTime(article)}
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatUpdatedDate(article)}
          </span>
        </div>
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary dark:text-blue-300">
          Read Guide
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function FeaturedSideCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex h-[170px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_20px_-16px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-none"
    >
      <div className="relative h-full w-36 shrink-0 overflow-hidden bg-slate-100 sm:w-40 dark:bg-slate-800">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(120deg,#f8fafc_0%,#e2e8f0_100%)] text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:bg-[linear-gradient(120deg,#1e293b_0%,#0f172a_100%)] dark:text-slate-300">
            Featured
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <ArticleBadge type={article.type} />
        <h4 className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100 dark:group-hover:text-blue-300">
          {article.title}
        </h4>
        <div className="mt-auto flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {getReadTime(article)}
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>{formatUpdatedDate(article)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPageClient({
  initialArticles,
  initialType,
  initialQuery,
}: BlogPageClientProps) {
  const [selectedType, setSelectedType] = useState<BlogArticle["type"] | null>(
    initialType ?? null
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery ?? "");

  const liveArticles = useQuery(api.frontend.listLatestArticles, { limit: 24 });
  const articles = liveArticles ?? initialArticles;
  const isArticlesLoading = articles === undefined;
  const articleList = (articles ?? []) as BlogArticle[];

  const syncUrlParams = (nextType: ArticleType | null, nextQuery: string) => {
    const params = new URLSearchParams(window.location.search);
    if (nextType) {
      params.set("type", nextType);
    } else {
      params.delete("type");
    }

    const normalizedQuery = nextQuery.trim();
    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    } else {
      params.delete("q");
    }

    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  };

  const updateTypeFilter = (type: ArticleType | null) => {
    setSelectedType(type);
    syncUrlParams(type, searchQuery);
  };

  const updateSearchQuery = (value: string) => {
    setSearchQuery(value);
    syncUrlParams(selectedType, value);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredArticles = articleList.filter((article) => {
    if (selectedType && article.type !== selectedType) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      article.title,
      article.excerpt ?? "",
      article.content ?? "",
      (article.tagNames ?? []).join(" "),
      TYPE_LABEL[article.type],
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const sortedFilteredArticles = [...filteredArticles].sort(
    (left, right) => getArticleTimestamp(right) - getArticleTimestamp(left)
  );
  const featuredFirstArticles = sortedFilteredArticles.filter((article) => article.featured);
  const nonFeaturedArticles = sortedFilteredArticles.filter((article) => !article.featured);
  const featuredArticles =
    featuredFirstArticles.length > 0
      ? [...featuredFirstArticles, ...nonFeaturedArticles].slice(0, 3)
      : sortedFilteredArticles.slice(0, 3);
  const featuredSideArticles = featuredArticles.slice(1);
  const breadcrumbItems = [{ label: "Blog", href: "/blog" }];

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-slate-700/70 bg-[linear-gradient(135deg,#0f1c2e_0%,#1c2f4a_100%)] text-slate-50">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(52% 55% at 16% 22%, rgba(59,130,246,0.28) 0%, rgba(59,130,246,0) 100%), radial-gradient(40% 55% at 78% 6%, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.38) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.38) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(125deg, rgba(148,163,184,0.16) 0px, rgba(148,163,184,0.16) 1px, transparent 1px, transparent 11px)",
          }}
        />
        <div className="container relative z-10 py-10 md:py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
              Blog & Resources
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-200/90 md:text-lg">
              Technical guides, selection methods, and application insights for industrial
              electrical connections.
            </p>
            <div className="relative mt-6 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => updateSearchQuery(event.target.value)}
                type="search"
                placeholder="Search articles..."
                className="h-12 w-full rounded-lg border border-slate-500/70 bg-slate-900/55 pl-11 pr-4 text-sm text-slate-100 outline-none ring-blue-400/35 transition placeholder:text-slate-400 focus:ring-2"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white dark:border-slate-800 dark:bg-[#0E192A]">
        <div className="container py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Quick Entry
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Popular Topics</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {TOPIC_SHORTCUTS.map((topic) => (
              <button
                key={topic.label}
                onClick={() => updateSearchQuery(topic.query)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-[#0E192A]">
        <div className="container py-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateTypeFilter(null)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !selectedType
                  ? "bg-slate-900 text-white dark:bg-blue-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              All
            </button>
            {ARTICLE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => updateTypeFilter(type)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedType === type
                    ? "bg-slate-900 text-white dark:bg-blue-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {TYPE_LABEL[type]}s
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F8FC] pb-12 pt-4 dark:bg-slate-950">
        <div className="container">
          {isArticlesLoading ? (
            <div className="py-14 text-center text-slate-500 dark:text-slate-400">Loading articles...</div>
          ) : sortedFilteredArticles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
              No articles found. Try another keyword or filter.
            </div>
          ) : (
            <>
              {featuredArticles.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Featured Articles
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Featured Guides</h2>
                  <div
                    className={`mt-5 grid gap-5 ${
                      featuredSideArticles.length > 0 ? "lg:grid-cols-2 lg:items-stretch" : ""
                    }`}
                  >
                    <div>
                      <FeaturedMainCard article={featuredArticles[0]} />
                    </div>
                    {featuredSideArticles.length > 0 ? (
                      <div className="space-y-5">
                        {featuredSideArticles.map((article) => (
                          <FeaturedSideCard key={article._id} article={article} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">All Articles</h3>
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  {sortedFilteredArticles.length} results
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedFilteredArticles.map((article) => (
                  <DenseArticleCard key={article._id} article={article} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-slate-50/80 py-8 dark:border-slate-800 dark:bg-[#0E192A]">
        <div className="container">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Explore Products by Topic
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {PRODUCT_TOPIC_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                {item.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
