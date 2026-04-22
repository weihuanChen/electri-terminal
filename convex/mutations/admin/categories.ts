import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { categoryPageConfig } from "../../lib/categoryPageConfig";
import {
  assertUniqueCategoryPath,
  assertUniqueCategorySlug,
  resolveCategoryHierarchy,
  withCreatedAt,
  withUpdatedAt,
} from "../../lib/validators";
import { statusCommon } from "./shared";

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("categories")),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    image: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    status: v.optional(statusCommon),
    templateKey: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
    pageConfig: v.optional(categoryPageConfig),
    isVisibleInNav: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertUniqueCategorySlug(ctx, args.slug);

    const { level, path } = await resolveCategoryHierarchy(
      ctx,
      args.slug,
      args.parentId
    );
    await assertUniqueCategoryPath(ctx, path);

    return await ctx.db.insert(
      "categories",
      withCreatedAt({
        name: args.name,
        slug: args.slug,
        parentId: args.parentId,
        level,
        path,
        description: args.description,
        shortDescription: args.shortDescription,
        image: args.image,
        icon: args.icon,
        sortOrder: args.sortOrder ?? 0,
        status: args.status ?? "draft",
        templateKey: args.templateKey,
        seoTitle: args.seoTitle,
        seoDescription: args.seoDescription,
        canonical: args.canonical,
        pageConfig: args.pageConfig,
        isVisibleInNav: args.isVisibleInNav ?? true,
      })
    );
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    parentId: v.optional(v.union(v.id("categories"), v.null())),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    image: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    status: v.optional(statusCommon),
    templateKey: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    canonical: v.optional(v.string()),
    pageConfig: v.optional(categoryPageConfig),
    isVisibleInNav: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Category not found");

    const nextSlug = args.slug ?? current.slug;
    const nextParentId =
      args.parentId === undefined ? current.parentId : args.parentId ?? undefined;

    if (nextSlug !== current.slug) {
      await assertUniqueCategorySlug(ctx, nextSlug, args.id);
    }

    const hierarchyChanged =
      nextSlug !== current.slug || nextParentId !== current.parentId;

    let level = current.level;
    let path = current.path;

    if (hierarchyChanged) {
      const resolved = await resolveCategoryHierarchy(
        ctx,
        nextSlug,
        nextParentId,
        args.id
      );
      level = resolved.level;
      path = resolved.path;
      await assertUniqueCategoryPath(ctx, path, args.id);
    }

    await ctx.db.patch(
      args.id,
      withUpdatedAt({
        ...(args.name !== undefined ? { name: args.name } : {}),
        ...(args.slug !== undefined ? { slug: args.slug } : {}),
        ...(args.parentId !== undefined
          ? { parentId: args.parentId ?? undefined }
          : {}),
        ...(args.description !== undefined ? { description: args.description } : {}),
        ...(args.shortDescription !== undefined
          ? { shortDescription: args.shortDescription }
          : {}),
        ...(args.image !== undefined ? { image: args.image } : {}),
        ...(args.icon !== undefined ? { icon: args.icon } : {}),
        ...(args.sortOrder !== undefined ? { sortOrder: args.sortOrder } : {}),
        ...(args.status !== undefined ? { status: args.status } : {}),
        ...(args.templateKey !== undefined ? { templateKey: args.templateKey } : {}),
        ...(args.seoTitle !== undefined ? { seoTitle: args.seoTitle } : {}),
        ...(args.seoDescription !== undefined
          ? { seoDescription: args.seoDescription }
          : {}),
        ...(args.canonical !== undefined ? { canonical: args.canonical } : {}),
        ...(args.pageConfig !== undefined ? { pageConfig: args.pageConfig } : {}),
        ...(args.isVisibleInNav !== undefined
          ? { isVisibleInNav: args.isVisibleInNav }
          : {}),
        ...(hierarchyChanged ? { level, path } : {}),
      })
    );

    return args.id;
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found");

    // Check for child categories
    const children = await ctx.db
      .query("categories")
      .withIndex("by_parentId", (q) => q.eq("parentId", args.id))
      .collect();

    if (children.length > 0) {
      throw new Error(
        "Cannot delete category with child categories. Please delete or reassign children first."
      );
    }

    // Check for related product families
    const families = await ctx.db
      .query("productFamilies")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.id))
      .collect();

    if (families.length > 0) {
      throw new Error(
        "Cannot delete category with product families. Please delete or reassign families first."
      );
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkUpdateCategories = mutation({
  args: {
    ids: v.array(v.id("categories")),
    updates: v.object({
      status: v.optional(statusCommon),
      isVisibleInNav: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const updateData: {
        status?: "draft" | "published" | "archived";
        isVisibleInNav?: boolean;
      } = {};
      if (args.updates.status !== undefined) {
        updateData.status = args.updates.status;
      }
      if (args.updates.isVisibleInNav !== undefined) {
        updateData.isVisibleInNav = args.updates.isVisibleInNav;
      }
      await ctx.db.patch(id, withUpdatedAt(updateData));
    }
  },
});
