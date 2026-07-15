import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { queryAdmin } from "@/lib/convex-admin";
import { STATIC_PAGE_DEFINITIONS } from "@/lib/i18n";
import { DashboardLayout } from "../../components/DashboardLayout";
import { IntentWorkspaceNav } from "../_components/IntentWorkspaceNav";
import {
  IntentStateBadge,
  SnapshotCell,
  type IntentInventoryState,
} from "../_components/IntentState";

type Inventory = { states: IntentInventoryState[] };

const labels: Record<string, string> = {
  home: "Homepage",
  contact: "Contact",
  manufacturing: "Manufacturing",
  "selection-guide": "Selection Guide",
  resources: "Resources",
  "quality-certifications": "Quality & Certifications",
  "privacy-policy": "Privacy Policy",
};

export default async function L1StaticIntentPage() {
  await requireAdmin();
  const inventory = await queryAdmin<Inventory>(
    "queries/modules/intentHierarchy:getIntentManagementInventory",
  );
  const states = new Map(
    inventory.states
      .filter((state) => state.entityType === "staticPage")
      .map((state) => [state.sourceId, state]),
  );
  const pages = STATIC_PAGE_DEFINITIONS.filter((page) => page.pageClass === "L1");
  const approved = pages.filter((page) => states.get(page.key)?.approvedRevisionId).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1400px] space-y-6 pb-16">
        <IntentWorkspaceNav />
        <header className="flex flex-wrap items-end justify-between gap-5 rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
          <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700"><PanelsTopLeft className="h-4 w-4" /> L1 page authority</p><h1 className="mt-2 text-2xl font-semibold text-zinc-950">Static Page Intent Management</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">L1 页面逐页保存完整 Canonical Intent，不使用 Product Group 继承。后续 LLM 起草也必须逐页进入人工审核。</p></div>
          <div className="text-right"><p className="text-3xl font-semibold tabular-nums text-zinc-950">{approved}/{pages.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Approved intents</p></div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-500"><tr><th className="px-5 py-4">Page</th><th className="px-5 py-4">Launch gate</th><th className="px-5 py-4">Source snapshot</th><th className="px-5 py-4">Canonical state</th><th className="px-5 py-4 text-right">Reference</th></tr></thead>
            <tbody className="divide-y divide-zinc-200">
              {pages.map((page) => {
                const state = states.get(page.key);
                return <tr key={page.key} className="hover:bg-zinc-50/70"><td className="px-5 py-4"><p className="font-semibold text-zinc-950">{labels[page.key] ?? page.key}</p><p className="mt-1 font-mono text-xs text-zinc-400">{page.path}</p></td><td className="px-5 py-4"><span className={page.requiredForLanguageLaunch ? "font-semibold text-rose-700" : "text-zinc-500"}>{page.requiredForLanguageLaunch ? "Required" : "Optional"}</span></td><td className="px-5 py-4"><SnapshotCell state={state} /></td><td className="px-5 py-4"><IntentStateBadge state={state} /></td><td className="px-5 py-4 text-right"><Link href={`/admin/localizations/static-pages/${page.key}?locale=en`} className="text-xs font-semibold text-cyan-700">Open English source →</Link></td></tr>;
              })}
            </tbody>
          </table>
        </section>
      </div>
    </DashboardLayout>
  );
}
