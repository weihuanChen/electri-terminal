import { v } from "convex/values";
import { query } from "../../_generated/server";
import {
  localizationEntityTypeValidator,
  localizationIdentityValidator,
  localizationStatusValidator,
} from "../../lib/localization";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

function normalizeLimit(limit?: number) {
  return Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
}

export const getLocalizationById = query({
  args: {
    id: v.id("localizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getLocalizationByEntityLocale = query({
  args: localizationIdentityValidator,
  handler: async (ctx, args) => {
    const sourceId = args.sourceId.trim();
    const locale = args.locale.trim();
    if (!sourceId || !locale) return null;

    return await ctx.db
      .query("localizations")
      .withIndex("by_entity_locale", (q) =>
        q
          .eq("entityType", args.entityType)
          .eq("sourceId", sourceId)
          .eq("locale", locale)
      )
      .unique();
  },
});

export const listLocalizations = query({
  args: {
    locale: v.optional(v.string()),
    entityType: v.optional(localizationEntityTypeValidator),
    sourceId: v.optional(v.string()),
    status: v.optional(localizationStatusValidator),
    statuses: v.optional(v.array(localizationStatusValidator)),
    owner: v.optional(v.string()),
    requiredForRelease: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = normalizeLimit(args.limit);
    const sourceId = args.sourceId?.trim();
    const locale = args.locale?.trim();
    const owner = args.owner?.trim();
    const statusSet = args.statuses ? new Set(args.statuses) : null;

    let items = await ctx.db.query("localizations").collect();
    if (args.entityType && sourceId) {
      const entityType = args.entityType;
      items = await ctx.db
        .query("localizations")
        .withIndex("by_entity", (q) =>
          q.eq("entityType", entityType).eq("sourceId", sourceId)
        )
        .collect();
    }

    if (locale) items = items.filter((item) => item.locale === locale);
    if (args.entityType) {
      items = items.filter((item) => item.entityType === args.entityType);
    }
    if (sourceId) items = items.filter((item) => item.sourceId === sourceId);
    if (args.status) items = items.filter((item) => item.status === args.status);
    if (statusSet) items = items.filter((item) => statusSet.has(item.status));
    if (owner) items = items.filter((item) => item.owner === owner);
    if (args.requiredForRelease !== undefined) {
      items = items.filter(
        (item) => item.requiredForRelease === args.requiredForRelease
      );
    }

    return items
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .slice(0, limit);
  },
});

export const listLocalizationReviewQueue = query({
  args: {
    locale: v.optional(v.string()),
    entityType: v.optional(localizationEntityTypeValidator),
    owner: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = normalizeLimit(args.limit);
    const locale = args.locale?.trim();
    const owner = args.owner?.trim();
    let items = await ctx.db.query("localizations").collect();

    if (locale) items = items.filter((item) => item.locale === locale);
    if (args.entityType) {
      items = items.filter((item) => item.entityType === args.entityType);
    }
    if (owner) items = items.filter((item) => item.owner === owner);

    return items
      .filter((item) =>
        ["machine_ready", "review_required"].includes(item.status)
      )
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .slice(0, limit);
  },
});

export const listStaleLocalizations = query({
  args: {
    locale: v.optional(v.string()),
    entityType: v.optional(localizationEntityTypeValidator),
    requiredForRelease: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = normalizeLimit(args.limit);
    const locale = args.locale?.trim();
    let items = locale
      ? await ctx.db
          .query("localizations")
          .withIndex("by_locale_status", (q) =>
            q.eq("locale", locale).eq("status", "stale")
          )
          .collect()
      : (await ctx.db.query("localizations").collect()).filter(
          (item) => item.status === "stale"
        );
    if (args.entityType) {
      items = items.filter((item) => item.entityType === args.entityType);
    }
    if (args.requiredForRelease !== undefined) {
      items = items.filter(
        (item) => item.requiredForRelease === args.requiredForRelease
      );
    }

    return items
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .slice(0, limit);
  },
});
