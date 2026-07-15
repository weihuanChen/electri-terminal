import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import { FolderTree } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { queryAdmin } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { IntentWorkspaceNav } from "../_components/IntentWorkspaceNav";
import {
  IntentStateBadge,
  SnapshotCell,
  type IntentInventoryState,
} from "../_components/IntentState";

type Inventory = { states: IntentInventoryState[] };

export default async function CategoryIntentPage() {
  await requireAdmin();
  const [inventory, categories] = await Promise.all([
    queryAdmin<Inventory>(
      "queries/modules/intentHierarchy:getIntentManagementInventory",
    ),
    queryAdmin<Doc<"categories">[]>("queries/modules/categories:listCategories", {
      limit: 200,
    }),
  ]);
  const states = new Map(
    inventory.states
      .filter((state) => state.entityType === "category")
      .map((state) => [state.sourceId, state]),
  );
  const approved = categories.filter((category) =>
    states.get(String(category._id))?.approvedRevisionId,
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1400px] space-y-6 pb-16">
        <IntentWorkspaceNav />
        <header className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-950 px-6 py-7 text-white md:grid-cols-[1fr_auto]">
          <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300"><FolderTree className="h-4 w-4" /> Catalog classification intent</p><h1 className="mt-2 text-2xl font-semibold">Category Intent Management</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">分类页负责解释产品分类边界、导航关系和选择入口。分类 Intent 独立于 Family/Product 继承链，避免把目录组织误当成产品文案。</p></div>
          <div className="self-end text-right"><p className="text-3xl font-semibold tabular-nums">{approved}/{categories.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approved categories</p></div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-500"><tr><th className="px-5 py-4">Category</th><th className="px-5 py-4">Level</th><th className="px-5 py-4">Source snapshot</th><th className="px-5 py-4">Canonical state</th><th className="px-5 py-4 text-right">Catalog</th></tr></thead>
            <tbody className="divide-y divide-zinc-200">
              {categories.map((category) => {
                const state = states.get(String(category._id));
                return <tr key={category._id} className="hover:bg-zinc-50/70"><td className="px-5 py-4"><p className="font-semibold text-zinc-950">{category.name}</p><p className="mt-1 font-mono text-xs text-zinc-400">{category.path}</p></td><td className="px-5 py-4"><span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">L{category.level}</span></td><td className="px-5 py-4"><SnapshotCell state={state} /></td><td className="px-5 py-4"><IntentStateBadge state={state} /></td><td className="px-5 py-4 text-right"><Link href={`/admin/categories/${category._id}/edit`} className="text-xs font-semibold text-cyan-700">Open category →</Link></td></tr>;
              })}
            </tbody>
          </table>
        </section>
      </div>
    </DashboardLayout>
  );
}
