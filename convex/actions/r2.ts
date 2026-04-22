"use node";

import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { v } from "convex/values";
import { action } from "../_generated/server";

function normalizePrefix(prefix: string) {
  return prefix.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

function matchesPrefix(key: string, prefixes: string[]) {
  if (prefixes.length === 0) return true;
  return prefixes.some((prefix) => key === prefix || key.startsWith(`${prefix}/`));
}

export const listBucketObjects = action({
  args: {
    pageSize: v.optional(v.number()),
    maxItems: v.optional(v.number()),
    prefixes: v.optional(v.array(v.string())),
  },
  returns: v.object({
    items: v.array(
      v.object({
        key: v.string(),
        size: v.optional(v.number()),
        lastModified: v.optional(v.string()),
      })
    ),
    isTruncated: v.boolean(),
    nextContinuationToken: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    const bucket = process.env.R2_BUCKET;
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error("R2 configuration is incomplete. Ensure R2_BUCKET/R2_ENDPOINT/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY are set.");
    }

    const client = new S3Client({
      region: "auto",
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const pageSize = Math.min(Math.max(Math.floor(args.pageSize ?? 500), 1), 1000);
    const maxItems = Math.min(Math.max(Math.floor(args.maxItems ?? 3000), 1), 10000);
    const prefixes = (args.prefixes ?? []).map(normalizePrefix).filter(Boolean);

    const items: Array<{
      key: string;
      size?: number;
      lastModified?: string;
    }> = [];
    let continuationToken: string | undefined;
    let isTruncated = false;

    while (items.length < maxItems) {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          MaxKeys: Math.min(pageSize, maxItems - items.length),
          ContinuationToken: continuationToken,
        })
      );

      for (const object of response.Contents ?? []) {
        const key = object.Key?.replace(/^\/+/, "") ?? "";
        if (!key) continue;
        if (!matchesPrefix(key, prefixes)) continue;
        items.push({
          key,
          size: object.Size,
          lastModified: object.LastModified?.toISOString(),
        });
      }

      if (!response.IsTruncated || !response.NextContinuationToken) {
        isTruncated = false;
        continuationToken = undefined;
        break;
      }

      continuationToken = response.NextContinuationToken;
      isTruncated = true;
    }

    items.sort((a, b) => a.key.localeCompare(b.key));

    return {
      items,
      isTruncated: isTruncated || Boolean(continuationToken),
      nextContinuationToken: continuationToken,
    };
  },
});
