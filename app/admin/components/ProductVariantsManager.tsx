"use client";

import { useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import {
  createProductVariantAction,
  deleteProductVariantAction,
  deleteProductVariantsBatchAction,
  updateProductVariantsBatchAction,
  updateProductVariantAction,
} from "../actions";
import {
  AdminAttributeTemplateSummary,
  AdminProductVariantSummary,
} from "@/lib/convex-admin";
import { UNIT_PRESETS, type AttributeUnitKey } from "@/lib/productPresentation";

type AttributeField = NonNullable<AdminAttributeTemplateSummary["fields"]>[number];
type RangeValue = [number | "", number | ""];
type AttributeValue = string | number | boolean | string[] | RangeValue;
type VariantStatus = "draft" | "published" | "archived";
type VariantMeta = {
  skuCode: string;
  itemNo: string;
  status: VariantStatus;
  sortOrder: number;
  moq: number;
  packageInfo: string;
  leadTime: string;
  origin: string;
};
type VariantBatchSaveItem = {
  id: string;
  skuCode: string;
  itemNo: string;
  attributes: Record<string, unknown>;
  status: VariantStatus;
  moq?: number;
  packageInfo?: string;
  leadTime?: string;
  origin?: string;
  sortOrder?: number;
};

function normalizeAttributeValue(value: unknown): AttributeValue {
  if (Array.isArray(value)) {
    if (value.length === 2 && value.every((item) => typeof item === "number")) {
      return value as RangeValue;
    }
    return value.map(String);
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  return value == null ? "" : String(value);
}

function getInitialAttributes(
  variant: AdminProductVariantSummary | undefined,
  fields: AttributeField[]
) {
  const source = variant?.attributes || {};
  return Object.fromEntries(
    fields.map((field) => [field.fieldKey, normalizeAttributeValue(source[field.fieldKey])])
  ) as Record<string, AttributeValue>;
}

function isSameAttributeValue(left: AttributeValue, right: AttributeValue | undefined) {
  if (right === undefined) return false;
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => item === right[index])
    );
  }
  return left === right;
}

function normalizeAttributesForSubmit(
  values: Record<string, AttributeValue>,
  fields: AttributeField[],
  inheritedAttributes: Record<string, unknown>
) {
  const normalizedEntries: Array<readonly [string, unknown]> = fields.flatMap(
    (field): Array<readonly [string, unknown]> => {
      const rawValue = values[field.fieldKey];
      const inheritedValue = inheritedAttributes[field.fieldKey] as
        | AttributeValue
        | undefined;

      if (field.fieldType === "array") {
        const arrayValue = Array.isArray(rawValue)
          ? rawValue.map((item) => String(item).trim()).filter(Boolean)
          : [];
        if (arrayValue.length === 0 || isSameAttributeValue(arrayValue, inheritedValue)) {
          return [];
        }
        return [[field.fieldKey, arrayValue] as const];
      }

      if (field.fieldType === "boolean") {
        if (rawValue !== true && rawValue !== false) {
          return [];
        }
        if (isSameAttributeValue(rawValue, inheritedValue)) {
          return [];
        }
        return [[field.fieldKey, rawValue] as const];
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
        if (isSameAttributeValue(parsedRange as RangeValue, inheritedValue)) {
          return [];
        }
        return [[field.fieldKey, parsedRange] as const];
      }

      if (field.fieldType === "number") {
        const parsed =
          typeof rawValue === "number" ? rawValue : Number(String(rawValue).trim());
        if (!Number.isFinite(parsed)) {
          return [];
        }
        if (isSameAttributeValue(parsed, inheritedValue)) {
          return [];
        }
        return [[field.fieldKey, parsed] as const];
      }

      const textValue = String(rawValue ?? "").trim();
      if (!textValue || isSameAttributeValue(textValue, inheritedValue)) {
        return [];
      }
      return [[field.fieldKey, textValue] as const];
    }
  );

  return Object.fromEntries(normalizedEntries);
}

function getInitialVariantMeta(variant: AdminProductVariantSummary): VariantMeta {
  return {
    skuCode: variant.skuCode || "",
    itemNo: variant.itemNo || "",
    status: variant.status || "draft",
    sortOrder: variant.sortOrder || 0,
    moq: variant.moq || 0,
    packageInfo: variant.packageInfo || "",
    leadTime: variant.leadTime || "",
    origin: variant.origin || "",
  };
}

function getRangeValue(value: AttributeValue | undefined): RangeValue {
  if (!Array.isArray(value) || value.length !== 2) {
    return ["", ""];
  }

  return [
    typeof value[0] === "number" ? value[0] : "",
    typeof value[1] === "number" ? value[1] : "",
  ];
}

function buildVariantBatchSaveItem(
  id: string,
  meta: VariantMeta,
  attributes: Record<string, unknown>
): VariantBatchSaveItem {
  return {
    id,
    skuCode: meta.skuCode.trim(),
    itemNo: meta.itemNo.trim(),
    attributes,
    status: meta.status,
    moq: Number.isFinite(meta.moq) ? meta.moq : undefined,
    packageInfo: meta.packageInfo.trim() || undefined,
    leadTime: meta.leadTime.trim() || undefined,
    origin: meta.origin.trim() || undefined,
    sortOrder: Number.isFinite(meta.sortOrder) ? meta.sortOrder : undefined,
  };
}

function getVariantBatchSaveItemFromVariant(
  variant: AdminProductVariantSummary,
  fields: AttributeField[],
  inheritedAttributes: Record<string, unknown>
) {
  return buildVariantBatchSaveItem(
    variant._id,
    getInitialVariantMeta(variant),
    normalizeAttributesForSubmit(
      getInitialAttributes(variant, fields),
      fields,
      inheritedAttributes
    )
  );
}

function formatInheritedValue(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) {
    if (value.length === 2 && value.every((item) => typeof item === "number")) {
      return `${value[0]} ~ ${value[1]}`;
    }
    return value.join(", ");
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

function VariantEditorCard({
  productId,
  fields,
  inheritedAttributes,
  variant,
  onVariantDraftChange,
}: {
  productId: string;
  fields: AttributeField[];
  inheritedAttributes: Record<string, unknown>;
  variant?: AdminProductVariantSummary;
  onVariantDraftChange?: (draft: VariantBatchSaveItem) => void;
}) {
  const isCreate = !variant;
  const [attributes, setAttributes] = useState<Record<string, AttributeValue>>(
    getInitialAttributes(variant, fields)
  );
  const normalizedAttributes = useMemo(
    () => normalizeAttributesForSubmit(attributes, fields, inheritedAttributes),
    [attributes, fields, inheritedAttributes]
  );

  const initial: VariantMeta = variant
    ? getInitialVariantMeta(variant)
    : {
        skuCode: "",
        itemNo: "",
        status: "draft",
        sortOrder: 0,
        moq: 0,
        packageInfo: "",
        leadTime: "",
        origin: "",
      };
  const [meta, setMeta] = useState(initial);

  const action = isCreate ? createProductVariantAction : updateProductVariantAction;

  function publishDraft(
    nextMeta: VariantMeta,
    nextAttributes: Record<string, AttributeValue>
  ) {
    if (!variant || !onVariantDraftChange) return;
    onVariantDraftChange(
      buildVariantBatchSaveItem(
        variant._id,
        nextMeta,
        normalizeAttributesForSubmit(nextAttributes, fields, inheritedAttributes)
      )
    );
  }

  function updateMeta<Key extends keyof VariantMeta>(
    key: Key,
    value: VariantMeta[Key]
  ) {
    const nextMeta = { ...meta, [key]: value };
    setMeta(nextMeta);
    publishDraft(nextMeta, attributes);
  }

  function updateAttributeValue(fieldKey: string, value: AttributeValue) {
    const nextAttributes = { ...attributes, [fieldKey]: value };
    setAttributes(nextAttributes);
    publishDraft(meta, nextAttributes);
  }

  return (
    <details
      open={isCreate}
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
    >
      <summary className="cursor-pointer list-none px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {isCreate ? "新增 Variant" : `${variant.itemNo} / ${variant.skuCode}`}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {isCreate
                ? "新增一条规格行并写入 productVariants"
                : `状态：${variant.status}，排序：${variant.sortOrder}`}
            </p>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">展开 / 收起</span>
        </div>
      </summary>

      <div className="border-t border-zinc-200 dark:border-zinc-800 px-5 py-5">
        <form action={action} className="space-y-6">
          {!isCreate ? <input type="hidden" name="id" value={variant._id} /> : null}
          <input type="hidden" name="productId" value={productId} />
          <input
            type="hidden"
            name="attributes"
            value={JSON.stringify(normalizedAttributes)}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                SKU <span className="text-rose-600">*</span>
              </label>
              <input
                name="skuCode"
                required
                value={meta.skuCode}
                onChange={(event) => updateMeta("skuCode", event.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Item No. <span className="text-rose-600">*</span>
              </label>
              <input
                name="itemNo"
                required
                value={meta.itemNo}
                onChange={(event) => updateMeta("itemNo", event.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">状态</label>
              <select
                name="status"
                value={meta.status}
                onChange={(event) =>
                  updateMeta("status", event.target.value as VariantStatus)
                }
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">排序</label>
              <input
                type="number"
                name="sortOrder"
                value={meta.sortOrder}
                onChange={(event) =>
                  updateMeta("sortOrder", Number(event.target.value) || 0)
                }
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">MOQ</label>
              <input
                type="number"
                name="moq"
                value={meta.moq}
                onChange={(event) => updateMeta("moq", Number(event.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">包装</label>
              <input
                name="packageInfo"
                value={meta.packageInfo}
                onChange={(event) => updateMeta("packageInfo", event.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">交期</label>
              <input
                name="leadTime"
                value={meta.leadTime}
                onChange={(event) => updateMeta("leadTime", event.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">产地</label>
              <input
                name="origin"
                value={meta.origin}
                onChange={(event) => updateMeta("origin", event.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Variant Attributes</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              只保存相对 product/family 的差异值；未填写字段会继续走继承值。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => {
              const value = attributes[field.fieldKey];
              const inheritedText = formatInheritedValue(
                inheritedAttributes[field.fieldKey]
              );
              const displayUnit = field.unitKey
                ? UNIT_PRESETS[field.unitKey as AttributeUnitKey]?.label
                : field.unit;

              if (field.fieldType === "boolean") {
                return (
                  <div key={field.fieldKey} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {field.label}
                    </label>
                    <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) =>
                          updateAttributeValue(field.fieldKey, event.target.checked)
                        }
                      />
                      <span>启用 / 是</span>
                    </label>
                    {inheritedText ? (
                      <p className="mt-2 text-xs text-sky-700">继承值：{inheritedText}</p>
                    ) : null}
                  </div>
                );
              }

              if (field.fieldType === "array") {
                const selectedValues = Array.isArray(value) ? value.map(String) : [];
                return (
                  <div key={field.fieldKey} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {field.label}
                    </label>
                    <div className="space-y-2">
                      {(field.options || []).map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"
                        >
                          <input
                            type="checkbox"
                            checked={selectedValues.includes(option)}
                            onChange={(event) => {
                              const next = event.target.checked
                                ? [...selectedValues, option]
                                : selectedValues.filter((item) => item !== option);
                              updateAttributeValue(field.fieldKey, next);
                            }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    {inheritedText ? (
                      <p className="mt-2 text-xs text-sky-700">继承值：{inheritedText}</p>
                    ) : null}
                  </div>
                );
              }

              if (field.fieldType === "enum") {
                return (
                  <div key={field.fieldKey}>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {field.label}
                    </label>
                    <select
                      value={String(value ?? "")}
                      onChange={(event) =>
                        updateAttributeValue(field.fieldKey, event.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    >
                      <option value="">请选择</option>
                      {(field.options || []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {inheritedText ? (
                      <p className="mt-2 text-xs text-sky-700">继承值：{inheritedText}</p>
                    ) : null}
                  </div>
                );
              }

              if (field.fieldType === "range") {
                const rangeValue = getRangeValue(value);
                return (
                  <div key={field.fieldKey}>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {field.label}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={String(rangeValue[0] ?? "")}
                        onChange={(event) =>
                          updateAttributeValue(field.fieldKey, [
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
                          updateAttributeValue(field.fieldKey, [
                            rangeValue[0] ?? "",
                            event.target.value === "" ? "" : Number(event.target.value),
                          ])
                        }
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                        placeholder={displayUnit ? `Max (${displayUnit})` : "Max"}
                      />
                    </div>
                    {inheritedText ? (
                      <p className="mt-2 text-xs text-sky-700">继承值：{inheritedText}</p>
                    ) : null}
                  </div>
                );
              }

              return (
                <div key={field.fieldKey}>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {field.label}
                  </label>
                  <input
                    type={field.fieldType === "number" ? "number" : "text"}
                    value={String(value ?? "")}
                    onChange={(event) =>
                      updateAttributeValue(
                        field.fieldKey,
                        field.fieldType === "number"
                          ? event.target.value === ""
                            ? ""
                            : Number(event.target.value)
                          : event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder={
                      displayUnit ? `${field.label} (${displayUnit})` : field.label
                    }
                  />
                  {inheritedText ? (
                    <p className="mt-2 text-xs text-sky-700">继承值：{inheritedText}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            {!isCreate ? (
              <button
                type="submit"
                formAction={deleteProductVariantAction}
                onClick={(event) => {
                  if (!window.confirm(`Delete variant ${variant.itemNo}?`)) {
                    event.preventDefault();
                  }
                }}
                className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
              >
                删除 Variant
              </button>
            ) : (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">创建后将自动返回当前编辑页。</span>
            )}

            <button
              type="submit"
              className="rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {isCreate ? "新增 Variant" : "保存 Variant"}
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}

export function ProductVariantsManager({
  productId,
  templateFields,
  inheritedAttributes,
  variants,
}: {
  productId: string;
  templateFields: AdminAttributeTemplateSummary["fields"];
  inheritedAttributes: Record<string, unknown>;
  variants: AdminProductVariantSummary[];
}) {
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [variantDrafts, setVariantDrafts] = useState<Record<string, VariantBatchSaveItem>>({});
  const fields = useMemo(
    () =>
      [...(templateFields || [])].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
      ),
    [templateFields]
  );
  const variantIds = useMemo(() => variants.map((variant) => variant._id), [variants]);
  const currentSelectedVariantIds = useMemo(
    () => selectedVariantIds.filter((id) => variantIds.includes(id)),
    [selectedVariantIds, variantIds]
  );
  const selectedIdSet = useMemo(
    () => new Set(currentSelectedVariantIds),
    [currentSelectedVariantIds]
  );
  const variantById = useMemo(
    () => new Map(variants.map((variant) => [variant._id, variant])),
    [variants]
  );
  const selectedBatchSaveItems = useMemo(
    () =>
      currentSelectedVariantIds.flatMap((id) => {
        const variant = variantById.get(id);
        if (!variant) return [];
        return [
          variantDrafts[id] ??
            getVariantBatchSaveItemFromVariant(
              variant,
              fields,
              inheritedAttributes
            ),
        ];
      }),
    [
      currentSelectedVariantIds,
      fields,
      inheritedAttributes,
      variantById,
      variantDrafts,
    ]
  );
  const selectedCount = currentSelectedVariantIds.length;
  const allSelected = variants.length > 0 && selectedCount === variants.length;

  function toggleVariantSelection(id: string, checked: boolean) {
    setSelectedVariantIds((current) =>
      checked
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id)
    );
  }

  function toggleAllVariants(checked: boolean) {
    setSelectedVariantIds(checked ? variantIds : []);
  }

  function handleVariantDraftChange(draft: VariantBatchSaveItem) {
    setVariantDrafts((current) => ({ ...current, [draft.id]: draft }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Variant 管理</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            在后台直接维护该 product 下的所有规格行，支持新增、编辑、删除。
          </p>
        </div>

        {variants.length > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => toggleAllVariants(event.target.checked)}
              />
              <span>全选</span>
              <span className="text-zinc-400">
                {selectedCount}/{variants.length}
              </span>
            </label>

            <form
              action={updateProductVariantsBatchAction}
              onSubmit={(event) => {
                if (selectedCount === 0) {
                  event.preventDefault();
                  return;
                }
                if (!window.confirm(`保存已选择的 ${selectedCount} 个 Variant？`)) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="productId" value={productId} />
              <input
                type="hidden"
                name="items"
                value={JSON.stringify(selectedBatchSaveItems)}
              />
              <button
                type="submit"
                disabled={selectedCount === 0}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white sm:w-auto"
              >
                <Save className="h-4 w-4" />
                保存所选
              </button>
            </form>

            <form
              action={deleteProductVariantsBatchAction}
              onSubmit={(event) => {
                if (selectedCount === 0) {
                  event.preventDefault();
                  return;
                }
                if (!window.confirm(`删除已选择的 ${selectedCount} 个 Variant？`)) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="productId" value={productId} />
              <input
                type="hidden"
                name="ids"
                value={JSON.stringify(currentSelectedVariantIds)}
              />
              <button
                type="submit"
                disabled={selectedCount === 0}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                删除所选
              </button>
            </form>
          </div>
        ) : null}
      </div>

      {variants.map((variant) => (
        <div
          key={variant._id}
          className="grid grid-cols-[44px_minmax(0,1fr)] gap-3"
        >
          <label className="flex min-h-[74px] items-start justify-center rounded-xl border border-zinc-200 bg-white pt-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <input
              type="checkbox"
              checked={selectedIdSet.has(variant._id)}
              onChange={(event) =>
                toggleVariantSelection(variant._id, event.target.checked)
              }
              aria-label={`选择 ${variant.itemNo}`}
            />
          </label>
          <VariantEditorCard
            productId={productId}
            fields={fields}
            inheritedAttributes={inheritedAttributes}
            variant={variant}
            onVariantDraftChange={handleVariantDraftChange}
          />
        </div>
      ))}

      <VariantEditorCard
        productId={productId}
        fields={fields}
        inheritedAttributes={inheritedAttributes}
      />
    </div>
  );
}
