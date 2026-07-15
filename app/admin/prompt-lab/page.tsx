import type { LabRunData } from "@/lib/llm-lab-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { getLabDashboard, getLabRun, getProviderStatuses } from "@/lib/llm-lab-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { initializePromptLabAction } from "./actions";
import { LabWorkspace } from "./LabWorkspace";

type SearchParams = Record<string, string | string[] | undefined>;
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function PromptLabPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  await requireAdmin();
  const query = (await searchParams) ?? {};
  let loaded: {
    dashboard: Awaited<ReturnType<typeof getLabDashboard>>;
    statuses: Awaited<ReturnType<typeof getProviderStatuses>>;
    initialRun: LabRunData | null;
  } | null = null;
  let loadError = "";
  try {
    const dashboard = await getLabDashboard();
    const runId = first(query.run);
    const [statuses, initialRun] = await Promise.all([
      getProviderStatuses(),
      runId ? getLabRun(runId) : Promise.resolve<LabRunData | null>(null),
    ]);
    loaded = { dashboard, statuses, initialRun };
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load Prompt Lab.";
  }
  if (!loaded) return <DashboardLayout><div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><h1 className="font-bold">Prompt Lab configuration required</h1><p className="mt-2 text-sm">{loadError}</p></div></DashboardLayout>;
  if (loaded.dashboard.providers.length === 0) return <DashboardLayout><div className="grid min-h-[70vh] place-items-center"><div className="max-w-xl rounded-3xl border bg-white p-10 text-center shadow-sm"><h1 className="text-2xl font-bold">Initialize Prompt Lab</h1><p className="mt-3 text-sm leading-6 text-zinc-500">Create the official providers, model catalog, and first versioned L1 localization spec. API keys remain in Convex environment variables.</p><form action={initializePromptLabAction}><button className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Initialize defaults</button></form></div></div></DashboardLayout>;
  const error = first(query.error); const success = first(query.success);
  return <DashboardLayout><LabWorkspace dashboard={loaded.dashboard} initialRun={loaded.initialRun} configuredProviderIds={loaded.statuses.filter((item) => item.configured).map((item) => item.providerId)} notice={error ? { tone: "error", message: error } : success ? { tone: "success", message: success.replaceAll("_", " ") } : undefined}/></DashboardLayout>;
}
