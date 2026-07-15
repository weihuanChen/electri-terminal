export type IntentInventoryState = {
  entityType: "staticPage" | "category" | "family" | "product" | "article";
  sourceId: string;
  canonicalIntentId?: string;
  currentRevisionId?: string;
  currentRevisionNumber?: number;
  currentRevisionStatus?: "draft" | "review_required" | "approved" | "superseded" | "stale";
  approvedRevisionId?: string;
  approvedRevisionNumber?: number;
  latestSnapshotId?: string;
  latestSnapshotCreatedAt?: number;
  latestSnapshotHash?: string;
  snapshotCount: number;
};

export function IntentStateBadge({ state }: { state?: IntentInventoryState }) {
  if (state?.approvedRevisionId) {
    return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">Approved · r{state.approvedRevisionNumber}</span>;
  }
  if (state?.currentRevisionStatus === "stale") {
    return <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700">Stale</span>;
  }
  if (state?.currentRevisionId) {
    return <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase text-cyan-700">{state.currentRevisionStatus ?? "Draft"} · r{state.currentRevisionNumber}</span>;
  }
  if (state?.latestSnapshotId) {
    return <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-bold uppercase text-zinc-600">Snapshot only</span>;
  }
  return <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-zinc-400">Not started</span>;
}

export function SnapshotCell({ state }: { state?: IntentInventoryState }) {
  if (!state?.latestSnapshotId) return <span className="text-zinc-400">No snapshot</span>;
  return <div><p className="font-mono text-[11px] text-zinc-700">{state.latestSnapshotHash}</p><p className="mt-1 text-[10px] text-zinc-400">{state.snapshotCount} version{state.snapshotCount === 1 ? "" : "s"}</p></div>;
}
