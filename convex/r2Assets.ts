import { R2 } from "@convex-dev/r2";
import type { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata, getMetadata, deleteObject } = r2.clientApi<DataModel>({
  checkUpload: async () => {
    // This project currently gates admin access in Next.js, not Convex auth.
    // Keep the component hook open here and enforce write paths in admin actions.
  },
});
