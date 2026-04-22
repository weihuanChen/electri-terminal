export type AttributeUnitKey =
  | "mm"
  | "mm2"
  | "g"
  | "kg"
  | "v"
  | "a"
  | "c"
  | "awg"
  | "nm"
  | "pcs";

export type AttributeFilterMode = "exact" | "range_bucket";

export type VisualMediaType =
  | "product"
  | "dimension"
  | "packaging"
  | "application";

export interface VisualMediaItem {
  type: VisualMediaType;
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface AttributePresentationField {
  fieldType?: "string" | "number" | "boolean" | "enum" | "array" | "range";
  unitKey?: AttributeUnitKey;
  unit?: string;
  displayPrecision?: number;
  filterMode?: AttributeFilterMode;
}

export const UNIT_PRESETS: Record<
  AttributeUnitKey,
  {
    label: string;
    inputSuffix: string;
  }
> = {
  mm: { label: "mm", inputSuffix: "mm" },
  mm2: { label: "mm²", inputSuffix: "mm2" },
  g: { label: "g", inputSuffix: "g" },
  kg: { label: "kg", inputSuffix: "kg" },
  v: { label: "V", inputSuffix: "V" },
  a: { label: "A", inputSuffix: "A" },
  c: { label: "°C", inputSuffix: "°C" },
  awg: { label: "AWG", inputSuffix: "AWG" },
  nm: { label: "N·m", inputSuffix: "N·m" },
  pcs: { label: "pcs", inputSuffix: "pcs" },
};

function getUnitLabel(unitKey?: AttributeUnitKey, legacyUnit?: string) {
  if (unitKey && UNIT_PRESETS[unitKey]) {
    return UNIT_PRESETS[unitKey].label;
  }
  return legacyUnit;
}

function formatScalar(value: string | number, unitLabel?: string) {
  return unitLabel ? `${value} ${unitLabel}` : String(value);
}

function formatNumericValue(value: number, precision?: number) {
  if (typeof precision === "number" && Number.isInteger(precision) && precision >= 0) {
    return value.toFixed(precision);
  }
  return Number.isInteger(value) ? String(value) : String(value);
}

export function formatAttributeValue(
  value: unknown,
  field: AttributePresentationField = {}
) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const unitLabel = getUnitLabel(field.unitKey, field.unit);

  if (Array.isArray(value)) {
    if (
      field.fieldType === "range" &&
      value.length === 2 &&
      value.every((item) => typeof item === "number")
    ) {
      const [min, max] = value;
      const rangeLabel = `${formatNumericValue(min, field.displayPrecision)}-${formatNumericValue(max, field.displayPrecision)}`;
      return unitLabel ? `${rangeLabel} ${unitLabel}` : rangeLabel;
    }

    return value.map((item) => String(item)).join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return formatScalar(formatNumericValue(value, field.displayPrecision), unitLabel);
  }

  if (typeof value === "string") {
    return formatScalar(value, unitLabel);
  }

  return String(value);
}

export function serializeAttributeFilterValue(value: unknown) {
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  return String(value);
}

export function makeBucketFilterValue(min: number, max: number) {
  return `bucket:${min}:${max}`;
}

export function parseBucketFilterValue(value: string) {
  if (!value.startsWith("bucket:")) {
    return null;
  }

  const [, minText, maxText] = value.split(":");
  const min = Number(minText);
  const max = Number(maxText);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return null;
  }

  return { min, max };
}

export function matchesAttributeFilterValue(rawValue: unknown, filterValue: string) {
  const bucket = parseBucketFilterValue(filterValue);
  if (bucket) {
    if (typeof rawValue === "number") {
      return rawValue >= bucket.min && rawValue <= bucket.max;
    }
    if (
      Array.isArray(rawValue) &&
      rawValue.length === 2 &&
      rawValue.every((item) => typeof item === "number")
    ) {
      const [min, max] = rawValue;
      return min <= bucket.max && max >= bucket.min;
    }
    return false;
  }

  if (Array.isArray(rawValue)) {
    if (rawValue.length === 2 && rawValue.every((item) => typeof item === "number")) {
      return serializeAttributeFilterValue(rawValue) === filterValue;
    }
    return rawValue.map(String).includes(filterValue);
  }

  return rawValue !== undefined && rawValue !== null
    ? serializeAttributeFilterValue(rawValue) === filterValue
    : false;
}

export function normalizeVisualMediaItems({
  mediaItems,
  primaryUrl,
  gallery,
  defaultAlt,
}: {
  mediaItems?: VisualMediaItem[];
  primaryUrl?: string;
  gallery?: string[];
  defaultAlt?: string;
}) {
  const normalized: VisualMediaItem[] = [];

  if (mediaItems?.length) {
    normalized.push(
      ...mediaItems
        .filter((item) => item?.url)
        .map((item, index) => ({
          type: item.type,
          url: item.url,
          alt: item.alt || defaultAlt,
          sortOrder: item.sortOrder ?? index,
        }))
    );
  }

  if (primaryUrl) {
    normalized.push({
      type: "product",
      url: primaryUrl,
      alt: defaultAlt,
      sortOrder: -1,
    });
  }

  for (const [index, url] of (gallery ?? []).entries()) {
    if (!url) continue;
    normalized.push({
      type: "product",
      url,
      alt: defaultAlt,
      sortOrder: index,
    });
  }

  const seen = new Set<string>();
  return normalized
    .filter((item) => {
      const key = `${item.type}:${item.url}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
}

export function getPrimaryMediaUrl(items?: VisualMediaItem[]) {
  if (!items?.length) {
    return undefined;
  }

  return (
    items.find((item) => item.type === "product")?.url ??
    items[0]?.url
  );
}

export function groupMediaItemsByType(items?: VisualMediaItem[]) {
  const groups: Record<VisualMediaType, VisualMediaItem[]> = {
    product: [],
    dimension: [],
    packaging: [],
    application: [],
  };

  for (const item of items ?? []) {
    groups[item.type].push(item);
  }

  return groups;
}
