import { makeBreadcrumbSchema, makeFAQPageSchema } from "@/lib/schema";
import {
  resolveFaqItems,
  resolveMetadataDescription,
  type BasicFaqRecord,
  type CTAConfig,
} from "@/lib/pageResolvers";

type ProductVariantRecord = {
  itemNo?: string;
};

type ProductCategoryRecord = {
  name?: string;
  slug?: string;
};

type ProductFamilyRecord = {
  name: string;
  slug: string;
};

type ProductLike = {
  _id: string;
  title: string;
  shortTitle?: string;
  slug?: string;
  skuCode: string;
  model: string;
  summary?: string;
  mainImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  attributes?: Record<string, unknown>;
  faqs?: BasicFaqRecord[];
  resources?: Array<{
    _id: string;
  }>;
  variants?: ProductVariantRecord[];
  category?: ProductCategoryRecord | null;
  family?: ProductFamilyRecord | null;
};

export function resolveProductMetadataEntity(product: ProductLike | null) {
  return product;
}

export function resolveProductMetadataDescription(product: ProductLike | null) {
  return resolveMetadataDescription(
    [product?.seoDescription, product?.summary],
    "Explore product specifications, images, and technical details."
  );
}

export function resolveProductFaqItems(product: Pick<ProductLike, "faqs">) {
  return resolveFaqItems(product.faqs);
}

export function resolveProductPageViewModel(product: ProductLike) {
  return {
    heroTitle: product.shortTitle || product.title,
    heroSummary: product.summary,
    primaryCTA: {
      label: "Request Quote",
      href: "#inquiry-form",
    } satisfies CTAConfig,
    secondaryCTA: product.family
      ? {
          label: "View Series",
          href: `/families/${product.family.slug}`,
        }
      : undefined,
    faqItems: resolveProductFaqItems(product),
    showDownloads: Boolean(product.resources && product.resources.length > 0),
    showFaq: resolveProductFaqItems(product).length > 0,
    showInquiry: true,
    showBottomCta: true,
  };
}

export function buildProductStructuredData(product: ProductLike, slug: string) {
  const faqItems = resolveProductFaqItems(product);

  return [
    makeBreadcrumbSchema([
      { name: "Categories", path: "/categories" },
      ...(product.category?.slug
        ? [{ name: product.category.name || "Category", path: `/categories/${product.category.slug}` }]
        : []),
      ...(product.family?.slug
        ? [{ name: product.family.name, path: `/families/${product.family.slug}` }]
        : []),
      { name: product.shortTitle || product.title, path: `/products/${slug}` },
    ]),
    // Keep product detail markup out of Google's Product rich-result pipeline until
    // we have real offers, reviews, or aggregate ratings to publish.
    ...(faqItems.length > 0
      ? [
          makeFAQPageSchema({
            path: `/products/${slug}`,
            items: faqItems,
          }),
        ]
      : []),
  ];
}
