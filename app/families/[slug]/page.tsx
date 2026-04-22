import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JsonLd from "@/components/seo/JsonLd";
import FamilyPageClient, { type FamilyPageData } from "./FamilyPageClient";
import {
  buildFamilyStructuredData,
  resolveFamilyMetadataDescription,
  resolveFamilyMetadataEntity,
  resolveFamilyMetadataImage,
  resolveFamilyPrimaryImageAlt,
  resolveFamilyMetadataRobots,
} from "@/lib/familyPage";
import { buildPageMetadata, queryPublicPage } from "@/lib/metadata";

type FamilyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type FamilyMetadataRecord = FamilyPageData & {
  status?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
};

async function getFamilyRecord(slug: string) {
  return await queryPublicPage<FamilyMetadataRecord | null>("frontend:getFamilyWithProducts", { slug });
}

export async function generateMetadata({ params }: FamilyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const family = await getFamilyRecord(slug);

  return buildPageMetadata({
    entity: resolveFamilyMetadataEntity(family),
    fallbackPath: `/families/${slug}`,
    fallbackTitle: family?.name || "Product Family",
    fallbackDescription: resolveFamilyMetadataDescription(family),
    image: {
      url: resolveFamilyMetadataImage(family),
      alt: resolveFamilyPrimaryImageAlt(family) || family?.name,
    },
    robots: resolveFamilyMetadataRobots(family),
  });
}

export default async function FamilyPage({ params }: FamilyPageProps) {
  const { slug } = await params;
  const family = await getFamilyRecord(slug);

  if (!family || family.status !== "published") {
    notFound();
  }

  const structuredData = buildFamilyStructuredData(family, slug);

  return (
    <>
      <JsonLd data={structuredData} />
      <FamilyPageClient family={family} />
    </>
  );
}
