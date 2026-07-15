import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Braces,
  Database,
  FileDiff,
  GitMerge,
  Layers3,
  LockKeyhole,
  X,
} from "lucide-react";

type ProductIdentity = Pick<
  Doc<"products">,
  "_id" | "title" | "model" | "skuCode"
>;

export type ResolvedProductCanonicalView = {
  product: ProductIdentity;
  canonical: Doc<"canonicalIntents"> | null;
  canonicalRevision: Doc<"canonicalIntentRevisions"> | null;
  productSnapshot: Doc<"localizationSourceSnapshots"> | null;
  familyTemplate: Doc<"familyIntentTemplates"> | null;
  familyTemplateRevision: Doc<"familyIntentTemplateRevisions"> | null;
  familySnapshots: Doc<"localizationSourceSnapshots">[];
  productGroup: Doc<"productIntentGroups"> | null;
  productGroupRevision: Doc<"productIntentGroupRevisions"> | null;
  pageDeltaRevision: Doc<"pageIntentDeltaRevisions"> | null;
  deltaSnapshot: Doc<"localizationSourceSnapshots"> | null;
};

function json(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function timestamp(value?: number) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[34rem] overflow-auto border-t border-slate-800 bg-slate-950 p-4 font-mono text-[11px] leading-5 text-slate-300 selection:bg-cyan-300 selection:text-slate-950">
      {json(value)}
    </pre>
  );
}

function LayerDetails({
  label,
  meta,
  value,
}: {
  label: string;
  meta: string;
  value: unknown;
}) {
  return (
    <details className="group border-b border-slate-800 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-900/80">
        <span>
          <span className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-200">
            {label}
          </span>
          <span className="mt-1 block font-mono text-[10px] text-slate-500">
            {meta}
          </span>
        </span>
        <span className="font-mono text-lg text-cyan-400 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <JsonBlock value={value} />
    </details>
  );
}

export function ResolvedCanonicalPanel({
  view,
  closeHref,
}: {
  view: ResolvedProductCanonicalView;
  closeHref: string;
}) {
  const revision = view.canonicalRevision;

  return (
    <section
      id="resolved-canonical"
      className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.9)]"
    >
      <header className="border-b border-slate-800 bg-[linear-gradient(120deg,rgba(8,145,178,0.16),transparent_48%)] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              <GitMerge className="h-4 w-4" /> Resolved full canonical
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              {view.product.title}
            </h2>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {view.product.model} · {view.product.skuCode}
            </p>
          </div>
          <Link
            href={closeHref}
            aria-label="Close resolved canonical panel"
            className="flex h-9 items-center gap-2 rounded-md border border-slate-700 px-3 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white"
          >
            <X className="h-4 w-4" /> Close
          </Link>
        </div>

        {revision ? (
          <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-slate-800 bg-slate-800 sm:grid-cols-4">
            {[
              ["Canonical", `r${revision.revision} · ${revision.status}`],
              [
                "Family",
                view.familyTemplateRevision
                  ? `${view.familyTemplate?.name ?? "Template"} · r${view.familyTemplateRevision.revision}`
                  : "No hierarchy reference",
              ],
              [
                "Product group",
                view.productGroupRevision
                  ? `${view.productGroup?.name ?? "Group"} · r${view.productGroupRevision.revision}`
                  : "No group reference",
              ],
              [
                "Page delta",
                view.pageDeltaRevision
                  ? `r${view.pageDeltaRevision.revision} · ${view.pageDeltaRevision.status}`
                  : "Inherited without delta",
              ],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-950/90 px-3 py-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  {label}
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-200">
                  {value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </header>

      {!revision ? (
        <div className="px-6 py-10 text-center">
          <LockKeyhole className="mx-auto h-7 w-7 text-amber-400" />
          <h3 className="mt-3 font-semibold text-white">
            This product has no locked Full Canonical
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
            Lock the Family Template and Product Group, assign the product, then
            run Materialize &amp; lock before opening this view.
          </p>
        </div>
      ) : (
        <div className="grid xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <div className="border-b border-slate-800 xl:border-r xl:border-b-0">
            <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
              <Layers3 className="h-4 w-4 text-amber-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-200">
                  Resolution inputs
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Exact locked layers used by this canonical revision
                </p>
              </div>
            </div>
            <LayerDetails
              label="Family template intent"
              meta={
                view.familyTemplateRevision
                  ? `revision ${view.familyTemplateRevision.revision} · ${view.familySnapshots.length} source snapshot(s)`
                  : "reference unavailable"
              }
              value={{
                sourceSnapshots: view.familySnapshots,
                intent: view.familyTemplateRevision?.intent ?? null,
                inheritancePolicy:
                  view.familyTemplateRevision?.inheritancePolicy ?? null,
              }}
            />
            <LayerDetails
              label="Product group patch"
              meta={
                view.productGroupRevision
                  ? `revision ${view.productGroupRevision.revision} · ${view.productGroupRevision.status}`
                  : "reference unavailable"
              }
              value={{
                membershipCriteria:
                  view.productGroupRevision?.membershipCriteria ?? null,
                differentiators:
                  view.productGroupRevision?.differentiators ?? null,
                intentPatch: view.productGroupRevision?.intentPatch ?? null,
              }}
            />
            <LayerDetails
              label="Product source snapshot"
              meta={
                view.productSnapshot
                  ? `${view.productSnapshot.sourceContentHash.slice(0, 12)} · ${timestamp(view.productSnapshot.createdAt)}`
                  : "snapshot unavailable"
              }
              value={view.productSnapshot}
            />
            <LayerDetails
              label="Optional page delta"
              meta={
                view.pageDeltaRevision
                  ? `revision ${view.pageDeltaRevision.revision} · ${view.pageDeltaRevision.patchOperations.length} operation(s)`
                  : "no page-specific delta applied"
              }
              value={
                view.pageDeltaRevision
                  ? {
                      sourceSnapshot: view.deltaSnapshot,
                      patchOperations: view.pageDeltaRevision.patchOperations,
                    }
                  : null
              }
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <Braces className="h-4 w-4 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-200">
                    Resolved intent JSON
                  </h3>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Family intent + Group patch + optional Page Delta
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-900 bg-emerald-950/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                <LockKeyhole className="h-3 w-3" /> locked
              </span>
            </div>
            <JsonBlock value={revision.intent} />
            <div className="grid gap-px border-t border-slate-800 bg-slate-800 sm:grid-cols-2">
              <div className="bg-slate-950 p-4">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Database className="h-3.5 w-3.5" /> Product snapshot ID
                </p>
                <p className="mt-2 break-all font-mono text-[10px] text-slate-300">
                  {revision.sourceSnapshotId}
                </p>
              </div>
              <div className="bg-slate-950 p-4">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <FileDiff className="h-3.5 w-3.5" /> Materialized
                </p>
                <p className="mt-2 text-xs text-slate-300">
                  {timestamp(revision.reviewedAt ?? revision.createdAt)} by{" "}
                  {revision.reviewedBy ?? revision.createdBy}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
