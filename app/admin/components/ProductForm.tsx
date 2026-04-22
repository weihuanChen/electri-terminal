"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
} from "../actions";
import { AdminImageListField } from "./ui/AdminImageListField";
import {
  UNIT_PRESETS,
  normalizeVisualMediaItems,
  type AttributeUnitKey,
  type VisualMediaItem,
  type VisualMediaType,
} from "@/lib/productPresentation";

interface Product {
  _id: string;
  productKey?: string;
  seriesCode?: string;
  skuCode: string;
  model: string;
  slug: string;
  title: string;
  shortTitle?: string;
  familyId: string;
  categoryId: string;
  brand?: string;
  summary?: string;
  content?: string;
  attributes?: Record<string, unknown>;
  featureBullets?: string[];
  mainImage?: string;
  gallery?: string[];
  mediaItems?: VisualMediaItem[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  moq?: number;
  packageInfo?: string;
  leadTime?: string;
  origin?: string;
  searchKeywords?: string[];
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Family {
  _id: string;
  name: string;
  categoryId: string;
  attributes?: Record<string, AttributeValue>;
}

type AttributeFieldType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "array"
  | "range";

interface AttributeField {
  fieldKey: string;
  label: string;
  fieldType: AttributeFieldType;
  displayPrecision?: number;
  filterMode?: "exact" | "range_bucket";
  unitKey?: AttributeUnitKey;
  unit?: string;
  options?: string[];
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isVisibleOnFrontend: boolean;
  sortOrder: number;
  groupName?: string;
  helpText?: string;
}

interface AttributeTemplate {
  _id: string;
  name: string;
  categoryId: string;
  status: "draft" | "published" | "archived";
  fields?: AttributeField[];
}

type RangeValue = [number | "", number | ""];
type AttributeValue = string | number | boolean | string[] | RangeValue;
type MediaFormItem = {
  url: string;
  alt?: string;
};
type MediaFormState = Record<VisualMediaType, MediaFormItem[]>;

interface ProductFormProps {
  product?: Product;
  categories?: Category[];
  families?: Family[];
  attributeTemplates?: AttributeTemplate[];
}

function getInitialAttributeState(product?: Product) {
  const attributes = product?.attributes || {};
  return Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [
      key,
      Array.isArray(value)
        ? value.length === 2 && value.every((item) => typeof item === "number")
          ? (value as RangeValue)
          : value.map(String)
        : value,
    ])
  ) as Record<string, AttributeValue>;
}

function getInitialMediaState(product?: Product): MediaFormState {
  const grouped: MediaFormState = {
    product: [],
    dimension: [],
    packaging: [],
    application: [],
  };
  const mediaItems = normalizeVisualMediaItems({
    mediaItems: product?.mediaItems,
    primaryUrl: product?.mainImage,
    gallery: product?.gallery,
    defaultAlt: product?.shortTitle || product?.title,
  });

  for (const type of Object.keys(grouped) as VisualMediaType[]) {
    grouped[type] = mediaItems
      .filter((item) => item.type === type)
      .map((item) => ({
        url: item.url,
        alt: item.alt || "",
      }));
  }

  return grouped;
}

function mediaStateToItems(mediaState: MediaFormState) {
  const mediaItems: VisualMediaItem[] = [];

  for (const type of Object.keys(mediaState) as VisualMediaType[]) {
    const items = mediaState[type]
      .map((item) => ({
        url: item.url.trim(),
        alt: item.alt?.trim() || undefined,
      }))
      .filter((item) => item.url);

    items.forEach((item, index) => {
      mediaItems.push({
        type,
        url: item.url,
        alt: item.alt,
        sortOrder: index,
      });
    });
  }

  return mediaItems;
}

function getTemplateForCategory(
  templates: AttributeTemplate[],
  categoryId: string
) {
  const matches = templates.filter((template) => template.categoryId === categoryId);
  return matches.find((template) => template.status === "published") || matches[0];
}

function normalizeAttributesForSubmit(
  values: Record<string, AttributeValue>,
  fields: AttributeField[],
  inheritedAttributes: Record<string, AttributeValue> = {}
) {
  const normalizedEntries = fields.flatMap((field) => {
    const rawValue = values[field.fieldKey];
    const inheritedValue = inheritedAttributes[field.fieldKey];

    if (field.fieldType === "array") {
      const arrayValue = Array.isArray(rawValue)
        ? rawValue.map((item) => String(item).trim()).filter(Boolean)
        : [];
      if (arrayValue.length === 0) {
        return [];
      }
      return isSameAttributeValue(arrayValue, inheritedValue)
        ? []
        : [[field.fieldKey, arrayValue] as const];
    }

    if (field.fieldType === "boolean") {
      if (rawValue !== true && rawValue !== false) {
        return [];
      }
      return isSameAttributeValue(rawValue, inheritedValue)
        ? []
        : [[field.fieldKey, rawValue] as const];
    }

    if (rawValue === undefined || rawValue === null) {
      return [];
    }

    const textValue = String(rawValue).trim();
    if (!textValue) {
      return [];
    }

    if (field.fieldType === "number") {
      const parsed = Number(textValue);
      if (!Number.isFinite(parsed)) {
        return [];
      }
      return isSameAttributeValue(parsed, inheritedValue)
        ? []
        : [[field.fieldKey, parsed] as const];
    }

    if (field.fieldType === "range") {
      if (!Array.isArray(rawValue) || rawValue.length !== 2) {
        return [];
      }
      const parsedRange = rawValue.map((item) =>
        typeof item === "number" ? item : Number(String(item).trim())
      );
      if (parsedRange.some((item) => !Number.isFinite(item))) {
        return [];
      }
      return isSameAttributeValue(parsedRange as RangeValue, inheritedValue)
        ? []
        : [[field.fieldKey, parsedRange] as const];
    }

    return isSameAttributeValue(textValue, inheritedValue)
      ? []
      : [[field.fieldKey, textValue] as const];
  });

  return Object.fromEntries(normalizedEntries);
}

function isSameAttributeValue(left: AttributeValue, right: AttributeValue) {
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => item === right[index])
    );
  }

  return left === right;
}

function areAttributesEqual(
  left: Record<string, AttributeValue>,
  right: Record<string, AttributeValue>
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => {
    const rightValue = right[key];
    return rightValue !== undefined && isSameAttributeValue(left[key], rightValue);
  });
}

export function ProductForm({
  product,
  categories = [],
  families = [],
  attributeTemplates = [],
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    productKey: product?.productKey || "",
    seriesCode: product?.seriesCode || "",
    skuCode: product?.skuCode || "",
    model: product?.model || "",
    slug: product?.slug || "",
    title: product?.title || "",
    shortTitle: product?.shortTitle || "",
    familyId: product?.familyId || "",
    categoryId: product?.categoryId || "",
    brand: product?.brand || "",
    summary: product?.summary || "",
    content: product?.content || "",
    featureBullets: product?.featureBullets?.join("\n") || "",
    status: product?.status || "draft",
    isFeatured: product?.isFeatured || false,
    moq: product?.moq || 0,
    packageInfo: product?.packageInfo || "",
    leadTime: product?.leadTime || "",
    origin: product?.origin || "",
    searchKeywords: product?.searchKeywords?.join("\n") || "",
    sortOrder: product?.sortOrder || 0,
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
    canonical: product?.canonical || "",
  });
  const [attributes, setAttributes] = useState<Record<string, AttributeValue>>(
    getInitialAttributeState(product)
  );
  const [mediaState, setMediaState] = useState<MediaFormState>(
    getInitialMediaState(product)
  );

  // Filter families by selected category
  const filteredFamilies = families.filter(
    (f) => !formData.categoryId || f.categoryId === formData.categoryId
  );
  const selectedFamily = useMemo(
    () => families.find((family) => family._id === formData.familyId),
    [families, formData.familyId]
  );
  const inheritedAttributes = useMemo(
    () => selectedFamily?.attributes || {},
    [selectedFamily]
  );
  const activeTemplate = useMemo(
    () => getTemplateForCategory(attributeTemplates, formData.categoryId),
    [attributeTemplates, formData.categoryId]
  );
  const activeFields = useMemo(
    () =>
      [...(activeTemplate?.fields || [])].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
      ),
    [activeTemplate]
  );

  useEffect(() => {
    setAttributes((current) => {
      if (!activeFields.length) {
        return Object.keys(current).length ? {} : current;
      }
      const nextEntries = activeFields.map((field) => {
        const currentValue = current[field.fieldKey];
        const productValue = product?.attributes?.[field.fieldKey];
        const inheritedValue = inheritedAttributes[field.fieldKey];
        const fallbackValue =
          field.fieldType === "array"
            ? Array.isArray(productValue)
              ? productValue.map(String)
              : Array.isArray(inheritedValue)
                ? inheritedValue.map(String)
                : []
            : field.fieldType === "range"
              ? Array.isArray(productValue) && productValue.length === 2
                ? [
                    typeof productValue[0] === "number" ? productValue[0] : "",
                    typeof productValue[1] === "number" ? productValue[1] : "",
                  ]
                : Array.isArray(inheritedValue) && inheritedValue.length === 2
                  ? [
                      typeof inheritedValue[0] === "number" ? inheritedValue[0] : "",
                      typeof inheritedValue[1] === "number" ? inheritedValue[1] : "",
                    ]
                  : ["", ""]
            : productValue === undefined || productValue === null
              ? inheritedValue === undefined || inheritedValue === null
                ? field.fieldType === "boolean"
                  ? false
                  : ""
                : (inheritedValue as AttributeValue)
              : (productValue as AttributeValue);

        return [field.fieldKey, currentValue ?? fallbackValue] as const;
      });

      const nextAttributes = Object.fromEntries(nextEntries);
      return areAttributesEqual(current, nextAttributes) ? current : nextAttributes;
    });
  }, [activeFields, inheritedAttributes, product?.attributes]);

  const setAttributeValue = (fieldKey: string, value: AttributeValue) => {
    setAttributes((current) => ({
      ...current,
      [fieldKey]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      // Basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "searchKeywords" || key === "featureBullets") {
          // Convert textarea lines to array
          const arrayValue = value.toString().split("\n").filter(v => v.trim());
          if (arrayValue.length > 0) {
            formDataToSend.append(key, JSON.stringify(arrayValue));
          }
        } else {
          formDataToSend.append(key, value.toString());
        }
      });
      if (activeFields.length > 0) {
        formDataToSend.append(
          "attributes",
          JSON.stringify(
            normalizeAttributesForSubmit(attributes, activeFields, inheritedAttributes)
          )
        );
      }
      const mediaItems = mediaStateToItems(mediaState);
      const productImageUrls = mediaItems
        .filter((item) => item.type === "product")
        .map((item) => item.url);
      formDataToSend.append("mediaItems", JSON.stringify(mediaItems));
      formDataToSend.append("mainImage", productImageUrls[0] || "");
      formDataToSend.append("gallery", JSON.stringify(productImageUrls.slice(1)));

      if (isEdit && product) {
        formDataToSend.append("id", product._id);
        await updateProductAction(formDataToSend);
      } else {
        await createProductAction(formDataToSend);
      }

      router.push("/admin/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "操作失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">基础信息</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Product Key
            </label>
            <input
              type="text"
              value={formData.productKey}
              onChange={(e) => setFormData({ ...formData, productKey: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：non-insulated-ring-terminals-g01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Series Code
            </label>
            <input
              type="text"
              value={formData.seriesCode}
              onChange={(e) => setFormData({ ...formData, seriesCode: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：non-insulated-ring-terminals-g01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Product Code / SKU <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.skuCode}
              onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：UK-2.5B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Legacy Model <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：UK2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Slug <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="product-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              短标题
            </label>
            <input
              type="text"
              value={formData.shortTitle}
              onChange={(e) => setFormData({ ...formData, shortTitle: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="简短的产品标题"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              产品标题 <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="完整的产品标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              分类 <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => {
                setFormData({ ...formData, categoryId: e.target.value, familyId: "" });
              }}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              产品系列 <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={formData.familyId}
              onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              disabled={!formData.categoryId}
            >
              <option value="">选择系列</option>
              {filteredFamilies.map((fam) => (
                <option key={fam._id} value={fam._id}>
                  {fam.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              品牌
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="品牌名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              排序
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">描述信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              摘要
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="产品摘要"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              详细内容
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="产品详细描述（支持 Markdown）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              特性卖点（每行一个）
            </label>
            <textarea
              value={formData.featureBullets}
              onChange={(e) => setFormData({ ...formData, featureBullets: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="Push-in quick wiring&#10;High vibration resistance"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">属性参数</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            参数字段来自当前分类的属性定义。Family 中已定义的公共参数会自动继承，当前 SKU 只保存差异值。
          </p>
        </div>

        {!formData.categoryId ? (
          <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
            请先选择分类，再录入属性参数。
          </div>
        ) : !activeTemplate ? (
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-6 text-sm text-amber-700">
            当前分类还没有属性模板。请先到 Templates 页面配置字段。
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{activeTemplate.name}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                共 {activeFields.length} 个字段，录入结果会写入 `products.attributes`。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {activeFields.map((field) => {
                const value = attributes[field.fieldKey];
                const inheritedValue = inheritedAttributes[field.fieldKey];
                const displayUnit = field.unitKey
                  ? UNIT_PRESETS[field.unitKey]?.label
                  : field.unit;
                const helpText = [field.helpText, displayUnit ? `单位：${displayUnit}` : ""]
                  .filter(Boolean)
                  .join(" ");
                const inheritedText =
                  inheritedValue === undefined
                    ? null
                    : Array.isArray(inheritedValue)
                      ? inheritedValue.length === 2 &&
                        typeof inheritedValue[0] === "number" &&
                        typeof inheritedValue[1] === "number"
                        ? `${inheritedValue[0]} ~ ${inheritedValue[1]}`
                        : inheritedValue.join(", ")
                      : String(inheritedValue);

                const label = (
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {field.label}
                    {field.isRequired && <span className="text-rose-600"> *</span>}
                  </label>
                );

                if (field.fieldType === "boolean") {
                  return (
                    <div key={field.fieldKey} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                      {label}
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) => setAttributeValue(field.fieldKey, event.target.checked)}
                          className="rounded border-zinc-300 dark:border-zinc-700"
                        />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">启用 / 是</span>
                      </label>
                      {helpText && <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{helpText}</p>}
                      {inheritedText && (
                        <p className="mt-2 text-xs text-sky-700">Family 默认值：{inheritedText}</p>
                      )}
                    </div>
                  );
                }

                if (field.fieldType === "array") {
                  const selectedValues = Array.isArray(value) ? value.map(String) : [];
                  return (
                    <div key={field.fieldKey} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                      {label}
                      <div className="space-y-2">
                        {(field.options || []).map((option) => (
                          <label key={option} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                            <input
                              type="checkbox"
                              checked={selectedValues.includes(option)}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? [...selectedValues, option]
                                  : selectedValues.filter((item) => item !== option);
                                setAttributeValue(field.fieldKey, next);
                              }}
                              className="rounded border-zinc-300 dark:border-zinc-700"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                      {helpText && <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{helpText}</p>}
                      {inheritedText && (
                        <p className="mt-2 text-xs text-sky-700">Family 默认值：{inheritedText}</p>
                      )}
                    </div>
                  );
                }

                if (field.fieldType === "enum") {
                  return (
                    <div key={field.fieldKey}>
                      {label}
                      <select
                        value={String(value ?? "")}
                        onChange={(event) => setAttributeValue(field.fieldKey, event.target.value)}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                      >
                        <option value="">请选择</option>
                        {(field.options || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {helpText && <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{helpText}</p>}
                      {inheritedText && (
                        <p className="mt-2 text-xs text-sky-700">Family 默认值：{inheritedText}</p>
                      )}
                    </div>
                  );
                }

                if (field.fieldType === "range") {
                  const rangeValue = Array.isArray(value) ? value : ["", ""];
                  return (
                    <div key={field.fieldKey}>
                      {label}
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={String(rangeValue[0] ?? "")}
                          onChange={(event) =>
                            setAttributeValue(field.fieldKey, [
                              event.target.value === "" ? "" : Number(event.target.value),
                              rangeValue[1] ?? "",
                            ])
                          }
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                          placeholder={displayUnit ? `Min (${displayUnit})` : "Min"}
                        />
                        <input
                          type="number"
                          value={String(rangeValue[1] ?? "")}
                          onChange={(event) =>
                            setAttributeValue(field.fieldKey, [
                              rangeValue[0] ?? "",
                              event.target.value === "" ? "" : Number(event.target.value),
                            ])
                          }
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                          placeholder={displayUnit ? `Max (${displayUnit})` : "Max"}
                        />
                      </div>
                      {helpText && <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{helpText}</p>}
                      {inheritedText && (
                        <p className="mt-2 text-xs text-sky-700">Family 默认值：{inheritedText}</p>
                      )}
                    </div>
                  );
                }

                if (field.fieldType === "string") {
                  return (
                    <div key={field.fieldKey}>
                      {label}
                      <input
                        type="text"
                        value={String(value ?? "")}
                        onChange={(event) => setAttributeValue(field.fieldKey, event.target.value)}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                        placeholder={displayUnit ? `${field.label} (${displayUnit})` : field.fieldKey}
                      />
                      {helpText && <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{helpText}</p>}
                      {inheritedText && (
                        <p className="mt-2 text-xs text-sky-700">Family 默认值：{inheritedText}</p>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={field.fieldKey}>
                    {label}
                    <input
                      type={field.fieldType === "number" ? "number" : "text"}
                      value={String(value ?? "")}
                      onChange={(event) => setAttributeValue(field.fieldKey, event.target.value)}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                      placeholder={displayUnit ? `${field.label} (${displayUnit})` : field.fieldKey}
                    />
                    {helpText && <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{helpText}</p>}
                    {inheritedText && (
                      <p className="mt-2 text-xs text-sky-700">Family 默认值：{inheritedText}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Visual Media */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">视觉媒体</h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          产品图、尺寸图、包装图、应用图分开录入。产品图首张会同步为旧字段 `mainImage`，其余产品图会同步到 `gallery`。
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {([
            ["product", "产品图"],
            ["dimension", "尺寸图"],
            ["packaging", "包装图"],
            ["application", "应用图"],
          ] as const).map(([type, label]) => (
            <div key={type}>
              <AdminImageListField
                label={label}
                values={mediaState[type]}
                onChange={(values) =>
                  setMediaState((current) => ({
                    ...current,
                    [type]: values,
                  }))
                }
                helperText={type === "product" ? "首张产品图会同步为旧字段 mainImage。" : undefined}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">状态设置</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              状态
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "draft" | "published" | "archived",
                })
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                特色产品
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">附加信息</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              MOQ
            </label>
            <input
              type="number"
              value={formData.moq}
              onChange={(e) => setFormData({ ...formData, moq: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="最小订购量"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              包装信息
            </label>
            <input
              type="text"
              value={formData.packageInfo}
              onChange={(e) => setFormData({ ...formData, packageInfo: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="包装规格"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              交期
            </label>
            <input
              type="text"
              value={formData.leadTime}
              onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：7-14 days"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              产地
            </label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：China"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              搜索关键词（每行一个）
            </label>
            <textarea
              value={formData.searchKeywords}
              onChange={(e) => setFormData({ ...formData, searchKeywords: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="关键词1&#10;关键词2&#10;关键词3"
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">SEO 设置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              SEO 标题
            </label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              SEO 描述
            </label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Canonical URL
            </label>
            <input
              type="url"
              value={formData.canonical}
              onChange={(e) => setFormData({ ...formData, canonical: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-slate-900 dark:bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "保存中..." : isEdit ? "保存更改" : "创建产品"}
        </button>
      </div>
    </form>
  );
}
