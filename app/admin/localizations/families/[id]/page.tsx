import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Save, ShieldCheck } from "lucide-react";

import type { Doc } from "@/convex/_generated/dataModel";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductFamily, queryAdmin } from "@/lib/convex-admin";
import {
  DEFAULT_LOCALE,
  LANGUAGE_CONFIGS,
  LOCALIZATION_STATUS_TRANSITIONS,
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
  type LocalizationStatus,
} from "@/lib/i18n";
import {
  moveLocalizationStatusAction,
  saveFamilyLocalizationDraftAction,
  unpublishLocalizationAction,
} from "@/app/admin/actions";
import { SourceCopyButton } from "@/app/admin/localizations/components/SourceCopyButton";
import { DashboardLayout } from "../../../components/DashboardLayout";

type SearchParams = Record<string, string | string[] | undefined>;
type LocalizationRecord = Doc<"localizations">;

const STATUS_LABELS = {
  missing: "Missing",
  draft: "Draft",
  machine_ready: "Machine ready",
  review_required: "Review required",
  approved: "Approved",
  published: "Published",
  stale: "Stale",
} satisfies Record<LocalizationStatus, string>;

function readFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getStatusTone(status: LocalizationStatus) {
  switch (status) {
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "approved":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "machine_ready":
    case "review_required":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "stale":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "draft":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "missing":
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600";
  }
}

function StatusBadge({ status }: { status: LocalizationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusTone(status)}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function getFields(localization: LocalizationRecord | null) {
  const fields = localization?.localizedFields;
  return fields && typeof fields === "object" && !Array.isArray(fields) ? fields : {};
}

function getFieldText(fields: Record<string, unknown>, key: string) {
  const value = fields[key];
  return typeof value === "string" ? value : "";
}

function getFieldObject(fields: Record<string, unknown>, key: string) {
  const value = fields[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

function getConfigSection(pageConfig: unknown, key: string) {
  if (!pageConfig || typeof pageConfig !== "object" || Array.isArray(pageConfig)) {
    return undefined;
  }

  const value = (pageConfig as Record<string, unknown>)[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

function getLongformMarkdown(pageConfig: unknown) {
  const longform = getConfigSection(pageConfig, "longform");
  const markdown = longform ? (longform as Record<string, unknown>).markdown : undefined;
  return typeof markdown === "string" ? markdown : "";
}

function getPageConfigRest(pageConfig: unknown) {
  if (!pageConfig || typeof pageConfig !== "object" || Array.isArray(pageConfig)) {
    return undefined;
  }

  const rest = { ...(pageConfig as Record<string, unknown>) };
  delete rest.content;
  delete rest.longform;
  delete rest.seoBoost;

  return Object.keys(rest).length > 0 ? rest : undefined;
}

function getFieldArray(fields: Record<string, unknown>, key: string) {
  const value = fields[key];
  return Array.isArray(value) ? value : undefined;
}

function jsonEditorValue(value: unknown) {
  if (!value || typeof value !== "object") return "";
  return JSON.stringify(value, null, 2);
}

function formatDate(timestamp?: number) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNextStatuses(status: LocalizationStatus) {
  if (status === "missing") return [];
  return (
    LOCALIZATION_STATUS_TRANSITIONS[status] as readonly LocalizationStatus[]
  ).filter((nextStatus) => nextStatus !== "missing");
}

function statusText(value: string) {
  switch (value) {
    case "family_localization_saved":
      return "Family localization draft saved.";
    case "localization_status_updated":
      return "Localization status updated.";
    case "localization_unpublished":
      return "Localization moved back to Approved.";
    default:
      return value;
  }
}

export default async function FamilyLocalizationEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  await requireAdmin();

  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedLocale = readFirstParam(resolvedSearchParams.locale);
  const success = readFirstParam(resolvedSearchParams.success);
  const error = readFirstParam(resolvedSearchParams.error);
  const targetLocales = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
  const selectedLocale: Locale =
    isLocale(requestedLocale) && requestedLocale !== DEFAULT_LOCALE
      ? requestedLocale
      : targetLocales[0];

  const [family, localization] = await Promise.all([
    getProductFamily(id),
    queryAdmin<LocalizationRecord | null>(
      "queries/modules/localizations:getLocalizationByEntityLocale",
      {
        entityType: "family",
        sourceId: id,
        locale: selectedLocale,
      }
    ),
  ]);

  if (!family) {
    notFound();
  }

  const fields = getFields(localization);
  const returnTo = `/admin/localizations/families/${family._id}?locale=${selectedLocale}`;
  const status = localization?.status ?? "missing";
  const nextStatuses = getNextStatuses(status);
  const isPublished = localization?.status === "published";
  const pageConfigPatch = getFieldObject(fields, "pageConfig");
  const pageConfigContentPatch = getConfigSection(pageConfigPatch, "content");
  const pageConfigLongformMarkdown = getLongformMarkdown(pageConfigPatch);
  const pageConfigSeoBoostPatch = getConfigSection(pageConfigPatch, "seoBoost");
  const pageConfigRestPatch = getPageConfigRest(pageConfigPatch);
  const highlightsPatch = getFieldArray(fields, "highlights");
  const targetPath = `/${selectedLocale}/families/${family.slug}`;
  const draftFormId = "family-localization-draft-form";
  const sourceCopyValues = {
    title: family.name,
    summary: family.summary || "",
    content: family.content || "",
    seoTitle: family.seoTitle || "",
    seoDescription: family.seoDescription || "",
    highlightsJson: jsonEditorValue(family.highlights),
    pageConfigContentJson: jsonEditorValue(family.pageConfig?.content),
    longformMarkdown: getLongformMarkdown(family.pageConfig),
    seoBoostJson: jsonEditorValue(family.pageConfig?.seoBoost),
    pageConfigJson: jsonEditorValue(getPageConfigRest(family.pageConfig)),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/localizations/families?locale=${selectedLocale}`}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Families
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {family.name}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Editing {LANGUAGE_CONFIGS[selectedLocale].displayName} family localization.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {targetLocales.map((locale) => (
              <Link
                key={locale}
                href={`/admin/localizations/families/${family._id}?locale=${locale}`}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  locale === selectedLocale
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {locale.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {statusText(success)}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={status} />
              <span className="text-sm text-zinc-500">
                Updated {formatDate(localization?.updatedAt)}
              </span>
              <Link
                href={targetPath}
                className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
              >
                Target URL
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            {localization && (
              <div className="flex flex-wrap items-center gap-2">
                {nextStatuses.length > 0 && (
                  <form action={moveLocalizationStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={localization._id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <input type="hidden" name="actor" value="admin" />
                    <select
                      name="nextStatus"
                      className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                    >
                      {nextStatuses.map((nextStatus) => (
                        <option key={nextStatus} value={nextStatus}>
                          {STATUS_LABELS[nextStatus]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Update status
                    </button>
                  </form>
                )}
                {isPublished && (
                  <form action={unpublishLocalizationAction}>
                    <input type="hidden" name="id" value={localization._id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <input type="hidden" name="actor" value="admin" />
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      Unpublish
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
          <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Source family
              </h2>
              <p className="text-sm text-zinc-500">Read-only English source fields.</p>
            </div>
            <div className="space-y-4 p-5 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Name</p>
                <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
                  {family.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Slug</p>
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">{family.slug}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Summary</p>
                <p className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {family.summary || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Content</p>
                <p className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {family.content || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Highlights</p>
                <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
                  {jsonEditorValue(family.highlights) || "[]"}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Page config</p>
                <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
                  {jsonEditorValue(family.pageConfig) || "{}"}
                </pre>
              </div>
            </div>
          </section>

          <form
            id={draftFormId}
            action={saveFamilyLocalizationDraftAction}
            className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <input type="hidden" name="sourceId" value={family._id} />
            <input type="hidden" name="sourceSlug" value={family.slug} />
            <input type="hidden" name="locale" value={selectedLocale} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  Translation draft
                </h2>
                <p className="text-sm text-zinc-500">
                  Published records are locked; unpublish before editing content.
                </p>
              </div>
              <SourceCopyButton
                formId={draftFormId}
                sourceValues={sourceCopyValues}
                disabled={isPublished}
              />
            </div>
            <div className="grid gap-5 p-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Target path
                  </span>
                  <input
                    value={targetPath}
                    readOnly
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 font-mono text-sm text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Localized name
                  </span>
                  <input
                    name="title"
                    defaultValue={localization?.title ?? getFieldText(fields, "name")}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                    placeholder={family.name}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Summary
                </span>
                <textarea
                  name="summary"
                  defaultValue={getFieldText(fields, "summary")}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                  placeholder={family.summary || ""}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Content (legacy fallback)
                </span>
                <textarea
                  name="content"
                  defaultValue={getFieldText(fields, "content")}
                  rows={6}
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                  placeholder={family.content || ""}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Highlights JSON
                </span>
                <textarea
                  name="highlightsJson"
                  defaultValue={jsonEditorValue(highlightsPatch)}
                  rows={5}
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-mono text-xs outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                  placeholder={`[\n  "Localized highlight"\n]`}
                />
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    SEO title
                  </span>
                  <input
                    name="seoTitle"
                    defaultValue={localization?.seoTitle ?? ""}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                    placeholder={family.seoTitle || ""}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    SEO description
                  </span>
                  <textarea
                    name="seoDescription"
                    defaultValue={localization?.seoDescription ?? ""}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                    placeholder={family.seoDescription || ""}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Page content JSON
                </span>
                <textarea
                  name="pageConfigContentJson"
                  defaultValue={jsonEditorValue(pageConfigContentPatch)}
                  rows={12}
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-mono text-xs outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                  placeholder={`{\n  "heroIntro": "...",\n  "overview": {\n    "intro": "..."\n  }\n}`}
                />
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Longform markdown
                  </span>
                  <textarea
                    name="longformMarkdown"
                    defaultValue={pageConfigLongformMarkdown}
                    rows={10}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-mono text-xs outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                    placeholder="## Localized longform"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    SEO boost JSON
                  </span>
                  <textarea
                    name="seoBoostJson"
                    defaultValue={jsonEditorValue(pageConfigSeoBoostPatch)}
                    rows={10}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-mono text-xs outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                    placeholder={`{\n  "faqMode": "embedded",\n  "embeddedFaqItems": []\n}`}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Other page config JSON
                </span>
                <textarea
                  name="pageConfigJson"
                  defaultValue={jsonEditorValue(pageConfigRestPatch)}
                  rows={6}
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-mono text-xs outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                  placeholder={`{\n  "display": {\n    "showFaq": false\n  }\n}`}
                />
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Owner
                  </span>
                  <input
                    name="owner"
                    defaultValue={localization?.owner ?? ""}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                    placeholder="translator or reviewer"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Translated by
                  </span>
                  <input
                    name="translatedBy"
                    defaultValue={localization?.translatedBy ?? "admin"}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Review notes
                  </span>
                  <textarea
                    name="reviewNotes"
                    defaultValue={localization?.reviewNotes ?? ""}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Workflow notes
                  </span>
                  <textarea
                    name="workflowNotes"
                    defaultValue={localization?.workflowNotes ?? ""}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    name="reviewRequired"
                    defaultChecked={localization?.reviewRequired ?? true}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  Review required
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    name="requiredForRelease"
                    defaultChecked={localization?.requiredForRelease ?? true}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  Required for release
                </label>
              </div>

              <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <button
                  type="submit"
                  disabled={isPublished}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <Save className="h-4 w-4" />
                  Save draft
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
