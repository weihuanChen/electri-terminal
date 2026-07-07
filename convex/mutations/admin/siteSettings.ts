import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import {
  DEFAULT_CONTACT_SETTINGS,
  type LanguageWorkflowSettings,
  contactSettingsValidator,
  languageWorkflowStatusValidator,
  normalizeContactSettings,
  normalizeLanguageWorkflowSettings,
  resolveLanguageWorkflowExposure,
  SITE_SETTINGS_GLOBAL_KEY,
} from "../../lib/siteSettings";
import { withCreatedAt, withUpdatedAt } from "../../lib/validators";

export const upsertGlobalContactSettings = mutation({
  args: {
    contact: contactSettingsValidator,
  },
  handler: async (ctx, args) => {
    const normalizedContact = normalizeContactSettings(args.contact);

    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", SITE_SETTINGS_GLOBAL_KEY))
      .unique();

    if (!existing) {
      return await ctx.db.insert(
        "siteSettings",
        withCreatedAt({
          key: SITE_SETTINGS_GLOBAL_KEY,
          contact: normalizedContact,
        })
      );
    }

    await ctx.db.patch(
      existing._id,
      withUpdatedAt({
        contact: normalizedContact,
      })
    );

    return existing._id;
  },
});

export const upsertLanguageWorkflow = mutation({
  args: {
    locale: v.string(),
    status: languageWorkflowStatusValidator,
    gscSubmissionEnabled: v.optional(v.boolean()),
    releaseOwner: v.optional(v.string()),
    notes: v.optional(v.string()),
    gateReport: v.optional(
      v.object({
        reportId: v.string(),
        checksum: v.string(),
        checkedAt: v.string(),
        passed: v.boolean(),
        blockerCount: v.number(),
        highCount: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const locale = args.locale.trim();
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", SITE_SETTINGS_GLOBAL_KEY))
      .unique();
    const existingWorkflows = normalizeLanguageWorkflowSettings(
      existing?.languageWorkflows as LanguageWorkflowSettings[] | undefined
    );
    const previousWorkflow = existingWorkflows.find((workflow) => workflow.locale === locale);
    const exposure = resolveLanguageWorkflowExposure(args.status, args.gscSubmissionEnabled);
    const nextWorkflow: LanguageWorkflowSettings = {
      locale,
      status: args.status,
      ...exposure,
      releaseOwner: normalizeOptionalText(args.releaseOwner),
      notes: normalizeOptionalText(args.notes),
      lastGateReportId: args.gateReport?.reportId,
      lastGateChecksum: args.gateReport?.checksum,
      lastGateCheckedAt: args.gateReport?.checkedAt,
      lastGatePassed: args.gateReport?.passed,
      lastGateBlockerCount: args.gateReport?.blockerCount,
      lastGateHighCount: args.gateReport?.highCount,
      publishedAt:
        args.status === "published"
          ? previousWorkflow?.publishedAt ?? now
          : previousWorkflow?.publishedAt,
      pausedAt: args.status === "paused" ? now : previousWorkflow?.pausedAt,
      createdAt: previousWorkflow?.createdAt ?? now,
      updatedAt: now,
    };
    const languageWorkflows = [
      ...existingWorkflows.filter((workflow) => workflow.locale !== locale),
      nextWorkflow,
    ].sort((a, b) => a.locale.localeCompare(b.locale));

    if (!existing) {
      return await ctx.db.insert(
        "siteSettings",
        withCreatedAt({
          key: SITE_SETTINGS_GLOBAL_KEY,
          contact: DEFAULT_CONTACT_SETTINGS,
          languageWorkflows,
        })
      );
    }

    await ctx.db.patch(
      existing._id,
      withUpdatedAt({
        languageWorkflows,
      })
    );

    return existing._id;
  },
});

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
