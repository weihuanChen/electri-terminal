import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JsonLd from "@/components/seo/JsonLd";
import ProductPageClient, { type ProductPageData } from "./ProductPageClient";
import {
  buildProductStructuredData,
  resolveProductMetadataDescription,
  resolveProductMetadataEntity,
} from "@/lib/productPage";
import { buildPageMetadata, queryPublicPage } from "@/lib/metadata";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductMetadataRecord = ProductPageData & {
  status?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: number;
};

type RelatedSeriesItem = NonNullable<ProductPageData["relatedSeries"]>[number];
type RelatedSeriesLabel = RelatedSeriesItem["relationLabel"];

type RelatedSeriesFamilyRecord = {
  _id: string;
  name: string;
  slug: string;
  summary?: string;
  categoryId?: string;
  sortOrder?: number;
  heroImage?: string;
  manualHeroImage?: string;
  mediaItems?: Array<{
    type?: string;
    url?: string;
    sortOrder?: number;
  }>;
};

type CategoryFamilyContent = {
  families?: RelatedSeriesFamilyRecord[];
};

const RELATED_SERIES_TARGETS: Array<{
  label: RelatedSeriesLabel;
  keywords: string[];
  excludeKeywords?: string[];
  preferredSlugs?: string[];
}> = [
  {
    label: "Single Crimp",
    keywords: [
      "single crimp",
      "single crimp ring",
      "vinyl insulated ring",
      "vinyl insulated terminals",
      "insulated ring terminals",
    ],
    excludeKeywords: ["double crimp", "heat shrink", "nylon", "non insulated"],
    preferredSlugs: [
      "single-crimp-ring-terminals",
      "vinyl-insulated-ring-terminals",
      "insulated-ring-terminals",
    ],
  },
  {
    label: "Heat Shrink",
    keywords: ["heat shrink", "heat shrink ring"],
    preferredSlugs: ["heat-shrink-ring-terminals"],
  },
  {
    label: "Nylon",
    keywords: ["nylon", "nylon ring", "nylon insulated"],
    preferredSlugs: ["nylon-ring-terminals", "nylon-insulated-ring-terminals"],
  },
  {
    label: "Non Insulated",
    keywords: [
      "non insulated",
      "non insulated ring",
      "standard ring terminals",
      "ring terminals standard type",
    ],
    excludeKeywords: ["heat shrink", "nylon"],
    preferredSlugs: ["standard-ring-terminals", "non-insulated-ring-terminals"],
  },
];

function normalizeSeriesText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFamilySearchText(family: RelatedSeriesFamilyRecord) {
  return normalizeSeriesText(
    [
      family.name,
      family.slug,
      family.summary,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function resolveRelatedSeriesImage(family: RelatedSeriesFamilyRecord) {
  return (
    family.heroImage ||
    family.manualHeroImage ||
    family.mediaItems?.find((item) => item.type === "product" && item.url)?.url ||
    family.mediaItems?.find((item) => item.url)?.url
  );
}

function familyMatchesTarget(
  family: RelatedSeriesFamilyRecord,
  target: (typeof RELATED_SERIES_TARGETS)[number]
) {
  const searchText = getFamilySearchText(family);
  const excluded = (target.excludeKeywords ?? []).some((keyword) =>
    searchText.includes(normalizeSeriesText(keyword))
  );

  if (excluded) return false;

  return target.keywords.some((keyword) => searchText.includes(normalizeSeriesText(keyword)));
}

function scoreRelatedSeriesFamily(
  product: ProductMetadataRecord,
  family: RelatedSeriesFamilyRecord,
  target: (typeof RELATED_SERIES_TARGETS)[number]
) {
  const preferredSlugIndex = (target.preferredSlugs ?? []).indexOf(family.slug);
  const currentFamilyId = product.familyId || product.family?._id;
  const currentCategoryId = product.categoryId || product.category?._id;

  return (
    (preferredSlugIndex >= 0 ? 1000 - preferredSlugIndex * 25 : 0) +
    (family._id === currentFamilyId ? 120 : 0) +
    (family.categoryId === currentCategoryId ? 80 : 0) +
    (resolveRelatedSeriesImage(family) ? 10 : 0) +
    (family.summary ? 5 : 0) -
    (family.sortOrder ?? 0)
  );
}

function buildRelatedSeriesFallback(
  product: ProductMetadataRecord,
  families: RelatedSeriesFamilyRecord[]
) {
  const selected: RelatedSeriesItem[] = [];
  const usedFamilyIds = new Set<string>();

  for (const target of RELATED_SERIES_TARGETS) {
    const family = families
      .filter((item) => !usedFamilyIds.has(item._id) && familyMatchesTarget(item, target))
      .sort(
        (left, right) =>
          scoreRelatedSeriesFamily(product, right, target) -
          scoreRelatedSeriesFamily(product, left, target)
      )[0];

    if (!family) continue;

    usedFamilyIds.add(family._id);
    selected.push({
      _id: family._id,
      name: family.name,
      slug: family.slug,
      summary: family.summary,
      image: resolveRelatedSeriesImage(family),
      relationLabel: target.label,
    });
  }

  return selected;
}

async function resolveRelatedSeriesFallback(product: ProductMetadataRecord) {
  const existingRelatedSeries = product.relatedSeries ?? [];
  const hasAllTargetLabels = RELATED_SERIES_TARGETS.every((target) =>
    existingRelatedSeries.some((item) => item.relationLabel === target.label)
  );

  if (hasAllTargetLabels) {
    return product;
  }

  const categoryIds = Array.from(
    new Set(
      [product.category?.parentId, product.categoryId || product.category?._id].filter(
        (value): value is string => Boolean(value)
      )
    )
  );

  if (categoryIds.length === 0) {
    return product;
  }

  try {
    const familyBuckets = await Promise.all(
      categoryIds.map((categoryId) =>
        queryPublicPage<CategoryFamilyContent>("frontend:getCategoryContent", {
          categoryId,
          type: "families",
          limit: 100,
        })
      )
    );

    const familiesById = new Map<string, RelatedSeriesFamilyRecord>();
    for (const family of familyBuckets.flatMap((bucket) => bucket.families ?? [])) {
      familiesById.set(family._id, family);
    }

    const fallbackRelatedSeries = buildRelatedSeriesFallback(
      product,
      Array.from(familiesById.values())
    );
    const mergedSeries: RelatedSeriesItem[] = [];
    const usedFamilyIds = new Set<string>();

    for (const target of RELATED_SERIES_TARGETS) {
      const item =
        existingRelatedSeries.find((candidate) => candidate.relationLabel === target.label) ||
        fallbackRelatedSeries.find((candidate) => candidate.relationLabel === target.label);

      if (!item || usedFamilyIds.has(item._id)) continue;

      usedFamilyIds.add(item._id);
      mergedSeries.push(item);
    }

    return mergedSeries.length > 0 ? { ...product, relatedSeries: mergedSeries } : product;
  } catch {
    return product;
  }
}

async function getProductRecord(slug: string) {
  const product = await queryPublicPage<ProductMetadataRecord | null>("frontend:getProductBySlug", { slug });
  return product ? await resolveRelatedSeriesFallback(product) : product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductRecord(slug);

  return buildPageMetadata({
    entity: resolveProductMetadataEntity(product),
    fallbackPath: `/products/${slug}`,
    fallbackTitle: product?.shortTitle || product?.title || "Product",
    fallbackDescription: resolveProductMetadataDescription(product),
    image: {
      url: product?.mainImage,
      alt: product?.shortTitle || product?.title,
    },
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductRecord(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  const structuredData = buildProductStructuredData(product, slug);

  return (
    <>
      <JsonLd data={structuredData} />
      <ProductPageClient product={product} />
    </>
  );
}
