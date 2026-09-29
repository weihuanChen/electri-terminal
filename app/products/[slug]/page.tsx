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
import { productUrl } from "@/lib/routes";
import { getCachedRelatedSeries } from "@/lib/relatedSeries";

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

async function resolveRelatedSeriesFallback(product: ProductMetadataRecord) {
  const familyId = product.familyId || product.family?._id;
  const categoryId = product.categoryId || product.category?._id;
  if (!familyId || !categoryId) return product;

  try {
    const relatedSeries = await getCachedRelatedSeries(familyId, categoryId) as ProductPageData["relatedSeries"];
    return { ...product, relatedSeries: relatedSeries ?? [] };
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
    fallbackPath: productUrl(slug),
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
