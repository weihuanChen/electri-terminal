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

async function getProductRecord(slug: string) {
  return await queryPublicPage<ProductMetadataRecord | null>("frontend:getProductBySlug", { slug });
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
