import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Check,
  CircleDot,
  FileClock,
  Globe2,
  Languages,
  Pause,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { queryAdmin } from "@/lib/convex-admin";
import {
  DEFAULT_LOCALE,
  LANGUAGE_CONFIGS,
  type Locale,
  type StoredLanguageWorkflow,
} from "@/lib/i18n";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  activateLanguageProfileVersionAction,
  approveLanguageProfileVersionAction,
  saveLanguageProfileVersionAction,
  setLanguageProfileStatusAction,
} from "./actions";

type SearchParams = Record<string, string | string[] | undefined>;
type ProfileBundle = {
  profile: Doc<"languageProfiles">;
  versions: Doc<"languageProfileVersions">[];
} | null;
type FoundationReadiness = {
  ready: boolean;
  blockers: string[];
  counts: {
    approvedConcepts: number;
    approvedBindings: number;
    approvedLocaleRules: number;
    canonicalIntents: number;
    missingApprovedIntents: number;
    missingConceptRules: number;
  };
};

const DEFAULT_RU_HARD_RULES = {
  ctaPolicy: {
    request_quote: "Запросить коммерческое предложение",
    contact_engineering: "Связаться с техническим специалистом",
  },
  protectedPatterns: ["SKU", "IEC", "UL", "CE", "RoHS", "AWG"],
  unresolvedConceptPolicy: "block",
  seo: {
    requirePrimaryTermInTitle: true,
    prohibitKeywordStuffing: true,
  },
};

const DEFAULT_RU_SOFT_RULES = {
  tone: ["industrial", "engineering", "professional"],
  marketingIntensity: "low",
  technicalDepth: "high",
  trustEmphasis: ["manufacturer", "engineering", "OEM"],
  preferredInformationOrder: [
    "definition",
    "specification",
    "application",
    "selection",
    "RFQ",
  ],
  bodyStyle: {
    paragraphDensity: "medium",
    preferLongerTechnicalDescription: true,
  },
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function formatDate(timestamp?: number) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function formatJson(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2);
}

function profileTone(status?: Doc<"languageProfiles">["status"]) {
  if (status === "active")
    return "border-emerald-300 bg-emerald-50 text-emerald-800";
  if (status === "paused") return "border-amber-300 bg-amber-50 text-amber-800";
  return "border-zinc-300 bg-zinc-50 text-zinc-700";
}

function messageText(value: string) {
  const messages: Record<string, string> = {
    profile_version_created: "新策略版本已保存为 Draft。",
    profile_version_approved: "策略版本已通过人工审核。",
    profile_version_activated: "策略版本已激活，后续生成将使用这一版本。",
    profile_status_updated: "Language Profile 状态已更新。",
    invalid_json: "Hard Rules 或 Soft Rules 不是有效的 JSON 对象。",
    language_workflow_required:
      "该语言尚未建立 Language Workflow，不能创建策略。",
    hard_rules_required: "Hard Rules 不能为空。",
    soft_rules_required: "Soft Rules 不能为空。",
  };
  return messages[value] ?? value;
}

export default async function LocalizationStrategyPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = (await searchParams) ?? {};
  const success = first(params.success);
  const error = first(params.error);

  const workflows = (
    await queryAdmin<StoredLanguageWorkflow[]>(
      "frontend:getLanguageWorkflowSettings",
    )
  ).filter((workflow) => workflow.locale !== DEFAULT_LOCALE);
  const requestedLocale = first(params.locale);
  const selectedWorkflow =
    workflows.find((workflow) => workflow.locale === requestedLocale) ??
    workflows[0];

  let bundle: ProfileBundle = null;
  let readiness: FoundationReadiness | null = null;
  if (selectedWorkflow) {
    const market = `global_${selectedWorkflow.locale}`;
    [bundle, readiness] = await Promise.all([
      queryAdmin<ProfileBundle>(
        "queries/modules/localizationFoundation:getLanguageProfile",
        { locale: selectedWorkflow.locale, market },
      ),
      queryAdmin<FoundationReadiness>(
        "queries/modules/localizationFoundation:getLocalizationFoundationReadiness",
        { locale: selectedWorkflow.locale, market },
      ),
    ]);
  }

  const profile = bundle?.profile;
  const versions = bundle?.versions ?? [];
  const currentVersion = versions.find(
    (item) => item._id === profile?.currentVersionId,
  );
  const activeVersion = versions.find(
    (item) => item._id === profile?.activeVersionId,
  );
  const locale = selectedWorkflow?.locale as Locale | undefined;
  const languageConfig =
    locale && locale in LANGUAGE_CONFIGS ? LANGUAGE_CONFIGS[locale] : null;
  const hardRules =
    currentVersion?.hardRules ?? (locale === "ru" ? DEFAULT_RU_HARD_RULES : {});
  const softRules =
    currentVersion?.softRules ?? (locale === "ru" ? DEFAULT_RU_SOFT_RULES : {});

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-6 py-7 text-white shadow-sm lg:px-8">
          <div
            className="absolute inset-y-0 right-0 hidden w-[42%] opacity-40 lg:block"
            aria-hidden="true"
          >
            <div className="absolute right-14 top-[-80px] h-64 w-px rotate-[24deg] bg-cyan-400" />
            <div className="absolute right-36 top-[-60px] h-72 w-px rotate-[24deg] bg-slate-600" />
            <div className="absolute right-[-20px] top-8 h-px w-80 -rotate-12 bg-slate-700" />
          </div>
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                <Languages className="h-4 w-4" />
                Localization governance
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Localization Strategy
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                每种工作流语言维护一份版本化 Language Profile。Hard Rules
                决定阻断条件，Soft Rules 控制语气、技术深度和信息顺序。
              </p>
            </div>
            <Link
              href="/admin/settings/languages"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200"
            >
              <Workflow className="h-4 w-4" />
              Manage language workflows
            </Link>
          </div>
        </header>

        {(success || error) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
          >
            {messageText(error || success)}
          </div>
        )}

        {workflows.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <Globe2 className="mx-auto h-10 w-10 text-zinc-400" />
            <h2 className="mt-4 text-lg font-semibold">
              尚未创建目标语言工作流
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              先在语言设置中创建目标语言，之后才能维护 Localization Strategy。
            </p>
            <Link
              href="/admin/settings/languages"
              className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              前往语言工作流
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Workflow languages
              </p>
              <div className="space-y-1">
                {workflows.map((workflow) => {
                  const workflowLocale = workflow.locale as Locale;
                  const config = LANGUAGE_CONFIGS[workflowLocale];
                  const active = workflow.locale === selectedWorkflow?.locale;
                  return (
                    <Link
                      key={workflow.locale}
                      href={`/admin/localizations/strategy?locale=${workflow.locale}`}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 transition ${active ? "bg-slate-950 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
                    >
                      <span>
                        <span className="block text-sm font-semibold">
                          {config?.displayName ?? workflow.locale}
                        </span>
                        <span
                          className={`mt-0.5 block text-xs ${active ? "text-slate-400" : "text-zinc-400"}`}
                        >
                          {config?.nativeDisplayName}
                        </span>
                      </span>
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${active ? "border-slate-700 text-cyan-300" : "border-zinc-200 text-zinc-500"}`}
                      >
                        {workflow.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </aside>

            <main className="min-w-0 space-y-6">
              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Language workflow
                    </span>
                    <Workflow className="h-4 w-4 text-zinc-400" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold">
                    {languageConfig?.nativeDisplayName ?? locale}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {selectedWorkflow?.status} · /{selectedWorkflow?.locale}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Profile state
                    </span>
                    <CircleDot className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <p className="text-2xl font-semibold capitalize">
                      {profile?.status ?? "Missing"}
                    </p>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${profileTone(profile?.status)}`}
                    >
                      {profile?.status ?? "not created"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {versions.length} stored version
                    {versions.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Foundation readiness
                    </span>
                    <ShieldCheck className="h-4 w-4 text-zinc-400" />
                  </div>
                  <p
                    className={`mt-4 text-2xl font-semibold ${readiness?.ready ? "text-emerald-700" : "text-amber-700"}`}
                  >
                    {readiness?.ready ? "Ready" : "Blocked"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {readiness?.blockers.length ?? 0} unresolved foundation
                    gates
                  </p>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Strategy editor</h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        保存时始终创建新 Draft，不覆盖历史版本。
                      </p>
                    </div>
                    {profile && (
                      <form action={setLanguageProfileStatusAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input
                          type="hidden"
                          name="profileId"
                          value={profile._id}
                        />
                        <input
                          type="hidden"
                          name="status"
                          value={
                            profile.status === "paused" ? "active" : "paused"
                          }
                        />
                        <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-zinc-100">
                          {profile.status === "paused" ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                          {profile.status === "paused"
                            ? "Resume profile"
                            : "Pause profile"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                <form
                  action={saveLanguageProfileVersionAction}
                  className="space-y-5 p-6"
                >
                  <input type="hidden" name="locale" value={locale} />
                  <input
                    type="hidden"
                    name="market"
                    value={`global_${locale}`}
                  />
                  <div className="grid gap-5 lg:grid-cols-2">
                    <label className="block">
                      <span className="flex items-center justify-between text-sm font-semibold text-zinc-800">
                        Hard Rules
                        <span className="text-xs font-normal text-rose-600">
                          Blocking policy
                        </span>
                      </span>
                      <textarea
                        name="hardRules"
                        rows={18}
                        defaultValue={formatJson(hardRules)}
                        spellCheck={false}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-cyan-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </label>
                    <label className="block">
                      <span className="flex items-center justify-between text-sm font-semibold text-zinc-800">
                        Soft Rules
                        <span className="text-xs font-normal text-cyan-700">
                          Style guidance
                        </span>
                      </span>
                      <textarea
                        name="softRules"
                        rows={18}
                        defaultValue={formatJson(softRules)}
                        spellCheck={false}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-emerald-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <label className="block flex-1">
                      <span className="text-sm font-semibold text-zinc-800">
                        Change note
                      </span>
                      <input
                        name="changeNote"
                        placeholder="Why is this strategy version changing?"
                        className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-600"
                      />
                    </label>
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800">
                      {profile ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {profile
                        ? "Create new version"
                        : "Create language profile"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
                  <div>
                    <h2 className="text-lg font-semibold">Version ledger</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Draft → Approved → Active，激活新版本后旧版本自动
                      Superseded。
                    </p>
                  </div>
                  <FileClock className="h-5 w-5 text-zinc-400" />
                </div>
                {versions.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-zinc-500">
                    尚无策略版本。保存上方表单后会创建 Version 1。
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                        <tr>
                          <th className="px-6 py-3">Version</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Change note</th>
                          <th className="px-4 py-3">Created</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {versions.map((version) => {
                          const isActive = version._id === activeVersion?._id;
                          return (
                            <tr
                              key={version._id}
                              className={isActive ? "bg-emerald-50/60" : ""}
                            >
                              <td className="px-6 py-4">
                                <span className="font-semibold">
                                  v{version.version}
                                </span>
                                {isActive && (
                                  <span className="ml-2 rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-bold uppercase text-white">
                                    Active
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4 capitalize text-zinc-600">
                                {version.status}
                              </td>
                              <td className="max-w-md px-4 py-4 text-zinc-600">
                                {version.changeNote || "—"}
                              </td>
                              <td className="px-4 py-4 text-zinc-500">
                                {formatDate(version.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {version.status === "draft" && (
                                  <form
                                    action={approveLanguageProfileVersionAction}
                                    className="inline"
                                  >
                                    <input
                                      type="hidden"
                                      name="locale"
                                      value={locale}
                                    />
                                    <input
                                      type="hidden"
                                      name="versionId"
                                      value={version._id}
                                    />
                                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold hover:bg-zinc-100">
                                      <Check className="h-3.5 w-3.5" />
                                      Approve
                                    </button>
                                  </form>
                                )}
                                {version.status === "approved" && !isActive && (
                                  <form
                                    action={
                                      activateLanguageProfileVersionAction
                                    }
                                    className="inline"
                                  >
                                    <input
                                      type="hidden"
                                      name="locale"
                                      value={locale}
                                    />
                                    <input
                                      type="hidden"
                                      name="versionId"
                                      value={version._id}
                                    />
                                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                                      <Play className="h-3.5 w-3.5" />
                                      Activate
                                    </button>
                                  </form>
                                )}
                                {isActive && (
                                  <span className="text-xs font-semibold text-emerald-700">
                                    In production
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </main>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
