import Link from "next/link";
import { Edit2, Plus, UserRound } from "lucide-react";

import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";

export default async function AuthorsPage() {
  await requireAdmin();
  const { authors, articles } = await loadAdminData();

  const articleCountByAuthorId = new Map<string, number>();
  for (const article of articles) {
    if (!article.authorId) continue;
    const authorId = article.authorId.toString();
    articleCountByAuthorId.set(authorId, (articleCountByAuthorId.get(authorId) ?? 0) + 1);
  }

  const authorsWithAvatar = authors.filter((author) => Boolean(author.avatar)).length;
  const assignedArticleCount = articles.filter((article) => Boolean(article.authorId)).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">作者管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              管理文章作者资料，并分配到具体文章。
            </p>
          </div>
          <Link
            href="/admin/authors/create"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            新建作者
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">作者数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {authors.length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已有头像</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {authorsWithAvatar}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已分配文章</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {assignedArticleCount}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">作者列表</h3>
          </div>

          {authors.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <UserRound className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">暂无作者</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                点击“新建作者”创建第一位作者。
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      作者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      文章数
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {authors.map((author) => (
                    <tr key={author._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                            {author.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={author.avatar}
                                alt={author.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-500">
                                {author.name.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/authors/${author._id}/edit`}
                              className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                            >
                              {author.name}
                            </Link>
                            <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {author.title || "未设置职称"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-xl px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <p className="line-clamp-2">{author.description || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {articleCountByAuthorId.get(author._id) ?? 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/authors/${author._id}/edit`}
                          className="inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-zinc-200"
                          title="编辑作者"
                        >
                          <Edit2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
