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

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="section bg-muted border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 items-center">
            <div className="rounded-sm border border-border bg-white p-5 md:p-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Product Family
              </p>
              <h1 className="mb-6 text-3xl font-semibold md:text-5xl">{family.name}</h1>
              {heroIntro && (
                <p className="text-lg text-secondary mb-6">{heroIntro}</p>
              )}
              <div className="flex flex-wrap gap-4">
                <Link href={primaryCTA.href} className="btn btn-primary">
                  {primaryCTA.label}
                </Link>
                <Link href={secondaryCTA.href} className="btn btn-secondary">
                  {secondaryCTA.label}
                </Link>
              </div>
            </div>

            {heroImageUrl && (
              <div className="relative h-72 overflow-hidden rounded-sm border border-border bg-white p-4 sm:h-96">
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

      {showOverview && (overviewIntro || overviewDetails.length > 0) && (
        <section className="section">
          <div className="container">
            <div className="max-w-4xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Overview
              </p>
              <h2 className="mb-6 text-2xl font-semibold md:text-3xl">Series Overview</h2>
              <div className="space-y-4">
                {overviewIntro && (
                  <p className="text-lg text-secondary whitespace-pre-line">{overviewIntro}</p>
                )}
                {overviewDetails.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`} className="text-secondary whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {showFeatures && featuresList && featuresList.length > 0 && (
        <section className="section border-y border-border">
          <div className="container">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Feature Highlights
            </p>
            <h2 className="mb-8 text-center text-2xl font-semibold md:text-3xl">Key Features</h2>
            {featuresIntro && (
              <p className="mx-auto mb-6 max-w-3xl text-center text-secondary whitespace-pre-line">
                {featuresIntro}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuresList.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                  </div>
                  <p className="text-foreground">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showApplications && applicationsList.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Applications
              </p>
              <h2 className="mb-6 text-2xl font-semibold md:text-3xl">Applications</h2>
              {applicationsIntro && (
                <p className="mb-6 text-secondary whitespace-pre-line">{applicationsIntro}</p>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {applicationsList.map((application, index) => (
                  <div
                    key={`${application}-${index}`}
                    className="rounded-sm border border-border bg-white px-4 py-3"
                  >
                    {application}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {showSelectionGuide && (selectionGuideIntro || selectionGuideSteps.length > 0) && (
        <section className="section bg-muted">
          <div className="container">
            <div className="max-w-4xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Selection Guide
              </p>
              <h2 className="mb-6 text-2xl font-semibold md:text-3xl">Selection Guide</h2>
              <div className="space-y-4">
                {selectionGuideIntro && (
                  <p className="text-secondary whitespace-pre-line">{selectionGuideIntro}</p>
                )}
                {selectionGuideSteps.length > 0 && (
                  <ol className="space-y-3">
                    {selectionGuideSteps.map((step, index) => (
                      <li key={`${step}-${index}`} className="flex gap-3 text-secondary">
                        <span className="font-semibold text-foreground">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {showTechnicalNote && technicalNotes.length > 0 && (
        <section className="section border-y border-border">
          <div className="container">
            <div className="max-w-4xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Technical Notes
              </p>
              <h2 className="mb-6 text-2xl font-semibold md:text-3xl">Technical Notes</h2>
              <div className="space-y-3">
                {technicalNotes.map((note, index) => (
                  <p key={`${note}-${index}`} className="text-secondary whitespace-pre-line">
                    {note}
                  </p>
                ))}
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
