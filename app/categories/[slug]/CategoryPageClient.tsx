import { Breadcrumb, FamilyCard, ProductCard, FAQAccordion, DownloadCard, CTABanner } from "@/components/shared";
import { resolveCategoryPageViewModel } from "@/lib/categoryPage";
import { categoryUrl, familyUrl } from "@/lib/routes";
import CategoryContentTabs, { CategoryFilterSidebar } from "./CategoryPageControls";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  type CategoryContentView,
  type CategoryFilterState,
} from "@/lib/categoryFilters";

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

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type?: "checkbox" | "radio";
  options: FilterOption[];
}

interface CategoryChild {
  _id: string;
  slug: string;
  name: string;
}

interface CategoryFamily {
  _id: string;
  slug: string;
  name: string;
  summary?: string;
  heroImage?: string;
  highlights?: string[];
  pageConfig?: {
    content?: {
      selectionReason?: string;
    };
  };
}

interface CategoryProduct {
  _id: string;
  slug: string;
  title: string;
  model?: string;
  shortTitle?: string;
  mainImage?: string;
  summary?: string;
  isFeatured?: boolean;
  attributes?: Record<string, unknown>;
}

interface CategoryTypeOverviewItem {
  name: string;
  description?: string;
  link?: string;
}

export interface CategoryPageData {
  _id: string;
  slug: string;
  name: string;
  parentId?: string;
  image?: string;
  description?: string;
  shortDescription?: string;
  children?: CategoryChild[];
  resources?: DownloadResource[];
  faqs?: FaqItem[];
  filters?: FilterGroup[];
}

export interface CategoryPageContent {
  families: CategoryFamily[];
  products: CategoryProduct[];
}

interface CategoryPageClientProps {
  category: CategoryPageData;
  content: CategoryPageContent;
  contentView: CategoryContentView;
  activeFilters: CategoryFilterState;
}

function resolveSeriesHint(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("angled") || normalized.includes("90")) {
    return "For tight installation spaces.";
  }
  if (normalized.includes("heat shrink") || normalized.includes("heat-shrink")) {
    return "For insulation and moisture protection.";
  }
  if (normalized.includes("non-insulated") || normalized.includes("non insulated")) {
    return "For direct crimp connections and high conductivity.";
  }
  if (normalized.includes("insulated")) {
    return "For safer general-purpose wiring.";
  }
  if (normalized.includes("heavy") || normalized.includes("copper") || normalized.includes("lug")) {
    return "For higher-current and demanding applications.";
  }

  return "For secure and stable electrical termination.";
}

type QuickSelectionItem = {
  label: string;
  description: string;
  href: string;
};

function normalizeComparable(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function resolveQuickSelectionItems(
  typesOverview: CategoryTypeOverviewItem[],
  families: CategoryFamily[]
) {
  if (typesOverview.length === 0) {
    return [];
  }

  return typesOverview.slice(0, 4).map<QuickSelectionItem>((item) => {
    if (item.link) {
      return {
        label: item.name,
        description:
          item.description?.trim() || "Open this type and browse matching series.",
        href: item.link,
      };
    }

    const normalizedType = normalizeComparable(item.name);
    const matchedFamily = families.find((family) =>
      normalizeComparable(family.name).includes(normalizedType)
    );

    return {
      label: item.name,
      description:
        item.description?.trim() || "Open this type and browse matching series.",
      href: matchedFamily ? familyUrl(matchedFamily.slug) : "#series-section",
    };
  });
}

function normalizeAboutText(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function isKeywordStuffedAboutText(text: string) {
  const normalized = normalizeAboutText(text);
  if (!normalized) {
    return true;
  }

  const blockedFragments = [
    "reliable ring terminals for secure electrical connections",
    "engineered for durability, conductivity, and long-term performance in critical applications",
    "ring terminals, ring terminal connectors, electrical ring terminals, copper ring terminals, insulated ring terminals, wire ring connectors, heavy duty ring lugs",
  ];
  if (blockedFragments.some((fragment) => normalized.includes(fragment))) {
    return true;
  }

  const commaParts = text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const seoTokenCount = (
    normalized.match(
      /\b(terminal|terminals|connector|connectors|lug|lugs|wire|electrical|copper|insulated|ring)\b/g
    ) || []
  ).length;

  return commaParts.length >= 6 && seoTokenCount >= 7;
}

function sanitizeAboutTextList(items: Array<string | undefined>) {
  return items
    .map((item) => item?.trim() || "")
    .filter((item) => item.length > 0)
    .filter((item, index, array) => array.indexOf(item) === index)
    .filter((item) => !isKeywordStuffedAboutText(item));
}

export default function CategoryPageClient({
  category,
  content,
  contentView,
  activeFilters,
}: CategoryPageClientProps) {
  const breadcrumbItems = [
    { label: "Categories", href: "/categories" },
    { label: category.name },
  ];
  const {
    heroDescription,
    heroShortDescription,
    overviewIntro,
    overviewKeyPoints,
    typesOverview,
    applicationsIntro,
    applicationsItems,
    selectionGuideIntro,
    selectionGuideSteps,
    collapsedFilterGroupKeys,
    filterGroups,
    visibleFamilies,
    visibleProducts,
    faqItems,
    showFaq,
    showDownloads,
    primaryCTA,
    secondaryCTA,
  } = resolveCategoryPageViewModel(category, content, contentView);
  const isRingTerminals = category.slug === "ring-terminals";
  const isSubcategory = Boolean(category.parentId);
  const useEnhancedHero = isRingTerminals || isSubcategory;
  const quickSelectionItems = resolveQuickSelectionItems(
    typesOverview,
    content.families
  );
  const productsToRender = contentView === "all" ? visibleProducts.slice(0, 8) : visibleProducts;
  const cleanAboutIntroParagraphs = sanitizeAboutTextList([
    heroDescription,
    heroShortDescription,
    overviewIntro,
  ]);
  const cleanOverviewKeyPoints = sanitizeAboutTextList(overviewKeyPoints);
  const cleanTypesPoints = sanitizeAboutTextList(
    typesOverview.map((item) =>
      item.description?.trim() ? `${item.name.trim()}: ${item.description.trim()}` : item.name.trim()
    )
  );
  const cleanApplicationsParagraphs = sanitizeAboutTextList([applicationsIntro]);
  const cleanApplicationsItems = sanitizeAboutTextList(applicationsItems);
  const cleanSelectionGuideParagraphs = sanitizeAboutTextList([selectionGuideIntro]);
  const cleanSelectionGuideSteps = sanitizeAboutTextList(selectionGuideSteps);
  const aboutSections = [
    {
      title: isRingTerminals ? "What Are Ring Terminals" : "What Is This Category",
      paragraphs: cleanAboutIntroParagraphs,
      points: cleanOverviewKeyPoints,
    },
    {
      title: isRingTerminals ? "Types of Ring Terminals" : "Types",
      paragraphs: [],
      points: cleanTypesPoints,
    },
    {
      title: "Applications",
      paragraphs: cleanApplicationsParagraphs,
      points: cleanApplicationsItems,
    },
    {
      title: "How to Choose",
      paragraphs: cleanSelectionGuideParagraphs,
      points: cleanSelectionGuideSteps,
    },
  ].filter((section) => section.paragraphs.length > 0 || section.points.length > 0);
  const heroIntroText = isRingTerminals
    ? "Ring terminals provide secure wire-to-stud electrical connections for industrial and automotive applications."
    : heroDescription || heroShortDescription || "Find the right series, filters, and products for this category.";
  const ringTerminalsHeroImage =
    "https://assets.electriterminal.com/factory/yellow-crimp-spade-connectors-detail.webp";
  const defaultHeroVisualImage =
    "https://assets.electriterminal.com/factory/copper-tube-cutting-manufacturing-process.webp";
  const heroVisualImage = isRingTerminals
    ? ringTerminalsHeroImage
    : category.image?.trim() || defaultHeroVisualImage;
  const heroEyebrow = isRingTerminals ? "Industrial Copper Terminations" : "Industrial Terminal Solutions";
  const heroPrimaryActionLabel = isRingTerminals ? "Browse Ring Terminal Types" : "Browse Product Series";
  const heroHighlights = isRingTerminals
    ? ["High conductivity copper", "Controlled crimp geometry", "Batch-level quality checks"]
    : ["Engineering-grade materials", "Stable production process", "Consistent quality control"];

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {useEnhancedHero ? (
        <section className="relative overflow-hidden border-y border-slate-800 bg-slate-950">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(249,115,22,0.32),transparent_36%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(56,189,248,0.22),transparent_42%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(130deg,#050b14_0%,#0e1928_46%,#1e2d41_100%)]" />
          </div>
          <div className="container relative py-10 md:py-14">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="max-w-2xl text-slate-100">
                <p className="inline-flex rounded-sm border border-orange-300/35 bg-orange-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-orange-100">
                  {heroEyebrow}
                </p>
                <h1
                  className="mt-4 text-3xl font-semibold leading-tight !text-white md:text-5xl"
                  style={{ color: "#f8fafc", textShadow: "0 2px 14px rgba(0, 0, 0, 0.35)" }}
                >
                  {category.name}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                  {heroIntroText}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="#series-section"
                    className="btn btn-primary"
                  >
                    {heroPrimaryActionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href={secondaryCTA.href}
                    className="inline-flex items-center rounded-sm border border-slate-100/80 bg-slate-900/70 px-5 py-3 text-sm font-semibold !text-[#3B82F6] transition-colors hover:border-orange-200 hover:bg-slate-900"
                  >
                    {secondaryCTA.label}
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {heroHighlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-sm border border-slate-200/25 bg-slate-900/45 px-3 py-1.5 text-xs font-medium text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[20px] bg-gradient-to-tr from-orange-500/20 via-sky-300/5 to-sky-300/25 blur-2xl" />
                <div className="relative overflow-hidden rounded-[18px] border border-slate-200/20 bg-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                  <img
                    src={heroVisualImage}
                    alt={`${category.name} manufacturing process`}
                    className="h-[260px] w-full object-cover sm:h-[320px] lg:h-[360px]"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-sm border border-slate-200/25 bg-slate-950/68 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-200">
                      Precision Process Snapshot
                    </p>
                    <p className="mt-1 text-sm text-slate-100">
                      Stable tube cutting and forming workflow for consistent termination quality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="section-compact border-y border-border bg-muted">
          <div className="container">
            <div className="max-w-4xl rounded-sm border border-border bg-white p-5 md:p-7 dark:bg-slate-900">
              <h1 className="mb-3 text-3xl font-semibold md:text-5xl">{category.name}</h1>
              <p className="max-w-3xl text-base text-secondary md:text-lg">{heroIntroText}</p>
            </div>
          </div>
        </section>
      )}

      {category.children && category.children.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary mb-6">Subcategories</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={categoryUrl(category.slug)}
                className="inline-flex items-center rounded-sm border border-border bg-white px-4 py-2 transition-colors hover:border-primary hover:text-primary dark:bg-slate-900"
              >
                All {category.name}
              </Link>
              {category.children.map((child) => (
                <Link
                  key={child._id}
                  href={categoryUrl(child.slug)}
                  className="inline-flex items-center rounded-sm border border-border bg-white px-4 py-2 transition-colors hover:border-primary hover:text-primary dark:bg-slate-900"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {quickSelectionItems.length > 0 && (
        <section className="section-compact !py-7 border-y border-border bg-[#F3F4F6] dark:bg-slate-950 md:!py-7">
          <div className="container">
            <div className="rounded-sm border border-border bg-white p-[18px] shadow-[0_2px_8px_rgba(15,23,42,0.06)] dark:bg-slate-900 dark:shadow-none md:p-5">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                CHOOSE BY APPLICATION
              </p>
              <p className="mb-4 text-base font-medium text-slate-700 dark:text-slate-100">
                Select the right type based on your application needs
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {quickSelectionItems.map((item) => (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className="group rounded-sm border border-border bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CBD5F5] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:bg-slate-900 dark:shadow-none dark:hover:border-primary"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100">
                        {item.label}
                      </h3>
                      <p className="mt-2 text-sm leading-6 font-semibold text-[#4B5563] dark:text-slate-300">{item.description}</p>
                      <span className="mt-2.5 inline-flex items-center text-sm font-medium text-[#3B82F6] transition-colors hover:text-[#2563EB] dark:text-blue-300 dark:hover:text-blue-200">
                        Explore
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <CategoryFilterSidebar
              filterGroups={filterGroups}
              activeFilters={activeFilters}
              contentView={contentView}
              familyCount={content.families.length}
              productCount={content.products.length}
              collapsedFilterGroupKeys={collapsedFilterGroupKeys}
            />

            <div className="flex-1 rounded-sm border border-border bg-white p-5 md:p-8 dark:bg-slate-900">
              <CategoryContentTabs
                filterGroups={filterGroups}
                activeFilters={activeFilters}
                contentView={contentView}
                familyCount={content.families.length}
                productCount={content.products.length}
              />

              <div className="mb-8 border-b border-border pb-5 text-sm text-secondary">
                Showing {visibleFamilies.length + visibleProducts.length} results
              </div>

              {visibleFamilies.length > 0 && (
                <div id="series-section" className="mb-12">
                  <h2 className="mb-6 text-2xl font-semibold md:text-3xl">
                    {isRingTerminals ? "Browse Ring Terminal Types" : "Product Series"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {visibleFamilies.map((family) => (
                      <FamilyCard
                        key={family._id}
                        name={family.name}
                        slug={family.slug}
                        summary={
                          family.pageConfig?.content?.selectionReason ||
                          family.summary ||
                          resolveSeriesHint(family.name)
                        }
                        heroImage={family.heroImage}
                        highlights={family.highlights}
                      />
                    ))}
                  </div>
                </div>
              )}

              {productsToRender.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-semibold md:text-3xl">
                    {isRingTerminals && contentView === "all"
                      ? "Top Ring Terminal Products"
                      : "Individual Products"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productsToRender.map((product) => (
                      <ProductCard
                        key={product._id}
                        slug={product.slug}
                        title={product.title}
                        shortTitle={product.shortTitle}
                        mainImage={product.mainImage}
                        summary={product.summary}
                        isFeatured={product.isFeatured}
                      />
                    ))}
                  </div>
                </div>
              )}

              {visibleFamilies.length === 0 && productsToRender.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-secondary">No products found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showFaq && (
        <section className="section bg-muted border-y border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Technical FAQ
              </p>
              <h2 className="mb-8 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                Frequently Asked Questions
              </h2>
              <FAQAccordion items={faqItems} />
            </div>
          </div>
        </section>
      )}

      {showDownloads && (
        <section className="section">
          <div className="container">
            <div className="max-w-4xl rounded-sm border border-border bg-white p-6 md:p-8 dark:bg-slate-900">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Documentation
              </p>
              <h2 className="mb-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Documentation Support</h2>
              <p className="mb-8 text-secondary">
                Public files are listed below. Additional product documentation can be provided upon request.
              </p>
              <div className="space-y-4">
                {(category.resources || []).map((resource) => (
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

      {aboutSections.length > 0 && (
        <section className="section-compact">
          <div className="container">
            <div className="mx-auto max-w-[700px]">
              <details className="group rounded-sm border border-border bg-white p-5 md:p-6 dark:bg-slate-900">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-[0.12em] text-secondary">
                  {isRingTerminals ? "About Ring Terminals" : "About This Category"}
                  <span className="text-primary transition-transform duration-200 group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="mt-5 space-y-4 text-sm leading-7 text-secondary">
                  {aboutSections.map((section) => (
                    <article key={section.title} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                      <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                        {section.title}
                      </h3>
                      {section.paragraphs.map((text, index) => (
                        <p key={`${section.title}-p-${index}`} className="mb-2 last:mb-0">
                          {text}
                        </p>
                      ))}
                      {section.points.length > 0 && (
                        <ul className="mt-2 space-y-1">
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
        title="Need Help Finding the Right Product?"
        description="Our team of experts is ready to assist you in selecting the perfect solution for your requirements."
        variant="primary"
        primaryCTA={{
          label: primaryCTA.label,
          href: primaryCTA.href,
        }}
        secondaryCTA={{
          label: secondaryCTA.label,
          href: secondaryCTA.href,
        }}
      />
    </>
  );
}
