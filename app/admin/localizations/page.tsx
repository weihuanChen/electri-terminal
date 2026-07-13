import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  Globe2,
  Languages,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import type { Doc } from "@/convex/_generated/dataModel";
import { requireAdmin } from "@/lib/admin-auth";
import { queryAdmin } from "@/lib/convex-admin";
import {
  DEFAULT_LOCALE,
  LANGUAGE_CONFIGS,
  buildLocaleReadinessReport,
  LOCALIZATION_STATUS_TRANSITIONS,
  LOCALIZATION_STATUSES,
  STATIC_PAGE_DEFINITIONS,
  SUPPORTED_LOCALES,
  isLocale,
  isLocalizationStatus,
  type LocalizableEntityType,
  type Locale,
  type LocalizationStatus,
  type StaticPageKey,
  type ReadinessSource,
} from "@/lib/i18n";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  moveLocalizationStatusAction,
  unpublishLocalizationAction,
} from "../actions";

type SearchParams = Record<string, string | string[] | undefined>;
type LocalizationRecord = Doc<"localizations">;
type LocalizationQueueArgs = {
  locale?: Locale;
  entityType?: LocalizableEntityType;
  owner?: string;
  limit?: number;
};

type SourceEntity = {
  entityType: LocalizableEntityType;
  sourceId: string;
  label: string;
  sourceStatus: string;
  href?: string;
  className: "L1" | "L2" | "L3";
};

type CoverageSummary = {
  locale: Locale;
  total: number;
  published: number;
  missing: number;
  stale: number;
  review: number;
  coveragePercent: number;
};

const ENTITY_TYPES = [
  "staticPage",
  "category",
  "family",
  "product",
  "article",
] as const satisfies readonly LocalizableEntityType[];

const ENTITY_LABELS = {
  staticPage: "Static pages",
  category: "Categories",
  family: "Families",
  product: "Products",
  article: "Articles",
} satisfies Record<LocalizableEntityType, string>;

const STATUS_LABELS = {
  missing: "Missing",
  draft: "Draft",
  machine_ready: "Machine ready",
  review_required: "Review required",
  approved: "Approved",
  published: "Published",
  stale: "Stale",
} satisfies Record<LocalizationStatus, string>;

const STATIC_PAGE_LABELS = {
  home: "Homepage",
  categories: "Categories hub",
  products: "Products hub",
  manufacturing: "Manufacturing",
  "selection-guide": "Selection guide",
  resources: "Resources",
  "quality-certifications": "Quality certifications",
  blog: "Blog hub",
  contact: "Contact",
  "privacy-policy": "Privacy policy",
} satisfies Record<StaticPageKey, string>;

const QUEUE_STATUSES = new Set<LocalizationStatus>([
  "machine_ready",
  "review_required",
]);

function readFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isEntityType(value: string): value is LocalizableEntityType {
  return ENTITY_TYPES.includes(value as LocalizableEntityType);
}

function formatDate(timestamp?: number) {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Never";

  return date.toLocaleString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusTone(status)}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function recordKey(locale: string, entityType: LocalizableEntityType, sourceId: string) {
  return `${locale}:${entityType}:${sourceId}`;
}

function sourceKey(entityType: LocalizableEntityType, sourceId: string) {
  return `${entityType}:${sourceId}`;
}

function getLocalizedPreview(localization: LocalizationRecord) {
  if (localization.title) return localization.title;

  const fields = localization.localizedFields;
  if (fields && typeof fields === "object") {
    for (const key of ["title", "name", "headline", "summary"]) {
      const value = fields[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return localization.localizedSlug || "Untitled translation";
}

function buildSourceEntities(args: {
  categories: Doc<"categories">[];
  families: Doc<"productFamilies">[];
  products: Doc<"products">[];
  articles: Doc<"articles">[];
}) {
  const staticPages: SourceEntity[] = STATIC_PAGE_DEFINITIONS.map((page) => ({
    entityType: "staticPage",
    sourceId: page.key,
    label: STATIC_PAGE_LABELS[page.key],
    sourceStatus: "published",
    href: page.path,
    className: page.pageClass,
  }));

  return [
    ...staticPages,
    ...args.categories.map((category) => ({
      entityType: "category" as const,
      sourceId: String(category._id),
      label: category.name,
      sourceStatus: category.status,
      href: `/categories/${category.slug}`,
      className: "L2" as const,
    })),
    ...args.families.map((family) => ({
      entityType: "family" as const,
      sourceId: String(family._id),
      label: family.name,
      sourceStatus: family.status,
      href: `/families/${family.slug}`,
      className: "L2" as const,
    })),
    ...args.products.map((product) => ({
      entityType: "product" as const,
      sourceId: String(product._id),
      label: product.title,
      sourceStatus: product.status,
      href: `/products/${product.slug}`,
      className: "L2" as const,
    })),
    ...args.articles.map((article) => ({
      entityType: "article" as const,
      sourceId: String(article._id),
      label: article.title,
      sourceStatus: article.status,
      href: `/blog/${article.slug}`,
      className: "L3" as const,
    })),
  ] satisfies SourceEntity[];
}

function buildCoverageSummary(
  locale: Locale,
  sourceEntities: SourceEntity[],
  localizationByIdentity: Map<string, LocalizationRecord>
) {
  if (locale === DEFAULT_LOCALE) {
    return {
      locale,
      total: sourceEntities.length,
      published: sourceEntities.length,
      missing: 0,
      stale: 0,
      review: 0,
      coveragePercent: 100,
    } satisfies CoverageSummary;
  }

  let published = 0;
  let missing = 0;
  let stale = 0;
  let review = 0;

  for (const source of sourceEntities) {
    const localization = localizationByIdentity.get(
      recordKey(locale, source.entityType, source.sourceId)
    );

    if (!localization) {
      missing += 1;
      continue;
    }

    if (localization.status === "published") published += 1;
    if (localization.status === "stale") stale += 1;
    if (QUEUE_STATUSES.has(localization.status)) review += 1;
  }

  return {
    locale,
    total: sourceEntities.length,
    published,
    missing,
    stale,
    review,
    coveragePercent: sourceEntities.length
      ? Math.round((published / sourceEntities.length) * 100)
      : 100,
  } satisfies CoverageSummary;
}

function getNextStatuses(status: LocalizationStatus) {
  if (status === "missing") return [];

  return (
    LOCALIZATION_STATUS_TRANSITIONS[status] as readonly LocalizationStatus[]
  ).filter((nextStatus) => nextStatus !== "missing");
}

function buildCurrentPath(args: {
  locale: Locale | "all";
  entityType: LocalizableEntityType | "all";
  status: LocalizationStatus | "all";
}) {
  const searchParams = new URLSearchParams();
  if (args.locale !== "all") searchParams.set("locale", args.locale);
  if (args.entityType !== "all") searchParams.set("entityType", args.entityType);
  if (args.status !== "all") searchParams.set("status", args.status);

  const query = searchParams.toString();
  return query ? `/admin/localizations?${query}` : "/admin/localizations";
}

function isMissingConvexPublicFunctionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Could not find public function");
}

function filterLocalizationQueue(
  localizations: LocalizationRecord[],
  args: LocalizationQueueArgs,
  statuses: ReadonlySet<LocalizationStatus>
) {
  return localizations
    .filter((localization) => {
      if (args.locale && localization.locale !== args.locale) return false;
      if (args.entityType && localization.entityType !== args.entityType) return false;
      if (args.owner && localization.owner !== args.owner) return false;
      return statuses.has(localization.status);
    })
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, args.limit ?? 8);
}

async function queryLocalizationQueueWithFallback(args: {
  queryName: string;
  queueArgs: LocalizationQueueArgs;
  localizations: LocalizationRecord[];
  statuses: ReadonlySet<LocalizationStatus>;
}) {
  try {
    return await queryAdmin<LocalizationRecord[]>(args.queryName, args.queueArgs);
  } catch (error) {
    if (!isMissingConvexPublicFunctionError(error)) {
      throw error;
    }

    return filterLocalizationQueue(
      args.localizations,
      args.queueArgs,
      args.statuses
    );
  }
}

function successText(success: string) {
  switch (success) {
    case "localization_status_updated":
      return "翻译状态已更新。";
    case "localization_unpublished":
      return "翻译已撤回到 Approved。";
    default:
      return success;
  }
}

function errorText(error: string) {
  switch (error) {
    case "localization_id_required":
      return "缺少翻译记录 ID。";
    case "invalid_localization_status":
      return "无效翻译状态。";
    default:
      return error;
  }
}

function LocalizationActionCell({
  localization,
  returnTo,
}: {
  localization: LocalizationRecord;
  returnTo: string;
}) {
  const nextStatuses = getNextStatuses(localization.status);

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {nextStatuses.length > 0 ? (
        <form action={moveLocalizationStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={localization._id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="actor" value="admin" />
          <select
            name="nextStatus"
            className="h-9 rounded-lg border border-zinc-300 bg-white px-2 text-xs font-medium text-zinc-700 outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
          >
            {nextStatuses.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            更新
          </button>
        </form>
      ) : (
        <span className="text-xs text-zinc-400">No transition</span>
      )}

      {localization.status === "published" && (
        <form action={unpublishLocalizationAction}>
          <input type="hidden" name="id" value={localization._id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="actor" value="admin" />
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-lg border border-zinc-300 px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            撤回
          </button>
        </form>
      )}
    </div>
  );
}

function QueueList({
  title,
  icon,
  items,
  sourceLabels,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: LocalizationRecord[];
  sourceLabels: Map<string, SourceEntity>;
  emptyText: string;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
        {icon}
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {title}
        </h2>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-8 text-sm text-zinc-500">{emptyText}</div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.slice(0, 8).map((item) => {
            const source = sourceLabels.get(sourceKey(item.entityType, item.sourceId));
            return (
              <div key={item._id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-xs font-semibold uppercase text-zinc-500">
                    {item.locale}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {ENTITY_LABELS[item.entityType]}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {source?.label ?? item.sourceId}
                </p>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {getLocalizedPreview(item)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default async function LocalizationsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await requireAdmin();

  const resolvedSearchParams = (await searchParams) ?? {};
  const localeParam = readFirstParam(resolvedSearchParams.locale);
  const entityTypeParam = readFirstParam(resolvedSearchParams.entityType);
  const statusParam = readFirstParam(resolvedSearchParams.status);
  const success = readFirstParam(resolvedSearchParams.success);
  const error = readFirstParam(resolvedSearchParams.error);
  const selectedId = readFirstParam(resolvedSearchParams.selected);

  const selectedLocale: Locale | "all" = isLocale(localeParam) ? localeParam : "all";
  const selectedEntityType: LocalizableEntityType | "all" = isEntityType(entityTypeParam)
    ? entityTypeParam
    : "all";
  const selectedStatus: LocalizationStatus | "all" = isLocalizationStatus(statusParam)
    ? statusParam
    : "all";
  const returnTo = buildCurrentPath({
    locale: selectedLocale,
    entityType: selectedEntityType,
    status: selectedStatus,
  });
  const queueArgs: LocalizationQueueArgs = { limit: 8 };
  if (selectedLocale !== "all") queueArgs.locale = selectedLocale;
  if (selectedEntityType !== "all") queueArgs.entityType = selectedEntityType;

  const [
    localizations,
    categories,
    families,
    products,
    articles,
  ] = await Promise.all([
    queryAdmin<LocalizationRecord[]>("queries/modules/localizations:listLocalizations", {
      limit: 500,
    }),
    queryAdmin<Doc<"categories">[]>("queries/modules/categories:listCategories", {
      status: "published",
      limit: 200,
    }),
    queryAdmin<Doc<"productFamilies">[]>(
      "queries/modules/products:listProductFamilies",
      { status: "published", limit: 200 }
    ),
    queryAdmin<Doc<"products">[]>("queries/modules/products:listProducts", {
      status: "published",
      limit: 200,
    }),
    queryAdmin<Doc<"articles">[]>("queries/modules/articles:listArticles", {
      status: "published",
      limit: 200,
    }),
  ]);
  const [reviewQueue, staleQueue] = await Promise.all([
    queryLocalizationQueueWithFallback({
      queryName: "queries/modules/localizations:listLocalizationReviewQueue",
      queueArgs,
      localizations,
      statuses: QUEUE_STATUSES,
    }),
    queryLocalizationQueueWithFallback({
      queryName: "queries/modules/localizations:listStaleLocalizations",
      queueArgs,
      localizations,
      statuses: new Set<LocalizationStatus>(["stale"]),
    }),
  ]);

  const sourceEntities = buildSourceEntities({
    categories,
    families,
    products,
    articles,
  });
  const sourceLabels = new Map(
    sourceEntities.map((source) => [sourceKey(source.entityType, source.sourceId), source])
  );
  const localizationByIdentity = new Map(
    localizations.map((localization) => [
      recordKey(localization.locale, localization.entityType, localization.sourceId),
      localization,
    ])
  );
  const targetLocales = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
  const coverageSummaries = targetLocales.map((locale) =>
    buildCoverageSummary(locale, sourceEntities, localizationByIdentity)
  );
  const readinessSources: ReadinessSource[] = sourceEntities.map((source) => ({
    entityType: source.entityType,
    sourceId: source.sourceId,
    label: source.label,
    pageClass: source.className,
    requiredForRelease:
      source.className === "L2" ||
      (source.entityType === "staticPage" &&
        (LANGUAGE_CONFIGS.ru.requiredL1PageKeys as readonly StaticPageKey[]).includes(
          source.sourceId as StaticPageKey
        )),
  }));
  const readinessReports = targetLocales.map((locale) =>
    buildLocaleReadinessReport({ locale, sources: readinessSources, localizations })
  );
  const primaryCoverage = coverageSummaries[0];
  const publishedCount = localizations.filter(
    (localization) => localization.status === "published"
  ).length;
  const staleCount = localizations.filter(
    (localization) => localization.status === "stale"
  ).length;
  const reviewCount = localizations.filter((localization) =>
    QUEUE_STATUSES.has(localization.status)
  ).length;
  const filteredLocalizations = localizations.filter((localization) => {
    if (selectedLocale !== "all" && localization.locale !== selectedLocale) return false;
    if (
      selectedEntityType !== "all" &&
      localization.entityType !== selectedEntityType
    ) {
      return false;
    }
    if (selectedStatus !== "all" && localization.status !== selectedStatus) return false;
    return true;
  });
  const activeTargetLocale =
    selectedLocale !== "all" && selectedLocale !== DEFAULT_LOCALE
      ? selectedLocale
      : targetLocales[0];
  const missingSamples = activeTargetLocale
    ? sourceEntities
        .filter(
          (source) =>
            !localizationByIdentity.has(
              recordKey(activeTargetLocale, source.entityType, source.sourceId)
            )
        )
        .slice(0, 10)
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
                <Languages className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  翻译治理
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                  监控页面级翻译状态、覆盖率、review queue 和 stale queue。
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/admin/settings/languages"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Globe2 className="h-4 w-4" />
            语言工作流
          </Link>
        </div>

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {successText(success)}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            操作失败：{errorText(error)}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {publishedCount}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Needs review
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{reviewCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Stale
            </p>
            <p className="mt-2 text-3xl font-bold text-rose-600">{staleCount}</p>
          </div>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">发布就绪度</h2>
              <p className="text-sm text-zinc-500">L1 必需页面与全部公开 L2 目录必须发布且无 blocker。</p>
            </div>
          </div>
          <div className="space-y-4">
            {readinessReports.map((report) => (
              <div key={report.locale} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {LANGUAGE_CONFIGS[report.locale].displayName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Required {report.required.published}/{report.required.total} · L1 {report.totals.L1.published}/{report.totals.L1.total} · L2 {report.totals.L2.published}/{report.totals.L2.total}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.ready ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {report.ready ? "READY" : `${report.blockers.length} BLOCKERS`}
                  </span>
                </div>
                {!report.ready && (
                  <div className="mt-3 max-h-48 divide-y divide-zinc-100 overflow-auto rounded-md bg-zinc-50 px-3 dark:divide-zinc-800 dark:bg-zinc-950">
                    {report.blockers.slice(0, 25).map((blocker) => (
                      <div key={`${blocker.entityType}:${blocker.sourceId}`} className="flex items-center justify-between gap-3 py-2 text-xs">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{blocker.pageClass} · {blocker.label}</span>
                        <span className="text-rose-600">{blocker.code} ({blocker.status})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                语言覆盖率
              </h2>
              <p className="text-sm text-zinc-500">
                基于当前可发布源实体和 `published` 翻译记录计算。
              </p>
            </div>
            {primaryCoverage && (
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700">
                <ShieldCheck className="h-4 w-4" />
                Pilot {primaryCoverage.locale.toUpperCase()} {primaryCoverage.coveragePercent}%
              </span>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {coverageSummaries.map((coverage) => (
              <div
                key={coverage.locale}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      {LANGUAGE_CONFIGS[coverage.locale].displayName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {coverage.published} / {coverage.total} published
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                    {coverage.coveragePercent}%
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${coverage.coveragePercent}%` }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md bg-white p-2 dark:bg-zinc-900">
                    <p className="text-zinc-500">Missing</p>
                    <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {coverage.missing}
                    </p>
                  </div>
                  <div className="rounded-md bg-white p-2 dark:bg-zinc-900">
                    <p className="text-zinc-500">Review</p>
                    <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {coverage.review}
                    </p>
                  </div>
                  <div className="rounded-md bg-white p-2 dark:bg-zinc-900">
                    <p className="text-zinc-500">Stale</p>
                    <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {coverage.stale}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Locale
              </label>
              <select
                name="locale"
                defaultValue={selectedLocale}
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="all">All locales</option>
                {SUPPORTED_LOCALES.map((locale) => (
                  <option key={locale} value={locale}>
                    {LANGUAGE_CONFIGS[locale].displayName} ({locale})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Entity
              </label>
              <select
                name="entityType"
                defaultValue={selectedEntityType}
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="all">All entities</option>
                {ENTITY_TYPES.map((entityType) => (
                  <option key={entityType} value={entityType}>
                    {ENTITY_LABELS[entityType]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Status
              </label>
              <select
                name="status"
                defaultValue={selectedStatus}
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="all">All statuses</option>
                {LOCALIZATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <Filter className="h-4 w-4" />
              筛选
            </button>
            <Link
              href="/admin/localizations"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <XCircle className="h-4 w-4" />
              清空
            </Link>
          </form>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <QueueList
            title="Review queue"
            icon={<Clock3 className="h-4 w-4 text-blue-600" />}
            items={reviewQueue}
            sourceLabels={sourceLabels}
            emptyText="当前没有待 review 的翻译记录。"
          />
          <QueueList
            title="Stale queue"
            icon={<RefreshCw className="h-4 w-4 text-rose-600" />}
            items={staleQueue}
            sourceLabels={sourceLabels}
            emptyText="当前没有 stale 翻译记录。"
          />
        </div>

        {activeTargetLocale && missingSamples.length > 0 && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              {activeTargetLocale.toUpperCase()} missing samples
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
              {missingSamples.map((source) => (
                <div key={sourceKey(source.entityType, source.sourceId)}>
                  <p className="font-medium">{source.label}</p>
                  <p className="text-xs text-amber-700">
                    {ENTITY_LABELS[source.entityType]} · {source.className}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-2 border-b border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Translation records
              </h2>
              <p className="text-sm text-zinc-500">
                当前显示 {filteredLocalizations.length} / {localizations.length} 条记录。
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Published records are the only search-visible translations.
            </div>
          </div>

          {filteredLocalizations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Languages className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                暂无翻译记录
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                后续通过翻译编辑器或导入任务创建 draft 后会出现在这里。
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px]">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Locale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Translation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Owner
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
                  {filteredLocalizations.slice(0, 100).map((localization) => {
                    const source = sourceLabels.get(
                      sourceKey(localization.entityType, localization.sourceId)
                    );
                    const isSelected = selectedId === localization._id;

                    return (
                      <tr
                        key={localization._id}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/20"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-semibold uppercase text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                            {localization.locale}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {source?.label ?? localization.sourceId}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {ENTITY_LABELS[localization.entityType]} ·{" "}
                            {source?.sourceStatus ?? "unknown source"}
                          </p>
                        </td>
                        <td className="max-w-sm px-6 py-4">
                          <p className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                            {getLocalizedPreview(localization)}
                          </p>
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {localization.localizedSlug || "No localized slug"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge status={localization.status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {localization.owner || localization.reviewer || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {formatDate(localization.updatedAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <LocalizationActionCell
                            localization={localization}
                            returnTo={returnTo}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredLocalizations.length > 100 && (
                <div className="border-t border-zinc-200 px-6 py-3 text-sm text-zinc-500 dark:border-zinc-800">
                  仅显示前 100 条记录，请使用筛选缩小范围。
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
