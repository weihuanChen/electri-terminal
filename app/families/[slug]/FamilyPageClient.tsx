import { Breadcrumb, SKUTable, FAQAccordion, DownloadCard, CTABanner } from "@/components/shared";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import {
  resolveFamilyPageViewModel,
  resolveFamilyPrimaryImage,
  resolveFamilyPrimaryImageAlt,
} from "@/lib/familyPage";
import { categoryUrl, familyUrl } from "@/lib/routes";
import { shouldBypassNextImageOptimization } from "@/lib/images";
import {
  groupMediaItemsByType,
  normalizeVisualMediaItems,
  type VisualMediaItem,
} from "@/lib/productPresentation";

interface CategorySummary {
  slug?: string;
  name?: string;
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

interface EmbeddedFaqItem {
  question: string;
  answer: string;
}

interface SectionContent {
  intro?: string;
  items?: string[];
}

interface OverviewContent {
  intro?: string;
  details?: string[];
}

interface SelectionGuideContent {
  intro?: string;
  steps?: string[];
}

interface FamilyProduct {
  _id: string;
  slug: string;
  skuCode: string;
  model?: string;
  title: string;
  shortTitle?: string;
  attributes?: Record<string, unknown>;
  moq?: number;
  leadTime?: string;
}

interface LinkedCategory {
  _id: string;
  name: string;
  slug: string;
}

interface LinkedFamily {
  _id: string;
  name: string;
  slug: string;
}

interface LinkedArticle {
  _id: string;
  title: string;
  slug: string;
  type: "blog" | "guide" | "application";
}

export interface FamilyPageData {
  name: string;
  summary?: string;
  content?: string;
  manualHeroImage?: string;
  manualHeroImageAlt?: string;
  heroImage?: string;
  gallery?: string[];
  mediaItems?: VisualMediaItem[];
  highlights?: string[];
  resources?: DownloadResource[];
  faqs?: FaqItem[];
  products?: FamilyProduct[];
  category?: CategorySummary | null;
  pageConfig?: {
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
      noindex?: boolean;
      ogImage?: string;
    };
    content?: {
      heroIntro?: string;
      overview?: OverviewContent;
      features?: SectionContent;
      applications?: SectionContent;
      selectionGuide?: SelectionGuideContent | string;
      technicalNotes?: string[];
      overviewText?: string;
      featuresIntro?: string;
      featuresList?: string[];
      applicationsIntro?: string;
      applicationsList?: string[];
      technicalNote?: string;
    };
    longform?: {
      markdown?: string;
    };
    conversion?: {
      ctaPrimaryLabel?: string;
      ctaPrimaryHref?: string;
      ctaSecondaryLabel?: string;
      ctaSecondaryHref?: string;
      downloadsMode?: "auto" | "manual";
      pinnedDownloadIds?: string[];
    };
    seoBoost?: {
      faqMode?: "relation" | "embedded" | "mixed";
      embeddedFaqItems?: EmbeddedFaqItem[];
    };
    linking?: {
      relatedCategoryIds?: string[];
      relatedFamilyIds?: string[];
      relatedArticleIds?: string[];
    };
    display?: {
      showOverview?: boolean;
      showFeatures?: boolean;
      showApplications?: boolean;
      showSelectionGuide?: boolean;
      showTechnicalNote?: boolean;
      showLongform?: boolean;
      showDownloads?: boolean;
      showFaq?: boolean;
      showRelatedLinks?: boolean;
      showBottomCta?: boolean;
    };
  };
  relatedCategories?: LinkedCategory[];
  relatedFamilies?: LinkedFamily[];
  relatedArticles?: LinkedArticle[];
}

interface FamilyPageClientProps {
  family: FamilyPageData;
}

type MarkdownBlock =
  | { type: "heading"; text: string; level: 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    blocks.push({
      type: "paragraph",
      text: paragraphBuffer.join(" ").trim(),
    });
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer.length) return;
    blocks.push({
      type: "list",
      items: listBuffer,
    });
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.slice(3).trim(), level: 2 });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.slice(4).trim(), level: 3 });
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      listBuffer.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function LongformMarkdown({ markdown }: { markdown: string }) {
  const blocks = parseMarkdownBlocks(markdown);

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = block.level === 2 ? "h2" : "h3";
          return (
            <HeadingTag key={`${block.type}-${index}`} className="text-3xl font-semibold text-foreground">
              {block.text}
            </HeadingTag>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`} className="space-y-3 pl-5 text-secondary list-disc">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-secondary leading-7 whitespace-pre-line">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function compactSentence(value: string | undefined, maxWords = 28) {
  if (!value) return "";
  const normalized = normalizeText(value);
  if (!normalized) return "";

  const firstSentence = normalized.split(/(?<=[.!?])\s+/)[0] || normalized;
  const words = firstSentence.split(" ").filter(Boolean);
  if (words.length <= maxWords) {
    return firstSentence;
  }
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function compactBullet(value: string) {
  return normalizeText(value).replace(/^[•\-]\s*/, "").replace(/[.;]\s*$/, "");
}

function deriveQuickFacts(sourceLines: string[]) {
  const sourceText = sourceLines.join(" ").toLowerCase();
  const quickFacts: string[] = [];

  if (sourceText.includes("wire-to-stud")) {
    quickFacts.push("Wire-to-stud connection");
  }
  if (sourceText.includes("angled")) {
    quickFacts.push("Angled routing support");
  }
  if (sourceText.includes("brazed") || sourceText.includes("seam")) {
    quickFacts.push("Brazed seam structure");
  }
  if (sourceText.includes("copper")) {
    quickFacts.push("Copper material");
  }

  for (const fallbackFact of [
    "Wire-to-stud connection",
    "Angled routing support",
    "Brazed seam structure",
    "Copper material",
  ]) {
    if (!quickFacts.includes(fallbackFact)) {
      quickFacts.push(fallbackFact);
    }
  }

  return quickFacts.slice(0, 4);
}

function deriveApplicationTags(items: string[]) {
  const tags: string[] = [];

  for (const item of items) {
    const normalized = compactBullet(item);
    const lower = normalized.toLowerCase();
    let matched = false;

    if (lower.includes("control panel")) {
      tags.push("Control Panels");
      matched = true;
    }
    if (lower.includes("industrial")) {
      tags.push("Industrial Equipment");
      matched = true;
    }
    if (lower.includes("electrical equipment") || lower.includes("electrical installation")) {
      tags.push("Electrical Installations");
      matched = true;
    }
    if (lower.includes("maintenance")) {
      tags.push("Maintenance Access");
      matched = true;
    }

    if (!matched && normalized) {
      const compact = normalized
        .split(/\b(where|requiring|for)\b/i)[0]
        .trim()
        .replace(/[;,]\s*$/, "");
      if (compact) {
        tags.push(compact);
      }
    }
  }

  return tags.filter((tag, index, array) => array.indexOf(tag) === index);
}

function getAttributeValue(
  attributes: Record<string, unknown> | undefined,
  keyTokens: string[]
) {
  if (!attributes) return undefined;

  const entries = Object.entries(attributes);
  for (const [key, rawValue] of entries) {
    const lowerKey = key.toLowerCase();
    const matched = keyTokens.some((token) => lowerKey === token || lowerKey.includes(token));
    if (!matched) continue;

    if (rawValue === undefined || rawValue === null) continue;
    if (Array.isArray(rawValue)) {
      const values = rawValue.map((item) => String(item).trim()).filter(Boolean);
      if (values.length > 0) return values.join(", ");
      continue;
    }
    if (typeof rawValue === "object") continue;

    const text = String(rawValue).trim();
    if (text) return text;
  }

  return undefined;
}

function resolveQuickSpecs({
  sourceLines,
  applicationTags,
  attributes,
}: {
  sourceLines: string[];
  applicationTags: string[];
  attributes?: Record<string, unknown>;
}) {
  const sourceText = sourceLines.join(" ").toLowerCase();

  const material =
    getAttributeValue(attributes, ["material", "conductor"]) ||
    (sourceText.includes("copper") ? "Copper" : "Copper");
  const surface =
    getAttributeValue(attributes, ["surface", "plating", "finish"]) ||
    (sourceText.includes("tin") ? "Tin-plated" : "Refined matte finish");
  const connection =
    getAttributeValue(attributes, ["connection", "termination"]) ||
    (sourceText.includes("crimp") ? "Crimp" : "Crimp");
  const structure =
    getAttributeValue(attributes, ["structure", "barrel", "seam", "angle"]) ||
    (sourceText.includes("angled") ? "Angled barrel" : "Brazed seam barrel");
  const application = sourceText.includes("wire-to-stud") ? "Wire-to-stud" : applicationTags[0] || "Wire-to-stud";

  return [
    { label: "Material", value: material },
    { label: "Surface", value: surface },
    { label: "Connection", value: connection },
    { label: "Structure", value: structure },
    { label: "Application", value: application },
  ];
}

export default function FamilyPageClient({ family }: FamilyPageClientProps) {
  const breadcrumbItems = [
    { label: "Categories", href: "/categories" },
    { label: family.category?.name || "Category", href: categoryUrl(family.category?.slug || "") },
    { label: family.name },
  ];
  const mediaItems = normalizeVisualMediaItems({
    mediaItems: family.mediaItems,
    primaryUrl: family.heroImage,
    gallery: family.gallery,
    defaultAlt: family.name,
  });
  const heroImageUrl = resolveFamilyPrimaryImage(family);
  const heroImageAlt = resolveFamilyPrimaryImageAlt(family) || family.name;
  const mediaGroups = groupMediaItemsByType(mediaItems);
  const mediaSections = [
    { key: "product", title: "Product Images" },
    { key: "dimension", title: "Dimension Drawings" },
    { key: "packaging", title: "Packaging" },
    { key: "application", title: "Application Images" },
  ] as const;
  const certificationSupportItems = [
    "UL / cULus certified models available",
    "Test reports and certificates can be provided",
    "Custom certification support for bulk orders",
  ];
  const {
    heroIntro,
    overviewIntro,
    overviewDetails,
    featuresIntro,
    featuresList,
    applicationsIntro,
    applicationsList,
    selectionGuideIntro,
    selectionGuideSteps,
    technicalNotes,
    longformMarkdown,
    primaryCTA,
    secondaryCTA,
    showOverview,
    showFeatures,
    showApplications,
    showSelectionGuide,
    showTechnicalNote,
    showLongform,
    showDownloads,
    showFaq,
    showRelatedLinks,
    showBottomCta,
    faqItems,
  } = resolveFamilyPageViewModel({
    ...family,
    pageConfig: {
      ...family.pageConfig,
      content: {
        ...family.pageConfig?.content,
        features: {
          ...family.pageConfig?.content?.features,
          items:
            family.pageConfig?.content?.features?.items?.length
              ? family.pageConfig.content.features.items
              : family.pageConfig?.content?.featuresList?.length
                ? family.pageConfig.content.featuresList
                : family.highlights,
        },
      },
    },
  });
  const overviewParagraphs = [overviewIntro, ...overviewDetails]
    .map((paragraph) => normalizeText(paragraph || ""))
    .filter(Boolean)
    .slice(0, 2);
  const compactFeatures = (showFeatures ? featuresList || [] : [])
    .map((feature) => compactBullet(feature))
    .filter(Boolean)
    .slice(0, 6);
  const applicationTags = deriveApplicationTags(showApplications ? applicationsList : []);
  const compactSelectionSteps = (showSelectionGuide ? selectionGuideSteps : [])
    .map((step) => compactBullet(step))
    .filter(Boolean);
  const compactTechnicalNotes = (showTechnicalNote ? technicalNotes : [])
    .map((note) => compactBullet(note))
    .filter(Boolean)
    .slice(0, 5);
  const fallbackSelectionSteps = [
    "Match wire size (AWG/mm²)",
    "Confirm stud size",
    "Choose angle orientation",
    "Verify material and dimensions",
  ];
  const selectionStepsForRender =
    compactSelectionSteps.length > 0
      ? compactSelectionSteps
      : showSelectionGuide
        ? fallbackSelectionSteps
        : [];
  const compactHeroIntro = compactSentence(
    heroIntro || overviewParagraphs[0] || family.summary || "",
    26
  );
  const quickFacts = deriveQuickFacts([
    heroIntro || "",
    ...overviewParagraphs,
    ...compactFeatures,
    ...compactTechnicalNotes,
  ]);
  const specSourceAttributes = family.products?.find(
    (product) => product.attributes && Object.keys(product.attributes).length > 0
  )?.attributes;
  const quickSpecs = resolveQuickSpecs({
    sourceLines: [heroIntro || "", ...overviewParagraphs, ...compactFeatures, ...compactTechnicalNotes],
    applicationTags,
    attributes: specSourceAttributes,
  });
  const hasOverviewAndFeatures =
    (showOverview && overviewParagraphs.length > 0) || (showFeatures && compactFeatures.length > 0);
  const hasSelectionAndTechnical =
    (showSelectionGuide && (selectionGuideIntro || selectionStepsForRender.length > 0)) ||
    (showTechnicalNote && compactTechnicalNotes.length > 0);

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="section-compact bg-muted border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
            <div className="rounded-sm border border-border bg-white p-5 md:p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Product Family
              </p>
              <h1 className="mb-4 text-3xl font-semibold md:text-4xl">{family.name}</h1>
              {compactHeroIntro && (
                <p className="mb-5 text-base text-secondary">{compactHeroIntro}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <Link href={primaryCTA.href} className="btn btn-primary">
                  {primaryCTA.label}
                </Link>
                <Link href={secondaryCTA.href} className="btn btn-secondary">
                  {secondaryCTA.label}
                </Link>
              </div>
            </div>

            {heroImageUrl && (
              <div className="relative min-h-[260px] overflow-hidden rounded-sm border border-border bg-white p-4 sm:min-h-[320px]">
                <Image
                  src={heroImageUrl}
                  alt={heroImageAlt}
                  fill
                  unoptimized={shouldBypassNextImageOptimization(heroImageUrl)}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {quickFacts.length > 0 && (
            <div className="mt-4 rounded-sm border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Quick Facts
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {quickFacts.map((fact) => (
                  <li key={fact} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {hasOverviewAndFeatures && (
        <section className="section-compact border-y border-border">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                  Overview
                </p>
                <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Overview</h2>
                <div className="space-y-4">
                  {overviewParagraphs.map((paragraph, index) => (
                    <p key={`${paragraph}-${index}`} className="text-secondary leading-7">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                  Key Features
                </p>
                <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Key Features</h2>
                {featuresIntro && (
                  <p className="mb-4 text-sm text-secondary">{compactSentence(featuresIntro, 18)}</p>
                )}
                <ul className="space-y-3">
                  {compactFeatures.map((feature, index) => (
                    <li key={`${feature}-${index}`} className="flex items-start gap-2 text-secondary">
                      <span className="mt-[9px] inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {showApplications && applicationTags.length > 0 && (
        <section className="section-compact">
          <div className="container">
            <div className="rounded-sm border border-border bg-white p-5 md:p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Applications
              </p>
              <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Typical Applications</h2>
              {applicationsIntro && (
                <p className="mb-4 text-sm text-secondary">{compactSentence(applicationsIntro, 24)}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {applicationTags.map((application, index) => (
                  <span
                    key={`${application}-${index}`}
                    className="inline-flex rounded-full border border-border bg-muted px-4 py-2 text-sm text-foreground"
                  >
                    {application}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {quickSpecs.length > 0 && (
        <section className="section-compact border-y border-border bg-muted">
          <div className="container">
            <div className="rounded-sm border border-border bg-white p-5 md:p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Quick Specs
              </p>
              <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Quick Spec Summary</h2>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {quickSpecs.map((spec) => (
                  <div key={spec.label} className="rounded-sm border border-border bg-muted/60 p-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      <section className="section-compact">
        <div className="container">
          <div className="max-w-3xl rounded-sm border border-border bg-white p-5 md:p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Certification
            </p>
            <h2 className="mb-4 text-xl font-semibold md:text-2xl">Certification Support</h2>
            <ul className="space-y-3">
              {certificationSupportItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-secondary">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {hasSelectionAndTechnical && (
        <section className="section-compact bg-muted">
          <div className="container">
            <div className="rounded-sm border border-border bg-white p-5 md:p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Selection & Technical Guidance
              </p>
              <h2 className="mb-6 text-2xl font-semibold md:text-3xl">Selection & Technical Guidance</h2>
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Selection Steps</h3>
                  {selectionGuideIntro && (
                    <p className="mb-4 text-sm text-secondary">{compactSentence(selectionGuideIntro, 24)}</p>
                  )}
                  <ol className="space-y-3">
                    {selectionStepsForRender.map((step, index) => (
                      <li key={`${step}-${index}`} className="flex gap-3 text-secondary">
                        <span className="font-semibold text-foreground">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold">Technical Notes</h3>
                  <ul className="space-y-3">
                    {compactTechnicalNotes.map((note, index) => (
                      <li key={`${note}-${index}`} className="flex gap-2 text-secondary">
                        <span className="mt-[9px] inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {showLongform && longformMarkdown && (
        <section className="section bg-muted">
          <div className="container">
            <div className="max-w-4xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Technical Article
              </p>
              <LongformMarkdown markdown={longformMarkdown} />
            </div>
          </div>
        </section>
      )}

      {mediaItems.length > 0 && (
        <section className="section bg-muted">
          <div className="container">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Visual References
            </p>
            <h2 className="mb-8 text-2xl font-semibold md:text-3xl">Media</h2>
            <div className="space-y-10">
              {mediaSections.map((section) =>
                mediaGroups[section.key].length > 0 ? (
                  <div key={section.key}>
                    <h3 className="mb-4 text-xl font-semibold">{section.title}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {mediaGroups[section.key].map((item, index) => (
                        <div key={`${item.type}-${item.url}-${index}`} className="relative h-48 overflow-hidden rounded-sm border border-border bg-white">
                          <Image
                            src={item.url}
                            alt={item.alt || `${family.name} - ${section.title} ${index + 1}`}
                            fill
                            unoptimized={shouldBypassNextImageOptimization(item.url)}
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </section>
      )}

      {family.products && family.products.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Available Models
              </p>
              <h2 className="mb-2 text-2xl font-semibold md:text-3xl">Available Products</h2>
              <p className="text-secondary">
                Select a product to view detailed specifications
              </p>
            </div>
            <SKUTable skus={family.products} />
          </div>
        </section>
      )}

      {showDownloads && (
        <section className="section bg-muted">
          <div className="container">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Documentation
              </p>
              <h2 className="mb-8 text-2xl font-semibold md:text-3xl">Documentation Support</h2>
              <div className="space-y-4">
                {(family.resources || []).map((resource) => (
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

      {showFaq && faqItems.length > 0 && (
        <section className="section border-y border-border">
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

      {showRelatedLinks &&
        ((family.relatedCategories && family.relatedCategories.length > 0) ||
          (family.relatedFamilies && family.relatedFamilies.length > 0) ||
          (family.relatedArticles && family.relatedArticles.length > 0)) && (
          <section className="section bg-muted">
            <div className="container">
              <div className="max-w-5xl">
                <h2 className="mb-8 text-2xl font-semibold md:text-3xl">Related Resources</h2>
                <div className="grid gap-8 md:grid-cols-3">
                  {family.relatedCategories && family.relatedCategories.length > 0 && (
                    <div className="rounded-sm border border-border bg-white p-5">
                      <h3 className="mb-3 text-xl font-semibold">Related Categories</h3>
                      <div className="space-y-2">
                        {family.relatedCategories.map((item) => (
                          <Link
                            key={item._id}
                            href={categoryUrl(item.slug)}
                            className="block text-primary hover:underline"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {family.relatedFamilies && family.relatedFamilies.length > 0 && (
                    <div className="rounded-sm border border-border bg-white p-5">
                      <h3 className="mb-3 text-xl font-semibold">Related Families</h3>
                      <div className="space-y-2">
                        {family.relatedFamilies.map((item) => (
                          <Link
                            key={item._id}
                            href={familyUrl(item.slug)}
                            className="block text-primary hover:underline"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {family.relatedArticles && family.relatedArticles.length > 0 && (
                    <div className="rounded-sm border border-border bg-white p-5">
                      <h3 className="mb-3 text-xl font-semibold">Related Articles</h3>
                      <div className="space-y-2">
                        {family.relatedArticles.map((item) => (
                          <Link
                            key={item._id}
                            href={`/blog/${item.slug}`}
                            className="block text-primary hover:underline"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

      {showBottomCta && (
        <CTABanner
          title="Need More Information?"
          description="Our team is ready to help you find the right product for your application."
          variant="primary"
          primaryCTA={{
            label: secondaryCTA.label,
            href: secondaryCTA.href,
          }}
          secondaryCTA={{
            label: primaryCTA.label,
            href: primaryCTA.href,
          }}
        />
      )}

    </>
  );
}
