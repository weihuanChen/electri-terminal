import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { Mail, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

export default async function InquiriesPage() {
  await requireAdmin();
  const { inquiries } = await loadAdminData();

  const statusLabels: Record<string, string> = {
    new: "新询盘",
    in_progress: "处理中",
    resolved: "已解决",
    closed: "已关闭",
    spam: "垃圾邮件",
  };

  const statusIcons: Record<string, any> = {
    new: AlertCircle,
    in_progress: Clock,
    resolved: CheckCircle2,
    closed: XCircle,
    spam: XCircle,
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300",
    spam: "bg-rose-100 text-rose-700",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">询盘管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">查看和处理客户询盘</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总询盘数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{inquiries.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">新询盘</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {inquiries.filter((i) => i.status === "new").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">处理中</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {inquiries.filter((i) => i.status === "in_progress").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已解决</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {inquiries.filter((i) => i.status === "resolved").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已关闭</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {inquiries.filter((i) => i.status === "closed").length}
            </p>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">询盘列表</h3>
          </div>

          {inquiries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">暂无询盘</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                当有客户提交询盘时，会显示在这里
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      邮箱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      公司
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      主题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      提交时间
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {inquiries.map((inquiry) => {
                    const StatusIcon = statusIcons[inquiry.status] || AlertCircle;
                    return (
                      <tr key={inquiry._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {inquiry.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {inquiry.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {inquiry.company || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                          {(inquiry as any).subject || inquiry.message?.substring(0, 50) + "..."}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColors[inquiry.status]}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusLabels[inquiry.status] || inquiry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {new Date(inquiry._creationTime).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
