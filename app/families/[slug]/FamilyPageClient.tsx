import { Breadcrumb, SKUTable, FAQAccordion, CTABanner } from "@/components/shared";
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

      {/* 1. Hero - Primary Peak */}
      <section className="py-12 md:py-16 bg-muted border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
            <div className="flex flex-col justify-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Product Family
              </p>
              <h1 className="mb-5 text-3xl font-bold md:text-5xl text-slate-900 dark:text-slate-100">{family.name}</h1>
              {fullHeroIntro && (
                <div className="mb-6 text-lg text-slate-600 dark:text-slate-300">
                  <ExpandableHeroIntro text={fullHeroIntro} preview={compactHeroIntro} />
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Link href={primaryCTA.href} className="btn btn-primary">
                  {primaryCTA.label}
                </Link>
                <Link href={heroSecondaryCTA.href} className="btn btn-secondary">
                  {hasDownloadResources && <Download className="h-4 w-4 mr-2" />}
                  {heroSecondaryCTA.label}
                </Link>
                {hasAvailableProducts && (
                  <QuickSelectButton targetId="available-products" />
                )}
              </div>
            </div>

            {heroImageUrl && (
              <div className="relative min-h-[300px] overflow-hidden rounded-md border border-border bg-white shadow-sm p-4 sm:min-h-[380px]">
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
        </div>
      </section>

      {/* 2. Quick Facts - Scanning Bar */}
      {quickFacts.length > 0 && (
        <section className="py-4 md:py-6 border-b border-border bg-white">
          <div className="container">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {quickFacts.map((fact) => (
                <li key={fact} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 3. Engineering Reference (Specs, Workflow, Applications, Certification) */}
      {(quickSpecs.length > 0 || hasSelectionAndTechnical || (showApplications && applicationTags.length > 0) || certificationSupportItems.length > 0) && (
        <section className="py-8 md:py-12 bg-slate-50 border-b border-border dark:bg-slate-900/50">
          <div className="container">
            <h2 className="mb-6 text-xl font-bold md:text-2xl">Engineering Reference</h2>
            <div className="rounded-sm border border-border bg-white shadow-sm dark:bg-slate-900 overflow-visible flex flex-col">
              {/* Top Row: Specs & Workflow */}
              <div className="grid md:grid-cols-[35fr_65fr]">
                {/* Left: Specs (35%) */}
                {quickSpecs.length > 0 && (
                  <div className="p-6 lg:p-8 border-b md:border-b-0 md:border-r border-border">
                    <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-secondary">Specifications</h3>
                    <dl className="space-y-0">
                      {quickSpecs.map((spec, index) => (
                        <div key={spec.label} className="relative pl-8 pb-5 last:pb-0">
                          {index < quickSpecs.length - 1 && (
                            <div className="absolute left-[9px] top-5 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-700" />
                          )}
                          <div className="absolute left-0 top-1 h-5 w-5 rounded-full border-2 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800 z-10" />
                          <div>
                            <dt className="text-[11px] font-semibold uppercase tracking-wide text-secondary mb-0.5">{spec.label}</dt>
                            <dd className="text-sm font-medium text-foreground">{spec.value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {/* Right: Workflow (65%) */}
                {showSelectionGuide && selectionStepsForRender.length > 0 && (
                  <div className="p-6 lg:p-8">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">Selection Workflow</h3>
                    </div>
                    <div className="space-y-0">
                      {selectionStepsForRender.map((step, index) => {
                        const shortStep = step.split(':')[0].split('. ')[0].split(' - ')[0];
                        const finalStep = shortStep.split(' ').length > 6 ? shortStep.split(' ').slice(0, 6).join(' ') + '...' : shortStep;
                        return (
                          <div
                            key={`${step}-${index}`}
                            className="group relative pl-10 pb-5 outline-none last:pb-0"
                            tabIndex={0}
                            aria-label={step}
                          >
                            {index < selectionStepsForRender.length - 1 && (
                              <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-700" />
                            )}
                            <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 border-2 border-white ring-2 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-900 dark:ring-slate-700 z-10">
                              {index + 1}
                            </div>
                            <div className="pt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <span className="truncate">{finalStep}</span>
                              <div className="flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 group-hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:group-hover:bg-slate-600">
                                ?
                              </div>
                            </div>

                            {/* Custom Tooltip */}
                            <div className="pointer-events-none absolute left-10 top-7 z-50 w-max max-w-[240px] sm:max-w-[320px] md:max-w-md translate-y-1 rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-medium leading-5 text-slate-700 opacity-0 shadow-lg transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                              <div className="whitespace-normal break-words">{step}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              {((quickSpecs.length > 0 || showSelectionGuide) && ((showApplications && applicationTags.length > 0) || certificationSupportItems.length > 0)) && (
                <hr className="border-border" />
              )}

              {/* Middle Row: Applications */}
              {showApplications && applicationTags.length > 0 && (
                <div className="p-4 lg:px-8 lg:py-5 border-b border-border flex flex-col md:flex-row md:items-center gap-4 lg:gap-16">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-secondary whitespace-nowrap w-32 md:w-40 shrink-0">
                    Applications
                  </h3>
                  <div className="flex flex-wrap gap-2 items-center">
                    {applicationTags.map((application, index) => (
                      <span
                        key={`${application}-${index}`}
                        className="inline-flex rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {application}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Row: Certification */}
              {certificationSupportItems.length > 0 && (
                <div className="p-4 lg:px-8 lg:py-5 flex flex-col md:flex-row md:items-center gap-4 lg:gap-16">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-secondary whitespace-nowrap w-32 md:w-40 shrink-0">
                    Certification
                  </h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                    {certificationSupportItems.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. Available Products */}
      {hasAvailableProducts && (
        <section id="available-products" className="py-8 md:py-12 border-b border-border bg-white scroll-mt-24">
          <div className="container">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">Available Models</h2>
                <p className="mt-2 text-secondary">Select a product to view detailed specifications</p>
              </div>
            </div>
            <div className="rounded-md border border-border shadow-sm overflow-hidden">
              <SKUTable skus={availableProducts} />
            </div>
          </div>
        </section>
      )}

      {/* 5. Engineering Knowledge (Cards & Notes) */}
      {(hasOverviewAndFeatures || (showTechnicalNote && compactTechnicalNotes.length > 0) || (showLongform && longformMarkdown)) && (
        <section className="py-12 md:py-16 bg-slate-50 border-b border-border dark:bg-slate-900/50">
          <div className="container">
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Engineering Knowledge
              </p>
              <h2 className="text-2xl font-bold md:text-3xl">Engineering Overview</h2>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* Overview Reading Guide (What Is It / Why It Matters) */}
                {showOverview && overviewParagraphs.length > 0 && (
                  <div className="rounded-sm border border-border bg-white shadow-sm dark:bg-slate-900 flex flex-col">
                    {/* What Is It */}
                    <div className="p-6 lg:p-8">
                      <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        What Is It
                      </h3>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed max-w-3xl">
                        {overviewParagraphs[0]}
                      </p>
                    </div>

                    {/* Why It Matters (if second paragraph exists) */}
                    {overviewParagraphs.length > 1 && (
                      <>
                        <hr className="border-border mx-6 lg:mx-8" />
                        <div className="p-6 lg:p-8">
                          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Why It Matters
                          </h3>
                          <div className="space-y-4">
                            {overviewParagraphs.slice(1).map((paragraph, index) => (
                              <p key={index} className="text-sm text-secondary leading-relaxed max-w-3xl">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Longform Article (keep if exists, but styled more neatly) */}
                {showLongform && longformMarkdown && (
                  <div className="rounded-sm border border-border bg-white p-6 shadow-sm dark:bg-slate-900 prose prose-slate dark:prose-invert max-w-none text-sm">
                    <LongformMarkdown markdown={longformMarkdown} />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Features List as a block */}
                {showFeatures && compactFeatures.length > 0 && (
                  <div className="rounded-sm border border-border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h3 className="mb-4 text-lg font-bold">Key Features</h3>
                    {featuresIntro && (
                      <p className="mb-4 text-xs text-secondary">{featuresIntro}</p>
                    )}
                    <ul className="space-y-3">
                      {compactFeatures.map((feature, index) => (
                        <li key={`${feature}-${index}`} className="flex items-start gap-2 text-sm text-secondary">
                          <span className="mt-[7px] inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technical Notes as Callouts */}
                {showTechnicalNote && compactTechnicalNotes.length > 0 && (
                  <div className="rounded-sm border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/50 dark:bg-blue-900/10">
                    <h3 className="mb-3 text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Engineering Notes
                    </h3>
                    <ul className="space-y-3">
                      {compactTechnicalNotes.map((note, index) => (
                        <li key={`${note}-${index}`} className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
                          <span className="mt-[6px] inline-block h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}



      {/* 7. Engineering Resources (Downloads) - Moved Up! */}
      {showDownloads && hasDownloadResources && (
        <section id={documentationSectionId} className="py-8 md:py-10 bg-slate-50 border-b border-border dark:bg-slate-900/50 scroll-mt-24">
          <div className="container">
            <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              Engineering Resources
            </h2>
            <p className="mb-6 text-sm text-secondary">
              Download available catalogs, datasheets, certificates, and CAD files.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {downloadResources.map((resource) => {
                const extension = resource.fileUrl.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)?.[1]?.toUpperCase() || "FILE";
                return (
                  <div 
                    key={resource._id} 
                    className="group flex items-center justify-between rounded-sm border border-slate-200 bg-white p-3 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-all"
                  >
                    {/* Left: Icon & Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-slate-500 dark:bg-slate-800">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-900 group-hover:text-primary transition-colors dark:text-slate-100 text-sm">
                          {resource.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {resource.version ? `v${resource.version} · ` : ""}{extension}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Download */}
                    <div className="shrink-0 pl-3">
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                        aria-label={`Download ${resource.title}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. Related Resources & Media & FAQ */}
      {mediaItems.length > 0 && (
        <section className="py-10 md:py-16 bg-white border-b border-border">
          <div className="container">
            <h2 className="mb-6 text-xl font-bold md:text-2xl">Media Gallery</h2>
            <div className="space-y-8">
              {mediaSections.map((section) =>
                mediaGroups[section.key].length > 0 ? (
                  <div key={section.key}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">{section.title}</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {mediaGroups[section.key].map((item, index) => (
                        <div key={`${item.type}-${item.url}-${index}`} className="relative h-40 overflow-hidden rounded-sm border border-border bg-slate-50">
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

      {showRelatedLinks &&
        ((family.relatedCategories && family.relatedCategories.length > 0) ||
          (family.relatedFamilies && family.relatedFamilies.length > 0) ||
          (family.relatedArticles && family.relatedArticles.length > 0)) && (
          <section className="py-10 md:py-16 bg-slate-50 border-b border-border dark:bg-slate-900/50">
            <div className="container">
              <h2 className="mb-6 text-xl font-bold md:text-2xl">Related Resources</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {family.relatedCategories && family.relatedCategories.length > 0 && (
                  <div className="rounded-sm border border-border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h3 className="mb-3 text-sm font-semibold uppercase text-secondary">Categories</h3>
                    <div className="space-y-2">
                      {family.relatedCategories.map((item) => (
                        <Link
                          key={item._id}
                          href={categoryUrl(item.slug)}
                          className="block text-sm font-medium text-primary hover:underline"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {family.relatedFamilies && family.relatedFamilies.length > 0 && (
                  <div className="rounded-sm border border-border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h3 className="mb-3 text-sm font-semibold uppercase text-secondary">Families</h3>
                    <div className="space-y-2">
                      {family.relatedFamilies.map((item) => (
                        <Link
                          key={item._id}
                          href={familyUrl(item.slug)}
                          className="block text-sm font-medium text-primary hover:underline"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {family.relatedArticles && family.relatedArticles.length > 0 && (
                  <div className="rounded-sm border border-border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <h3 className="mb-3 text-sm font-semibold uppercase text-secondary">Articles</h3>
                    <div className="space-y-2">
                      {family.relatedArticles.map((item) => (
                        <Link
                          key={item._id}
                          href={`/blog/${item.slug}`}
                          className="block text-sm font-medium text-primary hover:underline"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      {showFaq && faqItems.length > 0 && (
        <section className="py-12 md:py-16 bg-white border-b border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary text-center">
                Technical FAQ
              </p>
              <h2 className="mb-8 text-2xl font-bold md:text-3xl text-center">Frequently Asked Questions</h2>
              <FAQAccordion items={faqItems} />
            </div>
          </div>
        </section>
      )}

      {/* 9. CTA Banner */}
      {showBottomCta && (
        <div className="py-4">
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
        </div>
      )}
    </>
  );
}
