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

type KeySpecificationItem = {
  label: string;
  values: string[];
};

function uniqueValues(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function splitSpecificationList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => splitSpecificationList(item));
  }

  if (value === undefined || value === null) {
    return [];
  }

  return String(value)
    .split(/[\n,;|]+/)
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

function isMeaningfulRange(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === "number" && Number.isFinite(item)) &&
    !(value[0] === 0 && value[1] === 0)
  );
}

function formatAwgValue(value: string) {
  const normalized = value
    .replace(/^awg\s*/i, "")
    .replace(/\s*awg$/i, "")
    .replace(/\s*-\s*/g, "-")
    .trim();

  return normalized ? `${normalized} AWG` : "";
}

function formatNumberLabel(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function formatMaxCurrentValue(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value ?? "").replace(/[^\d.]/g, ""));

  if (Number.isFinite(numericValue) && numericValue > 0) {
    return `up to ${formatNumberLabel(numericValue)}A`;
  }

  const textValue = String(value ?? "").trim();
  if (!textValue) {
    return "";
  }

  return textValue.toLowerCase().startsWith("up to")
    ? textValue
    : `up to ${textValue.replace(/\s*a$/i, "A")}`;
}

function getField(fields: SpecificationField[] | undefined, fieldKey: string) {
  return fields?.find((field) => field.fieldKey === fieldKey);
}

function getVariantAttributeValues(product: ProductPageData, fieldKey: string) {
  return (product.variants || []).map((variant) => variant.attributes?.[fieldKey]);
}

function buildWireSizeValues(product: ProductPageData) {
  const productAwgValues = uniqueValues(
    splitSpecificationList(product.attributes?.awg_range)
      .map(formatAwgValue)
      .filter(Boolean)
  );

  if (productAwgValues.length > 0) {
    return productAwgValues;
  }

  const variantAwgValues = uniqueValues(
    getVariantAttributeValues(product, "awg_range")
      .flatMap(splitSpecificationList)
      .map(formatAwgValue)
      .filter(Boolean)
  );

  if (variantAwgValues.length > 0) {
    return variantAwgValues;
  }

  const wireRangeField = getField(product.specificationFields, "wire_range_mm2");
  const productWireRange = product.attributes?.wire_range_mm2;
  if (isMeaningfulRange(productWireRange)) {
    return [formatAttributeValue(productWireRange, wireRangeField)];
  }

  return uniqueValues(
    getVariantAttributeValues(product, "wire_range_mm2")
      .filter(isMeaningfulRange)
      .map((value) => formatAttributeValue(value, wireRangeField))
  );
}

function buildStudSizeValues(product: ProductPageData) {
  const productStudValues = uniqueValues(
    splitSpecificationList(product.attributes?.stud_size_american)
  );

  if (productStudValues.length > 0) {
    return productStudValues;
  }

  const variantStudEntries = (product.variants || [])
    .map((variant, index) => ({
      label: splitSpecificationList(variant.attributes?.stud_size_american)[0],
      metric:
        typeof variant.attributes?.stud_size_metric_mm === "number"
          ? variant.attributes.stud_size_metric_mm
          : undefined,
      index,
    }))
    .filter((entry) => entry.label);

  const uniqueEntries = Array.from(
    variantStudEntries
      .reduce((map, entry) => {
        const key = entry.label.toLowerCase();
        const existing = map.get(key);
        if (!existing || (entry.metric ?? Infinity) < (existing.metric ?? Infinity)) {
          map.set(key, entry);
        }
        return map;
      }, new Map<string, (typeof variantStudEntries)[number]>())
      .values()
  );

  const sortedAmericanValues = uniqueEntries
    .sort((left, right) => {
      if (left.metric !== undefined && right.metric !== undefined) {
        return left.metric - right.metric;
      }
      if (left.metric !== undefined) return -1;
      if (right.metric !== undefined) return 1;
      return left.index - right.index;
    })
    .map((entry) => entry.label);

  if (sortedAmericanValues.length > 0) {
    return sortedAmericanValues;
  }

  const metricField = getField(product.specificationFields, "stud_size_metric_mm");
  const productMetricStud = product.attributes?.stud_size_metric_mm;
  if (typeof productMetricStud === "number" && productMetricStud > 0) {
    return [formatAttributeValue(productMetricStud, metricField)];
  }

  return uniqueValues(
    getVariantAttributeValues(product, "stud_size_metric_mm")
      .filter((value): value is number => typeof value === "number" && value > 0)
      .sort((left, right) => left - right)
      .map((value) => formatAttributeValue(value, metricField))
  );
}

function buildMaxCurrentValues(product: ProductPageData) {
  const productCurrent = product.attributes?.max_current_a;
  const productCurrentLabel = formatMaxCurrentValue(productCurrent);

  if (productCurrentLabel) {
    return [productCurrentLabel];
  }

  const maxCurrent = Math.max(
    ...getVariantAttributeValues(product, "max_current_a").filter(
      (value): value is number => typeof value === "number" && value > 0
    )
  );

  return Number.isFinite(maxCurrent) ? [formatMaxCurrentValue(maxCurrent)] : [];
}

function buildKeySpecifications(product: ProductPageData): KeySpecificationItem[] {
  return [
    {
      label: "Supported Wire Sizes",
      values: buildWireSizeValues(product),
    },
    {
      label: "Supported Stud Sizes",
      values: buildStudSizeValues(product),
    },
    {
      label: "Max Current",
      values: buildMaxCurrentValues(product),
    },
  ].filter((item) => item.values.length > 0);
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
  const keySpecifications = buildKeySpecifications(product);

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

              {keySpecifications.length > 0 && (
                <div className="mb-6 border-y border-border py-4">
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
              <VariantTable variants={product.variants || []} fields={variantFields} />
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
                <Link href="/contact#request-quote" className="btn btn-secondary">
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
