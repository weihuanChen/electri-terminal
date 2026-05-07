import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ResourcesPageClient, {
  type PublicResourceDocument,
  type ResourceDocumentType,
} from "./ResourcesPageClient";
import { buildPageMetadata, queryPublicPage } from "@/lib/metadata";

type RawPublicResource = {
  _id: string;
  title: string;
  type: ResourceDocumentType | "image";
  fileUrl?: string;
  previewImage?: string;
  fileSize?: number | string;
  language?: string;
  version?: string;
};

const DOWNLOADABLE_RESOURCE_TYPES: ResourceDocumentType[] = [
  "catalog",
  "datasheet",
  "certificate",
  "cad",
  "manual",
];

type ResourceFilterType = "all" | ResourceDocumentType;

type ResourcesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeResourceType(value: string | string[] | undefined): ResourceFilterType {
  const type = readSingleParam(value);
  return DOWNLOADABLE_RESOURCE_TYPES.includes(type as ResourceDocumentType)
    ? (type as ResourceDocumentType)
    : "all";
}

function buildResourcesRobots(hasActiveFilters: boolean): Metadata["robots"] {
  if (!hasActiveFilters) {
    return undefined;
  }

  return {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-image-preview": "none",
      "max-snippet": 0,
      "max-video-preview": 0,
    },
  };
}

function isDownloadableResource(resource: RawPublicResource): resource is PublicResourceDocument {
  return (
    DOWNLOADABLE_RESOURCE_TYPES.includes(resource.type as ResourceDocumentType) &&
    typeof resource.fileUrl === "string" &&
    resource.fileUrl.trim().length > 0
  );
}

async function getPublicResources() {
  const resources = await queryPublicPage<RawPublicResource[]>("frontend:listPublicResources", {
    limit: 100,
  });

  return resources.filter(isDownloadableResource);
}

export async function generateMetadata({
  searchParams,
}: ResourcesPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const initialType = normalizeResourceType(resolvedSearchParams.type);
  const initialSearchQuery = readSingleParam(resolvedSearchParams.q);
  const hasActiveFilters = initialType !== "all" || initialSearchQuery.length > 0;

  return buildPageMetadata({
    entity: { status: "published" },
    fallbackPath: "/resources",
    fallbackTitle: "Documentation Support",
    fallbackDescription:
      "Browse publicly available catalogs, datasheets, certificates, CAD drawings, and manuals for Electri Terminal product lines.",
    robots: buildResourcesRobots(hasActiveFilters),
  });
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const resources = await getPublicResources();
  const resolvedSearchParams = await searchParams;
  const initialType = normalizeResourceType(resolvedSearchParams.type);
  const initialSearchQuery = readSingleParam(resolvedSearchParams.q);

  if (resources.length === 0) {
    notFound();
  }

  return (
    <ResourcesPageClient
      initialResources={resources}
      initialType={initialType}
      initialSearchQuery={initialSearchQuery}
    />
  );
}
