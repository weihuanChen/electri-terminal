import type { LocalizableEntityType } from "./config";
import type { LocalizationStatus } from "./urlResolver";

export const LOCALIZATION_STATUSES = [
  "missing",
  "draft",
  "machine_ready",
  "review_required",
  "approved",
  "published",
  "stale",
] as const satisfies readonly LocalizationStatus[];

export const TRANSLATION_METHODS = [
  "manual",
  "llm",
  "import",
  "external_vendor",
  "source_copy",
  "unknown",
] as const;

export const LOCALIZATION_FIELD_STATUSES = [
  "missing",
  "draft",
  "machine_ready",
  "review_required",
  "approved",
  "published",
  "stale",
  "protected",
] as const;

export const LOCALIZATION_ISSUE_SEVERITIES = [
  "blocker",
  "high",
  "medium",
  "low",
] as const;

export type TranslationMethod = (typeof TRANSLATION_METHODS)[number];
export type LocalizationFieldStatus = (typeof LOCALIZATION_FIELD_STATUSES)[number];
export type LocalizationIssueSeverity = (typeof LOCALIZATION_ISSUE_SEVERITIES)[number];

export type LocalizationFieldAudit = {
  status: LocalizationFieldStatus;
  sourceHash?: string;
  localizedHash?: string;
  changed?: boolean;
  requiredForRelease?: boolean;
  reviewedAt?: number;
  reviewer?: string;
  note?: string;
};

export type LocalizationValidationIssue = {
  severity: LocalizationIssueSeverity;
  code: string;
  message: string;
  fieldKey?: string;
  sourceUrl?: string;
  targetUrl?: string;
  createdAt: number;
  resolvedAt?: number;
};

export const LOCALIZATION_STATUS_TRANSITIONS = {
  missing: ["draft"],
  draft: ["machine_ready", "review_required", "approved"],
  machine_ready: ["draft", "review_required", "approved"],
  review_required: ["draft", "approved"],
  approved: ["draft", "published", "stale"],
  published: ["stale"],
  stale: ["draft", "machine_ready", "review_required"],
} as const satisfies Record<LocalizationStatus, readonly LocalizationStatus[]>;

export type LocalizationRecordV2 = {
  entityType: LocalizableEntityType;
  sourceId: string;
  locale: string;
  status: LocalizationStatus;
  localizedSlug?: string;
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  localizedFields?: Record<string, unknown>;
  sourceContentHash?: string;
  sourceFieldHashes?: Record<string, string>;
  localizedContentHash?: string;
  localizedFieldHashes?: Record<string, string>;
  fieldAudits?: Record<string, LocalizationFieldAudit>;
  requiredFieldKeys?: string[];
  protectedFieldKeys?: string[];
  translationMethod?: TranslationMethod;
  translatedBy?: string;
  generatedBy?: string;
  reviewer?: string;
  publishedBy?: string;
  owner?: string;
  reviewRequired?: boolean;
  requiredForRelease?: boolean;
  reviewNotes?: string;
  workflowNotes?: string;
  staleReason?: string;
  staleSourceUpdatedAt?: number;
  changedFieldKeys?: string[];
  validationIssues?: LocalizationValidationIssue[];
  sourceUpdatedAt?: number;
  translatedAt?: number;
  reviewedAt?: number;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
};

export function isLocalizationStatus(value: string): value is LocalizationStatus {
  return LOCALIZATION_STATUSES.includes(value as LocalizationStatus);
}

export function isTranslationMethod(value: string): value is TranslationMethod {
  return TRANSLATION_METHODS.includes(value as TranslationMethod);
}

export function canTransitionLocalizationStatus(
  currentStatus: LocalizationStatus,
  nextStatus: LocalizationStatus
) {
  return (LOCALIZATION_STATUS_TRANSITIONS[currentStatus] as readonly LocalizationStatus[]).includes(
    nextStatus
  );
}
