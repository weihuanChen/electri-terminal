import {
  formatAttributeValue,
  type AttributeUnitKey,
} from "@/lib/productPresentation";

export type KeySpecificationItem = {
  label: string;
  values: string[];
};

export type KeySpecificationField = {
  fieldKey: string;
  label: string;
  fieldType?: "string" | "number" | "boolean" | "enum" | "array" | "range";
  displayPrecision?: number;
  unitKey?: AttributeUnitKey;
  unit?: string;
  groupName?: string;
};

export type KeySpecificationVariant = {
  attributes?: Record<string, unknown>;
};

export type KeySpecificationProduct = {
  attributes?: Record<string, unknown>;
  specificationFields?: KeySpecificationField[];
  variants?: KeySpecificationVariant[];
};

function uniqueValues(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function splitSpecificationList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => splitSpecificationList(item));
  }

  if (value === undefined || value === null) {
    return [];
  }

  return String(value)
    .split(/[\n,;|]+/)
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

function isMeaningfulRange(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === "number" && Number.isFinite(item)) &&
    !(value[0] === 0 && value[1] === 0)
  );
}

function formatAwgValue(value: string) {
  const normalized = value
    .replace(/^awg\s*/i, "")
    .replace(/\s*awg$/i, "")
    .replace(/\s*-\s*/g, "-")
    .trim();

  return normalized ? `${normalized} AWG` : "";
}

function formatNumberLabel(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function formatMaxCurrentValue(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value ?? "").replace(/[^\d.]/g, ""));

  if (Number.isFinite(numericValue) && numericValue > 0) {
    return `up to ${formatNumberLabel(numericValue)}A`;
  }

  const textValue = String(value ?? "").trim();
  if (!textValue) {
    return "";
  }

  return textValue.toLowerCase().startsWith("up to")
    ? textValue
    : `up to ${textValue.replace(/\s*a$/i, "A")}`;
}

function getField(fields: KeySpecificationField[] | undefined, fieldKey: string) {
  return fields?.find((field) => field.fieldKey === fieldKey);
}

function getVariantAttributeValues(
  product: KeySpecificationProduct,
  fieldKey: string
) {
  return (product.variants || []).map((variant) => variant.attributes?.[fieldKey]);
}

function buildWireSizeValues(product: KeySpecificationProduct) {
  const productAwgValues = uniqueValues(
    splitSpecificationList(product.attributes?.awg_range)
      .map(formatAwgValue)
      .filter(Boolean)
  );

  if (productAwgValues.length > 0) {
    return productAwgValues;
  }

  const variantAwgValues = uniqueValues(
    getVariantAttributeValues(product, "awg_range")
      .flatMap(splitSpecificationList)
      .map(formatAwgValue)
      .filter(Boolean)
  );

  if (variantAwgValues.length > 0) {
    return variantAwgValues;
  }

  const wireRangeField = getField(product.specificationFields, "wire_range_mm2");
  const productWireRange = product.attributes?.wire_range_mm2;
  if (isMeaningfulRange(productWireRange)) {
    return [formatAttributeValue(productWireRange, wireRangeField)];
  }

  return uniqueValues(
    getVariantAttributeValues(product, "wire_range_mm2")
      .filter(isMeaningfulRange)
      .map((value) => formatAttributeValue(value, wireRangeField))
  );
}

function buildStudSizeValues(product: KeySpecificationProduct) {
  const productStudValues = uniqueValues(
    splitSpecificationList(product.attributes?.stud_size_american)
  );

  if (productStudValues.length > 0) {
    return productStudValues;
  }

  const variantStudEntries = (product.variants || [])
    .map((variant, index) => ({
      label: splitSpecificationList(variant.attributes?.stud_size_american)[0],
      metric:
        typeof variant.attributes?.stud_size_metric_mm === "number"
          ? variant.attributes.stud_size_metric_mm
          : undefined,
      index,
    }))
    .filter((entry) => entry.label);

  const uniqueEntries = Array.from(
    variantStudEntries
      .reduce((map, entry) => {
        const key = entry.label.toLowerCase();
        const existing = map.get(key);
        if (!existing || (entry.metric ?? Infinity) < (existing.metric ?? Infinity)) {
          map.set(key, entry);
        }
        return map;
      }, new Map<string, (typeof variantStudEntries)[number]>())
      .values()
  );

  const sortedAmericanValues = uniqueEntries
    .sort((left, right) => {
      if (left.metric !== undefined && right.metric !== undefined) {
        return left.metric - right.metric;
      }
      if (left.metric !== undefined) return -1;
      if (right.metric !== undefined) return 1;
      return left.index - right.index;
    })
    .map((entry) => entry.label);

  if (sortedAmericanValues.length > 0) {
    return sortedAmericanValues;
  }

  const metricField = getField(product.specificationFields, "stud_size_metric_mm");
  const productMetricStud = product.attributes?.stud_size_metric_mm;
  if (typeof productMetricStud === "number" && productMetricStud > 0) {
    return [formatAttributeValue(productMetricStud, metricField)];
  }

  return uniqueValues(
    getVariantAttributeValues(product, "stud_size_metric_mm")
      .filter((value): value is number => typeof value === "number" && value > 0)
      .sort((left, right) => left - right)
      .map((value) => formatAttributeValue(value, metricField))
  );
}

function buildMaxCurrentValues(product: KeySpecificationProduct) {
  const productCurrent = product.attributes?.max_current_a;
  const productCurrentLabel = formatMaxCurrentValue(productCurrent);

  if (productCurrentLabel) {
    return [productCurrentLabel];
  }

  const maxCurrent = Math.max(
    ...getVariantAttributeValues(product, "max_current_a").filter(
      (value): value is number => typeof value === "number" && value > 0
    )
  );

  return Number.isFinite(maxCurrent) ? [formatMaxCurrentValue(maxCurrent)] : [];
}

export function buildProductKeySpecifications(
  product: KeySpecificationProduct
): KeySpecificationItem[] {
  return [
    {
      label: "Supported Wire Sizes",
      values: buildWireSizeValues(product),
    },
    {
      label: "Supported Stud Sizes",
      values: buildStudSizeValues(product),
    },
    {
      label: "Max Current",
      values: buildMaxCurrentValues(product),
    },
  ].filter((item) => item.values.length > 0);
}

export function buildProductKeySpecificationAttributes(
  product: KeySpecificationProduct
) {
  return Object.fromEntries(
    buildProductKeySpecifications(product).map((item) => [
      item.label,
      item.values.length === 1 ? item.values[0] : item.values,
    ])
  );
}
