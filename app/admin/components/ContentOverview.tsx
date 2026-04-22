import { Doc } from "@/convex/_generated/dataModel";
import { FileText, PenLine, Eye, FolderOpen } from "lucide-react";

interface ContentOverviewProps {
  articles: Doc<"articles">[];
}

function getTypeColor(type: string) {
  const colors = {
    blog: "bg-blue-100 text-blue-700 border-blue-200",
    guide: "bg-purple-100 text-purple-700 border-purple-200",
    faq: "bg-amber-100 text-amber-700 border-amber-200",
    application: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return colors[type as keyof typeof colors] || colors.blog;
}

function getStatusIcon(status: string) {
  const icons = {
    published: "text-emerald-600",
    draft: "text-amber-600",
    archived: "text-zinc-400 dark:text-zinc-500",
  };
  return icons[status as keyof typeof icons] || icons.draft;
}

export function ContentOverview({ articles }: ContentOverviewProps) {
  const totalArticles = articles.length;
  const publishedArticles = articles.filter((a) => a.status === "published").length;
  const draftArticles = articles.filter((a) => a.status === "draft").length;

  // Group by type
  const articlesByType = articles.reduce((acc, article) => {
    acc[article.type] = acc[article.type] || [];
    acc[article.type].push(article);
    return acc;
  }, {} as Record<string, Doc<"articles">[]>);

  const latestArticles = articles.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Articles</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalArticles}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Published</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{publishedArticles}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {totalArticles > 0
                  ? `${Math.round((publishedArticles / totalArticles) * 100)}% of total`
                  : "-"}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <Eye className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Drafts</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{draftArticles}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {draftArticles > 0 ? "Need review" : "All caught up"}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <PenLine className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Breakdown by Type */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Content by Type</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Articles distribution</p>
        </div>

        <div className="grid divide-y divide-zinc-100 dark:divide-zinc-800 sm:divide-y-0 sm:divide-x sm:grid-cols-2 lg:grid-cols-4">
          {(["blog", "guide", "faq", "application"] as const).map((type) => {
            const typeArticles = articlesByType[type] || [];
            const typePublished = typeArticles.filter((a) => a.status === "published").length;

            return (
              <div key={type} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                      {type}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {typeArticles.length}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {typePublished} published
                    </p>
                  </div>
                  <div
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${getTypeColor(
                      type
                    )}`}
                  >
                    {typeArticles.length > 0
                      ? `${Math.round((typePublished / typeArticles.length) * 100)}%`
                      : "0%"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Articles */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Latest Articles</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Recently created or updated</p>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {latestArticles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">No articles yet</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Create your first article to get started
              </p>
            </div>
          ) : (
            latestArticles.map((article) => (
              <div
                key={article._id}
                className="px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getTypeColor(
                          article.type
                        )}`}
                      >
                        {article.type}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-xs font-medium ${getStatusIcon(
                          article.status
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                        {article.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{article.title}</h4>
                    {article.excerpt && (
                      <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {article.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                    <p>
                      {new Date(article._creationTime).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {article.slug}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {articles.length > 5 && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <a
              href="#articles"
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all {articles.length} articles →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
