import Link from "next/link";
import { notFound } from "next/navigation";
import type { Doc } from "@/convex/_generated/dataModel";
import { requireAdmin } from "@/lib/admin-auth";
import { queryAdmin } from "@/lib/convex-admin";
import {
  DEFAULT_LOCALE,
  LANGUAGE_CONFIGS,
  LOCALIZATION_STATUS_TRANSITIONS,
  STATIC_PAGE_DEFINITIONS,
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
  type LocalizationStatus,
} from "@/lib/i18n";
import {
  moveLocalizationStatusAction,
  saveStaticPageLocalizationDraftAction,
  unpublishLocalizationAction,
} from "@/app/admin/actions";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { StaticPageSourceReference } from "./StaticPageSourceReference";

type SearchParams = Record<string, string | string[] | undefined>;
const STATUS_LABELS: Record<LocalizationStatus, string> = {
  missing: "Missing", draft: "Draft", machine_ready: "Machine ready",
  review_required: "Review required", approved: "Approved", published: "Published", stale: "Stale",
};

function field(record: Doc<"localizations"> | null, key: string) {
  const value = record?.localizedFields?.[key];
  return typeof value === "string" ? value : "";
}

function structuredContentValue(record: Doc<"localizations"> | null) {
  const content = record?.localizedFields?.content;
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return JSON.stringify(content, null, 2);
  }
  const legacyBody = field(record, "body");
  return legacyBody
    ? JSON.stringify({ schemaVersion: 1, pageKey: record?.sourceId ?? "", sourcePath: "", blocks: [{ id: "legacy-body", type: "main", headings: [], paragraphs: [legacyBody], lists: [], ctas: [], children: [] }] }, null, 2)
    : "";
}

export default async function StaticPageEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  await requireAdmin();
  const { id } = await params;
  const definition = STATIC_PAGE_DEFINITIONS.find((page) => page.key === id);
  if (!definition) notFound();
  const query = (await searchParams) ?? {};
  const raw = Array.isArray(query.locale) ? query.locale[0] : query.locale;
  const targets = SUPPORTED_LOCALES.filter((item) => item !== DEFAULT_LOCALE);
  const locale: Locale = raw && isLocale(raw) && raw !== DEFAULT_LOCALE ? raw : targets[0];
  const record = await queryAdmin<Doc<"localizations"> | null>(
    "queries/modules/localizations:getLocalizationByEntityLocale",
    { entityType: "staticPage", sourceId: id, locale }
  );
  const returnTo = `/admin/localizations/static-pages/${id}?locale=${locale}`;
  const nextStatuses = record
    ? (LOCALIZATION_STATUS_TRANSITIONS[record.status] as readonly LocalizationStatus[]).filter(
        (status) => status !== "missing" && !(record.entityType === "staticPage" && status === "approved" && record.status !== "review_required")
      )
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href={`/admin/localizations/static-pages?locale=${locale}`} className="text-sm font-semibold text-cyan-700">← L1 Static Pages</Link>
            <h1 className="mt-2 text-2xl font-bold">{id}</h1>
            <p className="text-zinc-500">
              {LANGUAGE_CONFIGS[locale].displayName} · {record?.status ?? "missing"} · {definition.requiredForLanguageLaunch ? "Required for release" : "Optional"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {targets.map((item) => (
              <Link key={item} href={`/admin/localizations/static-pages/${id}?locale=${item}`} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${item === locale ? "bg-slate-900 text-white" : "bg-white"}`}>{item.toUpperCase()}</Link>
            ))}
          </div>
        </div>

        {record && (
          <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            {nextStatuses.length > 0 && record.status !== "published" && (
              <form action={moveLocalizationStatusAction}>
                <input type="hidden" name="id" value={record._id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <input type="hidden" name="actor" value="admin" />
                <select name="nextStatus" className="rounded-lg border px-3 py-2 text-sm">
                  {nextStatuses.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                </select>
                <button className="ml-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Update status</button>
              </form>
            )}
            {record.status === "published" && (
              <form action={unpublishLocalizationAction}>
                <input type="hidden" name="id" value={record._id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button className="rounded-lg border px-4 py-2 text-sm font-semibold">Unpublish</button>
              </form>
            )}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]">
          <StaticPageSourceReference sourcePath={definition.path} />
          <form action={saveStaticPageLocalizationDraftAction} className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <input type="hidden" name="sourceId" value={id} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="requiredForRelease" value={definition.requiredForLanguageLaunch ? "true" : "false"} />
            <div><h2 className="text-lg font-semibold">Russian localized copy</h2><p className="text-sm text-zinc-500">Edit independently from the English source. Source copy actions use the clipboard only.</p></div>
            {["title", "headline", "primaryCta", "secondaryCta", "seoTitle"].map((key) => (
              <label key={key} className="block"><span className="text-sm font-semibold">{key}</span><input name={key} defaultValue={key === "title" ? record?.title ?? "" : key === "seoTitle" ? record?.seoTitle ?? "" : field(record, key)} className="mt-2 w-full rounded-lg border p-3" /></label>
            ))}
            {["intro", "seoDescription", "reviewNotes"].map((key) => (
              <label key={key} className="block"><span className="text-sm font-semibold">{key}</span><textarea name={key} defaultValue={key === "seoDescription" ? record?.seoDescription ?? "" : key === "reviewNotes" ? record?.reviewNotes ?? "" : field(record, key)} className={`mt-2 w-full rounded-lg border p-3 ${key === "body" ? "min-h-80" : "min-h-24"}`} /></label>
            ))}
            <label className="block">
              <span className="text-sm font-semibold">Structured content JSON</span>
              <p className="mt-1 text-xs text-zinc-500">Keep schemaVersion, block IDs and hierarchy aligned with the English source. Translate text values only.</p>
              <textarea name="contentJson" defaultValue={structuredContentValue(record)} spellCheck={false} className="mt-2 min-h-[36rem] w-full rounded-lg border p-3 font-mono text-xs leading-5" />
            </label>
            <button className="rounded-lg bg-cyan-700 px-5 py-3 font-semibold text-white">Save Russian draft</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
