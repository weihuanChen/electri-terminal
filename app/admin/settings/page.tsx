import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  Settings,
  Users,
  Globe,
  Mail,
  Shield,
  Bell,
  Palette,
  Database,
} from "lucide-react";

export default async function SettingsPage() {
  await requireAdmin();
  const adminData = await loadAdminData();
  const adminUsers = (adminData as { users?: unknown[] }).users;
  const users: unknown[] = Array.isArray(adminUsers) ? adminUsers : [];

  const settings = [
    {
      id: "general",
      title: "通用设置",
      description: "站点基础配置与联系方式展示开关",
      icon: Globe,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "users",
      title: "用户管理",
      description: "管理管理员账户和权限",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      count: users.length,
    },
    {
      id: "notifications",
      title: "通知设置",
      description: "配置邮件通知和系统提醒",
      icon: Bell,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      id: "seo",
      title: "SEO 设置",
      description: "全局 SEO 配置和元数据",
      icon: Database,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: "security",
      title: "安全设置",
      description: "密码策略、会话管理等安全配置",
      icon: Shield,
      color: "text-rose-600",
      bgColor: "bg-rose-100",
    },
    {
      id: "appearance",
      title: "外观设置",
      description: "主题、颜色、Logo 等外观配置",
      icon: Palette,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      id: "email",
      title: "邮件配置",
      description: "SMTP 服务器和邮件模板设置",
      icon: Mail,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">系统设置</h1>
          <p className="text-zinc-600 dark:text-zinc-400">管理系统配置和偏好设置</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">管理员</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Settings className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">配置项</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{settings.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">系统状态</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">正常</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settings.map((setting) => {
            const Icon = setting.icon;
            return (
              <a
                key={setting.id}
                href={`/admin/settings/${setting.id}`}
                className="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md hover:border-zinc-300 dark:border-zinc-700 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg ${setting.bgColor} p-3`}>
                    <Icon className={`h-6 w-6 ${setting.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {setting.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {setting.description}
                    </p>
                    {setting.count !== undefined && (
                      <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {setting.count} 项
                      </p>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* System Info */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">系统信息</h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="font-medium text-zinc-600 dark:text-zinc-400">版本</p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">1.0.0</p>
            </div>
            <div>
              <p className="font-medium text-zinc-600 dark:text-zinc-400">环境</p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">Production</p>
            </div>
            <div>
              <p className="font-medium text-zinc-600 dark:text-zinc-400">数据库</p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">Convex</p>
            </div>
            <div>
              <p className="font-medium text-zinc-600 dark:text-zinc-400">框架</p>
              <p className="mt-1 text-zinc-900 dark:text-zinc-100">Next.js 16.1.6</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">提示</p>
          <p>
            已支持通用设置中的联系方式配置。其他设置页面将在后续版本中实现。
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
