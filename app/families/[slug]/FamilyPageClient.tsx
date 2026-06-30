import { Breadcrumb, SKUTable, FAQAccordion, DownloadCard, CTABanner } from "@/components/shared";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Download, FileText } from "lucide-react";
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
import ExpandableHeroIntro from "./ExpandableHeroIntro";
import QuickSelectButton from "./QuickSelectButton";

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
  | { type: "divider" }
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

    if (/^([-*_])(?:\s*\1){2,}$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "divider" });
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

        if (block.type === "divider") {
          return <hr key={`${block.type}-${index}`} className="border-border" />;
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

function includesAny(sourceText: string, tokens: string[]) {
  return tokens.some((token) => sourceText.includes(token));
}

function addUnique(items: string[], item: string | undefined) {
  if (item && !items.includes(item)) {
    items.push(item);
  }
}

function getMaterialSearchText(
  sourceText: string,
  attributes?: Record<string, unknown>
) {
  return [
    getAttributeValue(attributes, ["material", "conductor", "insulation"]),
    sourceText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasTinPlating(sourceText: string) {
  return /\btin(?:ned)?\b|\btin[-\s]?plated\b/.test(sourceText);
}

function inferMaterialLabel(
  sourceText: string,
  attributes?: Record<string, unknown>,
  options?: {
    preferInsulation?: boolean;
  }
) {
  const materialText = getMaterialSearchText(sourceText, attributes);

  if (!options?.preferInsulation && materialText.includes("copper")) return "Copper";
  if (!options?.preferInsulation && materialText.includes("brass")) return "Brass";
  if (materialText.includes("pvc")) return "PVC";
  if (materialText.includes("heat shrink") || materialText.includes("heat-shrink")) return "Heat shrink";
  if (materialText.includes("nylon")) return "Nylon";
  if (materialText.includes("copper")) return "Copper";
  if (materialText.includes("brass")) return "Brass";
  return undefined;
}

function deriveQuickFacts({
  sourceLines,
  attributes,
}: {
  sourceLines: string[];
  attributes?: Record<string, unknown>;
}) {
  const sourceText = sourceLines.join(" ").toLowerCase();
  const quickFacts: string[] = [];
  const isSleeveFamily = includesAny(sourceText, ["terminal sleeve", "terminal sleeves", "sleeve"]);
  const isRingFamily = includesAny(sourceText, ["ring terminal", "ring terminals", "wire-to-stud"]);
  const isForkFamily = includesAny(sourceText, ["fork terminal", "fork terminals"]);
  const materialText = getMaterialSearchText(sourceText, attributes);

  if (isSleeveFamily) {
    addUnique(quickFacts, "Wire-end protection");
  }
  if (isRingFamily) {
    addUnique(quickFacts, "Wire-to-stud connection");
  }
  if (isForkFamily) {
    addUnique(quickFacts, "Open fork installation");
  }
  if (sourceText.includes("angled")) {
    addUnique(quickFacts, "Angled routing support");
  }
  if (sourceText.includes("brazed") || sourceText.includes("seam")) {
    addUnique(quickFacts, "Brazed seam structure");
  }
  if (!isSleeveFamily && materialText.includes("copper")) {
    addUnique(quickFacts, "Copper material");
  }
  if (!isSleeveFamily && materialText.includes("brass")) {
    addUnique(quickFacts, "Brass material");
  }
  if (materialText.includes("pvc")) {
    addUnique(quickFacts, "PVC insulation");
  }
  if (materialText.includes("heat shrink") || materialText.includes("heat-shrink")) {
    addUnique(quickFacts, "Heat shrink insulation");
  }
  if (materialText.includes("nylon")) {
    addUnique(quickFacts, "Nylon insulation");
  }
  if (sourceText.includes("insulation") || sourceText.includes("insulated")) {
    addUnique(quickFacts, "Insulation coverage");
  }
  if (sourceText.includes("color-coded") || sourceText.includes("color coded")) {
    addUnique(quickFacts, "Color-coded identification");
  }
  if (sourceText.includes("flexible")) {
    addUnique(quickFacts, "Flexible sleeve fit");
  }
  if (sourceText.includes("industrial") || sourceText.includes("control panel")) {
    addUnique(quickFacts, "Industrial wiring use");
  }

  const fallbackFacts = isSleeveFamily
    ? ["Wire-end protection", "Insulation coverage", "Sleeve size matching", "Industrial wiring use"]
    : isRingFamily
      ? ["Wire-to-stud connection", "Closed-ring retention", "Stud size matching", "Crimp termination"]
      : ["Product size matching", "Industrial wiring use", "Application-specific selection", "Specification review"];

  for (const fallbackFact of fallbackFacts) {
    addUnique(quickFacts, fallbackFact);
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
  const isSleeveFamily = includesAny(sourceText, ["terminal sleeve", "terminal sleeves", "sleeve"]);
  const isRingFamily = includesAny(sourceText, ["ring terminal", "ring terminals", "wire-to-stud"]);
  const isForkFamily = includesAny(sourceText, ["fork terminal", "fork terminals"]);
  const materialLabel = inferMaterialLabel(sourceText, attributes, {
    preferInsulation: isSleeveFamily,
  });
  const materialAttribute = getAttributeValue(
    attributes,
    isSleeveFamily ? ["material", "insulation"] : ["material", "conductor"]
  );
  const materialFromAttribute =
    !isSleeveFamily &&
    materialAttribute?.toLowerCase().includes("pvc") &&
    sourceText.includes("copper")
      ? "Copper"
      : materialAttribute;

  const material =
    materialFromAttribute ||
    materialLabel ||
    "See product table";
  const surface =
    getAttributeValue(attributes, ["surface", "plating", "finish"]) ||
    (hasTinPlating(sourceText)
      ? "Tin-plated"
      : isSleeveFamily || sourceText.includes("insulation") || sourceText.includes("insulated")
        ? "Insulated finish"
        : "See product table");
  const connection =
    getAttributeValue(attributes, ["connection", "termination"]) ||
    (isSleeveFamily
      ? "Sleeve / wire protection"
      : sourceText.includes("crimp")
        ? "Crimp"
        : sourceText.includes("wire-to-stud")
          ? "Wire-to-stud"
          : "See product table");
  const structure =
    getAttributeValue(attributes, ["structure", "barrel", "seam", "angle"]) ||
    (isSleeveFamily
      ? "Flexible sleeve"
      : sourceText.includes("angled")
        ? "Angled barrel"
        : sourceText.includes("brazed") || sourceText.includes("seam")
          ? "Brazed barrel"
          : isRingFamily
            ? "Closed ring"
            : isForkFamily
              ? "Open fork"
              : "See product table");
  const application = sourceText.includes("wire-to-stud")
    ? "Wire-to-stud"
    : isSleeveFamily
      ? "Wire insulation"
      : applicationTags[0] || "Industrial wiring";

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
  const fullHeroIntro = normalizeText(heroIntro || overviewParagraphs[0] || family.summary || "");
  const specSourceAttributes = family.products?.find(
    (product) => product.attributes && Object.keys(product.attributes).length > 0
  )?.attributes;
  const quickFactSourceLines = [
    family.name,
    heroIntro || "",
    ...overviewParagraphs,
    ...compactFeatures,
    ...compactTechnicalNotes,
  ];
  const quickFacts = deriveQuickFacts({
    sourceLines: quickFactSourceLines,
    attributes: specSourceAttributes,
  });
  const quickSpecs = resolveQuickSpecs({
    sourceLines: quickFactSourceLines,
    applicationTags,
    attributes: specSourceAttributes,
  });
  const hasOverviewAndFeatures =
    (showOverview && overviewParagraphs.length > 0) || (showFeatures && compactFeatures.length > 0);
  const hasSelectionAndTechnical =
    (showSelectionGuide && (selectionGuideIntro || selectionStepsForRender.length > 0)) ||
    (showTechnicalNote && compactTechnicalNotes.length > 0);
  const availableProducts = family.products ?? [];
  const hasAvailableProducts = availableProducts.length > 0;
  const documentationSectionId = "documentation";
  const downloadResources = family.resources || [];
  const hasDownloadResources = showDownloads && downloadResources.length > 0;
  const heroSecondaryCTA = hasDownloadResources
    ? { label: "Download Documentation", href: `#${documentationSectionId}` }
    : secondaryCTA;

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
              {fullHeroIntro && (
                <ExpandableHeroIntro text={fullHeroIntro} preview={compactHeroIntro} />
              )}
              <div className="flex flex-wrap gap-3">
                <Link href={primaryCTA.href} className="btn btn-primary">
                  {primaryCTA.label}
                </Link>
                <Link href={heroSecondaryCTA.href} className="btn btn-secondary">
                  {hasDownloadResources && <Download className="h-4 w-4" />}
                  {heroSecondaryCTA.label}
                </Link>
                {hasAvailableProducts && (
                  <QuickSelectButton targetId="available-products" />
                )}
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
            <div className="mb-8 max-w-3xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Overview + Key Features
              </p>
              <h2 className="text-2xl font-semibold md:text-3xl">Overview + Key Features</h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {showOverview && overviewParagraphs.length > 0 && (
                <div>
                  <h3 className="mb-4 text-xl font-semibold">Overview</h3>
                  <div className="space-y-4">
                    {overviewParagraphs.map((paragraph, index) => (
                      <p key={`${paragraph}-${index}`} className="text-secondary leading-7">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {showFeatures && compactFeatures.length > 0 && (
                <div>
                  <h3 className="mb-4 text-xl font-semibold">Key Features</h3>
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
              )}
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
              <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Quick Specs</h2>
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

      {hasAvailableProducts && (
        <section id="available-products" className="section scroll-mt-24">
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
            <SKUTable skus={availableProducts} />
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

      {showBottomCta && (
        <CTABanner
          title="Need More Information?"
          titleAs="p"
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

      {showDownloads && (
        <section id={documentationSectionId} className="py-6 md:py-10 scroll-mt-24">
          <div className="container">
            <div className="w-full border border-border bg-white p-4 md:p-5 dark:bg-slate-900">
              <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                Engineering Resources
              </h2>
              <p className="mb-4 text-sm text-secondary">
                Download available catalogs, datasheets, certificates, and CAD files for this family.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {downloadResources.map((resource) => {
                  const extension = resource.fileUrl.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)?.[1]?.toUpperCase() || "FILE";
                  return (
                    <div 
                      key={resource._id} 
                      className="group flex items-center justify-between border border-slate-200 bg-white p-2 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      {/* Left: Icon & Title */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-800">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="truncate font-medium text-slate-900 group-hover:text-primary transition-colors dark:text-slate-100 text-sm">
                          {resource.title}
                        </span>
                      </div>
                      
                      {/* Right: Version & Download */}
                      <div className="flex items-center gap-4 shrink-0 pl-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {resource.version ? `v${resource.version} · ` : ""}{extension}
                        </span>
                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                          aria-label={`Download ${resource.title}`}
                        >
                          <Download className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
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

    </>
  );
}
