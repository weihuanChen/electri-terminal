import Link from "next/link";
import { FilePlus2, FileText, Link2, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";

function formatBytes(size?: number) {
  if (!size || size <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export default async function AssetsPage() {
  await requireAdmin();
  const { assets } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">资源管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">维护 datasheet、catalog、证书和 CAD 等资源主数据</p>
          </div>
          <Link
            href="/admin/assets/create"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <FilePlus2 className="h-4 w-4" />
            新建资源
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总资源数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{assets.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">公开资源</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {assets.filter((asset) => asset.isPublic).length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">需留资下载</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {assets.filter((asset) => asset.requireLeadForm).length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已关联条目</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {assets.filter((asset) => (asset.relations || []).length > 0).length}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">资源列表</h3>
          </div>

          {assets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">暂无资源</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">先创建资源主数据，再去 Relations 页面挂到分类/产品。</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      标题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      语言 / 版本
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      大小
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      关联数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      可见性
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {assets.map((asset) => (
                    <tr key={asset._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Link
                            href={`/admin/assets/${asset._id}/edit`}
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                          >
                            {asset.title}
                          </Link>
                          {(asset.accessUrl || asset.fileUrl || asset.objectKey) && (
                            <a
                              href={asset.accessUrl || asset.fileUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300"
                            >
                              {asset.objectKey || asset.fileUrl}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">{asset.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {[asset.language, asset.version].filter(Boolean).join(" / ") || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {formatBytes(asset.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {(asset.relations || []).length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              asset.isPublic
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {asset.isPublic ? "public" : "private"}
                          </span>
                          {asset.requireLeadForm && (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                              lead form
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/assets/${asset._id}/edit`}
                            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-200"
                            title="编辑资源"
                          >
                            <Pencil className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                          </Link>
                          <Link
                            href="/admin/relations"
                            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-200"
                            title="管理关联"
                          >
                            <Link2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                          </Link>
                        </div>
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
