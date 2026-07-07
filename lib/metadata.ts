import type { Metadata } from "next";
import { cache } from "react";

import { getAdminConvexClient } from "@/lib/convex-admin";
import {
  type Locale,
  resolveSeoOutput,
} from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";

type PublishableEntity = {
  status?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
};

type MetadataImage = {
  url?: string;
  alt?: string;
};

function normalizeImageUrl(url?: string) {
  if (!url?.trim()) {
    return undefined;
  }

  try {
    return new URL(url, `${getSiteUrl()}/`).toString();
  } catch {
    return undefined;
  }
}

type BuildMetadataArgs = {
  entity: PublishableEntity | null;
  fallbackPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
  locale?: Locale;
  openGraphType?: "website" | "article";
  image?: MetadataImage;
  robots?: Metadata["robots"];
};

export function buildPageMetadata({
  entity,
  fallbackPath,
  fallbackTitle,
  fallbackDescription,
  locale,
  openGraphType = "website",
  image,
  robots,
}: BuildMetadataArgs): Metadata {
  const title = entity?.seoTitle || fallbackTitle;
  const description = entity?.seoDescription || fallbackDescription;
  const seo = resolveSeoOutput({
    canonical: entity?.canonical,
    fallbackPath,
    locale,
    sourceStatus: entity?.status ?? "missing",
    robots: robots ?? undefined,
  });
  const imageUrl = normalizeImageUrl(image?.url);
  const images = imageUrl
    ? [
        {
          url: imageUrl,
          alt: image?.alt || title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: seo.metadataAlternates,
    robots: seo.robots,
    openGraph: {
      type: openGraphType,
      title,
      description,
      url: seo.canonical,
      siteName: "Electri Terminal",
      images,
      modifiedTime:
        typeof entity?.updatedAt === "number"
          ? new Date(entity.updatedAt).toISOString()
          : undefined,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((item) => item.url),
    },
  };
}

const PUBLIC_QUERY_RETRY_DELAYS_MS = [150, 500, 1_000, 2_000];

function normalizeQueryValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => (item === undefined ? null : normalizeQueryValue(item)));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, item]) => [key, normalizeQueryValue(item)])
    );
  }

  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeQueryValue(value)) ?? "null";
}

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function getConvexErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }

  return undefined;
}

function isRetryablePublicQueryError(error: unknown) {
  const code = getConvexErrorCode(error);
  if (code === "WorkerOverloaded" || code === "TooManyRequests") {
    return true;
  }

  const message = getReadableErrorMessage(error).toLowerCase();
  return [
    "fetch failed",
    "failed to fetch",
    "network",
    "timeout",
    "timed out",
    "econnreset",
    "etimedout",
    "eai_again",
    "und_err",
    "terminated",
    "workeroverloaded",
    "there are no available workers",
    "too many requests",
    "rate limit",
    "temporarily unavailable",
    "service unavailable",
  ].some((token) => message.includes(token));
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelay(attempt: number) {
  const baseDelay = PUBLIC_QUERY_RETRY_DELAYS_MS[attempt] ?? 0;
  const jitter = Math.floor(Math.random() * Math.min(baseDelay, 250));
  return baseDelay + jitter;
}

async function queryPublicPageWithRetry(name: string, args: Record<string, unknown>) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= PUBLIC_QUERY_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await getAdminConvexClient().query(name, args);
    } catch (error) {
      lastError = error;
      if (!isRetryablePublicQueryError(error) || attempt === PUBLIC_QUERY_RETRY_DELAYS_MS.length) {
        break;
      }
      await wait(getRetryDelay(attempt));
    }
  }

  throw new Error(
    `Convex public query failed: ${name}. ${getReadableErrorMessage(lastError)}. Check NEXT_PUBLIC_CONVEX_URL and Convex deploy status.`
  );
}

const cachedQueryPublicPage = cache(async (name: string, argsKey: string) => {
  return await queryPublicPageWithRetry(name, JSON.parse(argsKey) as Record<string, unknown>);
});

export async function queryPublicPage<T>(name: string, args: Record<string, unknown>) {
  return (await cachedQueryPublicPage(name, stableStringify(args))) as T;
}
