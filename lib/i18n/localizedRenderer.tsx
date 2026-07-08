import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import {
  type Locale,
  canRenderPrefixedLocale,
  getLanguageConfig,
} from "./config";
import {
  type LocalizedRouteKind,
  type LocalizedRouteMatch,
  getLocalizedRouteEntity,
  matchLocalizedRoute,
} from "./localizedRoutes";
import { resolveSeoOutput } from "./seoOutput";
import {
  type TranslationEligibilityResult,
  resolveTranslationEligibility,
} from "./translationEligibility";
import { type LocalizationStatus, resolvePageIndexability } from "./urlResolver";

export type LocalizedRouteBlockReason =
  | "unsupported_route"
  | "language_not_renderable"
  | "source_not_found"
  | "source_not_published"
  | "translation_not_published"
  | "eligibility_source_error"
  | "invalid_eligibility_response"
  | "renderer_not_configured";

export type LocalizedRouteRenderState = {
  locale: Locale;
  path: string;
  route: LocalizedRouteMatch | null;
  renderable: boolean;
  localizationStatus: LocalizationStatus;
  sourceStatus: string | null;
  translationEligibility: TranslationEligibilityResult | null;
  reasons: LocalizedRouteBlockReason[];
};

export type LocalizedRendererContext = {
  locale: Locale;
  route: LocalizedRouteMatch;
  searchParams?: Record<string, string | string[] | undefined>;
};

export type LocalizedRouteRenderer = (context: LocalizedRendererContext) => Promise<ReactNode>;

const LOCALIZED_RENDERERS: Partial<Record<LocalizedRouteKind, LocalizedRouteRenderer>> = {};
const STATIC_LOCALIZED_RENDERER_KINDS: ReadonlySet<LocalizedRouteKind> = new Set([
  "category",
  "family",
  "product",
]);

export function registerLocalizedRouteRenderer(
  kind: LocalizedRouteKind,
  renderer: LocalizedRouteRenderer
) {
  const existingRenderer = LOCALIZED_RENDERERS[kind];

  if (existingRenderer && existingRenderer !== renderer) {
    throw new Error(`Localized renderer already registered for route kind: ${kind}`);
  }

  LOCALIZED_RENDERERS[kind] = renderer;
}

export function hasLocalizedRouteRenderer(kind: LocalizedRouteKind) {
  return Boolean(LOCALIZED_RENDERERS[kind]) || STATIC_LOCALIZED_RENDERER_KINDS.has(kind);
}

export function getConfiguredLocalizedRouteKinds() {
  return Array.from(
    new Set([
      ...Object.keys(LOCALIZED_RENDERERS),
      ...STATIC_LOCALIZED_RENDERER_KINDS,
    ])
  ) as LocalizedRouteKind[];
}

function getLocalizedRouteTitle(state: LocalizedRouteRenderState) {
  const seoTitle = state.translationEligibility?.seoTitle;
  if (seoTitle) {
    return seoTitle;
  }

  const title = state.translationEligibility?.title;
  if (title) {
    return title;
  }

  if (!state.route) {
    return "Localized page not found";
  }

  const language = getLanguageConfig(state.locale);
  return `${language.displayName} ${state.route.kind} page`;
}

function getLocalizedRouteDescription(state: LocalizedRouteRenderState) {
  return (
    state.translationEligibility?.seoDescription ||
    "Localized page content is not available for public indexing yet."
  );
}

function getRouteRenderer(route: LocalizedRouteMatch) {
  return LOCALIZED_RENDERERS[route.kind];
}

function toBlockReasons(
  eligibility: TranslationEligibilityResult
): LocalizedRouteBlockReason[] {
  const reasons: LocalizedRouteBlockReason[] = [];

  if (eligibility.reasons.includes("source_not_found")) {
    reasons.push("source_not_found");
  }

  if (
    eligibility.reasons.includes("source_not_published") ||
    eligibility.sourceStatus !== "published"
  ) {
    reasons.push("source_not_published");
  }

  if (
    eligibility.reasons.includes("translation_missing") ||
    eligibility.reasons.includes("translation_not_published") ||
    eligibility.localizationStatus !== "published"
  ) {
    reasons.push("translation_not_published");
  }

  if (eligibility.reasons.includes("eligibility_source_error")) {
    reasons.push("eligibility_source_error");
  }

  if (eligibility.reasons.includes("invalid_eligibility_response")) {
    reasons.push("invalid_eligibility_response");
  }

  return reasons;
}

function uniqueReasons(reasons: LocalizedRouteBlockReason[]) {
  return Array.from(new Set(reasons));
}

export async function resolveLocalizedRouteRenderState({
  locale,
  path,
}: {
  locale: Locale;
  path: string;
}): Promise<LocalizedRouteRenderState> {
  const reasons: LocalizedRouteBlockReason[] = [];
  const route = matchLocalizedRoute(locale, path);

  if (!canRenderPrefixedLocale(locale)) {
    reasons.push("language_not_renderable");
  }

  if (!route) {
    reasons.push("unsupported_route");
    return {
      locale,
      path,
      route,
      renderable: false,
      localizationStatus: "missing",
      sourceStatus: null,
      translationEligibility: null,
      reasons,
    };
  }

  const translationEligibility = await resolveTranslationEligibility(locale, route);
  const localizationStatus = translationEligibility.localizationStatus;
  const indexability = resolvePageIndexability({
    locale,
    localizationStatus,
    sourceStatus: translationEligibility.sourceStatus,
  });

  reasons.push(...toBlockReasons(translationEligibility));

  if (!indexability.indexable && localizationStatus !== "published") {
    reasons.push("translation_not_published");
  }

  if (!hasLocalizedRouteRenderer(route.kind)) {
    reasons.push("renderer_not_configured");
  }

  return {
    locale,
    path,
    route,
    renderable: reasons.length === 0,
    localizationStatus,
    sourceStatus: translationEligibility.sourceStatus,
    translationEligibility,
    reasons: uniqueReasons(reasons),
  };
}

export async function generateLocalizedRouteMetadata({
  locale,
  path,
}: {
  locale: Locale;
  path: string;
}): Promise<Metadata> {
  const state = await resolveLocalizedRouteRenderState({ locale, path });
  const title = getLocalizedRouteTitle(state);
  const description = getLocalizedRouteDescription(state);
  const seo = resolveSeoOutput({
    locale,
    entity: state.route ? getLocalizedRouteEntity(state.route) : undefined,
    fallbackPath: state.route?.path ?? path,
    sourceStatus: state.sourceStatus ?? "missing",
    localizationStatus: state.localizationStatus,
    localizationStatusByLocale: {
      [locale]: state.localizationStatus,
    },
    robots: state.renderable ? undefined : { index: false, follow: false },
  });

  return {
    title,
    description,
    alternates: seo.metadataAlternates,
    robots: seo.robots,
    openGraph: {
      title,
      description,
      url: seo.canonical ?? seo.url,
    },
  };
}

export async function renderLocalizedRoutePage({
  locale,
  path,
  searchParams,
}: {
  locale: Locale;
  path: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const state = await resolveLocalizedRouteRenderState({ locale, path });

  if (!state.renderable || !state.route) {
    notFound();
  }

  const renderer = getRouteRenderer(state.route);
  if (!renderer) {
    notFound();
  }

  return renderer({
    locale,
    route: state.route,
    searchParams,
  });
}
