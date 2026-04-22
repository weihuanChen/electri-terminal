import type { Metadata } from "next";

import { getAdminConvexClient } from "@/lib/convex-admin";
import { getSiteUrl, toAbsoluteSiteUrl } from "@/lib/site";

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

function makeCanonicalUrl(canonical?: string, fallbackPath?: string) {
  if (canonical?.trim()) {
    return toAbsoluteSiteUrl(canonical.trim());
  }

  if (!fallbackPath) {
    return undefined;
  }

  return toAbsoluteSiteUrl(fallbackPath);
}

function makeRobots(indexable: boolean): Metadata["robots"] {
  return {
    index: indexable,
    follow: indexable,
    googleBot: {
      index: indexable,
      follow: indexable,
      "max-image-preview": indexable ? "large" : "none",
      "max-snippet": indexable ? -1 : 0,
      "max-video-preview": indexable ? -1 : 0,
    },
  };
}

type BuildMetadataArgs = {
  entity: PublishableEntity | null;
  fallbackPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
  openGraphType?: "website" | "article";
  image?: MetadataImage;
  robots?: Metadata["robots"];
};

export function buildPageMetadata({
  entity,
  fallbackPath,
  fallbackTitle,
  fallbackDescription,
  openGraphType = "website",
  image,
  robots,
}: BuildMetadataArgs): Metadata {
  const isPublished = entity?.status === "published";
  const title = entity?.seoTitle || fallbackTitle;
  const description = entity?.seoDescription || fallbackDescription;
  const canonical = makeCanonicalUrl(entity?.canonical, fallbackPath);
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
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    robots: robots ?? makeRobots(isPublished),
    openGraph: {
      type: openGraphType,
      title,
      description,
      url: canonical,
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

export async function queryPublicPage<T>(name: string, args: Record<string, unknown>) {
  return (await getAdminConvexClient().query(name, args)) as T;
}
