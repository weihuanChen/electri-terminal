import type { LocalizationRecordV2 } from "./localizationModel";

type PlainObject = Record<string, unknown>;

type LocalizedEntity = {
  _id?: string;
  name?: string;
  title?: string;
  shortTitle?: string;
  summary?: string;
  description?: string;
  shortDescription?: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  pageConfig?: unknown;
  featureBullets?: string[];
  highlights?: string[];
};

function isPlainObject(value: unknown): value is PlainObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .map((item) => normalizeText(item))
    .filter((item): item is string => Boolean(item));

  return items.length > 0 ? items : undefined;
}

function getFields(localization?: Pick<LocalizationRecordV2, "localizedFields"> | null) {
  return isPlainObject(localization?.localizedFields)
    ? localization.localizedFields
    : {};
}

function getFieldText(fields: PlainObject, key: string) {
  return normalizeText(fields[key]);
}

function getFirstFieldText(fields: PlainObject, keys: string[]) {
  for (const key of keys) {
    const value = getFieldText(fields, key);
    if (value) return value;
  }

  return undefined;
}

function getFieldStringArray(fields: PlainObject, key: string) {
  return normalizeStringArray(fields[key]);
}

function getFieldObject(fields: PlainObject, key: string) {
  return isPlainObject(fields[key]) ? fields[key] : undefined;
}

function mergePlainObjects<T>(base: T, patch: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return isPlainObject(patch) ? (patch as T) : base;
  }

  const merged: PlainObject = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;

    const previous = merged[key];
    if (isPlainObject(previous) && isPlainObject(value)) {
      merged[key] = mergePlainObjects(previous, value);
      continue;
    }

    merged[key] = value;
  }

  return merged as T;
}

function applyCommonLocalization<T extends LocalizedEntity>(
  entity: T,
  localization?: LocalizationRecordV2 | null
) {
  if (!localization || localization.status !== "published") {
    return entity;
  }

  const fields = getFields(localization);
  const pageConfigPatch = getFieldObject(fields, "pageConfig");

  return {
    ...entity,
    ...(localization.seoTitle || getFieldText(fields, "seoTitle")
      ? { seoTitle: localization.seoTitle ?? getFieldText(fields, "seoTitle") }
      : {}),
    ...(localization.seoDescription || getFieldText(fields, "seoDescription")
      ? {
          seoDescription:
            localization.seoDescription ?? getFieldText(fields, "seoDescription"),
        }
      : {}),
    ...(pageConfigPatch
      ? { pageConfig: mergePlainObjects(entity.pageConfig ?? {}, pageConfigPatch) }
      : {}),
  };
}

export function buildLocalizationMap(records: LocalizationRecordV2[]) {
  return new Map(records.map((record) => [record.sourceId, record]));
}

export function hasPublishedLocalization(
  localizations: Map<string, LocalizationRecordV2>,
  sourceId?: string
) {
  return Boolean(sourceId && localizations.get(sourceId)?.status === "published");
}

export function getPublishedLocalization(
  localizations: Map<string, LocalizationRecordV2>,
  sourceId?: string
) {
  if (!sourceId) return undefined;

  const localization = localizations.get(sourceId);
  return localization?.status === "published" ? localization : undefined;
}

export function applyCategoryLocalization<T extends LocalizedEntity>(
  category: T,
  localization?: LocalizationRecordV2 | null
): T {
  const fields = getFields(localization);
  const localized = applyCommonLocalization(category, localization);
  const name = localization?.title ?? getFirstFieldText(fields, ["name", "title"]);

  return {
    ...localized,
    ...(name ? { name } : {}),
    ...(getFieldText(fields, "description")
      ? { description: getFieldText(fields, "description") }
      : {}),
    ...(getFieldText(fields, "shortDescription")
      ? { shortDescription: getFieldText(fields, "shortDescription") }
      : {}),
    ...(getFieldText(fields, "summary")
      ? {
          pageConfig: mergePlainObjects(localized.pageConfig ?? {}, {
            content: { summary: getFieldText(fields, "summary") },
          }),
        }
      : {}),
  } as T;
}

export function applyFamilyLocalization<T extends LocalizedEntity>(
  family: T,
  localization?: LocalizationRecordV2 | null
): T {
  const fields = getFields(localization);
  const localized = applyCommonLocalization(family, localization);
  const name = localization?.title ?? getFirstFieldText(fields, ["name", "title"]);
  const highlights = getFieldStringArray(fields, "highlights");

  return {
    ...localized,
    ...(name ? { name } : {}),
    ...(getFieldText(fields, "summary") ? { summary: getFieldText(fields, "summary") } : {}),
    ...(getFieldText(fields, "content") ? { content: getFieldText(fields, "content") } : {}),
    ...(highlights ? { highlights } : {}),
  } as T;
}

export function applyProductLocalization<T extends LocalizedEntity>(
  product: T,
  localization?: LocalizationRecordV2 | null
): T {
  const fields = getFields(localization);
  const localized = applyCommonLocalization(product, localization);
  const title = localization?.title ?? getFirstFieldText(fields, ["title", "name"]);
  const featureBullets = getFieldStringArray(fields, "featureBullets");

  return {
    ...localized,
    ...(title ? { title } : {}),
    ...(getFieldText(fields, "shortTitle")
      ? { shortTitle: getFieldText(fields, "shortTitle") }
      : {}),
    ...(getFieldText(fields, "summary") ? { summary: getFieldText(fields, "summary") } : {}),
    ...(getFieldText(fields, "content") ? { content: getFieldText(fields, "content") } : {}),
    ...(featureBullets ? { featureBullets } : {}),
  } as T;
}

export function applyCollectionLocalizations<T extends { _id: string }>(
  items: T[] | undefined,
  localizations: Map<string, LocalizationRecordV2>,
  applyLocalization: (item: T, localization: LocalizationRecordV2) => T
) {
  return (items ?? [])
    .map((item) => {
      const localization = getPublishedLocalization(localizations, item._id);
      return localization ? applyLocalization(item, localization) : null;
    })
    .filter((item): item is T => Boolean(item));
}
