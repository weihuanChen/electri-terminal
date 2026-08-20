import Link from "next/link";
import { PackageCheck, Plus } from "lucide-react";

import { requireAdmin } from "@/lib/admin-auth";
import { listRecommendationGroups } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { RecommendationGroupsList } from "../components/RecommendationGroupsList";

export default async function RecommendationGroupsPage() {
  await requireAdmin();
  const groups = await listRecommendationGroups();
  const publishedCount = groups.filter((group) => group.status === "published").length;
  const usageCount = groups.reduce((total, group) => total + (group.usageCount ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end dark:border-zinc-800">
          <div>
            <p className="font-mono text-xs uppercase text-zinc-500">Editorial catalog</p>
            <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-100">推荐产品组合</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">一次维护产品清单，在文章中按组号快速复用。</p>
          </div>
          <Link href="/admin/recommendation-groups/create" className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:ml-auto dark:bg-zinc-100 dark:text-zinc-950"><Plus className="h-4 w-4" />新建组合</Link>
        </header>
        <div className="grid gap-px overflow-hidden rounded-md border border-zinc-200 bg-zinc-200 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
          {[{ label: "组合总数", value: groups.length }, { label: "已发布", value: publishedCount }, { label: "文章引用", value: usageCount }].map((item) => (
            <div key={item.label} className="bg-white px-5 py-4 dark:bg-zinc-950"><p className="text-xs font-medium text-zinc-500">{item.label}</p><p className="mt-2 font-mono text-2xl font-semibold text-zinc-950 dark:text-zinc-100">{item.value}</p></div>
          ))}
        </div>
        {groups.length === 0 ? <div className="rounded-md border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700"><PackageCheck className="mx-auto h-10 w-10 text-zinc-300" /><p className="mt-4 text-sm font-medium text-zinc-800 dark:text-zinc-200">还没有推荐产品组合</p><p className="mt-1 text-sm text-zinc-500">创建 G01 等组合后，即可在文章编辑器中直接选择。</p></div> : <RecommendationGroupsList groups={groups} />}
      </div>
    </DashboardLayout>
  );
}
