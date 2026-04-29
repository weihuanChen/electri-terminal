import { Breadcrumb, CTABanner, ImagePreview, MarkdownRenderer } from "@/components/shared";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { shouldBypassNextImageOptimization } from "@/lib/images";
import { productUrl } from "@/lib/routes";
import GithubSlugger from "github-slugger";

interface RelatedProduct {
  _id: string;
  slug: string;
  title: string;
  model?: string;
  shortTitle?: string;
  mainImage?: string;
  summary?: string;
}

interface RelatedArticle {
  _id: string;
  slug: string;
  title: string;
  type: "blog" | "guide" | "faq" | "application";
  excerpt?: string;
  createdAt: number;
  publishedAt?: number;
}

export interface ArticlePageData {
  _id: string;
  title: string;
  type: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  createdAt: number;
  publishedAt?: number;
  relatedProducts?: RelatedProduct[];
}

interface ArticlePageClientProps {
  article: ArticlePageData;
  slug: string;
  relatedArticles?: RelatedArticle[];
}

interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

interface MarkdownSection {
  headingTitle?: string;
  headingId?: string;
  content: string;
}

type SectionProductKey = "ring" | "spade" | "disconnect" | "insulation" | "wire-size";

interface FallbackLink {
  slug: string;
  label: string;
  mainImage: string;
}

interface SectionProductConfig {
  headingTerms: string[];
  productTerms: string[];
  viewAllHref: string;
  viewAllLabel: string;
  fallbackProducts: FallbackLink[];
}

const FALLBACK_TOC_ITEMS: TocItem[] = [
  { id: "introduction", title: "Introduction", level: 2 },
  { id: "key-features", title: "Key Features", level: 2 },
  { id: "benefits", title: "Benefits", level: 2 },
  { id: "conclusion", title: "Conclusion", level: 2 },
];

const QUICK_JUMP_RULES: Array<{ label: string; terms: string[] }> = [
  { label: "Ring", terms: ["ring terminal"] },
  { label: "Spade", terms: ["spade", "fork terminal"] },
  { label: "Disconnect", terms: ["disconnect", "slip-on"] },
  { label: "Insulation", terms: ["insulation", "heat shrink", "nylon", "pvc"] },
  { label: "Wire Size", terms: ["wire gauge", "wire size", "awg"] },
];

const ARTICLE_TYPE_LABEL: Record<RelatedArticle["type"], string> = {
  blog: "Blog",
  guide: "Guide",
  faq: "FAQ",
  application: "Application",
};

const SECTION_PRODUCT_CONFIG: Record<SectionProductKey, SectionProductConfig> = {
  ring: {
    headingTerms: ["ring terminal"],
    productTerms: ["ring terminal", "ring terminals", "rnb", "rv", "rny", "rve", "rhb"],
    viewAllHref: "/categories/ring-terminals",
    viewAllLabel: "View All Ring Terminals",
    fallbackProducts: [
      {
        slug: "non-insulated-ring-terminals-g01",
        label: "RNB Series Ring Terminals (RNB0.5-2 to RNB3.5-8)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-non-insulated-ring-terminal-rnb-g01-rnb0-5-2.webp",
      },
      {
        slug: "non-insulated-ring-terminals-g02",
        label: "RNB Series Ring Terminals (RNB5.5-10 to RNB8-8)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-non-insulated-ring-terminal-rnb-g02.webp",
      },
      {
        slug: "90-degree-non-insulated-ring-terminals-g01",
        label: "90D-RNB Ring Terminals (90D-RNB1.25-10 to 90D-RNB8-8)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-90-degree-non-insulated-ring-terminal-page-018-g01.webp",
      },
    ],
  },
  spade: {
    headingTerms: ["spade", "fork terminal"],
    productTerms: ["spade", "fork terminal", "sv", "snb"],
    viewAllHref: "/categories/spade-terminals",
    viewAllLabel: "View All Spade & Fork Terminals",
    fallbackProducts: [
      {
        slug: "non-insulated-spade-terminals-g01",
        label: "Non-Insulated Spade Terminals (RNB125-10 to RNB180-8)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-non-insulated-spade-terminal-rnb-g01.webp",
      },
      {
        slug: "vinyl-insulated-spade-terminals-g01",
        label: "Vinyl-Insulated Spade Terminals (SV0.5-2 to SV8-8)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-vinyl-insulated-ring-terminal-sv-g03-sv0-5-2.webp",
      },
      {
        slug: "nylon-insulated-spade-terminals-g01",
        label: "Nylon-Insulated Spade Terminals (SNY1.25-3.2 to SNY8-8)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-nylon-insulated-ring-terminal-sny-g03-sny1-25-3-2.webp",
      },
    ],
  },
  disconnect: {
    headingTerms: ["disconnect", "slip-on"],
    productTerms: ["disconnect", "slip-on", "blade terminal", "quick disconnect"],
    viewAllHref: "/categories/quick-disconnect-terminals",
    viewAllLabel: "View All Quick Disconnect Terminals",
    fallbackProducts: [
      {
        slug: "vinyl-insulated-female-quick-disconnects-g01",
        label: "Vinyl-Insulated Female Quick Disconnects (FDV1.25-1105 to FDV5.5-375)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-brass-vinyl-insulated-female-quick-disconnects-fdv-g01.webp",
      },
      {
        slug: "nylon-insulated-female-quick-disconnects-g01",
        label: "Nylon-Insulated Female Quick Disconnects (FDNY1.25-1105 to FDNY5.5-375)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-brass-nylon-insulated-female-quick-disconnects-fdny-g01.webp",
      },
      {
        slug: "fdh-heat-shrink-female-terminals-g01",
        label: "FDH Heat Shrink Female Terminals (FDH1.25-1105 to FDH5.5-375)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-brass-fdh-heat-shrink-female-terminal-fdh-g01.webp",
      },
    ],
  },
  insulation: {
    headingTerms: ["insulation", "heat shrink", "nylon", "pvc"],
    productTerms: ["heat shrink", "nylon", "pvc", "insulated"],
    viewAllHref: "/selection-guide",
    viewAllLabel: "View Insulation Selection Guide",
    fallbackProducts: [
      {
        slug: "vinyl-insulated-spade-terminals-g01",
        label: "PVC Insulated Spade Terminals (SV0.5-2 to SV8-8)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-vinyl-insulated-ring-terminal-sv-g03-sv0-5-2.webp",
      },
      {
        slug: "nylon-insulated-female-quick-disconnects-g01",
        label: "Nylon Insulated Female Disconnects (FDNY1.25-1105 to FDNY5.5-375)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-brass-nylon-insulated-female-quick-disconnects-fdny-g01.webp",
      },
      {
        slug: "fdh-heat-shrink-female-terminals-g01",
        label: "Heat Shrink Female Terminals (FDH1.25-1105 to FDH5.5-375)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-brass-fdh-heat-shrink-female-terminal-fdh-g01.webp",
      },
    ],
  },
  "wire-size": {
    headingTerms: ["wire gauge", "wire size", "awg"],
    productTerms: ["awg", "gauge", "wire size", "stud"],
    viewAllHref: "/selection-guide",
    viewAllLabel: "View Wire Size Matching Guide",
    fallbackProducts: [
      {
        slug: "non-insulated-ring-terminals-g01",
        label: "Small Gauge Range (RNB0.5-2 to RNB3.5-8)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-non-insulated-ring-terminal-rnb-g01-rnb0-5-2.webp",
      },
      {
        slug: "non-insulated-ring-terminals-g03",
        label: "Large Gauge Range (RNB14-10 to RNB60-8S)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-non-insulated-ring-terminal-rnb-g03-rnb14-10.webp",
      },
      {
        slug: "double-crimp-vinyl-fully-insulated-female-quick-disconnects-g01",
        label: "Double Crimp Insulated Disconnects (RVD1.25-10 to RVD5.5-8)",
        mainImage:
          "https://assets.electriterminal.com/products/v3/webp/tinned-copper-double-crimp-vinyl-fully-insulated-female-quick-disconnects-rvd-g01.webp",
      },
    ],
  },
};

function normalizeHeadingText(rawHeading: string) {
  return rawHeading
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim();
}

function hasAnyTerm(text: string, terms: string[]) {
  const normalized = text.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function compactMarkdownParagraphs(content: string) {
  const blocks = content.split(/\n{2,}/);
  const compacted: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) {
      continue;
    }

    if (
      /^(```|#{1,6}\s|[-*+]\s|\d+\.\s|>\s|\|)/m.test(trimmed) ||
      trimmed.includes("\n")
    ) {
      compacted.push(trimmed);
      continue;
    }

    if (trimmed.length < 240) {
      compacted.push(trimmed);
      continue;
    }

    const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length < 3) {
      compacted.push(trimmed);
      continue;
    }

    let chunk = "";
    for (const sentence of sentences) {
      const candidate = chunk ? `${chunk} ${sentence}` : sentence;
      if (candidate.length > 180) {
        compacted.push(chunk || sentence);
        chunk = chunk ? sentence : "";
      } else {
        chunk = candidate;
      }
    }

    if (chunk) {
      compacted.push(chunk);
    }
  }

  return compacted.join("\n\n");
}

function extractMarkdownToc(content: string): TocItem[] {
  const lines = content.split(/\r?\n/);
  const slugger = new GithubSlugger();
  const tocItems: TocItem[] = [];
  let insideCodeFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      insideCodeFence = !insideCodeFence;
      continue;
    }

    if (insideCodeFence) {
      continue;
    }

    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) {
      continue;
    }

    const level = match[1].length as 2 | 3;
    const title = normalizeHeadingText(match[2]);
    if (!title) {
      continue;
    }

    tocItems.push({
      id: slugger.slug(title),
      title,
      level,
    });
  }

  return tocItems;
}

function splitMarkdownIntoSections(content: string): MarkdownSection[] {
  const lines = content.split(/\r?\n/);
  const slugger = new GithubSlugger();
  const sections: MarkdownSection[] = [];
  let currentLines: string[] = [];
  let currentHeadingTitle: string | undefined;
  let currentHeadingId: string | undefined;
  let insideCodeFence = false;

  const pushCurrentSection = () => {
    const sectionContent = currentLines.join("\n").trim();
    if (!sectionContent) {
      return;
    }

    sections.push({
      headingTitle: currentHeadingTitle,
      headingId: currentHeadingId,
      content: sectionContent,
    });
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      insideCodeFence = !insideCodeFence;
      currentLines.push(line);
      continue;
    }

    const headingMatch = !insideCodeFence ? /^(#{2,3})\s+(.+)$/.exec(line.trim()) : null;
    if (headingMatch) {
      pushCurrentSection();
      currentLines = [line];
      currentHeadingTitle = normalizeHeadingText(headingMatch[2]);
      currentHeadingId = currentHeadingTitle ? slugger.slug(currentHeadingTitle) : undefined;
      continue;
    }

    currentLines.push(line);
  }

  pushCurrentSection();
  return sections;
}

function resolveQuickJumpItems(tocItems: TocItem[]) {
  const quickItems = QUICK_JUMP_RULES.flatMap((rule) => {
    const matched = tocItems.find((item) => hasAnyTerm(item.title, rule.terms));

    if (!matched) {
      return [];
    }

    return [{ label: rule.label, id: matched.id }];
  });

  if (quickItems.length > 0) {
    return quickItems;
  }

  return tocItems
    .slice(0, 5)
    .map((item) => ({ label: item.title, id: item.id }));
}

function resolveSectionProductKey(headingTitle?: string): SectionProductKey | null {
  if (!headingTitle) {
    return null;
  }

  if (hasAnyTerm(headingTitle, SECTION_PRODUCT_CONFIG.ring.headingTerms)) {
    return "ring";
  }

  if (hasAnyTerm(headingTitle, SECTION_PRODUCT_CONFIG.spade.headingTerms)) {
    return "spade";
  }

  if (hasAnyTerm(headingTitle, SECTION_PRODUCT_CONFIG.disconnect.headingTerms)) {
    return "disconnect";
  }

  if (hasAnyTerm(headingTitle, SECTION_PRODUCT_CONFIG.insulation.headingTerms)) {
    return "insulation";
  }

  if (hasAnyTerm(headingTitle, SECTION_PRODUCT_CONFIG["wire-size"].headingTerms)) {
    return "wire-size";
  }

  return null;
}

function matchProductsBySection(
  products: RelatedProduct[],
  sectionKey: SectionProductKey
): RelatedProduct[] {
  const terms = SECTION_PRODUCT_CONFIG[sectionKey].productTerms;
  return products.filter((product) => {
    const source = [product.title, product.shortTitle, product.summary].filter(Boolean).join(" ");
    return hasAnyTerm(source, terms);
  });
}

function InlineRelatedProducts({
  sectionKey,
  products,
}: {
  sectionKey: SectionProductKey;
  products: RelatedProduct[];
}) {
  const config = SECTION_PRODUCT_CONFIG[sectionKey];
  const topProducts = products.slice(0, 3);
  const fallbackProducts = config.fallbackProducts
    .filter((item) => !topProducts.some((product) => product.slug === item.slug))
    .map((item, index) => ({
      _id: `fallback-${sectionKey}-${index}`,
      slug: item.slug,
      title: item.label,
      mainImage: item.mainImage,
    }));
  const displayProducts = [...topProducts, ...fallbackProducts].slice(0, 3);

  return (
    <div className="mt-5 rounded-sm border border-border bg-muted p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
        Related Products
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {displayProducts.map((product) => (
          <Link
            key={`${sectionKey}-${product.slug}`}
            href={productUrl(product.slug)}
            className="group overflow-hidden rounded-sm border border-border bg-background transition-colors hover:border-primary"
          >
            <div className="relative h-24 bg-muted">
              {product.mainImage ? (
                <Image
                  src={product.mainImage}
                  alt={product.shortTitle || product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 260px"
                  unoptimized={shouldBypassNextImageOptimization(product.mainImage)}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                    Product
                  </span>
                </div>
              )}
            </div>
            <div className="px-3 py-3">
              <p className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {product.shortTitle || product.title}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href={config.viewAllHref}
        className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
      >
        {config.viewAllLabel}
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Link>
    </div>
  );
}

function rankSectionKeysByArticle(article: ArticlePageData): SectionProductKey[] {
  const sourceText = [article.title, article.excerpt, article.content, article.type]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const ranked = (Object.entries(SECTION_PRODUCT_CONFIG) as Array<
    [SectionProductKey, SectionProductConfig]
  >)
    .map(([sectionKey, config]) => {
      const keywordMatches = [...config.headingTerms, ...config.productTerms].reduce(
        (count, term) => (sourceText.includes(term) ? count + 1 : count),
        0
      );
      return { sectionKey, score: keywordMatches };
    })
    .sort((left, right) => right.score - left.score)
    .map((item) => item.sectionKey);

  if (ranked.length === 0) {
    return ["ring", "spade"];
  }

  return ranked;
}

function buildFallbackRelatedProducts(article: ArticlePageData): RelatedProduct[] {
  const resolvedSectionKeys = rankSectionKeysByArticle(article).slice(0, 2);

  const dedupedProducts = new Map<string, RelatedProduct>();
  for (const sectionKey of resolvedSectionKeys) {
    for (const fallbackProduct of SECTION_PRODUCT_CONFIG[sectionKey].fallbackProducts) {
      if (dedupedProducts.has(fallbackProduct.slug)) {
        continue;
      }

      dedupedProducts.set(fallbackProduct.slug, {
        _id: `fallback-${fallbackProduct.slug}`,
        slug: fallbackProduct.slug,
        title: fallbackProduct.label,
        mainImage: fallbackProduct.mainImage,
      });

      if (dedupedProducts.size >= 4) {
        return Array.from(dedupedProducts.values());
      }
    }
  }

  return Array.from(dedupedProducts.values());
}

export default function ArticlePageClient({ article, slug, relatedArticles }: ArticlePageClientProps) {
  const isWireTerminalGuide = slug === "wire-terminal-types-guide";
  const normalizedContent = article.content
    ? isWireTerminalGuide
      ? compactMarkdownParagraphs(article.content)
      : article.content
    : undefined;

  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    { label: article.type, href: `/blog?type=${article.type}` },
    { label: article.title },
  ];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const tocItems = normalizedContent ? extractMarkdownToc(normalizedContent) : FALLBACK_TOC_ITEMS;
  const quickJumpItems = isWireTerminalGuide ? resolveQuickJumpItems(tocItems) : [];
  const ringJumpTarget = quickJumpItems.find((item) => item.label === "Ring");
  const markdownSections = normalizedContent ? splitMarkdownIntoSections(normalizedContent) : [];
  const summaryInsertIndex =
    markdownSections.length > 0 ? Math.floor((markdownSections.length - 1) / 2) : 0;
  const firstRelatedInsertIndex =
    markdownSections.length > 0 ? Math.floor((markdownSections.length - 1) * 0.25) : 0;
  const secondRelatedInsertIndex =
    markdownSections.length > 1
      ? Math.min(
          markdownSections.length - 1,
          Math.max(
            firstRelatedInsertIndex + 1,
            Math.ceil((markdownSections.length - 1) * 0.75)
          )
        )
      : firstRelatedInsertIndex;

  const relatedProducts = article.relatedProducts ?? [];
  const fallbackRelatedProducts = buildFallbackRelatedProducts(article);
  const resolvedLegacyRelatedProducts =
    relatedProducts.length > 0 ? relatedProducts : fallbackRelatedProducts;
  const rankedSectionKeys = rankSectionKeysByArticle(article);
  const firstRelatedSectionKey: SectionProductKey = rankedSectionKeys[0] ?? "ring";
  const secondRelatedSectionKey: SectionProductKey =
    rankedSectionKeys.find((key) => key !== firstRelatedSectionKey) ??
    (firstRelatedSectionKey === "ring" ? "spade" : "ring");
  const firstRelatedProducts = matchProductsBySection(
    resolvedLegacyRelatedProducts,
    firstRelatedSectionKey
  );
  const secondRelatedProducts = matchProductsBySection(
    resolvedLegacyRelatedProducts,
    secondRelatedSectionKey
  );
  const resolvedRelatedArticles = (relatedArticles ?? []).filter((item) => item.slug !== slug).slice(0, 3);
  const usedSectionKeys = new Set<SectionProductKey>();
  const sectionRenderData = markdownSections.map((section) => {
    if (!isWireTerminalGuide) {
      return {
        section,
        sectionKey: null as SectionProductKey | null,
        matchedProducts: [] as RelatedProduct[],
      };
    }

    const sectionKey = resolveSectionProductKey(section.headingTitle);
    if (!sectionKey || usedSectionKeys.has(sectionKey)) {
      return {
        section,
        sectionKey: null as SectionProductKey | null,
        matchedProducts: [] as RelatedProduct[],
      };
    }

    usedSectionKeys.add(sectionKey);
    return {
      section,
      sectionKey,
      matchedProducts: matchProductsBySection(resolvedLegacyRelatedProducts, sectionKey),
    };
  });
  const eligibleProductSectionIndexes = sectionRenderData
    .map((item, index) => (item.sectionKey ? index : -1))
    .filter((index) => index >= 0);
  const inlineProductInsertIndexes = (() => {
    if (eligibleProductSectionIndexes.length <= 2) {
      return new Set(eligibleProductSectionIndexes);
    }

    return new Set([
      eligibleProductSectionIndexes[0],
      eligibleProductSectionIndexes[eligibleProductSectionIndexes.length - 1],
    ]);
  })();

  return (
    <>
      <div className="hidden border-b border-border bg-muted md:block">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="section-compact border-y border-border bg-muted">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              {article.type && (
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  {article.type}
                </span>
              )}
            </div>

            <h1 className="mb-4 text-3xl font-semibold leading-tight md:mb-5 md:text-5xl">
              {article.title}
            </h1>

            <p className="max-w-4xl text-base leading-7 text-secondary md:text-lg md:leading-8">
              {isWireTerminalGuide
                ? "Compare terminal types quickly, avoid selection mistakes, and match wire size and insulation with confidence."
                : article.excerpt}
            </p>

            {isWireTerminalGuide && (
              <>
                <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <li className="inline-flex items-start gap-2 rounded-sm border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Compare terminal types quickly</span>
                  </li>
                  <li className="inline-flex items-start gap-2 rounded-sm border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Avoid common selection mistakes</span>
                  </li>
                  <li className="inline-flex items-start gap-2 rounded-sm border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Match wire size and insulation correctly</span>
                  </li>
                </ul>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={ringJumpTarget ? `#${ringJumpTarget.id}` : "#article-content"}
                    className="btn btn-primary btn-sm"
                  >
                    View Matching Products
                  </Link>
                  <Link href="/selection-guide" className="btn btn-secondary btn-sm">
                    Selection Guide
                  </Link>
                </div>
              </>
            )}

            <div className="mt-6 grid gap-3 text-sm text-secondary sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-sm border border-border bg-muted px-3 py-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-sm border border-border bg-muted px-3 py-2">
                <Clock className="h-4 w-4" />
                <span>5 min read</span>
              </div>
              <div className="flex items-center gap-2 rounded-sm border border-border bg-muted px-3 py-2">
                <User className="h-4 w-4" />
                <span>Electri Terminal Team</span>
              </div>
            </div>

            {article.coverImage && (
              <div className="relative mt-6 h-52 overflow-hidden rounded-sm border border-border sm:h-72 md:h-[21rem]">
                <ImagePreview
                  src={article.coverImage}
                  alt={article.title}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 64rem"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {isWireTerminalGuide && quickJumpItems.length > 0 && (
        <section className="border-b border-border bg-white">
          <div className="container py-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
                Jump to:
              </span>
              {quickJumpItems.map((item) => (
                <a
                  key={`quick-${item.id}`}
                  href={`#${item.id}`}
                  className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-primary hover:text-primary"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section pt-8">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-10">
            <div className="order-2 xl:order-1" id="article-content">
              {tocItems.length > 0 && (
                <details className="card mb-6 overflow-hidden lg:hidden">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold">
                    On This Page
                  </summary>
                  <nav className="space-y-1 border-t border-border px-4 py-3">
                    {tocItems.map((item) => (
                      <a
                        key={`mobile-${item.id}`}
                        href={`#${item.id}`}
                        className={[
                          "block text-sm text-secondary hover:text-primary",
                          item.level === 3 ? "pl-3" : "",
                        ].join(" ")}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </details>
              )}

              <div className="max-w-none">
                {normalizedContent && sectionRenderData.length > 0 ? (
                  <div className="space-y-8">
                    {sectionRenderData.map(({ section, sectionKey, matchedProducts }, index) => (
                      <div key={`${section.headingId || "section"}-${index}`}>
                        <MarkdownRenderer content={section.content} className="article-markdown" />

                        {index === summaryInsertIndex && (
                          <div className="mt-6 rounded-sm border border-primary/40 bg-muted p-4 sm:p-5">
                            <h3 className="text-lg font-semibold text-foreground">
                              How to Choose (Quick Guide)
                            </h3>
                            <ol className="mt-3 grid gap-2 text-sm text-secondary sm:grid-cols-2">
                              <li>1. Match wire size</li>
                              <li>2. Select terminal type</li>
                              <li>3. Choose insulation</li>
                              <li>4. Confirm stud size</li>
                            </ol>
                            <Link
                              href="/selection-guide"
                              className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
                            >
                              Go to Selection Tool (Selection Guide)
                              <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Link>
                          </div>
                        )}

                        {isWireTerminalGuide && sectionKey && inlineProductInsertIndexes.has(index) && (
                          <InlineRelatedProducts sectionKey={sectionKey} products={matchedProducts} />
                        )}

                        {!isWireTerminalGuide && index === firstRelatedInsertIndex && (
                          <InlineRelatedProducts
                            sectionKey={firstRelatedSectionKey}
                            products={firstRelatedProducts}
                          />
                        )}

                        {!isWireTerminalGuide && index === secondRelatedInsertIndex && (
                          <InlineRelatedProducts
                            sectionKey={secondRelatedSectionKey}
                            products={secondRelatedProducts}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 text-foreground leading-relaxed">
                    <p id="introduction">
                      This is a comprehensive guide about {article.title.toLowerCase()}. In this article,
                      we&apos;ll explore the key aspects, features, and benefits that you need to know.
                    </p>

                    {!isWireTerminalGuide && (
                      <InlineRelatedProducts
                        sectionKey={firstRelatedSectionKey}
                        products={firstRelatedProducts}
                      />
                    )}

                    <h2 id="key-features" className="text-2xl font-semibold mt-8 mb-4">
                      Key Features
                    </h2>
                    <p>
                      Understanding the essential features is crucial for making informed decisions.
                      Here are the main characteristics that set this solution apart.
                    </p>

                    <div className="mt-6 rounded-sm border border-primary/40 bg-muted p-4 sm:p-5">
                      <h3 className="text-lg font-semibold text-foreground">
                        How to Choose (Quick Guide)
                      </h3>
                      <ol className="mt-3 grid gap-2 text-sm text-secondary sm:grid-cols-2">
                        <li>1. Match wire size</li>
                        <li>2. Select terminal type</li>
                        <li>3. Choose insulation</li>
                        <li>4. Confirm stud size</li>
                      </ol>
                      <Link
                        href="/selection-guide"
                        className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
                      >
                        Go to Selection Tool (Selection Guide)
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </div>

                    <h2 id="benefits" className="text-2xl font-semibold mt-8 mb-4">
                      Benefits
                    </h2>
                    <p>
                      Implementing this solution offers numerous advantages for your operations.
                      From improved efficiency to cost savings, the benefits are substantial.
                    </p>

                    {!isWireTerminalGuide && (
                      <InlineRelatedProducts
                        sectionKey={secondRelatedSectionKey}
                        products={secondRelatedProducts}
                      />
                    )}

                    <h2 id="conclusion" className="text-2xl font-semibold mt-8 mb-4">
                      Conclusion
                    </h2>
                    <p>
                      In conclusion, {article.title} represents an excellent choice for your needs.
                      If you have any questions or would like to learn more, please don&apos;t hesitate to
                      contact our team.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {tocItems.length > 0 && (
              <aside className="order-1 xl:order-2">
                <div className="sticky top-24 rounded-sm border border-border bg-white p-4">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
                    On This Page
                  </h3>
                  <nav className="space-y-2 border-l border-border pl-3">
                    {tocItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={[
                          "block text-sm text-secondary transition-colors hover:text-primary",
                          item.level === 3 ? "pl-3 text-[13px]" : "",
                        ].join(" ")}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="container">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold md:text-3xl">Related Articles</h2>
            <Link href="/blog" className="text-sm font-semibold text-primary hover:text-primary-dark">
              View all
            </Link>
          </div>
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
            {resolvedRelatedArticles.length > 0 ? (
              resolvedRelatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle._id}
                  href={`/blog/${relatedArticle.slug}`}
                  className="group block min-w-[230px] rounded-sm border border-border bg-white p-4 md:min-w-[260px]"
                >
                  <div>
                    <span className="text-xs font-semibold uppercase text-primary">
                      {ARTICLE_TYPE_LABEL[relatedArticle.type] ?? "Article"}
                    </span>
                    <h3 className="mt-2 line-clamp-2 text-base font-semibold group-hover:text-primary">
                      {relatedArticle.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-secondary">
                      {relatedArticle.excerpt ||
                        `Read the full ${ARTICLE_TYPE_LABEL[relatedArticle.type]?.toLowerCase() ?? "article"} for detailed technical guidance.`}
                    </p>
                    <p className="mt-3 text-xs text-secondary">
                      {formatDate(relatedArticle.publishedAt || relatedArticle.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <Link
                href="/blog"
                className="group block min-w-[230px] rounded-sm border border-border bg-white p-4 md:min-w-[260px]"
              >
                <div>
                  <span className="text-xs font-semibold uppercase text-primary">Article</span>
                  <h3 className="mt-2 text-base font-semibold group-hover:text-primary">
                    Browse More Technical Posts
                  </h3>
                  <p className="mt-2 text-sm text-secondary line-clamp-2">
                    Explore the latest guides, FAQs, and application notes in our knowledge base.
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      <CTABanner
        title="Need Help Selecting the Right Terminal?"
        description="Our team can recommend the exact model based on your application."
        primaryCTA={{
          label: "Request Quote",
          href: "/rfq",
        }}
        secondaryCTA={{
          label: "Talk to Engineer",
          href: "/contact",
        }}
      />
    </>
  );
}
