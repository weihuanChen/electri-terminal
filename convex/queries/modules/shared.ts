import { v } from "convex/values";

export const statusCommon = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived")
);

export const inquiryStatus = v.union(
  v.literal("new"),
  v.literal("in_progress"),
  v.literal("resolved"),
  v.literal("closed"),
  v.literal("spam")
);

export const inquiryType = v.union(
  v.literal("general"),
  v.literal("product"),
  v.literal("rfq")
);

export const articleType = v.union(
  v.literal("blog"),
  v.literal("guide"),
  v.literal("faq"),
  v.literal("application")
);

export const importStatus = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("partial_success")
);
