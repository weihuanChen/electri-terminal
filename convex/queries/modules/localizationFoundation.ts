import { v } from "convex/values";
import { query } from "../../_generated/server";
import { localizationEntityTypeValidator } from "../../lib/localization";
import {
  normalizeFoundationKey,
  normalizeLocale,
} from "../../lib/localizationFoundation";

export const getLocalizationFoundationEntity = query({
  args: { entityType: localizationEntityTypeValidator, sourceId: v.string() },
  handler: async (ctx, args) => {
    const sourceId = args.sourceId.trim();
    const [snapshots, canonicalIntent, bindings] = await Promise.all([
      ctx.db
        .query("localizationSourceSnapshots")
        .withIndex("by_entity_created", (q) =>
          q.eq("entityType", args.entityType).eq("sourceId", sourceId),
        )
        .order("desc")
        .collect(),
      ctx.db
        .query("canonicalIntents")
        .withIndex("by_entity", (q) =>
          q.eq("entityType", args.entityType).eq("sourceId", sourceId),
        )
        .unique(),
      ctx.db
        .query("entityConceptBindings")
        .withIndex("by_entity", (q) =>
          q.eq("entityType", args.entityType).eq("sourceId", sourceId),
        )
        .collect(),
    ]);
    const revisions = canonicalIntent
      ? await ctx.db
          .query("canonicalIntentRevisions")
          .withIndex("by_parent_revision", (q) =>
            q.eq("canonicalIntentId", canonicalIntent._id),
          )
          .order("desc")
          .collect()
      : [];
    const concepts = await Promise.all(
      bindings.map((binding) => ctx.db.get(binding.conceptId)),
    );
    return {
      snapshots,
      canonicalIntent,
      canonicalIntentRevisions: revisions,
      conceptBindings: bindings.map((binding, index) => ({
        ...binding,
        concept: concepts[index],
      })),
    };
  },
});

export const getLanguageProfile = query({
  args: { locale: v.string(), market: v.string() },
  handler: async (ctx, args) => {
    const locale = normalizeLocale(args.locale);
    const market = normalizeFoundationKey(args.market, "market");
    const profile = await ctx.db
      .query("languageProfiles")
      .withIndex("by_locale_market", (q) =>
        q.eq("locale", locale).eq("market", market),
      )
      .unique();
    if (!profile) return null;
    const versions = await ctx.db
      .query("languageProfileVersions")
      .withIndex("by_profile_version", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .collect();
    return { profile, versions };
  },
});

export const listCanonicalConcepts = query({
  args: { includeDeprecated: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const concepts = await ctx.db.query("canonicalConcepts").collect();
    return concepts
      .filter(
        (concept) => args.includeDeprecated || concept.status !== "deprecated",
      )
      .sort((left, right) => left.key.localeCompare(right.key));
  },
});

export const getConceptLocalization = query({
  args: {
    conceptId: v.id("canonicalConcepts"),
    locale: v.string(),
    market: v.string(),
  },
  handler: async (ctx, args) => {
    const concept = await ctx.db.get(args.conceptId);
    if (!concept) return null;
    const locale = normalizeLocale(args.locale);
    const market = normalizeFoundationKey(args.market, "market");
    const rules = await ctx.db
      .query("conceptLocaleRules")
      .withIndex("by_concept_locale_market", (q) =>
        q
          .eq("conceptId", concept._id)
          .eq("locale", locale)
          .eq("market", market),
      )
      .collect();
    return {
      concept,
      rules: rules.sort((left, right) => right.version - left.version),
      approvedRule: rules.find((rule) => rule.status === "approved") ?? null,
    };
  },
});

export const getLocalizationFoundationReadiness = query({
  args: { locale: v.string(), market: v.string() },
  handler: async (ctx, args) => {
    const locale = normalizeLocale(args.locale);
    const market = normalizeFoundationKey(args.market, "market");
    const [profile, concepts, approvedBindings, localeRules, intents] =
      await Promise.all([
        ctx.db
          .query("languageProfiles")
          .withIndex("by_locale_market", (q) =>
            q.eq("locale", locale).eq("market", market),
          )
          .unique(),
        ctx.db
          .query("canonicalConcepts")
          .withIndex("by_status", (q) => q.eq("status", "approved"))
          .collect(),
        ctx.db
          .query("entityConceptBindings")
          .collect()
          .then((items) => items.filter((item) => item.status === "approved")),
        ctx.db
          .query("conceptLocaleRules")
          .withIndex("by_locale_status", (q) =>
            q.eq("locale", locale).eq("status", "approved"),
          )
          .collect(),
        ctx.db.query("canonicalIntents").collect(),
      ]);
    const marketRules = localeRules.filter((rule) => rule.market === market);
    const ruleConceptIds = new Set(
      marketRules.map((rule) => String(rule.conceptId)),
    );
    const requiredConceptIds = new Set(
      approvedBindings.map((binding) => String(binding.conceptId)),
    );
    const missingConceptRuleIds = [...requiredConceptIds].filter(
      (id) => !ruleConceptIds.has(id),
    );
    const missingApprovedIntentCount = intents.filter(
      (intent) => !intent.approvedRevisionId,
    ).length;
    const blockers = [
      ...(!profile?.activeVersionId ? ["active_language_profile_missing"] : []),
      ...(missingConceptRuleIds.length > 0
        ? ["approved_concept_locale_rules_missing"]
        : []),
      ...(missingApprovedIntentCount > 0
        ? ["approved_canonical_intents_missing"]
        : []),
    ];
    return {
      locale,
      market,
      ready: blockers.length === 0,
      blockers,
      counts: {
        approvedConcepts: concepts.length,
        approvedBindings: approvedBindings.length,
        approvedLocaleRules: marketRules.length,
        canonicalIntents: intents.length,
        missingApprovedIntents: missingApprovedIntentCount,
        missingConceptRules: missingConceptRuleIds.length,
      },
      missingConceptRuleIds,
      activeLanguageProfileVersionId: profile?.activeVersionId ?? null,
    };
  },
});
