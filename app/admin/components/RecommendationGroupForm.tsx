"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  PackagePlus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  createRecommendationGroupAction,
  deleteRecommendationGroupAction,
  updateRecommendationGroupAction,
} from "../actions";
import type {
  AdminRecommendationGroup,
  RecommendationGroupFormOptions,
} from "@/lib/convex-admin";

interface RecommendationGroupFormProps {
  group?: AdminRecommendationGroup;
  options: RecommendationGroupFormOptions;
  usageCount?: number;
}

function normalizeError(message: string) {
  if (message.includes("recommendation_group_code_exists")) {
    return "该组号已经存在，请使用其他组号。";
  }
  if (message.includes("recommendation_group_in_use")) {
    return "该组合仍被文章引用，请先移除引用或将组合归档。";
  }
  if (message.includes("required_fields_missing")) {
    return "请填写组号、名称，并至少选择一个产品。";
  }
  if (message.includes("fetch failed")) {
    return "后台连接异常，请稍后重试。";
  }
  return message || "操作失败，请重试。";
}

export function RecommendationGroupForm({
  group,
  options,
  usageCount = 0,
}: RecommendationGroupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [familyId, setFamilyId] = useState("all");
  const [formData, setFormData] = useState({
    code: group?.code ?? "",
    name: group?.name ?? "",
    description: group?.description ?? "",
    productIds: group?.productIds ?? [],
    status: group?.status ?? ("draft" as const),
    sortOrder: group?.sortOrder ?? 0,
  });

  const familyById = useMemo(
    () => new Map(options.families.map((family) => [family._id, family])),
    [options.families],
  );
  const productById = useMemo(
    () => new Map(options.products.map((product) => [product._id, product])),
    [options.products],
  );
  const selectedProducts = formData.productIds
    .map((id) => productById.get(id))
    .filter((product): product is RecommendationGroupFormOptions["products"][number] =>
      Boolean(product),
    );
  const normalizedQuery = query.trim().toLowerCase();
  const availableProducts = options.products.filter((product) => {
    if (formData.productIds.includes(product._id)) return false;
    if (familyId !== "all" && product.familyId !== familyId) return false;
    if (!normalizedQuery) return true;
    return [
      product.title,
      product.shortTitle,
      product.slug,
      product.model,
      product.skuCode,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const addProduct = (productId: string) => {
    setFormData((current) => ({
      ...current,
      productIds: [...current.productIds, productId],
    }));
  };

  const removeProduct = (productId: string) => {
    setFormData((current) => ({
      ...current,
      productIds: current.productIds.filter((id) => id !== productId),
    }));
  };

  const moveProduct = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= formData.productIds.length) return;
    setFormData((current) => {
      const productIds = [...current.productIds];
      [productIds[index], productIds[target]] = [productIds[target], productIds[index]];
      return { ...current, productIds };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append("code", formData.code);
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("productIds", JSON.stringify(formData.productIds));
      payload.append("status", formData.status);
      payload.append("sortOrder", String(formData.sortOrder));
      if (group) payload.append("id", group._id);

      const result = group
        ? await updateRecommendationGroupAction(payload)
        : await createRecommendationGroupAction(payload);
      if (!result.ok) {
        setError(normalizeError(result.error));
        return;
      }
      toast.success(group ? "推荐组合已更新" : "推荐组合已创建");
      router.push("/admin/recommendation-groups");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!group || !window.confirm(`确定删除 ${group.code} · ${group.name} 吗？`)) return;
    setError("");
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append("id", group._id);
      const result = await deleteRecommendationGroupAction(payload);
      if (!result.ok) {
        setError(normalizeError(result.error));
        return;
      }
      toast.success("推荐组合已删除");
      router.push("/admin/recommendation-groups");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="border-y border-zinc-200 bg-white py-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-5 px-1 md:grid-cols-[160px_minmax(240px,1fr)_180px_120px]">
          <label className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span>组号</span>
            <input
              required
              value={formData.code}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  code: event.target.value.toUpperCase(),
                }))
              }
              className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm uppercase dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="G01"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span>组合名称</span>
            <input
              required
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="通用绝缘环形端子"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span>状态</span>
            <select
              value={formData.status}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  status: event.target.value as typeof current.status,
                }))
              }
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span>排序</span>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value) || 0,
                }))
              }
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 md:col-span-full">
            <span>内部说明</span>
            <textarea
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({ ...current, description: event.target.value }))
              }
              rows={2}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="记录适用文章、选型边界或维护说明"
            />
          </label>
        </div>
      </section>

      {usageCount > 0 && (
        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p>该组合正在被 {usageCount} 篇文章使用。保存后，已发布文章会立即采用新的产品清单和顺序。</p>
        </div>
      )}

      <div className="grid min-h-[560px] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        <section className="overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <header className="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <PackagePlus className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">产品目录</h2>
              <span className="ml-auto text-xs text-zinc-500">{availableProducts.length} 个可选</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 py-2 pl-9 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder="搜索标题、型号、SKU 或 slug"
                />
              </label>
              <select
                value={familyId}
                onChange={(event) => setFamilyId(event.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="all">全部 Family</option>
                {options.families.map((family) => (
                  <option key={family._id} value={family._id}>{family.name}</option>
                ))}
              </select>
            </div>
          </header>
          <div className="max-h-[470px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900">
            {availableProducts.length > 0 ? availableProducts.map((product) => (
              <div key={product._id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.shortTitle || product.title}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {familyById.get(product.familyId)?.name ?? "未知 Family"} · {product.model} · {product.slug}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addProduct(product._id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-700 dark:text-zinc-300"
                  title="加入组合"
                >
                  <PackagePlus className="h-4 w-4" />
                </button>
              </div>
            )) : (
              <div className="px-6 py-16 text-center text-sm text-zinc-500">没有匹配的产品</div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950">
          <header className="flex items-center border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">推荐顺序</h2>
              <p className="mt-1 text-xs text-zinc-500">文章将按此顺序展示产品</p>
            </div>
            <span className={`ml-auto font-mono text-sm ${formData.productIds.length > 6 ? "text-amber-700" : "text-zinc-500"}`}>
              {formData.productIds.length}/6
            </span>
          </header>
          {formData.productIds.length > 6 && (
            <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              当前文章版式只展示前 6 个产品，后续产品不会出现在文章推荐区。
            </p>
          )}
          <ol className="max-h-[500px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900">
            {selectedProducts.map((product, index) => (
              <li key={product._id} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                <span className="font-mono text-xs text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.shortTitle || product.title}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">{product.model} · {product.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveProduct(index, -1)} disabled={index === 0} className="inline-flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-25 dark:hover:bg-zinc-800" title="上移"><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => moveProduct(index, 1)} disabled={index === selectedProducts.length - 1} className="inline-flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-25 dark:hover:bg-zinc-800" title="下移"><ArrowDown className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => removeProduct(product._id)} className="inline-flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950" title="移出组合"><X className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            ))}
          </ol>
          {selectedProducts.length === 0 && (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <PackagePlus className="h-8 w-8 text-zinc-300" />
              <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">尚未选择产品</p>
              <p className="mt-1 text-xs text-zinc-500">从左侧目录添加产品并设置展示顺序</p>
            </div>
          )}
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <div>
          {group && (
            <button type="button" onClick={handleDelete} disabled={isLoading || usageCount > 0} className="inline-flex items-center gap-2 rounded-md border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40">
              <Trash2 className="h-4 w-4" />删除组合
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">取消</button>
          <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950">
            <Save className="h-4 w-4" />{isLoading ? "保存中..." : "保存组合"}
          </button>
        </div>
      </div>
    </form>
  );
}
