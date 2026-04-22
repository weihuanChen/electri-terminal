import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExpandedTemplateFieldsByTemplateId } from "../../lib/attributes";

export const listAttributeTemplates = query({
  args: {
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const templates = args.categoryId
      ? await ctx.db
          .query("attributeTemplates")
          .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId!))
          .collect()
      : await ctx.db.query("attributeTemplates").collect();

    templates.sort((a, b) => a.name.localeCompare(b.name));

    return await Promise.all(
      templates.map(async (template) => {
        const [category, fields] = await Promise.all([
          ctx.db.get(template.categoryId),
          getExpandedTemplateFieldsByTemplateId(ctx, template._id),
        ]);

        return {
          ...template,
          category,
          fields,
          fieldCount: fields.length,
        };
      })
    );
  },
});

export const getAttributeTemplateById = query({
  args: { id: v.id("attributeTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) return null;

    const [category, fields] = await Promise.all([
      ctx.db.get(template.categoryId),
      getExpandedTemplateFieldsByTemplateId(ctx, args.id),
    ]);

    return {
      ...template,
      category,
      fields,
    };
  },
});
