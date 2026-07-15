import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  FileText,
  FolderTree,
  GitBranch,
  PanelsTopLeft,
  ShieldCheck,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { queryAdmin } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { IntentWorkspaceNav } from "./_components/IntentWorkspaceNav";

type Coverage = {
  tracked: number;
  withSnapshot: number;
  withDraft: number;
  approved: number;
  stale: number;
};
type Inventory = {
  coverage: Record<"staticPage" | "category" | "family" | "product" | "article", Coverage>;
  hierarchy: {
    templates: number;
    approvedTemplates: number;
    groups: number;
    approvedGroups: number;
    approvedMembers: number;
    deltas: number;
    approvedDeltas: number;
  };
};

const workspaces = [
  {
    href: "/admin/intents/families-products",
    title: "Families & Products",
    eyebrow: "L2 inheritance",
    description: "管理 Family Template、Product Group、成员归组、Page Delta 和完整 Canonical Intent。",
    entityType: "product" as const,
    icon: Boxes,
  },
  {
    href: "/admin/intents/static-pages",
    title: "L1 Static Pages",
    eyebrow: "Page authority",
    description: "逐页管理首页、制造、资源、联系等 L1 页面完整 Intent。",
    entityType: "staticPage" as const,
    icon: PanelsTopLeft,
  },
  {
    href: "/admin/intents/categories",
    title: "Categories",
    eyebrow: "Catalog classification",
    description: "检查分类页的 Source Snapshot、完整 Intent 和后续分类级分析结果。",
    entityType: "category" as const,
    icon: FolderTree,
  },
  {
    href: "/admin/intents/articles",
    title: "Articles",
    eyebrow: "L3 reserved",
    description: "为后续文章模板、文章级 Delta 和专题聚类保留独立工作区。",
    entityType: "article" as const,
    icon: FileText,
  },
] as const;

export default async function IntentOverviewPage() {
  await requireAdmin();
  const inventory = await queryAdmin<Inventory>(
    "queries/modules/intentHierarchy:getIntentManagementInventory",
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px] space-y-6 pb-16">
        <IntentWorkspaceNav />
        <header className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-6 py-8 text-white lg:px-8">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-30" aria-hidden="true">
            <div className="absolute right-10 top-8 h-32 w-32 border border-cyan-300/40" />
            <div className="absolute right-20 top-16 h-32 w-32 border border-cyan-300/20" />
          </div>
          <div className="relative max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300"><GitBranch className="h-4 w-4" /> Intent control plane</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Canonical Intent Management</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Intent 是语言无关的页面治理层。这里统一管理 L1、分类、Family/Product 继承链，并为 L3 Article 保留独立扩展边界。</p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-4">
          {workspaces.map(({ href, title, eyebrow, description, entityType, icon: Icon }) => {
            const coverage = inventory.coverage[entityType];
            return (
              <Link key={href} href={href} className="group flex min-h-64 flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md">
                <div className="flex items-start justify-between"><span className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-slate-900"><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-zinc-300 transition group-hover:text-zinc-900" /></div>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-700">{eyebrow}</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-zinc-500">{description}</p>
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4 text-center">
                  <Metric label="Tracked" value={coverage.tracked} />
                  <Metric label="Draft" value={coverage.withDraft} />
                  <Metric label="Approved" value={coverage.approved} />
                </div>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 shadow-sm md:grid-cols-4">
          <HierarchyMetric label="Approved templates" value={`${inventory.hierarchy.approvedTemplates}/${inventory.hierarchy.templates}`} />
          <HierarchyMetric label="Approved groups" value={`${inventory.hierarchy.approvedGroups}/${inventory.hierarchy.groups}`} />
          <HierarchyMetric label="Assigned products" value={inventory.hierarchy.approvedMembers} />
          <HierarchyMetric label="Approved deltas" value={`${inventory.hierarchy.approvedDeltas}/${inventory.hierarchy.deltas}`} />
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>治理边界保持不变：</strong> Intent Management 负责“页面要表达什么”；Localizations 负责“某种语言如何表达及发布”。</p></div>
      </div>
    </DashboardLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div><p className="text-base font-semibold tabular-nums text-zinc-950">{value}</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">{label}</p></div>;
}

function HierarchyMetric({ label, value }: { label: string; value: number | string }) {
  return <div className="bg-white px-5 py-5"><p className="text-2xl font-semibold tabular-nums text-zinc-950">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p></div>;
}
