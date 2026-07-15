import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Eye,
  FileDiff,
  GitBranch,
  Layers3,
  LockKeyhole,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { queryAdmin } from "@/lib/convex-admin";
import { getLabDashboard } from "@/lib/llm-lab-admin";
import { isL2IntentDraftPresetVersionCompatible } from "@/lib/i18n/l2-intent-preset";
import { DashboardLayout } from "../../components/DashboardLayout";
import { IntentWorkspaceNav } from "../../intents/_components/IntentWorkspaceNav";
import {
  approveFamilyTemplateRevisionAction,
  approveProductDeltaRevisionAction,
  approveProductGroupRevisionAction,
  assignProductToGroupAction,
  createFamilyTemplateAction,
  createFamilyTemplateRevisionAction,
  createProductDeltaRevisionAction,
  createProductGroupAction,
  createProductGroupRevisionAction,
  materializeProductIntentAction,
  promoteSelectedResultToFamilyTemplateAction,
  startL2IntentAnalysisAction,
} from "./actions";
import {
  ResolvedCanonicalPanel,
  type ResolvedProductCanonicalView,
} from "./ResolvedCanonicalPanel";

type SearchParams = Record<string, string | string[] | undefined>;
type FamilySummary = Pick<
  Doc<"productFamilies">,
  "_id" | "name" | "status" | "sortOrder"
>;
type SelectedFamily = Pick<
  Doc<"productFamilies">,
  "_id" | "name" | "summary" | "status"
>;
type ProductSummary = Pick<
  Doc<"products">,
  "_id" | "title" | "model" | "skuCode" | "status"
>;
type ProductRow = {
  product: ProductSummary;
  sourceSnapshot: {
    _id: string;
    createdAt: number;
    sourceContentHash: string;
  } | null;
  member: Doc<"productIntentGroupMembers"> | null;
  delta: Doc<"pageIntentDeltas"> | null;
  deltaRevision: Doc<"pageIntentDeltaRevisions"> | null;
  canonical: Doc<"canonicalIntents"> | null;
  canonicalRevision: Doc<"canonicalIntentRevisions"> | null;
  analysisRun: {
    _id: string;
    status: Doc<"llmLabRuns">["status"];
    presetVersionId: string;
    selectedResultId?: string;
    createdAt: number;
    completedAt?: number;
    resultCount: number;
    validResultCount: number;
  } | null;
};
type Workspace = {
  families: FamilySummary[];
  selectedFamily: SelectedFamily | null;
  products: ProductRow[];
  templates: Array<{
    template: Doc<"familyIntentTemplates">;
    revisions: Doc<"familyIntentTemplateRevisions">[];
  }>;
  groups: Array<{
    group: Doc<"productIntentGroups">;
    revisions: Doc<"productIntentGroupRevisions">[];
    members: Doc<"productIntentGroupMembers">[];
  }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function json(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function statusTone(status: string) {
  if (status === "active" || status === "approved")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "stale" || status === "superseded")
    return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-zinc-200 bg-zinc-50 text-zinc-600";
}

function message(value: string) {
  const messages: Record<string, string> = {
    template_created: "Family Template 已创建。",
    template_revision_created: "Template 草稿版本已保存。",
    template_revision_locked: "Template 版本已审核并锁定。",
    group_created: "Product Group 已创建。",
    group_revision_created: "Group 草稿版本已保存。",
    group_revision_locked: "Group 版本已审核并锁定。",
    product_assigned: "产品已人工分配到 Group。",
    delta_revision_created: "Page Delta 草稿已保存。",
    delta_revision_locked: "Page Delta 已审核并锁定。",
    canonical_intent_materialized: "完整 Canonical Intent 已生成并锁定。",
    l2_intent_analysis_started:
      "L2 Intent 通用分析草稿已启动，可在 Prompt Lab 查看模型结果。",
    result_promoted_to_family_draft:
      "已将所选 LLM 结果提升为 Family Template 草稿，请复核共享范围后再锁定。",
    invalid_json: "JSON 格式无效，请检查字段结构。",
  };
  return messages[value] ?? value;
}

function defaultIntent(familyName: string) {
  return {
    schemaVersion: 1,
    pageRole: "industrial_product_selection",
    primaryAudience: ["electrical_engineer", "industrial_buyer"],
    buyerStage: ["evaluation", "procurement"],
    primaryGoal: `Help buyers evaluate and select the correct ${familyName} product`,
    primaryConceptIds: [],
    secondaryConceptIds: [],
    mustCommunicate: [
      {
        key: "family_scope",
        intent: "Define the product family and its selection scope",
        evidencePaths: ["sourcePayload.summary"],
      },
    ],
    verifiedClaims: [],
    prohibitedClaims: [
      "Unsupported certification, material, rating, or application claims",
    ],
    conversionIntent: {
      primaryAction: "request_quote",
      secondaryAction: "contact_engineering",
    },
    sectionIntents: [
      {
        sectionKey: "overview",
        purpose: "Define the product and its industrial role",
        requiredConceptIds: [],
        requiredFactPaths: ["sourcePayload.summary"],
      },
      {
        sectionKey: "selection",
        purpose: "Guide selection using verified specifications",
        requiredConceptIds: [],
        requiredFactPaths: ["evidencePayload.products"],
      },
    ],
  };
}

const DEFAULT_POLICY = {
  schemaVersion: 2,
  allowedOverrideTargets: [
    "primaryGoal",
    "primaryConceptIds",
    "secondaryConceptIds",
    "conversionIntent",
    "verifiedClaims",
    "prohibitedClaims",
    "extensions",
    "pageDelta",
  ],
  mergeTargets: ["mustCommunicate", "sectionIntents"],
  alwaysSharedPaths: [
    "buyerStage",
    "primaryAudience",
    "pageRole",
    "mustCommunicate.product_definition",
    "mustCommunicate.application_fit",
    "mustCommunicate.evidence_boundary",
    "sectionIntents.overview",
    "sectionIntents.applications",
  ],
  alwaysProductSpecificPaths: [
    "verifiedClaims",
    "pageDelta",
    "extensions.selectionCriteria",
    "extensions.supportedRanges",
    "extensions.pageDifferentiators",
    "extensions.productEvidence",
  ],
  sharedWithPageDeltaPaths: [
    "mustCommunicate.selection_logic",
    "sectionIntents.selection",
  ],
  excludedPaths: ["schemaVersion", "pageRole", "entityScope"],
  minimumMembershipEvidence: ["sourcePayload.title", "evidencePayload.model"],
  minimumPageEvidence: ["evidencePayload.variants"],
  evidenceResolutionOrder: [
    "protectedValues",
    "pageEvidence",
    "approvedGroupEvidence",
    "approvedFamilyEvidence",
    "sourceContent",
  ],
  missingEvidencePolicy: {
    shared_intent_missing_page_evidence: "inherit_without_conflict",
    page_specific_claim_missing_evidence: "high_conflict",
    optional_section_missing_evidence: "warning",
    group_membership_missing_evidence: "high_conflict",
  },
};

const DEFAULT_CRITERIA = [
  {
    fieldPath: "attributes.series",
    operator: "equals",
    values: ["replace_me"],
    required: true,
  },
];
const DEFAULT_DIFFERENTIATORS = [
  {
    key: "series_scope",
    label: "Series / specification scope",
    sourcePaths: ["attributes.series"],
    values: ["replace_me"],
    intentImpact:
      "Changes selection guidance and verified specification emphasis",
  },
];

export default async function IntentManagementPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = (await searchParams) ?? {};
  const requestedFamilyId = first(params.familyId) || undefined;
  const [workspace, lab] = await Promise.all([
    queryAdmin<Workspace>(
      "queries/modules/intentHierarchy:getIntentHierarchyWorkspace",
      requestedFamilyId ? { familyId: requestedFamilyId } : {},
    ),
    getLabDashboard(1),
  ]);
  const family = workspace.selectedFamily;
  const familyId = family ? String(family._id) : "";
  const inspectProductId = first(params.inspectProductId);
  const canInspectProduct = workspace.products.some(
    (row) => String(row.product._id) === inspectProductId,
  );
  const resolvedCanonicalView = canInspectProduct
    ? await queryAdmin<ResolvedProductCanonicalView>(
        "queries/modules/intentHierarchy:getResolvedProductCanonicalView",
        { productId: inspectProductId },
      )
    : null;
  const success = first(params.success);
  const error = first(params.error);
  const activeTemplates = workspace.templates.filter(
    (item) => item.template.approvedRevisionId,
  );
  const activeGroups = workspace.groups.filter(
    (item) => item.group.approvedRevisionId,
  );
  const groupById = new Map(
    workspace.groups.map((item) => [String(item.group._id), item]),
  );
  const assigned = workspace.products.filter((item) => item.member).length;
  const materialized = workspace.products.filter(
    (item) => item.canonicalRevision?.status === "approved",
  ).length;
  const providerById = new Map(
    lab.providers.map((provider) => [String(provider._id), provider]),
  );
  const analysisRoutes = lab.presets.flatMap((preset) => {
    const version = lab.versions.find(
      (candidate) =>
        candidate.presetId === preset._id &&
        candidate.version === preset.currentVersion,
    );
    if (!version || !isL2IntentDraftPresetVersionCompatible(preset, version)) {
      return [];
    }
    return lab.models.flatMap((model) => {
      const provider = providerById.get(String(model.providerId));
      if (
        !model.enabled ||
        !model.supportsStructuredOutput ||
        !provider?.enabled ||
        (version.providerKeys?.length &&
          !version.providerKeys.includes(provider.key))
      ) {
        return [];
      }
      return [
        {
          key: `${preset._id}:${version._id}:${model._id}`,
          label: `${preset.name} · v${version.version} · ${provider.name} · ${model.displayName}`,
        },
      ];
    });
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1560px] space-y-6 pb-16">
        <IntentWorkspaceNav />
        <header className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-sm">
          <div className="grid lg:grid-cols-[1fr_auto]">
            <div className="px-6 py-7 lg:px-8">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                <GitBranch className="h-4 w-4" /> Manual intent hierarchy
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Families & Products Intent
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                人工维护 L2
                共享意图、规格组差异和单页例外。每次锁定都进行结构校验；最终产物仍是页面级、完整且不可变的
                Canonical Intent。
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-slate-800 bg-slate-900/60 lg:w-[470px] lg:border-l lg:border-t-0">
              {[
                ["Templates", activeTemplates.length],
                ["Groups", activeGroups.length],
                ["Assigned", `${assigned}/${workspace.products.length}`],
                ["Canonical", `${materialized}/${workspace.products.length}`],
              ].map(([label, count]) => (
                <div
                  key={label}
                  className="border-b border-r border-slate-800 px-5 py-4 last:border-b-0"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-white">
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {(success || error) && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
          >
            {error ? (
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{message(error || success)}</span>
          </div>
        )}

        <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <form
            className="flex min-w-0 flex-1 flex-wrap items-end gap-3"
            action="/admin/localizations/intents"
          >
            <label className="min-w-[280px] flex-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Product family
              <select
                name="familyId"
                defaultValue={familyId}
                className="mt-2 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium normal-case tracking-normal text-zinc-900"
              >
                {workspace.families.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white">
              Load family
            </button>
          </form>
          <Link
            href="/admin/localizations/strategy"
            className="flex h-10 items-center gap-2 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700"
          >
            Language Profile <ChevronRight className="h-4 w-4" />
          </Link>
        </section>

        {resolvedCanonicalView && (
          <ResolvedCanonicalPanel
            view={resolvedCanonicalView}
            closeHref={`/admin/intents/families-products?familyId=${familyId}`}
          />
        )}

        {!family ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500">
            尚无 Product Family，无法建立 Intent 层级。
          </div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-2">
              <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-5 w-5 text-cyan-700" />
                    <h2 className="font-semibold text-zinc-950">
                      1. Family Templates
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    共享完整 Intent；锁定后才能创建 Group revision。
                  </p>
                </div>
                <div className="space-y-4 p-5">
                  {workspace.templates.map(({ template, revisions }) => {
                    const current = revisions[0];
                    return (
                      <article
                        key={template._id}
                        className="rounded-xl border border-zinc-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-zinc-950">
                              {template.name}
                            </h3>
                            <p className="mt-1 font-mono text-xs text-zinc-400">
                              {template.key}
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${statusTone(template.status)}`}
                          >
                            {template.status}
                          </span>
                        </div>
                        {current && (
                          <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                            <span>
                              Revision {current.revision} · {current.status}
                            </span>
                            {(current.status === "draft" ||
                              current.status === "review_required") && (
                              <form
                                action={approveFamilyTemplateRevisionAction}
                              >
                                <input
                                  type="hidden"
                                  name="familyId"
                                  value={familyId}
                                />
                                <input
                                  type="hidden"
                                  name="revisionId"
                                  value={current._id}
                                />
                                <button className="flex items-center gap-1 font-semibold text-emerald-700">
                                  <LockKeyhole className="h-3.5 w-3.5" /> Review
                                  & lock
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                        {current?.generationProvenance?.source ===
                          "llm_lab_selected_result" && (
                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
                            <p className="font-semibold">
                              LLM-promoted draft · human review required
                            </p>
                            <p className="mt-1 font-mono text-[10px] text-amber-800/80">
                              Run {current.generationProvenance.runId} · Result{" "}
                              {current.generationProvenance.resultId}
                            </p>
                            {current.validationIssues.map((issue) => (
                              <p
                                key={`${issue.code}-${issue.path ?? "root"}`}
                                className="mt-1"
                              >
                                {issue.severity.toUpperCase()} · {issue.message}
                              </p>
                            ))}
                          </div>
                        )}
                        <details className="mt-4 rounded-lg border border-zinc-200">
                          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-zinc-700">
                            Create new revision
                          </summary>
                          <form
                            action={createFamilyTemplateRevisionAction}
                            className="space-y-3 border-t border-zinc-200 p-3"
                          >
                            <input
                              type="hidden"
                              name="familyId"
                              value={familyId}
                            />
                            <input
                              type="hidden"
                              name="templateId"
                              value={template._id}
                            />
                            <JsonField
                              name="intent"
                              label="Complete shared Intent"
                              value={json(
                                current?.intent ?? defaultIntent(family.name),
                              )}
                              rows={15}
                            />
                            <JsonField
                              name="inheritancePolicy"
                              label="Inheritance policy"
                              value={json(
                                current?.inheritancePolicy ?? DEFAULT_POLICY,
                              )}
                              rows={9}
                            />
                            <input
                              name="coverageNote"
                              placeholder="Coverage evidence note"
                              className="h-9 w-full rounded-md border border-zinc-300 px-3 text-sm"
                            />
                            <button className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">
                              Save template draft
                            </button>
                          </form>
                        </details>
                      </article>
                    );
                  })}
                  <details className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
                    <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-700">
                      <Plus className="h-4 w-4" /> New Family Template
                    </summary>
                    <form
                      action={createFamilyTemplateAction}
                      className="grid gap-3 border-t border-zinc-200 p-4 sm:grid-cols-2"
                    >
                      <input type="hidden" name="familyId" value={familyId} />
                      <input
                        required
                        name="name"
                        placeholder="Template name"
                        className="h-9 rounded-md border border-zinc-300 px-3 text-sm"
                      />
                      <input
                        required
                        name="key"
                        placeholder="stable_key"
                        className="h-9 rounded-md border border-zinc-300 px-3 font-mono text-sm"
                      />
                      <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white sm:col-span-2">
                        Create template identity
                      </button>
                    </form>
                  </details>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Boxes className="h-5 w-5 text-cyan-700" />
                    <h2 className="font-semibold text-zinc-950">
                      2. Product Groups
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    保存规格范围差异，Patch 始终基于一个锁定 Template revision。
                  </p>
                </div>
                <div className="space-y-4 p-5">
                  {workspace.groups.map(({ group, revisions, members }) => {
                    const current = revisions[0];
                    return (
                      <article
                        key={group._id}
                        className="rounded-xl border border-zinc-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-zinc-950">
                              {group.name}
                            </h3>
                            <p className="mt-1 text-xs text-zinc-500">
                              {group.description}
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${statusTone(group.status)}`}
                          >
                            {group.status}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                          <span>
                            {
                              members.filter(
                                (item) => item.status === "approved",
                              ).length
                            }{" "}
                            assigned
                          </span>
                          <span>{revisions.length} revisions</span>
                        </div>
                        {current && (
                          <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                            <span>
                              Revision {current.revision} · {current.status} ·{" "}
                              {current.intentPatch.length} patches
                            </span>
                            {current.status === "draft" && (
                              <form action={approveProductGroupRevisionAction}>
                                <input
                                  type="hidden"
                                  name="familyId"
                                  value={familyId}
                                />
                                <input
                                  type="hidden"
                                  name="revisionId"
                                  value={current._id}
                                />
                                <button className="flex items-center gap-1 font-semibold text-emerald-700">
                                  <LockKeyhole className="h-3.5 w-3.5" /> Review
                                  & lock
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                        <details className="mt-4 rounded-lg border border-zinc-200">
                          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-zinc-700">
                            Create new revision
                          </summary>
                          <form
                            action={createProductGroupRevisionAction}
                            className="space-y-3 border-t border-zinc-200 p-3"
                          >
                            <input
                              type="hidden"
                              name="familyId"
                              value={familyId}
                            />
                            <input
                              type="hidden"
                              name="groupId"
                              value={group._id}
                            />
                            <JsonField
                              name="membershipCriteria"
                              label="Membership criteria"
                              value={json(
                                current?.membershipCriteria ?? DEFAULT_CRITERIA,
                              )}
                              rows={7}
                            />
                            <JsonField
                              name="differentiators"
                              label="Differentiators"
                              value={json(
                                current?.differentiators ??
                                  DEFAULT_DIFFERENTIATORS,
                              )}
                              rows={8}
                            />
                            <JsonField
                              name="intentPatch"
                              label="Intent patch operations"
                              value={json(current?.intentPatch ?? [])}
                              rows={9}
                            />
                            <JsonField
                              name="requiredEvidencePaths"
                              label="Required evidence paths"
                              value={json(
                                current?.requiredEvidencePaths ?? [
                                  "attributes.series",
                                ],
                              )}
                              rows={3}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                name="sampleMinimumCount"
                                type="number"
                                min="0"
                                defaultValue="2"
                                className="h-9 rounded-md border border-zinc-300 px-3 text-sm"
                              />
                              <input
                                name="samplePercentage"
                                type="number"
                                min="0"
                                max="100"
                                defaultValue="10"
                                className="h-9 rounded-md border border-zinc-300 px-3 text-sm"
                              />
                            </div>
                            <button className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">
                              Save group draft
                            </button>
                          </form>
                        </details>
                      </article>
                    );
                  })}
                  <details className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
                    <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-700">
                      <Plus className="h-4 w-4" /> New Product Group
                    </summary>
                    {activeTemplates.length ? (
                      <form
                        action={createProductGroupAction}
                        className="space-y-3 border-t border-zinc-200 p-4"
                      >
                        <input type="hidden" name="familyId" value={familyId} />
                        <select
                          name="templateId"
                          className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
                        >
                          {activeTemplates.map(({ template }) => (
                            <option key={template._id} value={template._id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            required
                            name="name"
                            placeholder="Group name"
                            className="h-9 rounded-md border border-zinc-300 px-3 text-sm"
                          />
                          <input
                            required
                            name="key"
                            placeholder="stable_group_key"
                            className="h-9 rounded-md border border-zinc-300 px-3 font-mono text-sm"
                          />
                        </div>
                        <textarea
                          required
                          name="description"
                          placeholder="What makes this specification group distinct?"
                          rows={3}
                          className="w-full rounded-md border border-zinc-300 p-3 text-sm"
                        />
                        <button className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">
                          Create group identity
                        </button>
                      </form>
                    ) : (
                      <p className="border-t border-zinc-200 p-4 text-sm text-amber-700">
                        先锁定一个 Family Template revision。
                      </p>
                    )}
                  </details>
                </div>
              </section>
            </div>

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileDiff className="h-5 w-5 text-cyan-700" />
                    <h2 className="font-semibold text-zinc-950">
                      3. Product assignment & Page Delta
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    产品先人工归组；只有真正不同的页面才创建
                    Delta。源快照在提交时自动捕获。
                  </p>
                </div>
                <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-600">
                  {workspace.products.length} products
                </span>
              </div>
              <div className="divide-y divide-zinc-200">
                {workspace.products.map((row) => {
                  const assignedGroup = row.member?.groupId
                    ? groupById.get(String(row.member.groupId))
                    : undefined;
                  const canMaterialize = Boolean(
                    row.member?.groupRevisionId &&
                    (!row.delta || row.deltaRevision?.status === "approved"),
                  );
                  const promotedRevision = row.analysisRun?.selectedResultId
                    ? workspace.templates
                        .flatMap(({ template, revisions }) =>
                          revisions.map((revision) => ({ template, revision })),
                        )
                        .find(
                          ({ revision }) =>
                            revision.generationProvenance?.resultId ===
                            row.analysisRun?.selectedResultId,
                        )
                    : undefined;
                  return (
                    <details key={row.product._id} className="group">
                      <summary className="grid cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-zinc-50 md:grid-cols-[minmax(0,1fr)_180px_150px_24px]">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-zinc-950">
                            {row.product.title}
                          </p>
                          <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                            {row.product.model} · {row.product.skuCode}
                          </p>
                        </div>
                        <div className="text-xs">
                          <p className="font-semibold text-zinc-700">
                            {assignedGroup?.group.name ?? "Unassigned"}
                          </p>
                          <p className="mt-1 text-zinc-400">
                            {row.member?.status ?? "Needs group"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            ok={row.deltaRevision?.status === "approved"}
                            label={
                              row.delta
                                ? `Delta ${row.deltaRevision?.status ?? "draft"}`
                                : "Inherited"
                            }
                          />
                          <Badge
                            ok={row.canonicalRevision?.status === "approved"}
                            label={
                              row.canonicalRevision?.status === "approved"
                                ? `Canonical r${row.canonicalRevision.revision}`
                                : "Not materialized"
                            }
                          />
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="grid gap-5 border-t border-zinc-200 bg-zinc-50/70 px-5 py-5 lg:grid-cols-3">
                        <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 lg:col-span-3">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-2xl">
                              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-900">
                                <BrainCircuit className="h-4 w-4" /> L2 general
                                intent analysis draft
                              </h3>
                              <p className="mt-2 text-sm leading-5 text-cyan-900/70">
                                选择兼容的 Intent Analysis Draft preset 分析
                                Source Snapshot
                                和当前已审核层级。结果只作为候选，不会自动创建或锁定
                                Template、Group、Delta。
                              </p>
                            </div>
                            {row.analysisRun ? (
                              <div className="flex items-center gap-3">
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${row.analysisRun.status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : row.analysisRun.status === "failed" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-cyan-200 bg-white text-cyan-800"}`}
                                >
                                  {row.analysisRun.status} ·{" "}
                                  {row.analysisRun.validResultCount}/
                                  {row.analysisRun.resultCount} valid
                                </span>
                                <Link
                                  href={`/admin/prompt-lab?run=${row.analysisRun._id}`}
                                  className="text-xs font-bold text-cyan-800"
                                >
                                  Review run →
                                </Link>
                              </div>
                            ) : null}
                          </div>
                          {analysisRoutes.length ? (
                            <form
                              action={startL2IntentAnalysisAction}
                              className="mt-4 flex flex-wrap gap-3"
                            >
                              <input
                                type="hidden"
                                name="familyId"
                                value={familyId}
                              />
                              <input
                                type="hidden"
                                name="productId"
                                value={row.product._id}
                              />
                              <select
                                aria-label="Intent analysis route"
                                name="analysisRoute"
                                className="h-9 min-w-[360px] flex-1 rounded-md border border-cyan-300 bg-white px-3 text-sm"
                              >
                                {analysisRoutes.map((route) => (
                                  <option key={route.key} value={route.key}>
                                    {route.label}
                                  </option>
                                ))}
                              </select>
                              <button className="flex h-9 items-center justify-center gap-2 rounded-md bg-cyan-900 px-4 text-sm font-semibold text-white">
                                <BrainCircuit className="h-4 w-4" />{" "}
                                {row.analysisRun
                                  ? "Run new analysis"
                                  : "Start analysis"}
                              </button>
                            </form>
                          ) : (
                            <p className="mt-4 text-xs font-semibold text-amber-800">
                              没有兼容的 L2 Intent Analysis Draft
                              preset、provider 或 model。
                            </p>
                          )}
                          {row.analysisRun?.selectedResultId ? (
                            promotedRevision ? (
                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                                <span className="font-semibold">
                                  Promoted to {promotedRevision.template.name} ·
                                  Revision {promotedRevision.revision.revision}
                                </span>
                                <span className="uppercase">
                                  {promotedRevision.revision.status}
                                </span>
                              </div>
                            ) : workspace.templates.length ? (
                              <form
                                action={
                                  promoteSelectedResultToFamilyTemplateAction
                                }
                                className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
                              >
                                <input
                                  type="hidden"
                                  name="familyId"
                                  value={familyId}
                                />
                                <input
                                  type="hidden"
                                  name="runId"
                                  value={row.analysisRun._id}
                                />
                                <input
                                  type="hidden"
                                  name="resultId"
                                  value={row.analysisRun.selectedResultId}
                                />
                                <div className="min-w-[220px] flex-1">
                                  <p className="text-xs font-semibold text-amber-950">
                                    Promote selected result to Family draft
                                  </p>
                                  <p className="mt-1 text-[11px] text-amber-800">
                                    只创建可审核草稿；不会自动锁定。
                                  </p>
                                </div>
                                <select
                                  name="templateId"
                                  aria-label="Target Family Template"
                                  className="h-9 min-w-[240px] rounded-md border border-amber-300 bg-white px-3 text-sm"
                                >
                                  {workspace.templates.map(({ template }) => (
                                    <option
                                      key={template._id}
                                      value={template._id}
                                    >
                                      {template.name}
                                    </option>
                                  ))}
                                </select>
                                <button className="h-9 rounded-md bg-amber-900 px-4 text-sm font-semibold text-white">
                                  Promote to draft
                                </button>
                              </form>
                            ) : (
                              <p className="mt-3 text-xs font-semibold text-amber-800">
                                先创建一个 Family Template
                                identity，才能提升所选结果。
                              </p>
                            )
                          ) : row.analysisRun?.validResultCount ? (
                            <p className="mt-3 text-xs text-cyan-900/70">
                              先进入 Prompt Lab 选择一个有效结果，再提升为
                              Family Template 草稿。
                            </p>
                          ) : null}
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                            A · Assign group
                          </h3>
                          {activeGroups.length ? (
                            <form
                              action={assignProductToGroupAction}
                              className="mt-3 space-y-3"
                            >
                              <input
                                type="hidden"
                                name="familyId"
                                value={familyId}
                              />
                              <input
                                type="hidden"
                                name="productId"
                                value={row.product._id}
                              />
                              <select
                                name="groupId"
                                defaultValue={row.member?.groupId ?? ""}
                                className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm"
                              >
                                <option value="" disabled>
                                  Select approved group
                                </option>
                                {activeGroups.map(({ group }) => (
                                  <option key={group._id} value={group._id}>
                                    {group.name}
                                  </option>
                                ))}
                              </select>
                              <input
                                name="assignmentReason"
                                defaultValue="Manual specification review"
                                className="h-9 w-full rounded-md border border-zinc-300 px-3 text-sm"
                              />
                              <button className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800">
                                Assign & capture snapshot
                              </button>
                            </form>
                          ) : (
                            <p className="mt-3 text-sm text-amber-700">
                              先锁定 Product Group。
                            </p>
                          )}
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                            B · Optional page delta
                          </h3>
                          {row.member?.groupRevisionId ? (
                            <>
                              {row.deltaRevision?.status === "draft" && (
                                <form
                                  action={approveProductDeltaRevisionAction}
                                  className="mt-3"
                                >
                                  <input
                                    type="hidden"
                                    name="familyId"
                                    value={familyId}
                                  />
                                  <input
                                    type="hidden"
                                    name="revisionId"
                                    value={row.deltaRevision._id}
                                  />
                                  <button className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">
                                    <LockKeyhole className="h-4 w-4" /> Review &
                                    lock current delta
                                  </button>
                                </form>
                              )}
                              <details className="mt-3 rounded-lg border border-zinc-200">
                                <summary className="cursor-pointer px-3 py-2 text-xs font-semibold">
                                  {row.delta
                                    ? "Create replacement revision"
                                    : "Add page-specific delta"}
                                </summary>
                                <form
                                  action={createProductDeltaRevisionAction}
                                  className="space-y-3 border-t border-zinc-200 p-3"
                                >
                                  <input
                                    type="hidden"
                                    name="familyId"
                                    value={familyId}
                                  />
                                  <input
                                    type="hidden"
                                    name="productId"
                                    value={row.product._id}
                                  />
                                  <input
                                    type="hidden"
                                    name="groupRevisionId"
                                    value={row.member.groupRevisionId}
                                  />
                                  <JsonField
                                    name="patchOperations"
                                    label="Patch operations"
                                    value={json(
                                      row.deltaRevision?.patchOperations ?? [],
                                    )}
                                    rows={9}
                                  />
                                  <button className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold">
                                    Save delta draft
                                  </button>
                                </form>
                              </details>
                            </>
                          ) : (
                            <p className="mt-3 text-sm text-zinc-500">
                              归组后才能建立 Delta。
                            </p>
                          )}
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                            C · Full canonical
                          </h3>
                          <p className="mt-3 text-sm leading-5 text-zinc-500">
                            解析锁定的 Template、Group 和可选
                            Delta，生成页面级完整版本。
                          </p>
                          {canMaterialize ? (
                            <form
                              action={materializeProductIntentAction}
                              className="mt-4"
                            >
                              <input
                                type="hidden"
                                name="familyId"
                                value={familyId}
                              />
                              <input
                                type="hidden"
                                name="productId"
                                value={row.product._id}
                              />
                              <button className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                                <ShieldCheck className="h-4 w-4" />{" "}
                                {row.canonicalRevision
                                  ? "Re-materialize"
                                  : "Materialize & lock"}
                              </button>
                            </form>
                          ) : (
                            <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-700">
                              <RefreshCw className="h-3.5 w-3.5" /> Lock the
                              current Delta first
                            </p>
                          )}
                          {row.canonicalRevision?.status === "approved" && (
                            <Link
                              href={`/admin/intents/families-products?familyId=${familyId}&inspectProductId=${row.product._id}#resolved-canonical`}
                              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-cyan-600 hover:text-cyan-800"
                            >
                              <Eye className="h-4 w-4" /> View full canonical
                            </Link>
                          )}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function JsonField({
  name,
  label,
  value,
  rows,
}: {
  name: string;
  label: string;
  value: string;
  rows: number;
}) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
      {label}
      <textarea
        required
        spellCheck={false}
        name={name}
        defaultValue={value}
        rows={rows}
        className="mt-1.5 w-full rounded-md border border-zinc-300 bg-zinc-950 p-3 font-mono text-[11px] leading-5 text-zinc-100"
      />
    </label>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full border px-2 py-1 text-[10px] font-bold ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-zinc-50 text-zinc-500"}`}
    >
      {label}
    </span>
  );
}
