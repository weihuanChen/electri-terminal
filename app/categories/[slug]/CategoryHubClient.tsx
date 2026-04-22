import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Breadcrumb, CategoryCard, CTABanner } from "@/components/shared";
import { familyUrl } from "@/lib/routes";
import { shouldBypassNextImageOptimization } from "@/lib/images";

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
}

type FeaturedCard = {
  key: string;
  name: string;
  description?: string;
  image?: string;
  href: string;
};

const TERMINALS_SUBCATEGORY_PRIORITY = [
  "ring-terminals",
  "copper-lugs",
  "quick-disconnect-terminals",
  "fork-terminals",
  "spade-terminals",
  "cord-end-terminals",
  "blade-terminals",
  "pin-terminals",
  "flag-terminals",
  "terminal-sleeves-accessories",
  "splice-connectors",
] as const;

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

function getSubcategoryPriority(slug: string) {
  const index = TERMINALS_SUBCATEGORY_PRIORITY.indexOf(
    slug as (typeof TERMINALS_SUBCATEGORY_PRIORITY)[number]
  );
  return index === -1 ? 999 : index;
}

function getFeaturedKeywordPriority(name: string, href: string) {
  const normalized = `${name} ${href}`.toLowerCase();
  const index = FEATURED_KEYWORD_PRIORITY.findIndex((token) => normalized.includes(token));
  return index === -1 ? 999 : index;
}

export default function CategoryHubClient({
  category,
  fallbackFamilies,
}: CategoryHubClientProps) {
  const breadcrumbItems = [
    { label: "Categories", href: "/categories" },
    { label: category.name },
  ];

  const subCategories = [...(category.children ?? [])].sort((left, right) => {
    const priorityDelta = getSubcategoryPriority(left.slug) - getSubcategoryPriority(right.slug);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

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
      const leftHref = familyUrl(left.slug);
      const rightHref = familyUrl(right.slug);
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
      href: familyUrl(family.slug),
    }));

  const featuredCards = configuredFeatured.length > 0 ? configuredFeatured : fallbackFeatured;
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

  const readMoreSections = [
    {
      title: "What Are Electrical Terminals",
      paragraphs: [category.pageConfig?.content?.overview?.intro?.trim() || defaultDefinition],
      points: [] as string[],
    },
    {
      title: "Common Types of Terminals",
      paragraphs: [] as string[],
      points: resolvedTypePoints,
    },
    {
      title: "Applications",
      paragraphs: [resolvedApplicationsIntro],
      points: resolvedApplicationPoints,
    },
    {
      title: "How to Choose the Right Terminal",
      paragraphs: [category.pageConfig?.content?.selectionGuide?.intro?.trim() || "Choosing the right terminal depends on:"],
      points: resolvedSelectionGuidePoints,
    },
  ].filter((section) => section.paragraphs.length > 0 || section.points.length > 0);

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
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
                  href="/rfq"
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
              <div className="relative overflow-hidden rounded-[18px] border border-slate-200/20 bg-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <img
                  src={heroImageUrl}
                  alt="Bulk metal cable glands in manufacturing facility"
                  className="h-[260px] w-full object-cover sm:h-[320px] lg:h-[360px]"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

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
                    child.shortDescription ||
                    child.pageConfig?.content?.summary ||
                    child.pageConfig?.content?.heroIntro ||
                    child.description ||
                    "View category details and available series."
                  }
                  image={child.image}
                  icon={child.icon}
                  descriptionLines={1}
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

      {readMoreSections.length > 0 && (
        <section className="section-compact">
          <div className="container">
            <div className="mx-auto max-w-[700px]">
              <details className="group rounded-sm border border-border bg-white p-5 md:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-[0.12em] text-secondary">
                  Read More: Terminal Selection Guide
                  <span className="text-primary transition-transform duration-200 group-open:rotate-180">
                    ▼
                  </span>
                </summary>

                <div className="mt-5 space-y-4 text-sm leading-7 text-secondary">
                  {readMoreSections.map((section) => (
                    <article key={section.title} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                      <h3 className="mb-2 text-base font-semibold text-slate-900">{section.title}</h3>
                      {section.paragraphs.map((paragraph, index) => (
                        <p key={`${section.title}-paragraph-${index}`} className="mb-2 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                      {section.points.length > 0 && (
                        <ul className="mt-2 space-y-1.5">
                          {section.points.map((point, index) => (
                            <li key={`${section.title}-point-${index}`} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </details>
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
          href: "/rfq",
        }}
        secondaryCTA={{
          label: "Contact Team",
          href: "/contact",
        }}
      />
    </>
  );
}
