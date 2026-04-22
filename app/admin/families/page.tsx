import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { Plus, Edit2, Layers } from "lucide-react";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

export default async function FamiliesPage() {
  await requireAdmin();
  const { families, categories } = await loadAdminData();

  const categoryMap = new Map(categories.map((c) => [c._id, c.name]));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">产品系列管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">管理产品系列</p>
          </div>
          <Link
            href="/admin/families/create"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新建系列
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总系列数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{families.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已发布</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {families.filter((f) => f.status === "published").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">草稿</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {families.filter((f) => f.status === "draft").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">有品牌</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {families.filter((f) => f.brand).length}
            </p>
          </div>
        </div>

        {/* Families Table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">系列列表</h3>
          </div>

          {families.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Layers className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">暂无系列</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                点击"新建系列"创建第一个系列
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      系列名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      品牌
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      所属分类
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
                  {families.map((family) => (
                    <tr key={family._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/families/${family._id}/edit`}
                          className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                        >
                          {family.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {family.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {family.brand || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {categoryMap.get(family.categoryId) || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          family.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : family.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                        }`}>
                          {family.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/families/${family._id}/edit`}
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
