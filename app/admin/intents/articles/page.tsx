import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import { FileClock, FileText } from "lucide-react";
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

export default async function ArticleIntentPage() {
  await requireAdmin();
  const [inventory, articles] = await Promise.all([
    queryAdmin<Inventory>(
      "queries/modules/intentHierarchy:getIntentManagementInventory",
    ),
    queryAdmin<Doc<"articles">[]>("queries/modules/articles:listArticles", {
      limit: 200,
    }),
  ]);
  const states = new Map(
    inventory.states
      .filter((state) => state.entityType === "article")
      .map((state) => [state.sourceId, state]),
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1400px] space-y-6 pb-16">
        <IntentWorkspaceNav />
        <header className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700"><FileText className="h-4 w-4" /> L3 reserved workspace</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950">Article Intent Management</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">本期只建立文章 Intent 库存与状态边界。后续可在这里增加 Article Template、主题聚类、文章级 Delta 和搜索意图治理，不与 L2 Product Group 混用。</p>
        </header>

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><FileClock className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>L3 authoring 尚未启用。</strong> 当前页面只读，不会从文章内容自动生成 Canonical Intent。</p></div>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-500"><tr><th className="px-5 py-4">Article</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Source snapshot</th><th className="px-5 py-4">Canonical state</th><th className="px-5 py-4 text-right">Content</th></tr></thead>
            <tbody className="divide-y divide-zinc-200">
              {articles.map((article) => {
                const state = states.get(String(article._id));
                return <tr key={article._id} className="hover:bg-zinc-50/70"><td className="max-w-xl px-5 py-4"><p className="truncate font-semibold text-zinc-950">{article.title}</p><p className="mt-1 truncate font-mono text-xs text-zinc-400">/{article.slug}</p></td><td className="px-5 py-4"><p className="text-xs font-semibold text-zinc-700">{article.type}</p><p className="mt-1 text-[10px] uppercase text-zinc-400">{article.status}</p></td><td className="px-5 py-4"><SnapshotCell state={state} /></td><td className="px-5 py-4"><IntentStateBadge state={state} /></td><td className="px-5 py-4 text-right"><Link href={`/admin/articles/${article._id}/edit`} className="text-xs font-semibold text-cyan-700">Open article →</Link></td></tr>;
              })}
              {articles.length === 0 ? <tr><td colSpan={5} className="px-5 py-16 text-center text-sm text-zinc-400">No articles found.</td></tr> : null}
            </tbody>
          </table>
        </section>
      </div>
    </DashboardLayout>
  );
}
