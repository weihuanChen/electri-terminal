import "server-only";

import { cache } from "react";

import { getAdminConvexClient } from "@/lib/convex-admin";

import type { Locale, LocalizableEntityType } from "./config";
import type { LocalizedRouteMatch } from "./localizedRoutes";
import type { LocalizationStatus } from "./urlResolver";

export type TranslationEligibilityReason =
  | "source_not_found"
  | "source_not_published"
  | "translation_missing"
  | "translation_not_published"
  | "eligibility_source_error"
  | "invalid_eligibility_response";

export type TranslationEligibilityResult = {
  locale: Locale;
  sourceEntityType: LocalizableEntityType | null;
  sourceId: string | null;
  sourceStatus: string;
  sourceUpdatedAt: number | null;
  localizationStatus: LocalizationStatus;
  localizedSlug: string | null;
  title: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: number | null;
  eligible: boolean;
  reasons: TranslationEligibilityReason[];
};

type ConvexLocalizedEligibilityRoute =
  | { kind: "staticPage"; pageKey: string }
  | { kind: "category"; slug: string }
  | { kind: "family"; slug: string }
  | { kind: "product"; slug: string }
  | { kind: "article"; slug: string }
  | { kind: "blogPage"; page: number };

const LOCALIZATION_STATUSES: ReadonlySet<string> = new Set<LocalizationStatus>([
  "missing",
  "draft",
  "machine_ready",
  "review_required",
  "approved",
  "published",
  "stale",
]);

const TRANSLATION_ELIGIBILITY_REASONS: ReadonlySet<string> =
  new Set<TranslationEligibilityReason>([
    "source_not_found",
    "source_not_published",
    "translation_missing",
    "translation_not_published",
    "eligibility_source_error",
    "invalid_eligibility_response",
  ]);

function toConvexEligibilityRoute(
  route: LocalizedRouteMatch
): ConvexLocalizedEligibilityRoute {
  switch (route.kind) {
    case "staticPage":
      return { kind: "staticPage", pageKey: route.pageKey };
    case "category":
    case "family":
    case "product":
    case "article":
      return { kind: route.kind, slug: route.slug };
    case "blogPage":
      return { kind: "blogPage", page: route.page };
  }
}

function normalizeLocalizationStatus(value: unknown): LocalizationStatus {
  if (typeof value === "string" && LOCALIZATION_STATUSES.has(value)) {
    return value as LocalizationStatus;
  }

  return "missing";
}

function normalizeNullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function normalizeNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSourceEntityType(value: unknown) {
  return typeof value === "string" &&
    ["staticPage", "category", "family", "product", "article"].includes(value)
    ? (value as LocalizableEntityType)
    : null;
}

function normalizeReasons(value: unknown): TranslationEligibilityReason[] {
  if (!Array.isArray(value)) {
    return ["invalid_eligibility_response"];
  }

  const reasons = value.filter(
    (item): item is TranslationEligibilityReason =>
      typeof item === "string" && TRANSLATION_ELIGIBILITY_REASONS.has(item)
  );

  return reasons.length > 0 ? reasons : [];
}

function failClosed(
  locale: Locale,
  reason: TranslationEligibilityReason
): TranslationEligibilityResult {
  return {
    locale,
    sourceEntityType: null,
    sourceId: null,
    sourceStatus: "missing",
    sourceUpdatedAt: null,
    localizationStatus: "missing",
    localizedSlug: null,
    title: null,
    seoTitle: null,
    seoDescription: null,
    updatedAt: null,
    eligible: false,
    reasons: [reason],
  };
}

function normalizeEligibilityResponse(
  locale: Locale,
  raw: unknown
): TranslationEligibilityResult {
  if (!raw || typeof raw !== "object") {
    return failClosed(locale, "invalid_eligibility_response");
  }

  const response = raw as Record<string, unknown>;
  const localizationStatus = normalizeLocalizationStatus(response.localizationStatus);
  const sourceStatus =
    typeof response.sourceStatus === "string" ? response.sourceStatus : "missing";
  const reasons = normalizeReasons(response.reasons);
  const eligible =
    response.eligible === true &&
    sourceStatus === "published" &&
    localizationStatus === "published" &&
    reasons.length === 0;

  return {
    locale,
    sourceEntityType: normalizeSourceEntityType(response.sourceEntityType),
    sourceId: normalizeNullableString(response.sourceId),
    sourceStatus,
    sourceUpdatedAt: normalizeNullableNumber(response.sourceUpdatedAt),
    localizationStatus,
    localizedSlug: normalizeNullableString(response.localizedSlug),
    title: normalizeNullableString(response.title),
    seoTitle: normalizeNullableString(response.seoTitle),
    seoDescription: normalizeNullableString(response.seoDescription),
    updatedAt: normalizeNullableNumber(response.updatedAt),
    eligible,
    reasons:
      eligible || reasons.length > 0 ? reasons : ["invalid_eligibility_response"],
  };
}

const queryTranslationEligibility = cache(
  async (locale: Locale, routeKey: string): Promise<TranslationEligibilityResult> => {
    try {
      const route = JSON.parse(routeKey) as ConvexLocalizedEligibilityRoute;
      const raw = await getAdminConvexClient().query(
        "frontend:getLocalizedRouteEligibility",
        {
          locale,
          route,
        }
      );

      return normalizeEligibilityResponse(locale, raw);
    } catch {
      return failClosed(locale, "eligibility_source_error");
    }
  }
);

export async function resolveTranslationEligibility(
  locale: Locale,
  route: LocalizedRouteMatch
) {
  const convexRoute = toConvexEligibilityRoute(route);
  return queryTranslationEligibility(locale, JSON.stringify(convexRoute));
}
