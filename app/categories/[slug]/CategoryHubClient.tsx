import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Breadcrumb, CategoryCard, CTABanner } from "@/components/shared";
import { categoriesUrl, contactUrl, familyUrl, requestQuoteUrl } from "@/lib/routes";
import { shouldBypassNextImageOptimization } from "@/lib/images";
import type { Locale } from "@/lib/i18n/config";
import { resolveLocalizedPath } from "@/lib/i18n/urlResolver";

interface HubChildCategory {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  icon?: string;
  sortOrder?: number;
  pageConfig?: {
    content?: {
      summary?: string;
      heroIntro?: string;
    };
  };
}

interface HubFeaturedFamilyItem {
  familyId?: string;
  name: string;
  description?: string;
  image?: string;
  link: string;
}

interface HubTypeOverviewItem {
  name: string;
  description?: string;
  link?: string;
}

interface HubCategory {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  seoDescription?: string;
  children?: HubChildCategory[];
  pageConfig?: {
    content?: {
      summary?: string;
      heroIntro?: string;
      overview?: {
        intro?: string;
        keyPoints?: string[];
      };
      typesOverview?: HubTypeOverviewItem[];
      applications?: {
        intro?: string;
        items?: string[];
      };
      selectionGuide?: {
        intro?: string;
        steps?: string[];
      };
      featuredFamilies?: HubFeaturedFamilyItem[];
    };
  };
}

interface HubFamilyFallback {
  _id: string;
  slug: string;
  name: string;
  summary?: string;
  heroImage?: string;
}

interface CategoryHubClientProps {
  category: HubCategory;
  fallbackFamilies: HubFamilyFallback[];
  locale?: Locale;
}

type FeaturedCard = {
  key: string;
  name: string;
  description?: string;
  image?: string;
  href: string;
};

const FEATURED_KEYWORD_PRIORITY = [
  "ring",
  "heat shrink",
  "heat-shrink",
  "copper",
  "lug",
  "quick disconnect",
  "fork",
  "spade",
  "cord end",
  "blade",
  "pin",
  "flag",
] as const;

function getFeaturedKeywordPriority(name: string, href: string) {
  const normalized = `${name} ${href}`.toLowerCase();
  const index = FEATURED_KEYWORD_PRIORITY.findIndex((token) => normalized.includes(token));
  return index === -1 ? 999 : index;
}

export default function CategoryHubClient({
  category,
  fallbackFamilies,
  locale,
}: CategoryHubClientProps) {
  const urlOptions = locale ? { locale } : undefined;
  const breadcrumbItems = [
    { label: "Categories", href: categoriesUrl(urlOptions) },
    { label: category.name },
  ];

  const subCategories = [...(category.children ?? [])].sort((left, right) => {
    const sortOrderDelta = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    if (sortOrderDelta !== 0) {
      return sortOrderDelta;
    }

    return left.name.localeCompare(right.name);
  });

  const configuredFeatured = (category.pageConfig?.content?.featuredFamilies ?? [])
    .slice(0, 6)
    .map<FeaturedCard>((item, index) => ({
      key: item.familyId || `${item.name}-${index}`,
      name: item.name,
      description: item.description,
      image: item.image,
      href: item.link,
    }));

  const fallbackFeatured = [...fallbackFamilies]
    .sort((left, right) => {
      const leftHref = familyUrl(left.slug, urlOptions);
      const rightHref = familyUrl(right.slug, urlOptions);
      const priorityDelta =
        getFeaturedKeywordPriority(left.name, leftHref) -
        getFeaturedKeywordPriority(right.name, rightHref);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return left.name.localeCompare(right.name);
    })
    .slice(0, 6)
    .map<FeaturedCard>((family) => ({
      key: family._id,
      name: family.name,
      description: family.summary,
      image: family.heroImage,
      href: familyUrl(family.slug, urlOptions),
    }));

  const featuredCards = configuredFeatured.length > 0
    ? configuredFeatured.map((item) => ({
        ...item,
        href:
          locale && item.href.startsWith("/")
            ? resolveLocalizedPath(item.href, locale)
            : item.href,
      }))
    : fallbackFeatured;
  const heroOverviewIntro = category.pageConfig?.content?.overview?.intro?.trim();
  const heroIntroFallback =
    category.pageConfig?.content?.heroIntro?.trim() ||
    category.pageConfig?.content?.summary?.trim() ||
    category.description?.trim() ||
    "Explore terminal categories for dependable electrical termination across industrial applications.";
  const heroIntroText = heroOverviewIntro || heroIntroFallback;
  const heroImageUrl =
    "https://assets.electriterminal.com/factory/yellow-crimp-ring-terminals-insulated-connectors.webp";
  const heroTrustTags = [
    "High-Conductivity Copper",
    "Precision Crimp Geometry",
    "Strict Batch Quality Control",
  ];
  const defaultDefinition =
    "Electrical terminals are components used to connect wires and cables to electrical systems, ensuring safe and efficient current transmission.";
  const commonTypePoints =
    (category.pageConfig?.content?.typesOverview ?? [])
      .map((item) => {
        const name = item.name?.trim() || "";
        const description = item.description?.trim() || "";
        if (!name) {
          return "";
        }
        return description ? `${name} - ${description}` : name;
      })
      .filter(Boolean)
      .slice(0, 8) || [];
  const applicationPoints =
    (category.pageConfig?.content?.applications?.items ?? [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 8) || [];
  const selectionGuidePoints =
    (category.pageConfig?.content?.selectionGuide?.steps ?? [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 8) || [];

  const resolvedTypePoints =
    commonTypePoints.length > 0
      ? commonTypePoints
      : [
          "Ring terminals - for secure stud connections",
          "Fork terminals - for easy installation and removal",
          "Blade terminals - for flat quick connections",
          "Pin terminals - for terminal block insertion",
          "Splice connectors - for joining wires",
          "Cable lugs - for high-current applications",
        ];
  const resolvedApplicationPoints =
    applicationPoints.length > 0
      ? applicationPoints
      : [
          "Industrial equipment",
          "Automotive wiring systems",
          "Control panels",
          "Power distribution systems",
        ];
  const resolvedSelectionGuidePoints =
    selectionGuidePoints.length > 0
      ? selectionGuidePoints
      : [
          "Wire size",
          "Connection type",
          "Electrical load requirements",
          "Environmental conditions",
        ];
  const engineeringApplicationsIntro =
    "Electrical terminals are used to create secure wire connections in industrial equipment, control panels, and power distribution systems.";
  const applicationsIntroFromConfig = category.pageConfig?.content?.applications?.intro?.trim() || "";
  const shouldOverrideGenericApplicationsIntro =
    !applicationsIntroFromConfig ||
    applicationsIntroFromConfig.toLowerCase().includes("across industries") ||
    applicationsIntroFromConfig.toLowerCase().includes("safe, efficient, and durable wire connections");
  const resolvedApplicationsIntro = shouldOverrideGenericApplicationsIntro
    ? engineeringApplicationsIntro
    : applicationsIntroFromConfig;

  const definitionSection = {
    title: "What Are Electrical Terminals",
    paragraphs: [category.pageConfig?.content?.overview?.intro?.trim() || defaultDefinition],
    points: [] as string[],
  };
  const typesSection = {
    title: "Common Types of Terminals",
    paragraphs: [] as string[],
    points: resolvedTypePoints,
  };
  const applicationsSection = {
    title: "Applications",
    paragraphs: [resolvedApplicationsIntro],
    points: resolvedApplicationPoints,
  };
  const selectionGuideSection = {
    title: "How to Choose the Right Terminal",
    paragraphs: [category.pageConfig?.content?.selectionGuide?.intro?.trim() || "Choosing the right terminal depends on:"],
    points: resolvedSelectionGuidePoints,
  };

  const engineeringGuideSections = [typesSection, applicationsSection].filter((section) => section.paragraphs.length > 0 || section.points.length > 0);

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} locale={locale} />
        </div>
      </div>

      <section className="relative overflow-hidden border-y border-slate-800 bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(249,115,22,0.28),transparent_34%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_72%,rgba(59,130,246,0.2),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_100%)]" />
        </div>
        <div className="container relative py-10 md:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl text-slate-100">
              <p className="inline-flex rounded-sm border border-orange-300/35 bg-orange-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-orange-100">
                Industrial Terminal Manufacturing
              </p>
              <h1
                className="mt-4 text-3xl font-semibold leading-tight !text-white md:text-5xl"
                style={{ color: "#f8fafc", textShadow: "0 2px 14px rgba(0, 0, 0, 0.35)" }}
              >
                Electrical Terminals for Reliable Industrial Connections
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                {heroIntroText}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#terminal-subcategories" className="btn btn-primary">
                  Explore Terminal Types
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href={requestQuoteUrl(urlOptions)}
                  className="inline-flex items-center rounded-sm border border-slate-100/80 bg-slate-900/70 px-5 py-3 text-sm font-semibold !text-[#3B82F6] transition-colors hover:border-orange-200 hover:bg-slate-900"
                >
                  Request Quote
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {heroTrustTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-slate-200/25 bg-slate-900/45 px-3 py-1.5 text-xs font-medium text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[20px] bg-gradient-to-tr from-orange-500/20 via-sky-300/5 to-sky-300/25 blur-2xl" />
                <div className="relative h-[260px] overflow-hidden rounded-[18px] border border-slate-200/20 bg-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:h-[320px] lg:h-[360px]">
                  <Image
                    src={heroImageUrl}
                    alt="Bulk metal cable glands in manufacturing facility"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 520px"
                    unoptimized={shouldBypassNextImageOptimization(heroImageUrl)}
                    className="object-cover"
                  />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {definitionSection.paragraphs.length > 0 && (
        <section className="py-6 border-b border-border bg-white dark:bg-slate-900">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-secondary">
                {definitionSection.title}
              </h2>
              <p className="line-clamp-3 text-base font-medium text-slate-700 dark:text-slate-300 sm:text-lg">
                {definitionSection.paragraphs[0]}
              </p>
            </div>
          </div>
        </section>
      )}

      <section id="terminal-subcategories" className="section">
        <div className="container">
          <div className="mb-10 flex flex-col gap-2 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Subcategories
              </p>
              <h2 className="text-2xl font-semibold md:text-3xl">Choose Terminal Category</h2>
            </div>
            <p className="max-w-xl text-sm text-secondary md:text-right">
              Pick a terminal type first, then use filters and series pages in that subcategory.
            </p>
          </div>

          {subCategories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {subCategories.map((child) => (
                <CategoryCard
                  key={child._id}
                  name={child.name}
                  slug={child.slug}
                  description={
                    child.pageConfig?.content?.summary ||
                    child.pageConfig?.content?.heroIntro ||
                    child.shortDescription ||
                    child.description ||
                    "View category details and available series."
                  }
                  image={child.image}
                  icon={child.icon}
                  descriptionLines={1}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-border bg-white p-8 text-center">
              <p className="text-secondary">No subcategories are available right now.</p>
            </div>
          )}
        </div>
      </section>

      {selectionGuideSection.points.length > 0 && (
        <section className="py-8 bg-slate-50 dark:bg-slate-950/50 border-t border-border">
          <div className="container">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold md:text-2xl text-slate-900 dark:text-slate-100">{selectionGuideSection.title}</h2>
              {selectionGuideSection.paragraphs[0] && (
                <p className="mx-auto mt-2 max-w-2xl text-sm text-secondary">{selectionGuideSection.paragraphs[0]}</p>
              )}
            </div>
            
            <div className="mx-auto max-w-4xl relative">
              <div className="hidden md:block absolute left-[12%] right-[12%] top-2.5 h-[1px] bg-slate-200 dark:bg-slate-700"></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {selectionGuideSection.points.map((point, index) => (
                  <div key={index} className="relative flex flex-col items-center text-center">
                    <div className="z-10 flex h-6 w-6 items-center justify-center bg-slate-50 dark:bg-slate-950/50">
                      <div className="flex h-5 w-5 items-center justify-center bg-slate-800 text-[11px] font-bold text-white dark:bg-slate-200 dark:text-slate-900 shadow-sm">
                        {index + 1}
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200 px-2">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {featuredCards.length > 0 && (
        <section className="section bg-muted border-y border-border">
          <div className="container">
            <div className="mb-10 flex flex-col gap-2 md:mb-12 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                  Featured Types
                </p>
                <h2 className="text-2xl font-semibold md:text-3xl">Popular Terminal Series</h2>
              </div>
              <p className="max-w-xl text-sm text-secondary md:text-right">
                Start with these high-demand series if you already know your use case.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {featuredCards.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group block overflow-hidden rounded-sm border border-border bg-white transition-colors hover:border-primary"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized={shouldBypassNextImageOptimization(item.image)}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl font-semibold text-slate-400">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-h-[144px] p-5">
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary sm:text-xl">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="line-clamp-2 text-sm font-semibold text-[#4B5563]">
                        {item.description}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                      View Series
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {engineeringGuideSections.length > 0 && (
        <section className="py-6 md:py-10 bg-slate-50 dark:bg-slate-950/50 border-y border-border">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <div className="border border-border bg-white p-5 shadow-sm dark:bg-slate-900 md:p-8">
                <div className="mb-8 border-b border-border pb-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                    Engineering Guide
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                    Category Design Guide
                  </h2>
                </div>
                
                <div className="relative ml-2 md:ml-4">
                  {/* Reading Axis */}
                  <div className="absolute top-2 bottom-4 left-[11px] w-[2px] bg-slate-200 dark:bg-slate-800" />
                  
                  <div className="space-y-10">
                    {engineeringGuideSections.map((section) => (
                      <div key={section.title} className="relative pl-10 md:pl-16 scroll-mt-20">
                        <div className="absolute left-0 top-1.5 h-6 w-6 border-4 border-white bg-slate-300 dark:border-slate-900 dark:bg-slate-700 shadow-sm" />
                        <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
                          {section.title}
                        </h3>
                        {section.paragraphs.length > 0 && (
                          <div className="prose prose-slate prose-sm md:prose-base dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            {section.paragraphs.map((paragraph, pIndex) => (
                              <p key={`${section.title}-paragraph-${pIndex}`} className="mb-4 last:mb-0">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        )}
                        {section.points.length > 0 && (
                          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {section.points.map((point, pIndex) => (
                              <div
                                key={`${section.title}-point-${pIndex}`}
                                className="flex items-start gap-3 border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50"
                              >
                                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                  <span className="h-1.5 w-1.5 bg-current" />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                  {point}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <CTABanner
        title="Need help selecting the right terminal type?"
        description="Share wire size, application, and standards. We will recommend the right category and series."
        variant="primary"
        primaryCTA={{
          label: "Request Quote",
          href: requestQuoteUrl(urlOptions),
        }}
        secondaryCTA={{
          label: "Contact Team",
          href: contactUrl(urlOptions),
        }}
      />
    </>
  );
}
