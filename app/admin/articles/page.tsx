import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { Plus, Edit2, FileText } from "lucide-react";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

export default async function ArticlesPage() {
  await requireAdmin();
  const { articles, categories, families, products } = await loadAdminData();

  const typeLabels: Record<string, string> = {
    blog: "博客",
    guide: "指南",
    faq: "FAQ",
    application: "应用案例",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">文章管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">管理博客、指南、FAQ 和应用案例</p>
          </div>
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新建文章
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总文章数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{articles.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已发布</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {articles.filter((a) => a.status === "published").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">博客</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {articles.filter((a) => a.type === "blog").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">草稿</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {articles.filter((a) => a.status === "draft").length}
            </p>
          </div>
        </div>

        {/* Articles Table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">文章列表</h3>
          </div>

          {articles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">暂无文章</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                点击"新建文章"创建第一篇文章
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      标题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      摘要
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      状态
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {articles.map((article) => (
                    <tr key={article._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                          {typeLabels[article.type] || article.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/articles/${article._id}/edit`}
                          className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                        >
                          {article.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-md truncate">
                        {article.excerpt || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          article.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : article.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                        }`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/articles/${article._id}/edit`}
                          className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-200 transition-colors"
                          title="编辑"
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
