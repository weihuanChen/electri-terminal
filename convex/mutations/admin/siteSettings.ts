import { mutation } from "../../_generated/server";
import {
  contactSettingsValidator,
  normalizeContactSettings,
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
