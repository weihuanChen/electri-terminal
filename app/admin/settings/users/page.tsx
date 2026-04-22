import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ArrowLeft, Users, Mail, Shield, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default async function UsersSettingsPage() {
  await requireAdmin();
  const adminData = await loadAdminData();
  const users = (adminData as any).users || [];

  const roleLabels: Record<string, string> = {
    admin: "管理员",
    editor: "编辑",
    viewer: "查看者",
  };

  const statusLabels: Record<string, string> = {
    published: "激活",
    draft: "禁用",
    archived: "已归档",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回设置
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">用户管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">管理系统用户和权限</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总用户数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{users.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">管理员</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {users.filter((u: any) => u.role === "admin").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">激活</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {users.filter((u: any) => u.status === "published").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">禁用</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {users.filter((u: any) => u.status === "draft").length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">用户列表</h3>
            <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
              <Users className="h-4 w-4" />
              新建用户
            </button>
          </div>

          {users.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">暂无用户</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                点击"新建用户"创建第一个用户
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
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      状态
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
                  {users.map((user: any) => (
                    <tr key={user._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300">
                          <Shield className="h-3 w-3" />
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : user.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                        }`}>
                          {user.status === "published" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {statusLabels[user.status] || user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 font-medium mr-3">
                          编辑
                        </button>
                        <button className="text-rose-600 hover:text-rose-900 font-medium">
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">提示</p>
          <p>
            用户编辑和删除功能将在后续版本中实现。
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
