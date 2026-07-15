import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getIntentManagementInventory = query({
  args: {},
  handler: async (ctx) => {
    const [intents, snapshots, templates, groups, members, deltas] =
      await Promise.all([
        ctx.db.query("canonicalIntents").collect(),
        ctx.db.query("localizationSourceSnapshots").collect(),
        ctx.db.query("familyIntentTemplates").collect(),
        ctx.db.query("productIntentGroups").collect(),
        ctx.db.query("productIntentGroupMembers").collect(),
        ctx.db.query("pageIntentDeltas").collect(),
      ]);
    const latestSnapshotByEntity = new Map<
      string,
      (typeof snapshots)[number]
    >();
    const snapshotCountByEntity = new Map<string, number>();
    for (const snapshot of snapshots) {
      const key = `${snapshot.entityType}:${snapshot.sourceId}`;
      snapshotCountByEntity.set(key, (snapshotCountByEntity.get(key) ?? 0) + 1);
      const current = latestSnapshotByEntity.get(key);
      if (!current || current.createdAt < snapshot.createdAt) {
        latestSnapshotByEntity.set(key, snapshot);
      }
    }
    const states: Array<{
      entityType: (typeof snapshots)[number]["entityType"];
      sourceId: string;
      canonicalIntentId?: string;
      currentRevisionId?: string;
      currentRevisionNumber?: number;
      currentRevisionStatus?: (typeof intents)[number] extends never
        ? never
        : "draft" | "review_required" | "approved" | "superseded" | "stale";
      approvedRevisionId?: string;
      approvedRevisionNumber?: number;
      latestSnapshotId?: string;
      latestSnapshotCreatedAt?: number;
      latestSnapshotHash?: string;
      snapshotCount: number;
    }> = await Promise.all(
      intents.map(async (intent) => {
        const key = `${intent.entityType}:${intent.sourceId}`;
        const [currentRevision, approvedRevision] = await Promise.all([
          intent.currentRevisionId ? ctx.db.get(intent.currentRevisionId) : null,
          intent.approvedRevisionId ? ctx.db.get(intent.approvedRevisionId) : null,
        ]);
        const snapshot = latestSnapshotByEntity.get(key);
        return {
          entityType: intent.entityType,
          sourceId: intent.sourceId,
          canonicalIntentId: intent._id,
          currentRevisionId: intent.currentRevisionId,
          currentRevisionNumber: currentRevision?.revision,
          currentRevisionStatus: currentRevision?.status,
          approvedRevisionId: intent.approvedRevisionId,
          approvedRevisionNumber: approvedRevision?.revision,
          latestSnapshotId: snapshot?._id,
          latestSnapshotCreatedAt: snapshot?.createdAt,
          latestSnapshotHash: snapshot?.sourceContentHash,
          snapshotCount: snapshotCountByEntity.get(key) ?? 0,
        };
      }),
    );
    for (const [key, snapshot] of latestSnapshotByEntity) {
      if (states.some((state) => `${state.entityType}:${state.sourceId}` === key)) {
        continue;
      }
      states.push({
        entityType: snapshot.entityType,
        sourceId: snapshot.sourceId,
        canonicalIntentId: undefined,
        currentRevisionId: undefined,
        currentRevisionNumber: undefined,
        currentRevisionStatus: undefined,
        approvedRevisionId: undefined,
        approvedRevisionNumber: undefined,
        latestSnapshotId: snapshot._id,
        latestSnapshotCreatedAt: snapshot.createdAt,
        latestSnapshotHash: snapshot.sourceContentHash,
        snapshotCount: snapshotCountByEntity.get(key) ?? 0,
      });
    }
    const entityTypes = [
      "staticPage",
      "category",
      "family",
      "product",
      "article",
    ] as const;
    const coverage = Object.fromEntries(
      entityTypes.map((entityType) => {
        const items = states.filter((state) => state.entityType === entityType);
        return [
          entityType,
          {
            tracked: items.length,
            withSnapshot: items.filter((item) => item.latestSnapshotId).length,
            withDraft: items.filter((item) => item.currentRevisionId).length,
            approved: items.filter((item) => item.approvedRevisionId).length,
            stale: items.filter((item) => item.currentRevisionStatus === "stale")
              .length,
          },
        ];
      }),
    );
    return {
      states,
      coverage,
      hierarchy: {
        templates: templates.length,
        approvedTemplates: templates.filter((item) => item.approvedRevisionId)
          .length,
        groups: groups.length,
        approvedGroups: groups.filter((item) => item.approvedRevisionId).length,
        approvedMembers: members.filter((item) => item.status === "approved")
          .length,
        deltas: deltas.length,
        approvedDeltas: deltas.filter((item) => item.approvedRevisionId).length,
      },
    };
  },
});

export const getIntentHierarchyWorkspace = query({
  args: { familyId: v.optional(v.id("productFamilies")) },
  handler: async (ctx, args) => {
    const familyDocs = (await ctx.db.query("productFamilies").collect()).sort(
      (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
    );
    const families = familyDocs.map(({ _id, name, sortOrder, status }) => ({
      _id,
      name,
      sortOrder,
      status,
    }));
    const familyId = args.familyId ?? familyDocs[0]?._id;
    if (!familyId) {
      return {
        families: [],
        selectedFamily: null,
        products: [],
        templates: [],
        groups: [],
        deltas: [],
      };
    }
    const selectedFamilyDoc = familyDocs.find((item) => item._id === familyId) ?? null;
    const selectedFamily = selectedFamilyDoc
      ? {
          _id: selectedFamilyDoc._id,
          name: selectedFamilyDoc.name,
          summary: selectedFamilyDoc.summary,
          status: selectedFamilyDoc.status,
        }
      : null;
    if (!selectedFamily) throw new Error("product_family_not_found");

    const [products, templates, groups, snapshots] = await Promise.all([
      ctx.db.query("products").withIndex("by_familyId", (q) => q.eq("familyId", familyId)).collect(),
      ctx.db.query("familyIntentTemplates").withIndex("by_family", (q) => q.eq("familyId", familyId)).collect(),
      ctx.db.query("productIntentGroups").withIndex("by_family", (q) => q.eq("familyId", familyId)).collect(),
      ctx.db.query("localizationSourceSnapshots").collect(),
    ]);
    products.sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
    const productIds = new Set(products.map((item) => String(item._id)));
    const latestSnapshots = new Map<string, { _id: string; createdAt: number; sourceContentHash: string }>();
    for (const snapshot of snapshots) {
      if (snapshot.entityType !== "product" || !productIds.has(snapshot.sourceId)) continue;
      const current = latestSnapshots.get(snapshot.sourceId);
      if (!current || current.createdAt < snapshot.createdAt) {
        latestSnapshots.set(snapshot.sourceId, {
          _id: String(snapshot._id),
          createdAt: snapshot.createdAt,
          sourceContentHash: snapshot.sourceContentHash,
        });
      }
    }

    const templateBundles = await Promise.all(
      templates.map(async (template) => ({
        template,
        revisions: await ctx.db
          .query("familyIntentTemplateRevisions")
          .withIndex("by_template_revision", (q) => q.eq("templateId", template._id))
          .order("desc")
          .collect(),
      })),
    );
    const groupBundles = await Promise.all(
      groups.map(async (group) => ({
        group,
        revisions: await ctx.db
          .query("productIntentGroupRevisions")
          .withIndex("by_group_revision", (q) => q.eq("groupId", group._id))
          .order("desc")
          .collect(),
        members: await ctx.db
          .query("productIntentGroupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect(),
      })),
    );
    const productRows = await Promise.all(
      products.map(async (product) => {
        const [members, delta, canonical, latestAnalysisRun] = await Promise.all([
          ctx.db.query("productIntentGroupMembers").withIndex("by_product", (q) => q.eq("productId", product._id)).collect(),
          ctx.db.query("pageIntentDeltas").withIndex("by_entity", (q) => q.eq("entityType", "product").eq("sourceId", String(product._id))).unique(),
          ctx.db.query("canonicalIntents").withIndex("by_entity", (q) => q.eq("entityType", "product").eq("sourceId", String(product._id))).unique(),
          ctx.db
            .query("llmLabRuns")
            .withIndex("by_task_entity", (q) =>
              q
                .eq("taskSlot", "l2_page_intent_draft")
                .eq("contextEntityType", "product")
                .eq("contextSourceId", String(product._id)),
            )
            .order("desc")
            .first(),
        ]);
        const currentMember = members
          .filter((item) => ["approved", "auto_inherited", "quick_review", "manual_review"].includes(item.status))
          .sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null;
        const deltaRevision = delta?.currentRevisionId ? await ctx.db.get(delta.currentRevisionId) : null;
        const canonicalRevision = canonical?.approvedRevisionId ? await ctx.db.get(canonical.approvedRevisionId) : null;
        const analysisResults = latestAnalysisRun
          ? await ctx.db
              .query("llmLabResults")
              .withIndex("by_run", (q) => q.eq("runId", latestAnalysisRun._id))
              .collect()
          : [];
        return {
          product: {
            _id: product._id,
            title: product.title,
            model: product.model,
            skuCode: product.skuCode,
            status: product.status,
          },
          sourceSnapshot: latestSnapshots.get(String(product._id)) ?? null,
          member: currentMember,
          delta,
          deltaRevision,
          canonical,
          canonicalRevision,
          analysisRun: latestAnalysisRun
            ? {
                _id: latestAnalysisRun._id,
                status: latestAnalysisRun.status,
                presetVersionId: latestAnalysisRun.presetVersionId,
                selectedResultId: latestAnalysisRun.selectedResultId,
                createdAt: latestAnalysisRun.createdAt,
                completedAt: latestAnalysisRun.completedAt,
                resultCount: analysisResults.length,
                validResultCount: analysisResults.filter(
                  (result) => result.status === "completed" && result.schemaValid,
                ).length,
              }
            : null,
        };
      }),
    );

    return {
      families,
      selectedFamily,
      products: productRows,
      templates: templateBundles,
      groups: groupBundles,
      deltas: productRows.filter((item) => item.delta).map((item) => ({
        productId: item.product._id,
        delta: item.delta,
        revision: item.deltaRevision,
      })),
    };
  },
});

export const getResolvedProductCanonicalView = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("product_not_found");

    const canonical = await ctx.db
      .query("canonicalIntents")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "product").eq("sourceId", String(product._id)),
      )
      .unique();
    const canonicalRevision = canonical?.approvedRevisionId
      ? await ctx.db.get(canonical.approvedRevisionId)
      : null;

    if (!canonical || !canonicalRevision) {
      return {
        product: {
          _id: product._id,
          title: product.title,
          model: product.model,
          skuCode: product.skuCode,
        },
        canonical: null,
        canonicalRevision: null,
        productSnapshot: null,
        familyTemplate: null,
        familyTemplateRevision: null,
        familySnapshots: [],
        productGroup: null,
        productGroupRevision: null,
        pageDeltaRevision: null,
        deltaSnapshot: null,
      };
    }

    const provenance = canonicalRevision.generationProvenance;
    const templateRevisionId = provenance?.templateRevisionId
      ? ctx.db.normalizeId(
          "familyIntentTemplateRevisions",
          provenance.templateRevisionId,
        )
      : null;
    const groupRevisionId = provenance?.groupRevisionId
      ? ctx.db.normalizeId(
          "productIntentGroupRevisions",
          provenance.groupRevisionId,
        )
      : null;
    const deltaRevisionId = provenance?.deltaRevisionId
      ? ctx.db.normalizeId("pageIntentDeltaRevisions", provenance.deltaRevisionId)
      : null;

    const [
      productSnapshot,
      familyTemplateRevision,
      productGroupRevision,
      pageDeltaRevision,
    ] = await Promise.all([
      ctx.db.get(canonicalRevision.sourceSnapshotId),
      templateRevisionId ? ctx.db.get(templateRevisionId) : null,
      groupRevisionId ? ctx.db.get(groupRevisionId) : null,
      deltaRevisionId ? ctx.db.get(deltaRevisionId) : null,
    ]);

    const [familyTemplate, productGroup, deltaSnapshot, familySnapshots] =
      await Promise.all([
        familyTemplateRevision
          ? ctx.db.get(familyTemplateRevision.templateId)
          : null,
        productGroupRevision
          ? ctx.db.get(productGroupRevision.groupId)
          : null,
        pageDeltaRevision
          ? ctx.db.get(pageDeltaRevision.sourceSnapshotId)
          : null,
        familyTemplateRevision
          ? Promise.all(
              familyTemplateRevision.sourceSnapshotIds.map((snapshotId) =>
                ctx.db.get(snapshotId),
              ),
            ).then((snapshots) => snapshots.filter((snapshot) => snapshot !== null))
          : [],
      ]);

    return {
      product: {
        _id: product._id,
        title: product.title,
        model: product.model,
        skuCode: product.skuCode,
      },
      canonical,
      canonicalRevision,
      productSnapshot,
      familyTemplate,
      familyTemplateRevision,
      familySnapshots,
      productGroup,
      productGroupRevision,
      pageDeltaRevision,
      deltaSnapshot,
    };
  },
});

export const getL2IntentAnalysisInput = query({
  args: {
    productId: v.id("products"),
    sourceSnapshotId: v.id("localizationSourceSnapshots"),
  },
  handler: async (ctx, args) => {
    const [product, snapshot] = await Promise.all([
      ctx.db.get(args.productId),
      ctx.db.get(args.sourceSnapshotId),
    ]);
    if (!product) throw new Error("product_not_found");
    if (
      !snapshot ||
      snapshot.entityType !== "product" ||
      snapshot.sourceId !== String(product._id)
    ) {
      throw new Error("product_source_snapshot_mismatch");
    }
    const [family, templates, groups, productBindings, familyBindings] =
      await Promise.all([
        ctx.db.get(product.familyId),
        ctx.db
          .query("familyIntentTemplates")
          .withIndex("by_family", (q) => q.eq("familyId", product.familyId))
          .collect(),
        ctx.db
          .query("productIntentGroups")
          .withIndex("by_family", (q) => q.eq("familyId", product.familyId))
          .collect(),
        ctx.db
          .query("entityConceptBindings")
          .withIndex("by_entity", (q) =>
            q.eq("entityType", "product").eq("sourceId", String(product._id)),
          )
          .collect(),
        ctx.db
          .query("entityConceptBindings")
          .withIndex("by_entity", (q) =>
            q.eq("entityType", "family").eq("sourceId", String(product.familyId)),
          )
          .collect(),
      ]);
    if (!family) throw new Error("product_family_not_found");
    const approvedTemplates = await Promise.all(
      templates
        .filter((template) => template.approvedRevisionId)
        .map(async (template) => {
          const revision = template.approvedRevisionId
            ? await ctx.db.get(template.approvedRevisionId)
            : null;
          return revision?.status === "approved"
            ? {
                templateId: String(template._id),
                key: template.key,
                name: template.name,
                revisionId: String(revision._id),
                intent: revision.intent,
                inheritancePolicy: revision.inheritancePolicy,
              }
            : null;
        }),
    );
    const approvedGroups = await Promise.all(
      groups
        .filter((group) => group.approvedRevisionId)
        .map(async (group) => {
          const revision = group.approvedRevisionId
            ? await ctx.db.get(group.approvedRevisionId)
            : null;
          return revision?.status === "approved"
            ? {
                groupId: String(group._id),
                key: group.key,
                name: group.name,
                description: group.description,
                revisionId: String(revision._id),
                familyIntentTemplateRevisionId: String(
                  revision.familyIntentTemplateRevisionId,
                ),
                membershipCriteria: revision.membershipCriteria,
                differentiators: revision.differentiators,
                intentPatch: revision.intentPatch,
              }
            : null;
        }),
    );
    const bindings = [...productBindings, ...familyBindings].filter(
      (binding) => binding.status === "approved",
    );
    const terminology = await Promise.all(
      bindings.map(async (binding) => {
        const concept = await ctx.db.get(binding.conceptId);
        return concept?.status === "approved"
          ? {
              conceptId: String(concept._id),
              key: concept.key,
              canonicalLabel: concept.canonicalLabel,
              definition: concept.definition,
              role: binding.role,
              fieldPaths: binding.fieldPaths,
            }
          : null;
      }),
    );

    return {
      sourceSnapshot: {
        id: String(snapshot._id),
        sourceContentHash: snapshot.sourceContentHash,
        sourcePayload: snapshot.sourcePayload,
        evidencePayload: snapshot.evidencePayload,
        protectedValues: snapshot.protectedValues,
      },
      terminology: terminology.filter(Boolean),
      hierarchyContext: {
        family: {
          id: String(family._id),
          name: family.name,
          summary: family.summary,
        },
        approvedTemplates: approvedTemplates.filter(Boolean),
        approvedGroups: approvedGroups.filter(Boolean),
      },
    };
  },
});
