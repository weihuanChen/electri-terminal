import Link from "next/link";
import { Plus, SlidersHorizontal } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";

export default async function AttributeTemplatesPage() {
  await requireAdmin();
  const { attributeTemplates } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">属性模板管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">维护分类参数模板和前台规格字段。</p>
          </div>
          <Link
            href="/admin/attribute-templates/create"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            新建模板
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">模板总数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{attributeTemplates.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已发布模板</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {attributeTemplates.filter((item) => item.status === "published").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">字段总数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {attributeTemplates.reduce((total, item) => total + (item.fieldCount || 0), 0)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {attributeTemplates.map((template) => (
            <Link
              key={template._id}
              href={`/admin/attribute-templates/${template._id}/edit`}
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-slate-700" />
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{template.name}</h2>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    分类: {template.category?.name || "未关联"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    template.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : template.status === "draft"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {template.status}
                </span>
              </div>

              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                {template.description || "未填写模板描述"}
              </p>

              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-950 px-3 py-1 text-zinc-700 dark:text-zinc-300">
                  {template.fieldCount} 个字段
                </span>
                <span className="font-medium text-slate-700 transition-transform group-hover:translate-x-1">
                  进入编辑 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
