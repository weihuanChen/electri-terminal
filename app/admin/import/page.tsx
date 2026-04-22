import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

export default async function ImportPage() {
  await requireAdmin();
  const { importJobs } = await loadAdminData();

  const typeLabels: Record<string, string> = {
    product_csv: "产品 CSV",
    family_csv: "系列 CSV",
    category_csv: "分类 CSV",
  };

  const statusLabels: Record<string, string> = {
    pending: "等待中",
    running: "运行中",
    completed: "完成",
    failed: "失败",
    partial_success: "部分成功",
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    running: Clock,
    completed: CheckCircle2,
    failed: XCircle,
    partial_success: AlertCircle,
  };

  const statusColors: Record<string, string> = {
    pending: "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300",
    running: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-rose-100 text-rose-700",
    partial_success: "bg-amber-100 text-amber-700",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">批量导入</h1>
            <p className="text-zinc-600 dark:text-zinc-400">管理批量导入任务</p>
          </div>
          {/* Note: Upload functionality would be implemented here */}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总任务数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{importJobs.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">等待中</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {importJobs.filter((j) => j.status === "pending").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">运行中</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {importJobs.filter((j) => j.status === "running").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">完成</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {importJobs.filter((j) => j.status === "completed").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">失败</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {importJobs.filter((j) => j.status === "failed").length}
            </p>
          </div>
        </div>

        {/* Import Jobs Table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">导入任务历史</h3>
          </div>

          {importJobs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Upload className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">暂无导入任务</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                当有导入任务时，会显示在这里
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
                      文件名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      进度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {importJobs.map((job) => {
                    const StatusIcon = statusIcons[job.status] || FileText;
                    const totalRows = job.totalRows || 0;
                    const successRows = job.successRows || 0;
                    const failedRows = job.failedRows || 0;
                    const progress = totalRows > 0 ? Math.round((successRows + failedRows) / totalRows * 100) : 0;

                    // Extract filename from URL
                    const fileName = job.fileUrl.split('/').pop() || job.fileUrl;

                    return (
                      <tr key={job._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            <FileText className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                            {typeLabels[job.type] || job.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100 max-w-md truncate">
                          {fileName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColors[job.status]}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusLabels[job.status] || job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                              <span className="font-medium">{progress}%</span>
                              <span className="text-zinc-400 dark:text-zinc-500">
                                ({successRows}/{totalRows})
                              </span>
                            </div>
                            {failedRows > 0 && (
                              <span className="text-xs text-rose-600">
                                {failedRows} 失败
                              </span>
                            )}
                            {job.status === "running" && (
                              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 animate-pulse"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {new Date(job._creationTime).toLocaleString("zh-CN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/admin/import/${job._id}`}
                            className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="查看详情"
                          >
                            <Eye className="h-4 w-4" />
                            查看
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload Section (Placeholder) */}
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" />
          <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            上传 CSV 文件进行批量导入
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            支持产品、系列和分类的批量导入
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            上传功能将在后续版本中实现
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
