import { DEFAULT_LOCALE, type Locale, type StaticPageKey } from "./config";

export type NavigationLocalizationRecord = {
  entityType: "staticPage" | "category" | "family" | "product" | "article";
  sourceId: string;
  locale: string;
  status: string;
  title?: string;
  localizedFields?: Record<string, unknown>;
};

export type NavigationEligibilitySnapshot = {
  locale: Locale;
  publishedStaticPages: StaticPageKey[];
  publishedCategories: Array<{ sourceId: string; title?: string }>;
};

export function buildNavigationEligibilitySnapshot(
  locale: Locale,
  records: NavigationLocalizationRecord[]
): NavigationEligibilitySnapshot {
  if (locale === DEFAULT_LOCALE) {
    return { locale, publishedStaticPages: [], publishedCategories: [] };
  }
  const published = records.filter(
    (record) => record.locale === locale && record.status === "published"
  );
  return {
    locale,
    publishedStaticPages: published
      .filter((record) => record.entityType === "staticPage")
      .map((record) => record.sourceId as StaticPageKey),
    publishedCategories: published
      .filter((record) => record.entityType === "category")
      .map((record) => ({
        sourceId: record.sourceId,
        title:
          record.title ||
          (typeof record.localizedFields?.name === "string"
            ? record.localizedFields.name
            : undefined),
      })),
  };
}

export function canExposeStaticNavigationTarget(
  snapshot: NavigationEligibilitySnapshot,
  pageKey: StaticPageKey
) {
  return (
    snapshot.locale === DEFAULT_LOCALE ||
    snapshot.publishedStaticPages.includes(pageKey)
  );
}

export function getPublishedNavigationCategory(
  snapshot: NavigationEligibilitySnapshot,
  sourceId: string
) {
  if (snapshot.locale === DEFAULT_LOCALE) return { sourceId };
  return snapshot.publishedCategories.find((category) => category.sourceId === sourceId);
}

export function auditNavigationTargets(args: {
  snapshot: NavigationEligibilitySnapshot;
  staticPageKeys: StaticPageKey[];
  categorySourceIds: string[];
}) {
  if (args.snapshot.locale === DEFAULT_LOCALE) return [];
  return [
    ...args.staticPageKeys
      .filter((key) => !canExposeStaticNavigationTarget(args.snapshot, key))
      .map((key) => ({ code: "navigation_static_target_not_published" as const, target: key })),
    ...args.categorySourceIds
      .filter((sourceId) => !getPublishedNavigationCategory(args.snapshot, sourceId))
      .map((sourceId) => ({ code: "navigation_category_target_not_published" as const, target: sourceId })),
  ];
}
