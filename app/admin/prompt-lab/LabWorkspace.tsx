"use client";

import { useEffect, useMemo, useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  FileJson2,
  FlaskConical,
  LoaderCircle,
  Play,
  RotateCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LabDashboardData, LabRunData } from "@/lib/llm-lab-admin";
import { retryLabResultAction, selectLabResultAction, startLabRunAction } from "./actions";

type Props = {
  dashboard: LabDashboardData;
  initialRun: LabRunData | null;
  configuredProviderIds: string[];
  notice?: { tone: "success" | "error"; message: string };
};

const COMPLETE_STATUSES = new Set(["completed", "partial", "failed"]);
const DIFF_FIELDS = ["title", "headline", "intro", "primaryCta", "secondaryCta", "seoTitle", "seoDescription"];

function formatTime(timestamp?: number) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(timestamp);
}

function badge(status: string) {
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "failed") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "partial") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-cyan-200 bg-cyan-50 text-cyan-700";
}

function ResultCard({ result, run }: { result: Doc<"llmLabResults">; run: Doc<"llmLabRuns"> }) {
  const [view, setView] = useState<"structured" | "raw" | "validation">("structured");
  const selectable = result.status === "completed" && result.schemaValid === true;
  return (
    <article className={`min-w-[340px] flex-1 overflow-hidden rounded-2xl border bg-white ${run.selectedResultId === result._id ? "border-cyan-500 shadow-[0_0_0_1px_rgba(6,182,212,.14),0_12px_30px_rgba(15,23,42,.10)]" : "border-zinc-200 shadow-sm"}`}>
      <header className="border-b border-zinc-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-zinc-500">{result.providerName}</p><h3 className="mt-1 font-mono text-sm font-semibold text-zinc-900">{result.modelDisplayName}</h3></div>
          <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${badge(result.status)}`}>{result.status}</span>
        </div>
        <div className="mt-3 flex gap-4 font-mono text-[10px] text-zinc-500"><span>{result.latencyMs ? `${(result.latencyMs / 1000).toFixed(1)}s` : "waiting"}</span><span>{result.totalTokens ? `${result.totalTokens.toLocaleString()} tok` : "— tok"}</span><span>{result.finishReason ?? "—"}</span></div>
      </header>
      <div className="flex border-b border-zinc-200 bg-zinc-50 p-1">
        {(["structured", "raw", "validation"] as const).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`flex-1 rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider ${view === item ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-800"}`}>{item}</button>)}
      </div>
      <div className="h-[380px] overflow-auto p-4">
        {result.status === "queued" || result.status === "running" ? <div className="flex h-full flex-col items-center justify-center text-zinc-500"><LoaderCircle className="mb-3 h-6 w-6 animate-spin text-cyan-600"/><p className="text-xs">Model execution in progress</p></div> : null}
        {result.error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs leading-6 text-rose-700"><AlertCircle className="mb-2 h-4 w-4"/>{result.error}</div> : null}
        {result.status === "completed" && view === "structured" ? <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-6 text-zinc-700">{JSON.stringify(result.parsedOutput ?? {}, null, 2)}</pre> : null}
        {result.status === "completed" && view === "raw" ? <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-6 text-zinc-700">{result.rawText}</pre> : null}
        {result.status === "completed" && view === "validation" ? <div className="space-y-3">{result.schemaValid ? <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700"><CheckCircle2 className="h-4 w-4"/>Output matches the preset schema.</div> : (result.validationErrors ?? []).map((error) => <div key={error} className="rounded-xl border border-amber-200 bg-amber-50 p-3 font-mono text-[11px] text-amber-800">{error}</div>)}</div> : null}
      </div>
      <footer className="border-t border-zinc-200 bg-zinc-50/70 p-3">
        {result.status === "failed" ? <form action={retryLabResultAction} className="mb-2"><input type="hidden" name="runId" value={run._id}/><input type="hidden" name="resultId" value={result._id}/><button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-700"><RotateCw className="h-3.5 w-3.5"/>Retry this model</button></form> : null}
        <form action={selectLabResultAction} className="flex gap-2">
          <input type="hidden" name="runId" value={run._id}/><input type="hidden" name="resultId" value={result._id}/><input name="note" placeholder="Selection note" className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"/>
          <button disabled={!selectable} className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400">{run.selectedResultId === result._id ? <Check className="h-4 w-4"/> : <Sparkles className="h-4 w-4"/>}{run.selectedResultId === result._id ? "Selected" : "Select"}</button>
        </form>
      </footer>
    </article>
  );
}

export function LabWorkspace({ dashboard, initialRun, configuredProviderIds, notice }: Props) {
  const [runData, setRunData] = useState(initialRun);
  const [presetId, setPresetId] = useState<string>(dashboard.presets[0]?._id ?? "");
  const availableVersions = dashboard.versions.filter((item) => item.presetId === presetId).sort((a, b) => b.version - a.version);
  const selectedVersion = availableVersions[0];
  const providers = new Map(dashboard.providers.map((item) => [String(item._id), item]));
  const allowedProviderKeys = selectedVersion?.providerKeys ?? [];
  const enabledModels = dashboard.models.filter((model) => {
    const provider = providers.get(String(model.providerId));
    return model.enabled && configuredProviderIds.includes(String(model.providerId)) &&
      (allowedProviderKeys.length === 0 || Boolean(provider && allowedProviderKeys.includes(provider.key)));
  });

  useEffect(() => {
    if (!runData || COMPLETE_STATUSES.has(runData.run.status)) return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/admin/prompt-lab/runs/${runData.run._id}`, { cache: "no-store" });
      if (response.ok) setRunData(await response.json() as LabRunData);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [runData]);

  const diffRows = useMemo(() => {
    if (!runData) return [];
    return DIFF_FIELDS.map((field) => ({ field, values: runData.results.map((result) => {
      const parsed = result.parsedOutput;
      return parsed && typeof parsed === "object" && field in parsed ? String((parsed as Record<string, unknown>)[field] ?? "") : "—";
    }) }));
  }, [runData]);

  return <div className="prompt-lab-shell min-h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-sm">
    <header className="relative overflow-hidden border-b border-zinc-200 bg-white px-5 py-5 lg:px-7">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(8,145,178,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,.045)_1px,transparent_1px)] [background-size:24px_24px]"/>
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4"><div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-200 bg-cyan-50"><FlaskConical className="h-5 w-5 text-cyan-700"/></div><div><p className="font-mono text-[10px] uppercase tracking-[.28em] text-cyan-700">Model evaluation console</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Prompt Lab <span className="text-zinc-400">/</span> i18n</h1></div></div>
        <div className="flex items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[10px] text-zinc-600"><ShieldCheck className="h-3.5 w-3.5 text-cyan-700"/>Keys remain in Convex</span>{runData ? <span className={`rounded-full border px-3 py-2 font-mono text-[10px] uppercase ${badge(runData.run.status)}`}>{runData.run.status}</span> : null}</div>
      </div>
    </header>
    {notice ? <div className={`mx-5 mt-4 rounded-xl border px-4 py-3 text-xs ${notice.tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{notice.message}</div> : null}
    <div className="grid xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="border-b border-zinc-200 bg-zinc-50/80 p-5 xl:border-b-0 xl:border-r">
        <form action={startLabRunAction} className="space-y-5">
          <section><div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">01 / Spec</h2><FileJson2 className="h-4 w-4 text-zinc-600"/></div>
            <select name="presetId" value={presetId} onChange={(event) => setPresetId(event.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100">{dashboard.presets.filter((item) => item.enabled).map((preset) => <option key={preset._id} value={preset._id}>{preset.name} · v{preset.currentVersion}</option>)}</select>
            <input type="hidden" name="presetVersionId" value={selectedVersion?._id ?? ""}/>
            {selectedVersion ? <details className="mt-2 rounded-xl border border-zinc-200 bg-white p-3"><summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-zinc-500">Prompt preview</summary><p className="mt-3 whitespace-pre-wrap text-[11px] leading-5 text-zinc-700">{selectedVersion.systemPrompt}</p><p className="mt-3 whitespace-pre-wrap border-t border-zinc-200 pt-3 font-mono text-[10px] leading-5 text-zinc-500">{selectedVersion.userPromptTemplate}</p></details> : null}
          </section>
          <section><h2 className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">02 / Input</h2><div className="grid grid-cols-2 gap-2"><label className="text-[10px] uppercase tracking-wider text-zinc-500">Source<input name="sourceLocale" defaultValue="en" className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-2.5 font-mono text-xs text-zinc-900 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"/></label><label className="text-[10px] uppercase tracking-wider text-zinc-500">Target<input name="targetLocale" defaultValue="ru" className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-2.5 font-mono text-xs text-zinc-900 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"/></label></div><textarea required name="sourceContent" placeholder="Paste source page copy or structured JSON…" className="mt-3 min-h-44 w-full rounded-xl border border-zinc-300 bg-white p-3 font-mono text-[11px] leading-5 text-zinc-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"/><textarea name="terminology" placeholder="Terminology / protected terms" className="mt-2 min-h-20 w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs text-zinc-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"/></section>
          <section><h2 className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">03 / Sampling</h2><div className="grid grid-cols-3 gap-2">{([
            ["temperature", selectedVersion?.defaultTemperature ?? 0.2],
            ["topP", selectedVersion?.defaultTopP ?? 0.95],
            ["maxTokens", selectedVersion?.defaultMaxTokens ?? 8192],
          ] as const).map(([name, defaultValue]) => <label key={`${selectedVersion?._id ?? "default"}-${name}`} className="text-[9px] uppercase tracking-wider text-zinc-500">{name}<input name={name} defaultValue={defaultValue} type="number" step={name === "maxTokens" ? 1 : 0.05} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 font-mono text-[11px] text-zinc-900 focus:border-cyan-600 focus:outline-none"/></label>)}</div></section>
          <section><h2 className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">04 / Models</h2><div className="space-y-2">{enabledModels.map((model, index) => { const provider = providers.get(String(model.providerId)); return <label key={model._id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm hover:border-cyan-300"><input type="checkbox" name="modelIds" value={model._id} defaultChecked={index < 3} className="h-4 w-4 accent-cyan-700"/><span className="min-w-0 flex-1"><span className="block truncate font-mono text-xs text-zinc-800">{model.displayName}</span><span className="mt-1 block text-[9px] uppercase tracking-wider text-zinc-500">{provider?.kind} · {provider?.name}</span></span><span className="h-2 w-2 rounded-full bg-emerald-500"/></label>})}{enabledModels.length === 0 ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">No configured models. Add the keys to Convex, then open Provider Settings.</p> : null}</div></section>
          <button disabled={!selectedVersion || enabledModels.length === 0} className="group flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:bg-zinc-200 disabled:text-zinc-400"><span className="inline-flex items-center gap-2"><Play className="h-4 w-4 fill-current"/>Run comparison</span><span className="font-mono text-[10px]">{enabledModels.length} READY</span></button>
        </form>
      </aside>
      <main className="min-w-0 p-5 lg:p-6">
        {!runData ? <div className="grid min-h-[650px] place-items-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60"><div className="max-w-sm text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-zinc-200 bg-white shadow-sm"><Code2 className="h-6 w-6 text-zinc-400"/></div><h2 className="mt-5 text-lg font-semibold">Ready for a controlled run</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Load a versioned spec, select equivalent model targets, and compare schema-validated output side by side.</p></div></div> : <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-zinc-600">Run {String(runData.run._id).slice(-8)}</p><h2 className="mt-1 text-lg font-semibold">{String((runData.run.presetSnapshot as { name?: string }).name ?? "Prompt comparison")}</h2></div><div className="flex items-center gap-3 font-mono text-[10px] text-zinc-500"><Clock3 className="h-3.5 w-3.5"/>{formatTime(runData.run.createdAt)}{!COMPLETE_STATUSES.has(runData.run.status) ? <><RotateCw className="ml-2 h-3.5 w-3.5 animate-spin text-cyan-600"/>polling</> : null}</div></div>
          {runData.results.some((result) => result.status === "completed") ? <details className="rounded-2xl border border-zinc-200 bg-white shadow-sm"><summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-[.16em] text-zinc-600">Field difference matrix</summary><div className="overflow-auto border-t border-zinc-200"><table className="min-w-full text-left"><thead className="bg-zinc-50"><tr><th className="sticky left-0 bg-zinc-50 p-3 font-mono text-[10px] text-zinc-500">FIELD</th>{runData.results.map((result) => <th key={result._id} className="min-w-64 p-3 font-mono text-[10px] text-zinc-600">{result.modelDisplayName}</th>)}</tr></thead><tbody>{diffRows.map((row) => <tr key={row.field} className="border-t border-zinc-100"><th className="sticky left-0 bg-white p-3 font-mono text-[10px] text-cyan-700">{row.field}</th>{row.values.map((item, index) => <td key={index} className="max-w-sm p-3 align-top text-[11px] leading-5 text-zinc-600">{item}</td>)}</tr>)}</tbody></table></div></details> : null}
          <div className="flex gap-4 overflow-x-auto pb-3">{runData.results.map((result) => <ResultCard key={result._id} result={result} run={runData.run}/>)}</div>
        </div>}
      </main>
    </div>
  </div>;
}
