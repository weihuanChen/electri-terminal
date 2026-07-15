import { requireAdmin } from "@/lib/admin-auth";
import { getLabDashboard } from "@/lib/llm-lab-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PresetEditor } from "./PresetEditor";

export default async function PromptLabPresetsPage() {
  await requireAdmin(); const dashboard = await getLabDashboard(1);
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-7"><header><p className="font-mono text-xs uppercase tracking-[.2em] text-cyan-700">Prompt Lab / Version control</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Presets & portable specs</h1><p className="mt-2 text-sm text-zinc-500">Edit prompts as fields or import a complete JSON spec. Historical runs retain their own immutable snapshots.</p></header><PresetEditor presets={dashboard.presets} versions={dashboard.versions} providers={dashboard.providers}/></div></DashboardLayout>;
}
