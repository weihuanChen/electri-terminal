import { v } from "convex/values";

export const statusCommon = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived")
);

export const articleType = v.union(
  v.literal("blog"),
  v.literal("guide"),
  v.literal("faq"),
  v.literal("application")
);

export const inquiryType = v.union(
  v.literal("general"),
  v.literal("product"),
  v.literal("rfq")
);

export const inquiryStatus = v.union(
  v.literal("new"),
  v.literal("in_progress"),
  v.literal("resolved"),
  v.literal("closed"),
  v.literal("spam")
);

export const importJobType = v.union(
  v.literal("product_csv"),
  v.literal("family_csv"),
  v.literal("category_csv")
);

export const importStatus = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("partial_success")
);

export const relationEntityType = v.union(
  v.literal("category"),
  v.literal("family"),
  v.literal("product"),
  v.literal("article")
);

export const assetType = v.union(
  v.literal("catalog"),
  v.literal("datasheet"),
  v.literal("certificate"),
  v.literal("cad"),
  v.literal("manual"),
  v.literal("image")
);
