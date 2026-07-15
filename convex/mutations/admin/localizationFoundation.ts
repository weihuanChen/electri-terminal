import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import { mutation, type MutationCtx } from "../../_generated/server";
import { localizationEntityTypeValidator } from "../../lib/localization";
import {
  assertCanonicalIntentContract,
  buildSourceFieldHashes,
  canonicalIntentPayloadValidator,
  canonicalIntentStatusValidator,
  conceptBindingRoleValidator,
  conceptBindingSourceValidator,
  conceptBindingStatusValidator,
  conceptTermValidator,
  hashLocalizationFoundationValue,
  languageProfileStatusValidator,
  localizationPageClassValidator,
  normalizeFoundationKey,
  normalizeLocale,
  protectedSourceValueValidator,
} from "../../lib/localizationFoundation";

function requiredText(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label}_required`);
  return normalized;
}

function optionalText(value?: string) {
  const normalized = value?.trim();
  return normalized || undefined;
}

type SnapshotInput = {
  entityType: Doc<"localizationSourceSnapshots">["entityType"];
  sourceId: string;
  pageClass: Doc<"localizationSourceSnapshots">["pageClass"];
  schemaVersion: number;
  sourceUpdatedAt: number;
  sourcePayload: Record<string, unknown>;
  evidencePayload: Record<string, unknown>;
  protectedValues: Doc<"localizationSourceSnapshots">["protectedValues"];
  actor: string;
};

async function persistSourceSnapshot(ctx: MutationCtx, input: SnapshotInput) {
  const sourceFieldHashes = buildSourceFieldHashes(input.sourcePayload);
  const sourceContentHash = hashLocalizationFoundationValue({
    sourcePayload: input.sourcePayload,
    evidencePayload: input.evidencePayload,
    protectedValues: input.protectedValues,
  });
  const existing = await ctx.db
    .query("localizationSourceSnapshots")
    .withIndex("by_entity_hash", (q) =>
      q
        .eq("entityType", input.entityType)
        .eq("sourceId", input.sourceId)
        .eq("sourceContentHash", sourceContentHash),
    )
    .unique();
  if (existing) return existing._id;
  const snapshotId = await ctx.db.insert("localizationSourceSnapshots", {
    entityType: input.entityType,
    sourceId: input.sourceId,
    pageClass: input.pageClass,
    schemaVersion: input.schemaVersion,
    sourceUpdatedAt: input.sourceUpdatedAt,
    sourceContentHash,
    sourceFieldHashes,
    sourcePayload: input.sourcePayload,
    evidencePayload: input.evidencePayload,
    protectedValues: input.protectedValues,
    createdBy: input.actor,
    createdAt: Date.now(),
  });
  const canonicalIntent = await ctx.db
    .query("canonicalIntents")
    .withIndex("by_entity", (q) =>
      q.eq("entityType", input.entityType).eq("sourceId", input.sourceId),
    )
    .unique();
  if (canonicalIntent?.approvedRevisionId) {
    const approvedRevision = await ctx.db.get(
      canonicalIntent.approvedRevisionId,
    );
    const approvedSnapshot = approvedRevision
      ? await ctx.db.get(approvedRevision.sourceSnapshotId)
      : null;
    if (
      approvedRevision?.status === "approved" &&
      approvedSnapshot?.sourceContentHash !== sourceContentHash
    ) {
      const now = Date.now();
      await ctx.db.patch(approvedRevision._id, {
        status: "stale",
        updatedAt: now,
      });
      await ctx.db.patch(canonicalIntent._id, {
        approvedRevisionId: undefined,
        updatedAt: now,
      });
    }
  }
  return snapshotId;
}

async function getNextCanonicalIntentRevision(
  ctx: MutationCtx,
  parentId: Id<"canonicalIntents">,
) {
  const latest = await ctx.db
    .query("canonicalIntentRevisions")
    .withIndex("by_parent_revision", (q) => q.eq("canonicalIntentId", parentId))
    .order("desc")
    .first();
  return (latest?.revision ?? 0) + 1;
}

async function getNextLanguageProfileVersion(
  ctx: MutationCtx,
  parentId: Id<"languageProfiles">,
) {
  const latest = await ctx.db
    .query("languageProfileVersions")
    .withIndex("by_profile_version", (q) => q.eq("profileId", parentId))
    .order("desc")
    .first();
  return (latest?.version ?? 0) + 1;
}

export const captureLocalizationSourceSnapshot = mutation({
  args: {
    entityType: localizationEntityTypeValidator,
    sourceId: v.string(),
    pageClass: localizationPageClassValidator,
    schemaVersion: v.number(),
    sourceUpdatedAt: v.number(),
    sourcePayload: v.record(v.string(), v.any()),
    evidencePayload: v.record(v.string(), v.any()),
    protectedValues: v.array(protectedSourceValueValidator),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const sourceId = requiredText(args.sourceId, "source_id");
    const actor = requiredText(args.actor, "actor");
    if (args.schemaVersion < 1) throw new Error("invalid_schema_version");
    if (Object.keys(args.sourcePayload).length === 0) {
      throw new Error("source_payload_required");
    }
    return await persistSourceSnapshot(ctx, {
      entityType: args.entityType,
      sourceId,
      pageClass: args.pageClass,
      schemaVersion: args.schemaVersion,
      sourceUpdatedAt: args.sourceUpdatedAt,
      sourcePayload: args.sourcePayload,
      evidencePayload: args.evidencePayload,
      protectedValues: args.protectedValues,
      actor,
    });
  },
});

export const captureCatalogSourceSnapshot = mutation({
  args: {
    entityType: v.union(
      v.literal("category"),
      v.literal("family"),
      v.literal("product"),
    ),
    sourceId: v.string(),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = requiredText(args.actor, "actor");
    const rawSourceId = requiredText(args.sourceId, "source_id");

    if (args.entityType === "category") {
      const id = ctx.db.normalizeId("categories", rawSourceId);
      const category = id ? await ctx.db.get(id) : null;
      if (!category) throw new Error("category_not_found");
      const families = await ctx.db
        .query("productFamilies")
        .withIndex("by_categoryId", (q) => q.eq("categoryId", category._id))
        .collect();
      return await persistSourceSnapshot(ctx, {
        entityType: "category",
        sourceId: String(category._id),
        pageClass: "L2",
        schemaVersion: 1,
        sourceUpdatedAt: category.updatedAt,
        sourcePayload: {
          name: category.name,
          description: category.description,
          shortDescription: category.shortDescription,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          pageConfig: category.pageConfig,
        },
        evidencePayload: {
          level: category.level,
          path: category.path,
          parentId: category.parentId,
          templateKey: category.templateKey,
          familyIds: families.map((family) => String(family._id)),
        },
        protectedValues: [
          { value: category.path, kind: "url_path", fieldPath: "path" },
        ],
        actor,
      });
    }

    if (args.entityType === "family") {
      const id = ctx.db.normalizeId("productFamilies", rawSourceId);
      const family = id ? await ctx.db.get(id) : null;
      if (!family) throw new Error("product_family_not_found");
      const [category, products] = await Promise.all([
        ctx.db.get(family.categoryId),
        ctx.db
          .query("products")
          .withIndex("by_familyId", (q) => q.eq("familyId", family._id))
          .collect(),
      ]);
      return await persistSourceSnapshot(ctx, {
        entityType: "family",
        sourceId: String(family._id),
        pageClass: "L2",
        schemaVersion: 1,
        sourceUpdatedAt: family.updatedAt,
        sourcePayload: {
          name: family.name,
          summary: family.summary,
          content: family.content,
          highlights: family.highlights,
          seoTitle: family.seoTitle,
          seoDescription: family.seoDescription,
          pageConfig: family.pageConfig,
        },
        evidencePayload: {
          brand: family.brand,
          attributes: family.attributes,
          category: category
            ? {
                id: String(category._id),
                name: category.name,
                path: category.path,
              }
            : null,
          products: products.map((product) => ({
            id: String(product._id),
            skuCode: product.skuCode,
            model: product.model,
            title: product.title,
            attributes: product.attributes,
          })),
        },
        protectedValues: products.flatMap((product) => [
          {
            value: product.skuCode,
            kind: "sku",
            fieldPath: "products[*].skuCode",
          },
          {
            value: product.model,
            kind: "model",
            fieldPath: "products[*].model",
          },
        ]),
        actor,
      });
    }

    const id = ctx.db.normalizeId("products", rawSourceId);
    const product = id ? await ctx.db.get(id) : null;
    if (!product) throw new Error("product_not_found");
    const [family, category, variants] = await Promise.all([
      ctx.db.get(product.familyId),
      ctx.db.get(product.categoryId),
      ctx.db
        .query("productVariants")
        .withIndex("by_productId", (q) => q.eq("productId", product._id))
        .collect(),
    ]);
    return await persistSourceSnapshot(ctx, {
      entityType: "product",
      sourceId: String(product._id),
      pageClass: "L2",
      schemaVersion: 1,
      sourceUpdatedAt: product.updatedAt,
      sourcePayload: {
        title: product.title,
        shortTitle: product.shortTitle,
        summary: product.summary,
        content: product.content,
        featureBullets: product.featureBullets,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        searchKeywords: product.searchKeywords,
      },
      evidencePayload: {
        skuCode: product.skuCode,
        model: product.model,
        normalizedModel: product.normalizedModel,
        productKey: product.productKey,
        seriesCode: product.seriesCode,
        brand: product.brand,
        attributes: product.attributes,
        family: family ? { id: String(family._id), name: family.name } : null,
        category: category
          ? { id: String(category._id), name: category.name }
          : null,
        variants: variants.map((variant) => ({
          skuCode: variant.skuCode,
          itemNo: variant.itemNo,
          attributes: variant.attributes,
        })),
      },
      protectedValues: [
        { value: product.skuCode, kind: "sku", fieldPath: "skuCode" },
        { value: product.model, kind: "model", fieldPath: "model" },
        ...variants.flatMap((variant) => [
          {
            value: variant.skuCode,
            kind: "sku",
            fieldPath: "variants[*].skuCode",
          },
          {
            value: variant.itemNo,
            kind: "item_number",
            fieldPath: "variants[*].itemNo",
          },
        ]),
      ],
      actor,
    });
  },
});

export const createCanonicalIntentRevision = mutation({
  args: {
    sourceSnapshotId: v.id("localizationSourceSnapshots"),
    intent: canonicalIntentPayloadValidator,
    actor: v.string(),
    generationProvenance: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.sourceSnapshotId);
    if (!snapshot) throw new Error("source_snapshot_not_found");
    assertCanonicalIntentContract(args.intent);
    const actor = requiredText(args.actor, "actor");
    let identity = await ctx.db
      .query("canonicalIntents")
      .withIndex("by_entity", (q) =>
        q
          .eq("entityType", snapshot.entityType)
          .eq("sourceId", snapshot.sourceId),
      )
      .unique();
    const now = Date.now();
    if (!identity) {
      const identityId = await ctx.db.insert("canonicalIntents", {
        entityType: snapshot.entityType,
        sourceId: snapshot.sourceId,
        createdAt: now,
        updatedAt: now,
      });
      identity = await ctx.db.get(identityId);
    }
    if (!identity) throw new Error("canonical_intent_identity_creation_failed");
    const revision = await getNextCanonicalIntentRevision(ctx, identity._id);
    const revisionId = await ctx.db.insert("canonicalIntentRevisions", {
      canonicalIntentId: identity._id,
      revision,
      sourceSnapshotId: snapshot._id,
      schemaVersion: args.intent.schemaVersion,
      status: "draft",
      intent: args.intent,
      generationProvenance: args.generationProvenance,
      validationIssues: [],
      createdBy: actor,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(identity._id, {
      currentRevisionId: revisionId,
      updatedAt: now,
    });
    return revisionId;
  },
});

export const moveCanonicalIntentRevisionStatus = mutation({
  args: {
    revisionId: v.id("canonicalIntentRevisions"),
    status: canonicalIntentStatusValidator,
    actor: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const revision = await ctx.db.get(args.revisionId);
    if (!revision) throw new Error("canonical_intent_revision_not_found");
    const identity = await ctx.db.get(revision.canonicalIntentId);
    if (!identity) throw new Error("canonical_intent_not_found");
    const allowed: Record<Doc<"canonicalIntentRevisions">["status"], string[]> =
      {
        draft: ["review_required"],
        review_required: ["draft", "approved"],
        approved: ["stale", "superseded"],
        stale: ["draft", "superseded"],
        superseded: [],
      };
    if (!allowed[revision.status].includes(args.status)) {
      throw new Error(
        `canonical_intent_transition_not_allowed:${revision.status}_to_${args.status}`,
      );
    }
    const now = Date.now();
    const actor = requiredText(args.actor, "actor");
    if (args.status === "approved") {
      if (
        revision.validationIssues.some(
          (issue) => issue.severity === "blocker" && !issue.resolvedAt,
        )
      ) {
        throw new Error("canonical_intent_has_unresolved_blockers");
      }
      if (
        identity.approvedRevisionId &&
        identity.approvedRevisionId !== revision._id
      ) {
        await ctx.db.patch(identity.approvedRevisionId, {
          status: "superseded",
          updatedAt: now,
        });
      }
      await ctx.db.patch(identity._id, {
        approvedRevisionId: revision._id,
        currentRevisionId: revision._id,
        updatedAt: now,
      });
    }
    await ctx.db.patch(revision._id, {
      status: args.status,
      reviewedBy: args.status === "approved" ? actor : revision.reviewedBy,
      reviewedAt: args.status === "approved" ? now : revision.reviewedAt,
      reviewNote: optionalText(args.note) ?? revision.reviewNote,
      updatedAt: now,
    });
    return revision._id;
  },
});

export const createLanguageProfileVersion = mutation({
  args: {
    locale: v.string(),
    market: v.string(),
    schemaVersion: v.number(),
    hardRules: v.record(v.string(), v.any()),
    softRules: v.record(v.string(), v.any()),
    changeNote: v.optional(v.string()),
    owner: v.optional(v.string()),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const locale = normalizeLocale(args.locale);
    const market = normalizeFoundationKey(args.market, "market");
    const actor = requiredText(args.actor, "actor");
    const siteSettings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    const languageWorkflow = siteSettings?.languageWorkflows?.find(
      (workflow) => workflow.locale === locale,
    );
    if (!languageWorkflow) throw new Error("language_workflow_required");
    if (args.schemaVersion < 1) throw new Error("invalid_schema_version");
    if (Object.keys(args.hardRules).length === 0)
      throw new Error("hard_rules_required");
    if (Object.keys(args.softRules).length === 0)
      throw new Error("soft_rules_required");
    let profile = await ctx.db
      .query("languageProfiles")
      .withIndex("by_locale_market", (q) =>
        q.eq("locale", locale).eq("market", market),
      )
      .unique();
    const now = Date.now();
    if (!profile) {
      const profileId = await ctx.db.insert("languageProfiles", {
        locale,
        market,
        status: "draft",
        owner: optionalText(args.owner),
        createdAt: now,
        updatedAt: now,
      });
      profile = await ctx.db.get(profileId);
    }
    if (!profile) throw new Error("language_profile_creation_failed");
    const version = await getNextLanguageProfileVersion(ctx, profile._id);
    const versionId = await ctx.db.insert("languageProfileVersions", {
      profileId: profile._id,
      version,
      schemaVersion: args.schemaVersion,
      status: "draft",
      hardRules: args.hardRules,
      softRules: args.softRules,
      changeNote: optionalText(args.changeNote),
      createdBy: actor,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(profile._id, {
      currentVersionId: versionId,
      owner: optionalText(args.owner) ?? profile.owner,
      updatedAt: now,
    });
    return versionId;
  },
});

export const approveLanguageProfileVersion = mutation({
  args: { versionId: v.id("languageProfileVersions"), actor: v.string() },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.versionId);
    if (!version) throw new Error("language_profile_version_not_found");
    if (version.status !== "draft")
      throw new Error("language_profile_version_not_draft");
    const now = Date.now();
    await ctx.db.patch(version._id, {
      status: "approved",
      reviewedBy: requiredText(args.actor, "actor"),
      reviewedAt: now,
      updatedAt: now,
    });
    return version._id;
  },
});

export const activateLanguageProfileVersion = mutation({
  args: { versionId: v.id("languageProfileVersions"), actor: v.string() },
  handler: async (ctx, args) => {
    requiredText(args.actor, "actor");
    const version = await ctx.db.get(args.versionId);
    if (!version || version.status !== "approved") {
      throw new Error("approved_language_profile_version_required");
    }
    const profile = await ctx.db.get(version.profileId);
    if (!profile) throw new Error("language_profile_not_found");
    const now = Date.now();
    if (profile.activeVersionId && profile.activeVersionId !== version._id) {
      await ctx.db.patch(profile.activeVersionId, {
        status: "superseded",
        updatedAt: now,
      });
    }
    await ctx.db.patch(profile._id, {
      status: "active",
      activeVersionId: version._id,
      currentVersionId: version._id,
      updatedAt: now,
    });
    return profile._id;
  },
});

export const setLanguageProfileStatus = mutation({
  args: {
    profileId: v.id("languageProfiles"),
    status: languageProfileStatusValidator,
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("language_profile_not_found");
    if (args.status === "active" && !profile.activeVersionId) {
      throw new Error("active_language_profile_version_required");
    }
    await ctx.db.patch(profile._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return profile._id;
  },
});

export const createCanonicalConcept = mutation({
  args: {
    key: v.string(),
    kind: v.string(),
    parentId: v.optional(v.id("canonicalConcepts")),
    canonicalLabel: v.string(),
    definition: v.string(),
    distinguishingCriteria: v.array(v.string()),
    protected: v.boolean(),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const key = normalizeFoundationKey(args.key, "concept_key");
    if (
      await ctx.db
        .query("canonicalConcepts")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique()
    ) {
      throw new Error("canonical_concept_key_exists");
    }
    if (args.parentId && !(await ctx.db.get(args.parentId)))
      throw new Error("parent_concept_not_found");
    const now = Date.now();
    return await ctx.db.insert("canonicalConcepts", {
      key,
      kind: requiredText(args.kind, "concept_kind"),
      parentId: args.parentId,
      canonicalLabel: requiredText(args.canonicalLabel, "canonical_label"),
      definition: requiredText(args.definition, "definition"),
      distinguishingCriteria: args.distinguishingCriteria
        .map((item) => item.trim())
        .filter(Boolean),
      protected: args.protected,
      status: "draft",
      createdBy: requiredText(args.actor, "actor"),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDraftCanonicalConcept = mutation({
  args: {
    conceptId: v.id("canonicalConcepts"),
    kind: v.string(),
    parentId: v.optional(v.id("canonicalConcepts")),
    canonicalLabel: v.string(),
    definition: v.string(),
    distinguishingCriteria: v.array(v.string()),
    protected: v.boolean(),
  },
  handler: async (ctx, args) => {
    const concept = await ctx.db.get(args.conceptId);
    if (!concept) throw new Error("canonical_concept_not_found");
    if (concept.status !== "draft")
      throw new Error("only_draft_concept_is_editable");
    if (args.parentId === concept._id)
      throw new Error("concept_cannot_parent_itself");
    if (args.parentId && !(await ctx.db.get(args.parentId)))
      throw new Error("parent_concept_not_found");
    await ctx.db.patch(concept._id, {
      kind: requiredText(args.kind, "concept_kind"),
      parentId: args.parentId,
      canonicalLabel: requiredText(args.canonicalLabel, "canonical_label"),
      definition: requiredText(args.definition, "definition"),
      distinguishingCriteria: args.distinguishingCriteria
        .map((item) => item.trim())
        .filter(Boolean),
      protected: args.protected,
      updatedAt: Date.now(),
    });
    return concept._id;
  },
});

export const moveCanonicalConceptStatus = mutation({
  args: {
    conceptId: v.id("canonicalConcepts"),
    status: v.union(v.literal("approved"), v.literal("deprecated")),
    actor: v.string(),
    replacementId: v.optional(v.id("canonicalConcepts")),
  },
  handler: async (ctx, args) => {
    const concept = await ctx.db.get(args.conceptId);
    if (!concept) throw new Error("canonical_concept_not_found");
    if (args.status === "approved" && concept.status !== "draft") {
      throw new Error("canonical_concept_not_draft");
    }
    if (args.status === "deprecated" && concept.status !== "approved") {
      throw new Error("canonical_concept_not_approved");
    }
    if (args.replacementId === concept._id)
      throw new Error("concept_cannot_replace_itself");
    const now = Date.now();
    await ctx.db.patch(concept._id, {
      status: args.status,
      replacementId:
        args.status === "deprecated" ? args.replacementId : undefined,
      reviewedBy: requiredText(args.actor, "actor"),
      reviewedAt: now,
      updatedAt: now,
    });
    return concept._id;
  },
});

export const createConceptLocaleRuleVersion = mutation({
  args: {
    conceptId: v.id("canonicalConcepts"),
    locale: v.string(),
    market: v.string(),
    terms: v.array(conceptTermValidator),
    avoidTerms: v.array(v.string()),
    transliterationPolicy: v.optional(v.string()),
    grammaticalNotes: v.optional(v.string()),
    examples: v.array(v.string()),
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const concept = await ctx.db.get(args.conceptId);
    if (!concept || concept.status !== "approved") {
      throw new Error("approved_canonical_concept_required");
    }
    if (!args.terms.some((term) => term.role === "primary")) {
      throw new Error("primary_concept_term_required");
    }
    const locale = normalizeLocale(args.locale);
    const market = normalizeFoundationKey(args.market, "market");
    const previous = await ctx.db
      .query("conceptLocaleRules")
      .withIndex("by_concept_locale_market", (q) =>
        q
          .eq("conceptId", args.conceptId)
          .eq("locale", locale)
          .eq("market", market),
      )
      .collect();
    const version =
      previous.reduce((max, item) => Math.max(max, item.version), 0) + 1;
    const now = Date.now();
    return await ctx.db.insert("conceptLocaleRules", {
      conceptId: concept._id,
      locale,
      market,
      version,
      status: "draft",
      terms: args.terms,
      avoidTerms: args.avoidTerms.map((item) => item.trim()).filter(Boolean),
      transliterationPolicy: optionalText(args.transliterationPolicy),
      grammaticalNotes: optionalText(args.grammaticalNotes),
      examples: args.examples.map((item) => item.trim()).filter(Boolean),
      createdBy: requiredText(args.actor, "actor"),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const approveConceptLocaleRule = mutation({
  args: { ruleId: v.id("conceptLocaleRules"), actor: v.string() },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    if (!rule || rule.status !== "draft")
      throw new Error("draft_concept_locale_rule_required");
    const siblings = await ctx.db
      .query("conceptLocaleRules")
      .withIndex("by_concept_locale_market", (q) =>
        q
          .eq("conceptId", rule.conceptId)
          .eq("locale", rule.locale)
          .eq("market", rule.market),
      )
      .collect();
    const now = Date.now();
    for (const sibling of siblings) {
      if (sibling.status === "approved") {
        await ctx.db.patch(sibling._id, {
          status: "superseded",
          updatedAt: now,
        });
      }
    }
    await ctx.db.patch(rule._id, {
      status: "approved",
      reviewedBy: requiredText(args.actor, "actor"),
      reviewedAt: now,
      updatedAt: now,
    });
    return rule._id;
  },
});

export const upsertEntityConceptBinding = mutation({
  args: {
    entityType: localizationEntityTypeValidator,
    sourceId: v.string(),
    conceptId: v.id("canonicalConcepts"),
    role: conceptBindingRoleValidator,
    fieldPaths: v.array(v.string()),
    contextTags: v.array(v.string()),
    source: conceptBindingSourceValidator,
    actor: v.string(),
  },
  handler: async (ctx, args) => {
    const sourceId = requiredText(args.sourceId, "source_id");
    const concept = await ctx.db.get(args.conceptId);
    if (!concept || concept.status !== "approved") {
      throw new Error("approved_canonical_concept_required");
    }
    const existing = await ctx.db
      .query("entityConceptBindings")
      .withIndex("by_entity_concept_role", (q) =>
        q
          .eq("entityType", args.entityType)
          .eq("sourceId", sourceId)
          .eq("conceptId", args.conceptId)
          .eq("role", args.role),
      )
      .unique();
    const now = Date.now();
    const status: Doc<"entityConceptBindings">["status"] =
      args.source === "llm_suggested" ? "proposed" : "approved";
    if (existing) {
      await ctx.db.patch(existing._id, {
        fieldPaths: args.fieldPaths,
        contextTags: args.contextTags,
        source: args.source,
        status,
        reviewedBy:
          status === "approved" ? requiredText(args.actor, "actor") : undefined,
        reviewedAt: status === "approved" ? now : undefined,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("entityConceptBindings", {
      entityType: args.entityType,
      sourceId,
      conceptId: args.conceptId,
      role: args.role,
      fieldPaths: args.fieldPaths,
      contextTags: args.contextTags,
      source: args.source,
      status,
      createdBy: requiredText(args.actor, "actor"),
      reviewedBy: status === "approved" ? args.actor.trim() : undefined,
      reviewedAt: status === "approved" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const reviewEntityConceptBinding = mutation({
  args: {
    bindingId: v.id("entityConceptBindings"),
    status: conceptBindingStatusValidator,
    actor: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const binding = await ctx.db.get(args.bindingId);
    if (!binding) throw new Error("entity_concept_binding_not_found");
    if (binding.status !== "proposed" || args.status === "proposed") {
      throw new Error("only_proposed_binding_can_be_reviewed");
    }
    const now = Date.now();
    await ctx.db.patch(binding._id, {
      status: args.status,
      reviewedBy: requiredText(args.actor, "actor"),
      reviewedAt: now,
      reviewNote: optionalText(args.note),
      updatedAt: now,
    });
    return binding._id;
  },
});
