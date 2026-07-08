import { makeBreadcrumbSchema, makeFAQPageSchema, makeProductSchema } from "@/lib/schema";
import { buildProductKeySpecificationAttributes } from "@/lib/productKeySpecifications";
import {
  resolveFaqItems,
  resolveMetadataDescription,
  type BasicFaqRecord,
  type CTAConfig,
} from "@/lib/pageResolvers";
import { categoriesUrl, categoryUrl, familyUrl, productUrl } from "@/lib/routes";
import type { UrlResolverOptions } from "@/lib/i18n/urlResolver";

type ProductVariantRecord = {
  itemNo?: string;
  attributes?: Record<string, unknown>;
};

type ProductSpecificationFieldRecord = {
  fieldKey: string;
  label: string;
  fieldType?: "string" | "number" | "boolean" | "enum" | "array" | "range";
  displayPrecision?: number;
  unitKey?: "mm" | "mm2" | "g" | "kg" | "v" | "a" | "c" | "awg" | "nm" | "pcs";
  unit?: string;
  groupName?: string;
};

type ProductCategoryRecord = {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  seoDescription?: string;
};

type ProductFamilyRecord = {
  name: string;
  slug: string;
  summary?: string;
  content?: string;
  seoDescription?: string;
};

type ProductLike = {
  _id: string;
  title: string;
  shortTitle?: string;
  slug?: string;
  skuCode: string;
  model: string;
  summary?: string;
  content?: string;
  mainImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  attributes?: Record<string, unknown>;
  specificationFields?: ProductSpecificationFieldRecord[];
  faqs?: BasicFaqRecord[];
  resources?: Array<{
    _id: string;
  }>;
  variants?: ProductVariantRecord[];
  category?: ProductCategoryRecord | null;
  family?: ProductFamilyRecord | null;
};

function hasText(value?: string) {
  return typeof value === "string" && value.trim().length > 0;
}

export function resolveProductOverviewContent(product: ProductLike | null) {
  const candidates = [
    product?.content,
    product?.summary,
    product?.family?.content,
    product?.family?.summary,
    product?.category?.shortDescription,
    product?.category?.description,
  ];

  return candidates.find(hasText)?.trim();
}

export function resolveProductMetadataEntity(product: ProductLike | null) {
  return product;
}

export function resolveProductMetadataDescription(product: ProductLike | null) {
  return resolveMetadataDescription(
    [
      product?.seoDescription,
      product?.summary,
      product?.content,
      product?.family?.seoDescription,
      product?.family?.summary,
      product?.category?.seoDescription,
      product?.category?.shortDescription,
      product?.category?.description,
    ],
    "Explore product specifications, images, and technical details."
  );
}

export function resolveProductFaqItems(product: Pick<ProductLike, "faqs">) {
  return resolveFaqItems(product.faqs);
}

export function resolveProductPageViewModel(
  product: ProductLike,
  urlOptions?: UrlResolverOptions
) {
  return {
    heroTitle: product.shortTitle || product.title,
    heroSummary: product.summary,
    overviewContent: resolveProductOverviewContent(product),
    primaryCTA: {
      label: "Request Quote",
      href: "#inquiry-form",
    } satisfies CTAConfig,
    secondaryCTA: product.family
      ? {
          label: "View Series",
          href: familyUrl(product.family.slug, urlOptions),
        }
      : undefined,
    faqItems: resolveProductFaqItems(product),
    showDownloads: Boolean(product.resources && product.resources.length > 0),
    showFaq: resolveProductFaqItems(product).length > 0,
    showInquiry: true,
    showBottomCta: true,
  };
}

export function buildProductStructuredData(
  product: ProductLike,
  slug: string,
  urlOptions?: UrlResolverOptions
) {
  const faqItems = resolveProductFaqItems(product);

  return [
    makeBreadcrumbSchema([
      { name: "Categories", path: categoriesUrl(urlOptions) },
      ...(product.category?.slug
        ? [
            {
              name: product.category.name || "Category",
              path: categoryUrl(product.category.slug, urlOptions),
            },
          ]
        : []),
      ...(product.family?.slug
        ? [{ name: product.family.name, path: familyUrl(product.family.slug, urlOptions) }]
        : []),
      { name: product.shortTitle || product.title, path: productUrl(slug, urlOptions) },
    ]),
    makeProductSchema({
      slug,
      name: product.shortTitle || product.title,
      description: resolveProductMetadataDescription(product),
      image: product.mainImage,
      model: product.model,
      sku: product.skuCode,
      mpn: product.model,
      categoryName: product.category?.name,
      attributes: buildProductKeySpecificationAttributes(product),
    }),
    ...(faqItems.length > 0
      ? [
          makeFAQPageSchema({
            path: productUrl(slug, urlOptions),
            items: faqItems,
          }),
        ]
      : []),
  ];
}
