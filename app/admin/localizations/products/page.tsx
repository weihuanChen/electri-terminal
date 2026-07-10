import Link from "next/link";
import { ArrowRight, Globe2, Languages, Package, Search, X } from "lucide-react";

import type { Doc } from "@/convex/_generated/dataModel";
import { requireAdmin } from "@/lib/admin-auth";
import { queryAdmin } from "@/lib/convex-admin";
import {
  DEFAULT_LOCALE,
  LANGUAGE_CONFIGS,
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
  type LocalizationStatus,
} from "@/lib/i18n";
import { DashboardLayout } from "../../components/DashboardLayout";

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

function getLocalizedPreview(localization?: LocalizationRecord) {
  if (!localization) return "-";
  if (localization.title) return localization.title;

  const fields = localization.localizedFields;
  if (fields && typeof fields === "object") {
    for (const key of ["title", "name", "shortTitle", "summary"]) {
      const value = fields[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return localization.localizedSlug || "Untitled draft";
}

function formatDate(timestamp?: number) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildLocaleHref(locale: Locale, keyword: string) {
  const searchParams = new URLSearchParams({ locale });
  if (keyword) searchParams.set("q", keyword);
  return `/admin/localizations/products?${searchParams.toString()}`;
}

export default async function ProductLocalizationsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await requireAdmin();

  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedLocale = readFirstParam(resolvedSearchParams.locale);
  const keyword = readFirstParam(resolvedSearchParams.q).trim();
  const targetLocales = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
  const selectedLocale: Locale =
    isLocale(requestedLocale) && requestedLocale !== DEFAULT_LOCALE
      ? requestedLocale
      : targetLocales[0];

  const [products, localizations, categories, families] = await Promise.all([
    queryAdmin<Doc<"products">[]>("queries/modules/products:listProducts", {
      keyword: keyword || undefined,
      limit: 200,
    }),
    queryAdmin<LocalizationRecord[]>("queries/modules/localizations:listLocalizations", {
      locale: selectedLocale,
      entityType: "product",
      limit: 500,
    }),
    queryAdmin<Doc<"categories">[]>("queries/modules/categories:listCategories", {
      limit: 200,
    }),
    queryAdmin<Doc<"productFamilies">[]>("queries/modules/products:listProductFamilies", {
      limit: 200,
    }),
  ]);

  const categoryMap = new Map(categories.map((category) => [String(category._id), category.name]));
  const familyMap = new Map(families.map((family) => [String(family._id), family.name]));
  const localizationsBySourceId = new Map(
    localizations.map((localization) => [localization.sourceId, localization])
  );
  const publishedCount = localizations.filter(
    (localization) => localization.status === "published"
  ).length;
  const reviewCount = localizations.filter((localization) =>
    ["machine_ready", "review_required"].includes(localization.status)
  ).length;
  const missingCount = products.filter(
    (product) => !localizationsBySourceId.has(String(product._id))
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Product Localizations
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Edit product translations separately with SKU context.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {targetLocales.map((locale) => (
              <Link
                key={locale}
                href={buildLocaleHref(locale, keyword)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  locale === selectedLocale
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <Globe2 className="h-4 w-4" />
                {LANGUAGE_CONFIGS[locale].displayName}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Source products
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {products.length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Translation records
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {localizations.length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Published
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{publishedCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Missing / review
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {missingCount} / {reviewCount}
            </p>
          </div>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <input type="hidden" name="locale" value={selectedLocale} />
            <div className="flex flex-1 items-center gap-3">
              <div className="relative w-full max-w-2xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={keyword}
                  placeholder="Search SKU, model, title, or slug"
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-slate-800"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Search
              </button>
              {keyword ? (
                <Link
                  href={`/admin/localizations/products?locale=${selectedLocale}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Link>
              ) : null}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {keyword ? `Filtered to ${products.length} source records` : "Showing first 200 source records"}
            </p>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-2 border-b border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Products
              </h2>
              <p className="text-sm text-zinc-500">
                Locale: {selectedLocale.toUpperCase()} · Edit one product translation at a time.
              </p>
            </div>
            <Link
              href="/admin/localizations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
            >
              <Languages className="h-4 w-4" />
              Overview
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Context
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Translation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {products.map((product) => {
                  const localization = localizationsBySourceId.get(String(product._id));
                  const status = localization?.status ?? "missing";

                  return (
                    <tr
                      key={product._id}
                      className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {product.title}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {product.skuCode} · {product.model} · {product.status}
                        </p>
                      </td>
                      <td className="max-w-xs px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <p className="truncate">
                          {categoryMap.get(String(product.categoryId)) || "Unknown category"}
                        </p>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {familyMap.get(String(product.familyId)) || "Unknown family"}
                        </p>
                      </td>
                      <td className="max-w-sm px-6 py-4">
                        <p className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                          {getLocalizedPreview(localization)}
                        </p>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          /{selectedLocale}/products/{product.slug}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDate(localization?.updatedAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          href={`/admin/localizations/products/${product._id}?locale=${selectedLocale}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          Edit
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
