import type { LocalizableEntityType, Locale, StaticPageKey } from "./config";
import type { LocalizationStatus } from "./urlResolver";

export type ReadinessSource = {
  entityType: LocalizableEntityType;
  sourceId: string;
  label: string;
  pageClass: "L1" | "L2" | "L3";
  requiredForRelease: boolean;
};

export type ReadinessLocalization = {
  entityType: LocalizableEntityType;
  sourceId: string;
  locale: string;
  status: LocalizationStatus;
  requiredForRelease?: boolean;
  reviewRequired?: boolean;
  validationIssues?: Array<{ severity: string; resolvedAt?: number }>;
};

export type ReadinessBlockerCode =
  | "missing_required_translation"
  | "required_translation_not_published"
  | "required_translation_stale"
  | "unresolved_validation_blocker";

export type ReadinessBlocker = {
  code: ReadinessBlockerCode;
  entityType: LocalizableEntityType;
  sourceId: string;
  label: string;
  pageClass: "L1" | "L2";
  status: LocalizationStatus;
};

export type LocaleReadinessReport = {
  locale: Locale;
  ready: boolean;
  totals: Record<"L1" | "L2" | "L3", { total: number; published: number }>;
  required: { total: number; published: number; coveragePercent: number };
  blockers: ReadinessBlocker[];
};

function identity(entityType: LocalizableEntityType, sourceId: string) {
  return `${entityType}:${sourceId}`;
}

export function buildLocaleReadinessReport(args: {
  locale: Locale;
  sources: ReadinessSource[];
  localizations: ReadinessLocalization[];
}): LocaleReadinessReport {
  const records = new Map(
    args.localizations
      .filter((item) => item.locale === args.locale)
      .map((item) => [identity(item.entityType, item.sourceId), item])
  );
  const totals = {
    L1: { total: 0, published: 0 },
    L2: { total: 0, published: 0 },
    L3: { total: 0, published: 0 },
  };
  const blockers: ReadinessBlocker[] = [];
  let requiredTotal = 0;
  let requiredPublished = 0;

  for (const source of args.sources) {
    const record = records.get(identity(source.entityType, source.sourceId));
    totals[source.pageClass].total += 1;
    if (record?.status === "published") totals[source.pageClass].published += 1;

    const required =
      source.pageClass !== "L3" &&
      (source.requiredForRelease || record?.requiredForRelease === true);
    if (!required) continue;
    requiredTotal += 1;

    const unresolvedBlocker = record?.validationIssues?.some(
      (issue) => issue.severity === "blocker" && !issue.resolvedAt
    );
    if (record?.status === "published" && !unresolvedBlocker) {
      requiredPublished += 1;
      continue;
    }

    let code: ReadinessBlockerCode = "required_translation_not_published";
    if (!record) code = "missing_required_translation";
    else if (record.status === "stale") code = "required_translation_stale";
    else if (unresolvedBlocker) code = "unresolved_validation_blocker";

    blockers.push({
      code,
      entityType: source.entityType,
      sourceId: source.sourceId,
      label: source.label,
      pageClass: source.pageClass as "L1" | "L2",
      status: record?.status ?? "missing",
    });
  }

  return {
    locale: args.locale,
    ready: blockers.length === 0,
    totals,
    required: {
      total: requiredTotal,
      published: requiredPublished,
      coveragePercent: requiredTotal ? Math.round((requiredPublished / requiredTotal) * 100) : 100,
    },
    blockers,
  };
}

export function isRequiredL1Page(
  key: StaticPageKey,
  requiredKeys: readonly StaticPageKey[]
) {
  return requiredKeys.includes(key);
}
