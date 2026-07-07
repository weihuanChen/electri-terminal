import {
  DEFAULT_LOCALE,
  LANGUAGE_CONFIGS,
  type LanguageConfig,
  type Locale,
  type LocaleStatus,
} from "./config";

export type StoredLanguageWorkflow = {
  locale: string;
  status: LocaleStatus;
  gscSubmissionEnabled: boolean;
  sitemapEnabled: boolean;
  hreflangEnabled: boolean;
  languageSwitcherEnabled: boolean;
  previewEnabled: boolean;
  releaseOwner?: string;
  notes?: string;
  lastGateReportId?: string;
  lastGateChecksum?: string;
  lastGateCheckedAt?: string;
  lastGatePassed?: boolean;
  lastGateBlockerCount?: number;
  lastGateHighCount?: number;
  publishedAt?: number;
  pausedAt?: number;
  createdAt: number;
  updatedAt: number;
};

export type ResolvedLanguageWorkflow = StoredLanguageWorkflow & {
  runtimeConfig: LanguageConfig;
  runtimeStatus: LocaleStatus;
  isDefaultLocale: boolean;
  isRuntimeAligned: boolean;
};

export const LANGUAGE_STATUS_LABELS = {
  draft: "Draft",
  prelaunch: "Prelaunch",
  published: "Published",
  paused: "Paused",
} satisfies Record<LocaleStatus, string>;

export const LANGUAGE_STATUS_DESCRIPTIONS = {
  draft: "内部规划状态，不进入 sitemap、hreflang、语言切换器或 GSC。",
  prelaunch: "可做后台预览和审计，但仍不暴露给搜索引擎。",
  published: "内容通过 gate 后才允许进入公开搜索曝光面。",
  paused: "暂停搜索曝光和语言切换器，但保留已准备的翻译资产。",
} satisfies Record<LocaleStatus, string>;

const ALLOWED_TRANSITIONS = {
  draft: ["prelaunch"],
  prelaunch: ["draft", "published"],
  published: ["paused"],
  paused: ["prelaunch", "published"],
} satisfies Record<LocaleStatus, LocaleStatus[]>;

export function getAllowedLanguageStatusTransitions(
  status: LocaleStatus,
  options: { isDefaultLocale?: boolean } = {}
): LocaleStatus[] {
  if (options.isDefaultLocale) {
    return [];
  }

  return [...ALLOWED_TRANSITIONS[status]];
}

export function resolveLanguageWorkflow(
  locale: Locale,
  storedWorkflow?: StoredLanguageWorkflow
): ResolvedLanguageWorkflow {
  const runtimeConfig = LANGUAGE_CONFIGS[locale];
  const now = Date.now();
  const fallbackWorkflow: StoredLanguageWorkflow = {
    locale,
    status: runtimeConfig.status,
    gscSubmissionEnabled: runtimeConfig.gscSubmissionEnabled,
    sitemapEnabled: runtimeConfig.sitemapEnabled,
    hreflangEnabled: runtimeConfig.hreflangEnabled,
    languageSwitcherEnabled: runtimeConfig.languageSwitcherEnabled,
    previewEnabled: runtimeConfig.previewEnabled,
    createdAt: now,
    updatedAt: now,
  };
  const workflow = storedWorkflow ?? fallbackWorkflow;

  return {
    ...workflow,
    locale,
    runtimeConfig,
    runtimeStatus: runtimeConfig.status,
    isDefaultLocale: locale === DEFAULT_LOCALE,
    isRuntimeAligned:
      workflow.status === runtimeConfig.status &&
      workflow.gscSubmissionEnabled === runtimeConfig.gscSubmissionEnabled &&
      workflow.sitemapEnabled === runtimeConfig.sitemapEnabled &&
      workflow.hreflangEnabled === runtimeConfig.hreflangEnabled &&
      workflow.languageSwitcherEnabled === runtimeConfig.languageSwitcherEnabled,
  };
}
