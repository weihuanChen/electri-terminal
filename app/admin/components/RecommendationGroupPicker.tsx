"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Search, X } from "lucide-react";

import type { AdminRecommendationGroup } from "@/lib/convex-admin";

interface RecommendationGroupPickerProps {
  groups: AdminRecommendationGroup[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function RecommendationGroupPicker({
  groups,
  value,
  onChange,
}: RecommendationGroupPickerProps) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      groups.filter(
        (group) =>
          !normalized ||
          [group.code, group.name, group.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalized),
      ),
    [groups, normalized],
  );
  const selectedGroups = value
    .map((id) => groups.find((group) => group._id === id))
    .filter((group): group is AdminRecommendationGroup => Boolean(group));
  const selectedProductCount = selectedGroups.reduce(
    (total, group) => total + group.productIds.length,
    0,
  );

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
      <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50 p-3 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-950">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索组号或组合名称"
            className="w-full rounded-md border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <span className={`shrink-0 font-mono text-xs ${selectedProductCount > 6 ? "text-amber-700" : "text-zinc-500"}`}>
          已选 {value.length} 组 · {selectedProductCount} 个产品
        </span>
      </div>
      {selectedProductCount > 6 && (
        <p className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          当前文章推荐区最多展示前 6 个产品，请调整组合或组合顺序。
        </p>
      )}
      {selectedGroups.length > 0 && (
        <div className="border-b border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-2 text-[11px] font-semibold uppercase text-zinc-500">已选组合与解析顺序</p>
          <ol className="space-y-1">
            {selectedGroups.map((group, index) => (
              <li key={group._id} className="grid grid-cols-[24px_56px_minmax(0,1fr)_auto] items-center gap-2 rounded bg-zinc-50 px-2 py-1.5 dark:bg-zinc-900">
                <span className="font-mono text-[11px] text-zinc-400">{index + 1}</span>
                <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">{group.code}</span>
                <span className="truncate text-xs text-zinc-700 dark:text-zinc-300">{group.name}</span>
                <span className="flex items-center gap-0.5">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 disabled:opacity-25 dark:hover:bg-zinc-800" title="上移组合"><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === selectedGroups.length - 1} className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 disabled:opacity-25 dark:hover:bg-zinc-800" title="下移组合"><ArrowDown className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => toggle(group._id)} className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950" title="移除组合"><X className="h-3.5 w-3.5" /></button>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="max-h-64 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900">
        {filtered.length > 0 ? (
          filtered.map((group) => {
            const checked = value.includes(group._id);
            return (
              <button
                key={group._id}
                type="button"
                onClick={() => toggle(group._id)}
                className={`grid w-full grid-cols-[24px_64px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-left transition ${checked ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"}`}
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-emerald-700 bg-emerald-700 text-white" : "border-zinc-300 dark:border-zinc-700"}`}>
                  {checked && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">{group.code}</span>
                <span className="min-w-0"><span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{group.name}</span><span className="mt-0.5 block truncate text-xs text-zinc-500">{group.productIds.length} 个产品</span></span>
                <span className={`rounded px-1.5 py-1 text-[11px] ${group.status === "published" ? "bg-emerald-100 text-emerald-800" : group.status === "draft" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>{group.status === "published" ? "已发布" : group.status === "draft" ? "草稿" : "已归档"}</span>
              </button>
            );
          })
        ) : (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">没有匹配的推荐组合</p>
        )}
      </div>
    </div>
  );
}
