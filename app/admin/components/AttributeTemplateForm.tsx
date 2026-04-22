"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  createAttributeTemplateAction,
  deleteAttributeTemplateAction,
  updateAttributeTemplateAction,
} from "../actions";
import { UNIT_PRESETS, type AttributeUnitKey } from "@/lib/productPresentation";

type FieldType = "string" | "number" | "boolean" | "enum" | "array" | "range";

interface AttributeField {
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  displayPrecision?: number;
  filterMode?: "exact" | "range_bucket";
  unitKey?: AttributeUnitKey;
  unit?: string;
  options?: string[];
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isVisibleOnFrontend: boolean;
  importAlias?: string;
  sortOrder: number;
  groupName?: string;
  helpText?: string;
  description?: string;
}

interface AttributeTemplate {
  _id: string;
  name: string;
  categoryId: string;
  description?: string;
  status: "draft" | "published" | "archived";
  fields?: AttributeField[];
}

interface Category {
  _id: string;
  name: string;
}

interface AttributeTemplateFormProps {
  template?: AttributeTemplate;
  categories: Category[];
}

function createEmptyField(sortOrder: number): AttributeField {
  return {
    fieldKey: "",
    label: "",
    fieldType: "string",
    displayPrecision: undefined,
    filterMode: "exact",
    unitKey: undefined,
    unit: "",
    options: [],
    isRequired: false,
    isFilterable: false,
    isSearchable: false,
    isVisibleOnFrontend: true,
    importAlias: "",
    sortOrder,
    groupName: "",
    helpText: "",
    description: "",
  };
}

export function AttributeTemplateForm({
  template,
  categories,
}: AttributeTemplateFormProps) {
  const router = useRouter();
  const isEdit = Boolean(template);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: template?.name || "",
    categoryId: template?.categoryId || "",
    description: template?.description || "",
    status: template?.status || ("draft" as const),
  });
  const [fields, setFields] = useState<AttributeField[]>(
    template?.fields?.length
      ? template.fields.map((field, index) => ({
          ...field,
          sortOrder: field.sortOrder ?? index,
        }))
      : [createEmptyField(0)]
  );

  const handleDelete = async () => {
    if (!template) return;

    setIsLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("id", template._id);
      await deleteAttributeTemplateAction(payload);
      router.push("/admin/attribute-templates");
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "删除失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("categoryId", formData.categoryId);
      payload.append("status", formData.status);
      if (formData.description) payload.append("description", formData.description);
      payload.append(
        "fields",
        JSON.stringify(
          fields.map((field, index) => ({
            ...field,
            sortOrder: index,
            options: (field.options || []).filter((option) => option.trim().length > 0),
          }))
        )
      );

      if (isEdit && template) {
        payload.append("id", template._id);
        await updateAttributeTemplateAction(payload);
      } else {
        await createAttributeTemplateAction(payload);
      }

      router.push("/admin/attribute-templates");
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "保存失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = <K extends keyof AttributeField>(
    index: number,
    key: K,
    value: AttributeField[K]
  ) => {
    setFields((current) =>
      current.map((field, fieldIndex) =>
        fieldIndex === index
          ? {
              ...field,
              [key]: value,
            }
          : field
      )
    );
  };

  const addField = () => {
    setFields((current) => [...current, createEmptyField(current.length)]);
  };

  const removeField = (index: number) => {
    setFields((current) =>
      current.filter((_, fieldIndex) => fieldIndex !== index).map((field, fieldIndex) => ({
        ...field,
        sortOrder: fieldIndex,
      }))
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">模板信息</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            一个分类通常只保留一套主模板，用于筛选、规格展示和导入字段映射。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              模板名称 <span className="text-rose-600">*</span>
            </label>
            <input
              required
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：Terminal Blocks Default"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              所属分类 <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(event) =>
                setFormData((current) => ({ ...current, categoryId: event.target.value }))
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="">选择分类</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">状态</label>
            <select
              value={formData.status}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  status: event.target.value as "draft" | "published" | "archived",
                }))
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">描述</label>
            <textarea
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({ ...current, description: event.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="说明这套模板对应的参数范围和使用场景"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">字段定义</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              这里的字段会驱动分类筛选和产品规格表。
            </p>
          </div>
          <button
            type="button"
            onClick={addField}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            添加字段
          </button>
        </div>

        <div className="space-y-4 p-6">
          {fields.map((field, index) => (
            <div key={`${field.fieldKey}-${index}`} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">字段 #{index + 1}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">排序将按当前字段顺序保存。</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  disabled={fields.length === 1}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-white dark:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    fieldKey
                  </label>
                  <input
                    required
                    value={field.fieldKey}
                    onChange={(event) => updateField(index, "fieldKey", event.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder="rated_voltage"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    前台标签
                  </label>
                  <input
                    required
                    value={field.label}
                    onChange={(event) => updateField(index, "label", event.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder="Rated Voltage"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    字段类型
                  </label>
                  <select
                    value={field.fieldType}
                    onChange={(event) =>
                      updateField(index, "fieldType", event.target.value as FieldType)
                    }
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="enum">enum</option>
                    <option value="array">array</option>
                    <option value="range">range</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    显示精度
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={field.displayPrecision ?? ""}
                    onChange={(event) =>
                      updateField(
                        index,
                        "displayPrecision",
                        event.target.value === "" ? undefined : Number(event.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder="如 1 / 2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    单位预设
                  </label>
                  <select
                    value={field.unitKey || ""}
                    onChange={(event) =>
                      updateField(
                        index,
                        "unitKey",
                        (event.target.value || undefined) as AttributeUnitKey | undefined
                      )
                    }
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  >
                    <option value="">无</option>
                    {Object.entries(UNIT_PRESETS).map(([unitKey, preset]) => (
                      <option key={unitKey} value={unitKey}>
                        {unitKey} ({preset.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    筛选模式
                  </label>
                  <select
                    value={field.filterMode || "exact"}
                    onChange={(event) =>
                      updateField(index, "filterMode", event.target.value as "exact" | "range_bucket")
                    }
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  >
                    <option value="exact">exact</option>
                    <option value="range_bucket">range_bucket</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    导入别名
                  </label>
                  <input
                    value={field.importAlias || ""}
                    onChange={(event) => updateField(index, "importAlias", event.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder="voltage"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    分组
                  </label>
                  <input
                    value={field.groupName || ""}
                    onChange={(event) => updateField(index, "groupName", event.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder="Electrical"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    选项
                  </label>
                  <textarea
                    value={(field.options || []).join("\n")}
                    onChange={(event) =>
                      updateField(
                        index,
                        "options",
                        event.target.value.split("\n").map((option) => option.trim())
                      )
                    }
                    rows={3}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder="仅 enum / array 需要，每行一个"
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    定义说明
                  </label>
                  <textarea
                    value={field.description || ""}
                    onChange={(event) => updateField(index, "description", event.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder="字段含义，例如单位基准、典型来源列名"
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    帮助文本
                  </label>
                  <textarea
                    value={field.helpText || ""}
                    onChange={(event) => updateField(index, "helpText", event.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder="说明字段填写规则、单位或前台展示提示"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={field.isRequired}
                    onChange={(event) => updateField(index, "isRequired", event.target.checked)}
                  />
                  必填
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={field.isFilterable}
                    onChange={(event) => updateField(index, "isFilterable", event.target.checked)}
                  />
                  可筛选
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={field.isSearchable}
                    onChange={(event) => updateField(index, "isSearchable", event.target.checked)}
                  />
                  可搜索
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={field.isVisibleOnFrontend}
                    onChange={(event) =>
                      updateField(index, "isVisibleOnFrontend", event.target.checked)
                    }
                  />
                  前台展示
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {isEdit && template ? (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              删除模板
            </button>
          ) : (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">建议每个大类只维护一套已发布模板。</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-slate-900 dark:bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isLoading ? "保存中..." : isEdit ? "保存模板" : "创建模板"}
          </button>
        </div>
      </div>
    </form>
  );
}
