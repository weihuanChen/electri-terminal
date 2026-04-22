import {
  Breadcrumb,
  ImageGallery,
  SpecificationTable,
  VariantTable,
  DownloadCard,
  FAQAccordion,
  InquiryForm,
  ProductCard,
  CTABanner,
} from "@/components/shared";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { resolveProductPageViewModel } from "@/lib/productPage";
import { categoryUrl, familyUrl } from "@/lib/routes";
import {
  formatAttributeValue,
  normalizeVisualMediaItems,
  type VisualMediaItem,
} from "@/lib/productPresentation";

interface CategorySummary {
  slug?: string;
  name?: string;
}

interface FamilySummary {
  slug: string;
  name: string;
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

export interface ProductPageData {
  _id: string;
  title: string;
  shortTitle?: string;
  skuCode: string;
  model: string;
  summary?: string;
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
  category?: CategorySummary | null;
  family?: FamilySummary | null;
}

interface ProductPageClientProps {
  product: ProductPageData;
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
    showBottomCta,
  } = resolveProductPageViewModel(product);
  const breadcrumbItems = [
    { label: "Categories", href: "/categories" },
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

  const specGroups = new Map<string, Array<{
    label: string;
    value: unknown;
    displayPrecision?: number;
    unitKey?: "mm" | "mm2" | "g" | "kg" | "v" | "a" | "c" | "awg" | "nm" | "pcs";
    unit?: string;
    fieldType?: "string" | "number" | "boolean" | "enum" | "array" | "range";
  }>>();
  for (const field of product.specificationFields || []) {
    const value = product.attributes?.[field.fieldKey];
    if (value === undefined || value === null || value === "") {
      continue;
    }
    const groupName = field.groupName || "Technical Specifications";
    const group = specGroups.get(groupName) || [];
    group.push({
      label: field.label,
      value,
      displayPrecision: field.displayPrecision,
      unitKey: field.unitKey,
      unit: field.unit,
      fieldType: field.fieldType,
    });
    specGroups.set(groupName, group);
  }

  const specifications = [
    {
      groupName: "Basic Information",
      attributes: [
        { label: "Product Code", value: product.skuCode || product.model },
        ...(product.moq ? [{ label: "Minimum Order Quantity", value: product.moq }] : []),
        ...(product.leadTime ? [{ label: "Lead Time", value: product.leadTime }] : []),
        ...(product.origin ? [{ label: "Country of Origin", value: product.origin }] : []),
      ],
    },
    ...Array.from(specGroups.entries()).map(([groupName, attributes]) => ({
      groupName,
      attributes,
    })),
  ];

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

  const mockRelatedProducts: RelatedProduct[] = [];

  return (
    <>
      <div className="hidden border-b border-border bg-muted md:block">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="section bg-muted border-y border-border">
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
                <p className="mb-6 text-base leading-7 text-secondary md:text-lg">{heroSummary}</p>
              )}

              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="mb-6 rounded-sm border border-border bg-muted p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Key Specifications</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.entries(product.attributes)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div key={key} className="text-sm break-words">
                          <span className="text-secondary">
                            {key.replace(/_/g, " ")}:
                          </span>{" "}
                          <span className="font-medium">
                            {formatAttributeValue(
                              value,
                              product.specificationFields?.find((field) => field.fieldKey === key)
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {product.featureBullets && product.featureBullets.length > 0 && (
                <div className="mb-6">
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
                <a href="#technical-data" className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                  Specs
                </a>
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
                <a href="#compliance" className="rounded-sm border border-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                  Compliance
                </a>
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

      <section id="technical-data" className="section scroll-mt-24 bg-muted">
        <div className="container">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Technical Data
          </p>
          <h2 className="mb-8 text-2xl font-semibold md:text-3xl">Specifications</h2>
          <SpecificationTable specifications={specifications} />
        </div>
      </section>

      {hasVariants && (
        <section id="variant-matrix" className="section scroll-mt-24 border-y border-border">
          <div className="container">
            <div className="max-w-7xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Variant Matrix
              </p>
              <h2 className="mb-3 text-2xl font-semibold md:text-3xl">Specification Table</h2>
              <p className="text-secondary mb-8">
                Select the exact item number from the specification rows below when requesting a quote.
              </p>
              <VariantTable variants={product.variants} fields={variantFields} />
            </div>
          </div>
        </section>
      )}

      {hasResources && (
        <section id="documentation" className="section scroll-mt-24 bg-muted border-y border-border">
          <div className="container">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Documentation
              </p>
              <h2 className="mb-8 text-2xl font-semibold md:text-3xl">Documentation Support</h2>
              <div className="space-y-4">
                {(product.resources || []).map((resource) => (
                  <DownloadCard
                    key={resource._id}
                    title={resource.title}
                    type={resource.type}
                    fileUrl={resource.fileUrl}
                    previewImage={resource.previewImage}
                    fileSize={resource.fileSize}
                    language={resource.language}
                    version={resource.version}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="compliance" className="section scroll-mt-24">
        <div className="container">
          <div className="max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Compliance
            </p>
            <h2 className="mb-6 text-2xl font-semibold md:text-3xl">Compliance Support</h2>
            <div className="card p-6 md:p-8">
              <p className="text-secondary leading-relaxed">
                Certificates and compliance documents are available upon request for selected models.
                Please include the item numbers and project requirements when contacting our team.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contact" className="btn btn-primary">
                  Request Certificate Documents
                </Link>
                <Link href="/rfq" className="btn btn-secondary">
                  Submit RFQ with Item Numbers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showFaq && (
        <section id="technical-faq" className="section scroll-mt-24 bg-muted border-y border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Technical FAQ
              </p>
              <h2 className="mb-8 text-2xl font-semibold md:text-3xl">Frequently Asked Questions</h2>
              <FAQAccordion items={faqItems} />
            </div>
          </div>
        </section>
      )}

      {mockRelatedProducts.length > 0 && (
        <section className="section bg-muted">
          <div className="container">
            <h2 className="text-3xl font-semibold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <section id="inquiry-form" className="section">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 text-center">
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

      {showBottomCta && (
        <CTABanner
          title="Need Help Choosing?"
          description="Our team of experts is ready to help you find the perfect solution."
          variant="primary"
          primaryCTA={{
            label: "Contact Us",
            href: "/contact",
          }}
          secondaryCTA={{
            label: "Browse Products",
            href: categoryUrl(product.category?.slug || ""),
          }}
        />
      )}

    </>
  );
}
