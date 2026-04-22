import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ImportJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { importJobs } = await loadAdminData();

  const job = importJobs.find((j) => j._id === id);

  if (!job) {
    notFound();
  }

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

  const StatusIcon = statusIcons[job.status] || FileText;
  const totalRows = job.totalRows || 0;
  const successRows = job.successRows || 0;
  const failedRows = job.failedRows || 0;
  const progress = totalRows > 0 ? Math.round((successRows + failedRows) / totalRows * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">导入任务详情</h1>
            <p className="text-zinc-600 dark:text-zinc-400">查看导入任务的详细信息和结果</p>
          </div>
        </div>

        {/* Job Overview */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">任务概览</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">导入类型</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {typeLabels[job.type] || job.type}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">状态</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusColors[job.status]}`}>
                    <StatusIcon className="h-4 w-4" />
                    {statusLabels[job.status] || job.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">文件</p>
                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 break-all">{job.fileUrl}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总行数</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{totalRows}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">成功</p>
                <p className="mt-1 text-lg font-semibold text-emerald-600">{successRows}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">失败</p>
                <p className="mt-1 text-lg font-semibold text-rose-600">{failedRows}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {totalRows > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">进度</span>
                <span className="text-zinc-600 dark:text-zinc-400">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${job.status === "running" ? "bg-blue-600 animate-pulse" : job.status === "completed" ? "bg-emerald-600" : "bg-zinc-400"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="font-medium text-zinc-600 dark:text-zinc-400">创建时间</p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                {new Date(job._creationTime).toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
            {job.finishedAt && (
              <div>
                <p className="font-medium text-zinc-600 dark:text-zinc-400">完成时间</p>
                <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                  {new Date(job.finishedAt).toLocaleString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mapping Config */}
        {job.mappingConfig && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">映射配置</h2>
            <pre className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(job.mappingConfig, null, 2)}
            </pre>
          </div>
        )}

        {/* Note */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">提示</p>
          <p>
            导入任务行详情和错误日志功能将在后续版本中实现。
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
