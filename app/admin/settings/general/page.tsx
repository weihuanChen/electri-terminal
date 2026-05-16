import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminConvexClient } from "@/lib/convex-admin";
import {
  DEFAULT_PUBLIC_CONTACT_SETTINGS,
  normalizePublicContactSettings,
  type PublicContactSettings,
} from "@/lib/contactConfig";
import { DashboardLayout } from "../../components/DashboardLayout";
import { updateContactSettingsAction } from "../../actions";

function readFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getSocialMediaLink(
  settings: PublicContactSettings,
  platform: string
) {
  return settings.socialMedia.items.find(
    (item) => item.platform.trim().toLowerCase() === platform
  );
}

export default async function GeneralSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  let settings = DEFAULT_PUBLIC_CONTACT_SETTINGS;

  try {
    const resolved = (await getAdminConvexClient().query("frontend:getPublicContactSettings", {})) as
      | Partial<PublicContactSettings>
      | null;
    settings = normalizePublicContactSettings(resolved);
  } catch {
    settings = DEFAULT_PUBLIC_CONTACT_SETTINGS;
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const success = readFirstParam(resolvedSearchParams.success);
  const error = readFirstParam(resolvedSearchParams.error);
  const linkedInLink = getSocialMediaLink(settings, "linkedin");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            返回设置
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">通用设置</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              配置 Footer、首页 CTA、Contact 页面展示的联系方式。
            </p>
          </div>
        </div>

        {success === "contact_settings_saved" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            联系方式配置已保存。
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            保存失败：{error}
          </div>
        )}

        <form action={updateContactSettingsAction} className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Email</h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  name="emailEnabled"
                  defaultChecked={settings.email.enabled}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                启用 Email
              </label>
              <input
                type="email"
                name="emailValue"
                defaultValue={settings.email.value}
                placeholder="sales@electriterminal.com"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">WhatsApp</h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  name="whatsappEnabled"
                  defaultChecked={settings.whatsapp.enabled}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                启用 WhatsApp
              </label>
              <input
                type="text"
                name="whatsappValue"
                defaultValue={settings.whatsapp.value}
                placeholder="+1 555 123 4567"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="url"
                name="whatsappHref"
                defaultValue={settings.whatsapp.href}
                placeholder="https://wa.me/15551234567（可留空，系统自动生成）"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Phone</h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  name="phoneEnabled"
                  defaultChecked={settings.phone.enabled}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                启用 Phone
              </label>
              <input
                type="text"
                name="phoneValue"
                defaultValue={settings.phone.value}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Address</h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  name="addressEnabled"
                  defaultChecked={settings.address.enabled}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                启用 Address
              </label>
              <textarea
                name="addressLines"
                defaultValue={settings.address.lines.join("\n")}
                rows={5}
                placeholder={"Line 1\nLine 2\nLine 3"}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">社媒（预留）</h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  name="socialMediaEnabled"
                  defaultChecked={settings.socialMedia.enabled}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                启用社媒入口
              </label>
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      LinkedIn
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      预留领英企业主页链接，当前先用于后台配置存储，前台展示可后续接入。
                    </p>
                  </div>

                  <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      name="linkedinEnabled"
                      defaultChecked={linkedInLink?.enabled ?? false}
                      className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    启用 LinkedIn 链接
                  </label>

                  <input
                    type="text"
                    name="linkedinLabel"
                    defaultValue={linkedInLink?.label ?? "LinkedIn"}
                    placeholder="LinkedIn"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
                  />

                  <input
                    type="url"
                    name="linkedinUrl"
                    defaultValue={linkedInLink?.url ?? ""}
                    placeholder="https://www.linkedin.com/company/your-company"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              保存配置
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
