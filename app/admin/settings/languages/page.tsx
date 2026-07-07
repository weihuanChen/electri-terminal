import Link from "next/link";
import type { ElementType } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Lock,
  PauseCircle,
  Rocket,
  Save,
} from "lucide-react";

import { requireAdmin } from "@/lib/admin-auth";
import { getAdminConvexClient } from "@/lib/convex-admin";
import {
  LANGUAGE_CONFIGS,
  LANGUAGE_STATUS_DESCRIPTIONS,
  LANGUAGE_STATUS_LABELS,
  SUPPORTED_LOCALES,
  getAllowedLanguageStatusTransitions,
  resolveLanguageWorkflow,
  type Locale,
  type LocaleStatus,
  type StoredLanguageWorkflow,
} from "@/lib/i18n";
import { buildSitemapGscLinkIntegrityReport } from "@/lib/sitemap";
import { DashboardLayout } from "../../components/DashboardLayout";
import { updateLanguageWorkflowAction } from "../../actions";

function readFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function formatDate(timestamp?: number | string) {
  if (!timestamp) return "Never";
  const date = typeof timestamp === "number" ? new Date(timestamp) : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusTone(status: LocaleStatus) {
  switch (status) {
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "prelaunch":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "paused":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "draft":
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600";
  }
}

const STATUS_ICONS = {
  draft: Globe2,
  prelaunch: Rocket,
  published: CheckCircle2,
  paused: PauseCircle,
} satisfies Record<LocaleStatus, ElementType>;

function StatusBadge({ status }: { status: LocaleStatus }) {
  const Icon = STATUS_ICONS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusTone(status)}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {LANGUAGE_STATUS_LABELS[status]}
    </span>
  );
}

function errorText(error: string, blockers: string, high: string) {
  switch (error) {
    case "invalid_locale":
      return "无效语言代码。";
    case "invalid_status":
      return "无效目标状态。";
    case "default_locale_locked":
      return "默认语言是源语言，不能通过语言工作流修改。";
    case "transition_not_allowed":
      return "当前状态不允许执行这个流转。";
    case "runtime_not_published":
      return "运行时语言配置尚未发布该语言。请先通过代码配置打开语言发布边界，再执行后台发布。";
    case "gsc_gate_failed":
      return `GSC Link Integrity Gate 未通过，阻断项 ${blockers || "0"} 个，高风险项 ${high || "0"} 个。`;
    default:
      return error;
  }
}

export default async function LanguageSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const resolvedSearchParams = (await searchParams) ?? {};
  const success = readFirstParam(resolvedSearchParams.success);
  const error = readFirstParam(resolvedSearchParams.error);
  const selectedLocale = readFirstParam(resolvedSearchParams.locale);
  const blockers = readFirstParam(resolvedSearchParams.blockers);
  const high = readFirstParam(resolvedSearchParams.high);

  let storedWorkflows: StoredLanguageWorkflow[] = [];
  try {
    storedWorkflows = (await getAdminConvexClient().query(
      "frontend:getLanguageWorkflowSettings",
      {}
    )) as StoredLanguageWorkflow[];
  } catch {
    storedWorkflows = [];
  }

  const workflows = SUPPORTED_LOCALES.map((locale) =>
    resolveLanguageWorkflow(
      locale,
      storedWorkflows.find((workflow) => workflow.locale === locale)
    )
  );
  const workflowPublishedCount = workflows.filter(
    (workflow) => workflow.status === "published"
  ).length;
  const runtimePublishedCount = workflows.filter(
    (workflow) => workflow.runtimeStatus === "published"
  ).length;

  let gateReport:
    | Awaited<ReturnType<typeof buildSitemapGscLinkIntegrityReport>>
    | null = null;
  try {
    gateReport = await buildSitemapGscLinkIntegrityReport();
  } catch {
    gateReport = null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
              返回设置
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                语言状态工作流
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                管理语言级 release 状态；公开曝光仍以运行时配置和 GSC gate 为硬边界。
              </p>
            </div>
          </div>
        </div>

        {success === "language_workflow_updated" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            语言工作流状态已保存。
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            保存失败：{errorText(error, blockers, high)}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">Supported Locales</p>
            <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
              {SUPPORTED_LOCALES.length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">Workflow Published</p>
            <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
              {workflowPublishedCount}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-500">Runtime Published</p>
            <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50">
              {runtimePublishedCount}
            </p>
          </div>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                GSC Link Integrity Gate
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                发布语言或开启 GSC submission 前会运行当前 sitemap gate。
              </p>
            </div>
            {gateReport ? (
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  gateReport.passed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {gateReport.passed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {gateReport.passed ? "Passed" : "Blocked"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Unavailable
              </span>
            )}
          </div>
          {gateReport && (
            <div className="mt-5 grid gap-3 text-sm md:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-zinc-500">Sitemap URLs</p>
                <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
                  {gateReport.sitemapUrlCount}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-zinc-500">Blockers</p>
                <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
                  {gateReport.issueCounts.blocker}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-zinc-500">High</p>
                <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
                  {gateReport.issueCounts.high}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-zinc-500">Checked</p>
                <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
                  {formatDate(gateReport.checkedAt)}
                </p>
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-5">
          {workflows.map((workflow) => {
            const locale = workflow.locale as Locale;
            const config = LANGUAGE_CONFIGS[locale];
            const allowedTransitions = getAllowedLanguageStatusTransitions(workflow.status, {
              isDefaultLocale: workflow.isDefaultLocale,
            });
            const isSelected = selectedLocale === locale;

            return (
              <section
                key={locale}
                className={`rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900 ${
                  isSelected
                    ? "border-blue-300 ring-2 ring-blue-100 dark:border-blue-700"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                            {config.displayName}
                          </h2>
                          <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-semibold uppercase text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                            {locale}
                          </span>
                          {workflow.isDefaultLocale && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                              <Lock className="h-3.5 w-3.5" />
                              Source locale
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                          {config.nativeDisplayName} · Prefix {config.urlPrefix || "/"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={workflow.status} />
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            workflow.isRuntimeAligned
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {workflow.isRuntimeAligned ? "Runtime aligned" : "Pending runtime config"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {LANGUAGE_STATUS_DESCRIPTIONS[workflow.status]}
                    </p>

                    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["Sitemap", workflow.sitemapEnabled],
                        ["Hreflang", workflow.hreflangEnabled],
                        ["Switcher", workflow.languageSwitcherEnabled],
                        ["GSC", workflow.gscSubmissionEnabled],
                      ].map(([label, enabled]) => (
                        <div
                          key={label as string}
                          className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <p className="text-zinc-500">{label}</p>
                          <p
                            className={`mt-1 font-semibold ${
                              enabled ? "text-emerald-600" : "text-zinc-500"
                            }`}
                          >
                            {enabled ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-3 text-xs text-zinc-500 md:grid-cols-3">
                      <p>Runtime status: {LANGUAGE_STATUS_LABELS[workflow.runtimeStatus]}</p>
                      <p>Updated: {formatDate(workflow.updatedAt)}</p>
                      <p>Last gate: {workflow.lastGateCheckedAt ? formatDate(workflow.lastGateCheckedAt) : "Never"}</p>
                    </div>
                    {workflow.notes && (
                      <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                        {workflow.notes}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    {workflow.isDefaultLocale ? (
                      <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                          <Lock className="h-4 w-4" />
                          默认语言已锁定
                        </div>
                        <p>
                          English 是默认源语言，它的公开状态由代码配置和发布流程控制，不通过后台语言流转修改。
                        </p>
                      </div>
                    ) : (
                      <form action={updateLanguageWorkflowAction} className="space-y-4">
                        <input type="hidden" name="locale" value={locale} />
                        <div>
                          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            下一状态
                          </label>
                          <select
                            name="nextStatus"
                            disabled={allowedTransitions.length === 0}
                            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                          >
                            {allowedTransitions.map((status) => (
                              <option key={status} value={status}>
                                {LANGUAGE_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <label className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                          <input
                            type="checkbox"
                            name="gscSubmissionEnabled"
                            defaultChecked={workflow.gscSubmissionEnabled}
                            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>
                            发布时同时开启 GSC submission。只有目标状态为 Published 且 gate 通过时才会生效。
                          </span>
                        </label>

                        <div>
                          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Release owner
                          </label>
                          <input
                            type="text"
                            name="releaseOwner"
                            defaultValue={workflow.releaseOwner}
                            placeholder="Owner name"
                            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Notes
                          </label>
                          <textarea
                            name="notes"
                            defaultValue={workflow.notes}
                            rows={3}
                            placeholder="Gate notes, release scope, known follow-up"
                            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={allowedTransitions.length === 0}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          保存流转
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
