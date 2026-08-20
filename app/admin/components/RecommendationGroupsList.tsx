"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Edit2, PackageOpen, Search } from "lucide-react";

import type { AdminRecommendationGroup } from "@/lib/convex-admin";

export function RecommendationGroupsList({ groups }: { groups: AdminRecommendationGroup[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(
    () => groups.filter((group) =>
      !normalized || [group.code, group.name, group.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    ),
    [groups, normalized],
  );

  return (
    <section className="overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <header className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">组合目录</h2>
          <p className="mt-1 text-xs text-zinc-500">集中维护文章和页面使用的产品清单</p>
        </div>
        <label className="relative sm:ml-auto sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索组号、名称或说明" className="w-full rounded-md border border-zinc-300 py-2 pl-9 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        </label>
      </header>
      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <PackageOpen className="mx-auto h-9 w-9 text-zinc-300" />
          <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">没有匹配的推荐组合</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <tr className="text-left text-xs font-semibold uppercase text-zinc-500">
                <th className="px-5 py-3">组号</th><th className="px-5 py-3">组合</th><th className="px-5 py-3">产品</th><th className="px-5 py-3">引用文章</th><th className="px-5 py-3">状态</th><th className="px-5 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filtered.map((group) => (
                <tr key={group._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-5 py-4"><span className="font-mono text-sm font-semibold text-zinc-950 dark:text-zinc-100">{group.code}</span></td>
                  <td className="max-w-lg px-5 py-4"><Link href={`/admin/recommendation-groups/${group._id}/edit`} className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100">{group.name}</Link><p className="mt-1 line-clamp-1 text-xs text-zinc-500">{group.description || "未填写维护说明"}</p></td>
                  <td className="px-5 py-4 font-mono text-sm text-zinc-600 dark:text-zinc-400">{group.productIds.length}</td>
                  <td className="px-5 py-4 font-mono text-sm text-zinc-600 dark:text-zinc-400">{group.usageCount ?? 0}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${group.status === "published" ? "bg-emerald-100 text-emerald-800" : group.status === "draft" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>{group.status === "published" ? "已发布" : group.status === "draft" ? "草稿" : "已归档"}</span></td>
                  <td className="px-5 py-4 text-right"><Link href={`/admin/recommendation-groups/${group._id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950 dark:hover:bg-zinc-800" title="编辑组合"><Edit2 className="h-4 w-4" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
