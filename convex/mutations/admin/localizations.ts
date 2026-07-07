import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  localizationEditableFieldValidators,
  localizationIdentityValidator,
  localizationStatusValidator,
} from "../../lib/localization";
import { withCreatedAt, withUpdatedAt } from "../../lib/validators";

type LocalizationStatus = Doc<"localizations">["status"];
type LocalizationPatch = Partial<Doc<"localizations">>;
type LocalizationEditableInput = {
  localizedSlug?: string;
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  localizedFields?: Record<string, unknown>;
  sourceUpdatedAt?: number;
  sourceContentHash?: string;
  sourceFieldHashes?: Record<string, string>;
  localizedContentHash?: string;
  localizedFieldHashes?: Record<string, string>;
  fieldAudits?: Doc<"localizations">["fieldAudits"];
  requiredFieldKeys?: string[];
  protectedFieldKeys?: string[];
  translationMethod?: Doc<"localizations">["translationMethod"];
  translatedBy?: string;
  generatedBy?: string;
  owner?: string;
  reviewRequired?: boolean;
  requiredForRelease?: boolean;
  reviewNotes?: string;
  workflowNotes?: string;
  validationIssues?: Doc<"localizations">["validationIssues"];
};

const DRAFT_EDITABLE_STATUSES = new Set<LocalizationStatus>([
  "draft",
  "machine_ready",
  "review_required",
  "approved",
  "stale",
]);

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeIdentity(args: {
  entityType: Doc<"localizations">["entityType"];
  sourceId: string;
  locale: string;
}) {
  return {
    entityType: args.entityType,
    sourceId: args.sourceId.trim(),
    locale: args.locale.trim(),
  };
}

function hasTranslatableContent(args: {
  localizedSlug?: string;
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  localizedFields?: Record<string, unknown>;
}) {
  return Boolean(
    normalizeOptionalText(args.localizedSlug) ||
      normalizeOptionalText(args.title) ||
      normalizeOptionalText(args.seoTitle) ||
      normalizeOptionalText(args.seoDescription) ||
      (args.localizedFields && Object.keys(args.localizedFields).length > 0)
  );
}

function buildContentPatch(args: LocalizationEditableInput) {
  const patch: LocalizationPatch = {};

  if ("localizedSlug" in args) patch.localizedSlug = normalizeOptionalText(args.localizedSlug);
  if ("title" in args) patch.title = normalizeOptionalText(args.title);
  if ("seoTitle" in args) patch.seoTitle = normalizeOptionalText(args.seoTitle);
  if ("seoDescription" in args) {
    patch.seoDescription = normalizeOptionalText(args.seoDescription);
  }
  if (args.localizedFields !== undefined) patch.localizedFields = args.localizedFields;
  if (args.sourceUpdatedAt !== undefined) patch.sourceUpdatedAt = args.sourceUpdatedAt;
  if (args.sourceContentHash !== undefined) {
    patch.sourceContentHash = normalizeOptionalText(args.sourceContentHash);
  }
  if (args.sourceFieldHashes !== undefined) patch.sourceFieldHashes = args.sourceFieldHashes;
  if (args.localizedContentHash !== undefined) {
    patch.localizedContentHash = normalizeOptionalText(args.localizedContentHash);
  }
  if (args.localizedFieldHashes !== undefined) {
    patch.localizedFieldHashes = args.localizedFieldHashes;
  }
  if (args.fieldAudits !== undefined) patch.fieldAudits = args.fieldAudits;
  if (args.requiredFieldKeys !== undefined) patch.requiredFieldKeys = args.requiredFieldKeys;
  if (args.protectedFieldKeys !== undefined) patch.protectedFieldKeys = args.protectedFieldKeys;
  if (args.translationMethod !== undefined) patch.translationMethod = args.translationMethod;
  if ("translatedBy" in args) patch.translatedBy = normalizeOptionalText(args.translatedBy);
  if ("generatedBy" in args) patch.generatedBy = normalizeOptionalText(args.generatedBy);
  if ("owner" in args) patch.owner = normalizeOptionalText(args.owner);
  if (args.reviewRequired !== undefined) patch.reviewRequired = args.reviewRequired;
  if (args.requiredForRelease !== undefined) {
    patch.requiredForRelease = args.requiredForRelease;
  }
  if ("reviewNotes" in args) patch.reviewNotes = normalizeOptionalText(args.reviewNotes);
  if ("workflowNotes" in args) patch.workflowNotes = normalizeOptionalText(args.workflowNotes);
  if (args.validationIssues !== undefined) patch.validationIssues = args.validationIssues;

  return patch;
}

function assertEditable(current: Doc<"localizations">) {
  if (!DRAFT_EDITABLE_STATUSES.has(current.status)) {
    throw new Error(`localization_status_not_editable:${current.status}`);
  }
}

function assertTransition(
  current: Doc<"localizations">,
  allowedStatuses: LocalizationStatus[],
  nextStatus: LocalizationStatus
) {
  if (!allowedStatuses.includes(current.status)) {
    throw new Error(`localization_transition_not_allowed:${current.status}_to_${nextStatus}`);
  }
}

async function getLocalizationByIdentity(
  ctx: MutationCtx,
  args: {
    entityType: Doc<"localizations">["entityType"];
    sourceId: string;
    locale: string;
  }
) {
  const identity = normalizeIdentity(args);

  return await ctx.db
    .query("localizations")
    .withIndex("by_entity_locale", (q) =>
      q
        .eq("entityType", identity.entityType)
        .eq("sourceId", identity.sourceId)
        .eq("locale", identity.locale)
    )
    .unique();
}

export const upsertLocalizationDraft = mutation({
  args: {
    ...localizationIdentityValidator,
    ...localizationEditableFieldValidators,
  },
  handler: async (ctx, args) => {
    const identity = normalizeIdentity(args);
    if (!identity.sourceId || !identity.locale) {
      throw new Error("localization_identity_required");
    }

    const existing = await getLocalizationByIdentity(ctx, identity);
    const patch = buildContentPatch(args);
    const translatedAt = hasTranslatableContent(args) ? Date.now() : existing?.translatedAt;

    if (existing) {
      assertEditable(existing);
      await ctx.db.patch(
        existing._id,
        withUpdatedAt({
          ...patch,
          status: "draft",
          translatedAt,
          staleReason: undefined,
          staleSourceUpdatedAt: undefined,
          changedFieldKeys: undefined,
        })
      );

      return existing._id;
    }

    return await ctx.db.insert(
      "localizations",
      withCreatedAt({
        ...identity,
        ...patch,
        status: "draft",
        translationMethod: args.translationMethod ?? "manual",
        reviewRequired: args.reviewRequired ?? true,
        requiredForRelease: args.requiredForRelease ?? false,
        translatedAt,
      })
    );
  },
});

export const updateLocalizationContent = mutation({
  args: {
    id: v.id("localizations"),
    ...localizationEditableFieldValidators,
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("localization_not_found");
    assertEditable(current);

    const patch = buildContentPatch(args);
    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...patch,
        translatedAt: hasTranslatableContent(args) ? Date.now() : current.translatedAt,
      })
    );

    return args.id;
  },
});

export const moveLocalizationStatus = mutation({
  args: {
    id: v.id("localizations"),
    status: localizationStatusValidator,
    actor: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("localization_not_found");

    const now = Date.now();
    const actor = normalizeOptionalText(args.actor);
    const note = normalizeOptionalText(args.note);

    switch (args.status) {
      case "draft":
        assertTransition(current, ["machine_ready", "review_required", "approved", "stale"], "draft");
        await ctx.db.patch(
          args.id,
          withUpdatedAt({
            status: "draft",
            workflowNotes: note ?? current.workflowNotes,
          })
        );
        break;
      case "machine_ready":
        assertTransition(current, ["draft", "stale"], "machine_ready");
        await ctx.db.patch(
          args.id,
          withUpdatedAt({
            status: "machine_ready",
            translationMethod: current.translationMethod ?? "llm",
            translatedAt: current.translatedAt ?? now,
            workflowNotes: note ?? current.workflowNotes,
          })
        );
        break;
      case "review_required":
        assertTransition(current, ["draft", "machine_ready", "stale"], "review_required");
        await ctx.db.patch(
          args.id,
          withUpdatedAt({
            status: "review_required",
            reviewRequired: true,
            workflowNotes: note ?? current.workflowNotes,
          })
        );
        break;
      case "approved":
        assertTransition(current, ["draft", "machine_ready", "review_required"], "approved");
        await ctx.db.patch(
          args.id,
          withUpdatedAt({
            status: "approved",
            reviewer: actor ?? current.reviewer,
            reviewedAt: now,
            reviewNotes: note ?? current.reviewNotes,
            reviewRequired: false,
          })
        );
        break;
      case "published":
        assertTransition(current, ["approved"], "published");
        await ctx.db.patch(
          args.id,
          withUpdatedAt({
            status: "published",
            publishedBy: actor ?? current.publishedBy,
            publishedAt: now,
            staleReason: undefined,
            staleSourceUpdatedAt: undefined,
            changedFieldKeys: undefined,
          })
        );
        break;
      case "stale":
        assertTransition(current, ["approved", "published"], "stale");
        await ctx.db.patch(
          args.id,
          withUpdatedAt({
            status: "stale",
            staleReason: note ?? "source_changed",
            staleSourceUpdatedAt: now,
          })
        );
        break;
      case "missing":
        throw new Error("missing_status_is_derived");
    }

    return args.id;
  },
});

export const unpublishLocalization = mutation({
  args: {
    id: v.id("localizations"),
    actor: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("localization_not_found");
    assertTransition(current, ["published"], "approved");

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        status: "approved",
        workflowNotes: normalizeOptionalText(args.note) ?? current.workflowNotes,
      })
    );

    return args.id;
  },
});

export const markEntityLocalizationsStale = mutation({
  args: {
    entityType: localizationIdentityValidator.entityType,
    sourceId: v.string(),
    staleReason: v.optional(v.string()),
    sourceUpdatedAt: v.optional(v.number()),
    sourceContentHash: v.optional(v.string()),
    changedFieldKeys: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const sourceId = args.sourceId.trim();
    if (!sourceId) throw new Error("source_id_required");

    const items = await ctx.db
      .query("localizations")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", args.entityType).eq("sourceId", sourceId)
      )
      .collect();
    const now = Date.now();
    let updatedCount = 0;

    for (const item of items) {
      if (item.status === "missing" || item.status === "draft") {
        continue;
      }

      await ctx.db.patch(
        item._id,
        withUpdatedAt({
          status: "stale",
          staleReason: normalizeOptionalText(args.staleReason) ?? "source_changed",
          staleSourceUpdatedAt: args.sourceUpdatedAt ?? now,
          sourceUpdatedAt: args.sourceUpdatedAt ?? item.sourceUpdatedAt,
          sourceContentHash:
            normalizeOptionalText(args.sourceContentHash) ?? item.sourceContentHash,
          changedFieldKeys: args.changedFieldKeys,
        })
      );
      updatedCount += 1;
    }

    return updatedCount;
  },
});

export const deleteLocalization = mutation({
  args: {
    id: v.id("localizations"),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("localization_not_found");
    if (current.status === "published") {
      throw new Error("published_localization_must_be_unpublished_first");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
