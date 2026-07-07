import {
  Breadcrumb,
  ImageGallery,
  VariantTable,
  FAQAccordion,
  InquiryForm,
  ProductCard,
} from "@/components/shared";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Download } from "lucide-react";
import { resolveProductPageViewModel } from "@/lib/productPage";
import { categoriesUrl, categoryUrl, familyUrl } from "@/lib/routes";
import {
  normalizeVisualMediaItems,
  type VisualMediaItem,
} from "@/lib/productPresentation";
import { buildProductKeySpecifications } from "@/lib/productKeySpecifications";

interface CategorySummary {
  _id?: string;
  slug?: string;
  name?: string;
  parentId?: string;
  description?: string;
  shortDescription?: string;
  seoDescription?: string;
}

interface FamilySummary {
  _id?: string;
  slug: string;
  name: string;
  summary?: string;
  content?: string;
  seoDescription?: string;
}

interface DownloadResource {
  _id: string;
  title: string;
  type: "catalog" | "datasheet" | "certificate" | "cad" | "manual";
  fileUrl: string;
  previewImage?: string;
  fileSize?: number;
  language?: string;
  version?: string;
}

interface FaqItem {
  title: string;
  content?: string;
  excerpt?: string;
}

interface RelatedProduct {
  _id: string;
  slug: string;
  title: string;
  model?: string;
  shortTitle?: string;
  mainImage?: string;
  summary?: string;
}

interface SpecificationField {
  fieldKey: string;
  label: string;
  fieldType?: "string" | "number" | "boolean" | "enum" | "array" | "range";
  displayPrecision?: number;
  unitKey?: "mm" | "mm2" | "g" | "kg" | "v" | "a" | "c" | "awg" | "nm" | "pcs";
  unit?: string;
  groupName?: string;
}

interface ProductVariant {
  _id: string;
  skuCode: string;
  itemNo: string;
  attributes?: Record<string, unknown>;
}

type RelatedSeriesLabel = "Single Crimp" | "Heat Shrink" | "Nylon" | "Non Insulated";

interface RelatedSeriesItem {
  _id: string;
  name: string;
  slug: string;
  summary?: string;
  image?: string;
  relationLabel: RelatedSeriesLabel;
}

export interface ProductPageData {
  _id: string;
  title: string;
  shortTitle?: string;
  categoryId?: string;
  familyId?: string;
  skuCode: string;
  model: string;
  summary?: string;
  content?: string;
  packageInfo?: string;
  moq?: number;
  leadTime?: string;
  origin?: string;
  mainImage?: string;
  gallery?: string[];
  mediaItems?: VisualMediaItem[];
  featureBullets?: string[];
  attributes?: Record<string, unknown>;
  resources?: DownloadResource[];
  faqs?: FaqItem[];
  specificationFields?: SpecificationField[];
  variants?: ProductVariant[];
  relatedSeries?: RelatedSeriesItem[];
  category?: CategorySummary | null;
  family?: FamilySummary | null;
}

interface ProductPageClientProps {
  product: ProductPageData;
}

const relatedSeriesDescriptions: Record<RelatedSeriesLabel, string> = {
  "Single Crimp": "Simpler insulated construction for standard wiring and cost-focused projects.",
  "Heat Shrink": "Sealed insulation path for moisture, vibration, and harsher installation environments.",
  Nylon: "Abrasion-resistant insulation option for higher heat and tougher handling conditions.",
  "Non Insulated": "Base copper terminal series for low-cost assemblies or separate insulation processes.",
};

function RelatedSeriesSection({ items }: { items: RelatedSeriesItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="related-series" className="py-6 md:py-10 border-b border-border">
      <div className="container">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Related Series
            </p>
            <h2 className="text-2xl font-semibold md:text-3xl">Series Options</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-secondary md:text-right">
            Compare nearby ring terminal series by crimp structure, insulation material, and protection level.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {items.map((item, index) => (
            <Link
              key={item._id}
              href={familyUrl(item.slug)}
              className="group relative min-h-[190px] overflow-hidden rounded-sm border border-border bg-white p-4 transition-colors hover:border-primary dark:bg-slate-900"
            >
              {item.image && (
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-24 bg-cover bg-center opacity-15 transition-opacity group-hover:opacity-25"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              )}
              <div className="relative flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="inline-flex min-h-8 items-center rounded-sm border border-border bg-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
                    {item.relationLabel}
                  </span>
                  {index < items.length - 1 && (
                    <ArrowRight className="hidden h-4 w-4 shrink-0 text-secondary md:block" />
                  )}
                </div>

                <h3 className="line-clamp-2 text-lg font-semibold leading-6 transition-colors group-hover:text-primary">
                  {item.name}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-secondary">
                  {item.summary || relatedSeriesDescriptions[item.relationLabel]}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
                  View Series
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const {
    heroTitle,
    heroSummary,
    primaryCTA,
    secondaryCTA,
    faqItems,
    showDownloads,
    showFaq,
    showInquiry,
  } = resolveProductPageViewModel(product);
  const breadcrumbItems = [
    { label: "Categories", href: categoriesUrl() },
    { label: product.category?.name || "Category", href: categoryUrl(product.category?.slug || "") },
    ...(product.family
      ? [{ label: product.family.name, href: familyUrl(product.family.slug) }]
      : []),
    { label: product.shortTitle || product.title },
  ];

  const visualMediaItems = normalizeVisualMediaItems({
    mediaItems: product.mediaItems,
    primaryUrl: product.mainImage,
    gallery: product.gallery,
    defaultAlt: product.shortTitle || product.title,
  });



  const variantFields = (product.specificationFields || []).filter(
    (field: SpecificationField) =>
      (product.variants || []).some(
        (variant: ProductVariant) =>
          variant.attributes?.[field.fieldKey] !== undefined &&
          variant.attributes?.[field.fieldKey] !== null &&
          variant.attributes?.[field.fieldKey] !== ""
      )
  );
  const hasVariants = (product.variants || []).length > 0 && variantFields.length > 0;
  const hasResources = showDownloads && (product.resources || []).length > 0;
  const keySpecifications = buildProductKeySpecifications(product);
  const descriptionText = product.summary?.trim();
  const showProductOverview = Boolean(descriptionText);
  const relatedSeries = product.relatedSeries || [];
  const hasRelatedSeries = relatedSeries.length > 0;

  const mockRelatedProducts: RelatedProduct[] = [];

  return (
    <>
      <div className="hidden border-b border-border bg-muted md:block">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="py-6 md:py-10 bg-muted border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
            <div className="rounded-sm border border-border bg-white p-2 sm:p-4 md:p-5">
              <ImageGallery
                images={visualMediaItems.map((item) => ({
                  url: item.url,
                  alt: item.alt,
                }))}
                alt={product.shortTitle || product.title}
              />
            </div>

            <div className="rounded-sm border border-border bg-white p-4 md:p-8">
              {(product.skuCode || product.model) && (
                <p className="mb-2 break-all text-xs text-secondary md:text-sm">
                  {product.skuCode || product.model}
                </p>
              )}
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Product Detail
              </p>
              <h1 className="mb-4 text-2xl font-semibold leading-tight md:text-4xl">{heroTitle}</h1>

              {heroSummary && (
                <p className="mb-4 text-base leading-7 text-secondary md:text-lg">{heroSummary}</p>
              )}

              {keySpecifications.length > 0 && (
                <div className="mb-4 border-y border-border py-4">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-secondary">Key Specifications</h3>
                  <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {keySpecifications.map((item) => (
                      <div key={item.label} className="min-w-0">
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                          {item.label}
                        </dt>
                        <dd className="mt-2 flex flex-wrap gap-2">
                          {item.values.map((value) => (
                            <span
                              key={value}
                              className="inline-flex min-h-8 items-center rounded-sm border border-border bg-muted px-2.5 py-1 text-sm font-semibold leading-5 text-foreground"
                            >
                              {value}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {product.featureBullets && product.featureBullets.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Features</h3>
                  <ul className="space-y-2">
                    {product.featureBullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm leading-6">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href={primaryCTA.href} className="btn btn-primary w-full justify-center sm:w-auto">
                  {primaryCTA.label}
                </a>
                {secondaryCTA && (
                  <Link href={secondaryCTA.href} className="btn btn-secondary w-full justify-center sm:w-auto">
                    {secondaryCTA.label}
                  </Link>
                )}
              </div>

              {product.packageInfo && (
                <div className="mt-6 rounded-sm border border-border bg-muted px-3 py-2 text-sm text-secondary">
                  <strong>Packaging:</strong> {product.packageInfo}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 md:hidden">
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2">
                {showProductOverview && (
                  <a href="#product-overview" className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                    Overview
                  </a>
                )}
                {hasRelatedSeries && (
                  <a href="#related-series" className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                    Series
                  </a>
                )}

                {hasVariants && (
                  <a href="#variant-matrix" className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                    Variants
                  </a>
                )}
                {hasResources && (
                  <a href="#documentation" className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                    Docs
                  </a>
                )}

                {showFaq && (
                  <a href="#technical-faq" className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                    FAQ
                  </a>
                )}
                {showInquiry && (
                  <a href="#inquiry-form" className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                    Quote
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showProductOverview && (
        <section id="product-overview" className="py-6 md:py-10 scroll-mt-24 border-b border-border">
          <div className="container">
            <div className="max-w-4xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Product Overview
              </p>
              <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Description</h2>
              <p className="text-base leading-7 text-secondary md:text-lg">
                {descriptionText}
              </p>
            </div>
          </div>
        </section>
      )}

      {hasVariants && (
        <section id="variant-matrix" className="py-6 md:py-10 scroll-mt-24 border-y border-border">
          <div className="container">
            <div className="max-w-7xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Variant Matrix
              </p>
              <h2 className="mb-3 text-2xl font-semibold md:text-3xl">Specification Table</h2>
              <p className="text-secondary mb-5">
                Select the exact item number from the specification rows below when requesting a quote.
              </p>
              <VariantTable variants={product.variants || []} fields={variantFields} />
            </div>
          </div>
        </section>
      )}

      {hasResources && (
        <section id="documentation" className="py-6 md:py-10 scroll-mt-24 border-y border-border bg-slate-50 dark:bg-slate-950/50">
          <div className="container">
            <div className="w-full border border-border bg-white p-4 md:p-5 dark:bg-slate-900">
              <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                Engineering Resources
              </h2>
              <p className="mb-4 text-sm font-medium text-secondary">
                Technical catalogs, selection guides and application documents.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(product.resources || []).map((resource, index) => (
                  <a
                    key={resource._id || index}
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between border border-border bg-slate-50 p-3 hover:border-primary dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white border border-border dark:bg-slate-700">
                        <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                          {resource.title}
                        </span>
                        <span className="text-xs text-secondary mt-0.5">
                          {resource.version ? `v${resource.version}` : 'Latest'} · PDF
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Download className="h-4 w-4 text-primary" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {hasRelatedSeries && <RelatedSeriesSection items={relatedSeries} />}



      {showFaq && (
        <section id="technical-faq" className="py-6 md:py-10 scroll-mt-24 bg-muted border-y border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Technical FAQ
              </p>
              <h2 className="mb-5 text-2xl font-semibold md:text-3xl">Frequently Asked Questions</h2>
              <FAQAccordion items={faqItems} />
            </div>
          </div>
        </section>
      )}

      {mockRelatedProducts.length > 0 && (
        <section className="py-6 md:py-10 bg-muted">
          <div className="container">
            <h2 className="text-3xl font-semibold mb-5">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockRelatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  slug={relatedProduct.slug}
                  title={relatedProduct.title}
                  shortTitle={relatedProduct.shortTitle}
                  mainImage={relatedProduct.mainImage}
                  summary={relatedProduct.summary}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {showInquiry && (
        <section id="inquiry-form" className="py-6 md:py-10">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="mb-5 text-center">
                <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Request a Quote</h2>
                <p className="text-secondary">
                  Fill out the form below and our sales team will respond as soon as possible.
                </p>
              </div>
              <InquiryForm
                sourceType="product"
                sourceId={product._id}
                productName={product.shortTitle || product.title}
              />
            </div>
          </div>
        </section>
      )}

    </>
  );
}
