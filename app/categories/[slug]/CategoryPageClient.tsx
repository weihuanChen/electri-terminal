import Image from "next/image";
import { Breadcrumb, FamilyCard, ProductCard, FAQAccordion, CTABanner } from "@/components/shared";
import { resolveCategoryPageViewModel } from "@/lib/categoryPage";
import { categoriesUrl, categoryUrl, familyUrl } from "@/lib/routes";
import { shouldBypassNextImageOptimization } from "@/lib/images";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { resolveLocalizedPath } from "@/lib/i18n/urlResolver";
import CategoryContentTabs, { CategoryFilterSidebar } from "./CategoryPageControls";
import Link from "next/link";
import { ArrowRight, FileText, Download } from "lucide-react";
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
  locale?: Locale;
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
  families: CategoryFamily[],
  locale?: Locale
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
        href: locale && item.link.startsWith("/")
          ? resolveLocalizedPath(item.link, locale)
          : item.link,
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
      href: matchedFamily
        ? familyUrl(matchedFamily.slug, locale ? { locale } : undefined)
        : "#series-section",
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
  locale,
}: CategoryPageClientProps) {
  const urlOptions = locale ? { locale } : undefined;
  const breadcrumbItems = [
    { label: "Categories", href: categoriesUrl(urlOptions) },
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
  } = resolveCategoryPageViewModel(category, content, contentView, urlOptions);
  const isRingTerminals = category.slug === "ring-terminals";
  const isLocalizedRoute = Boolean(locale && locale !== DEFAULT_LOCALE);
  const isSubcategory = Boolean(category.parentId);
  const useEnhancedHero = isRingTerminals || isSubcategory;
  const quickSelectionItems = resolveQuickSelectionItems(
    typesOverview,
    content.families,
    locale
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
  const heroIntroText = isRingTerminals
    ? isLocalizedRoute
      ? heroDescription || heroShortDescription || overviewIntro || "Find the right series, filters, and products for this category."
      : "Ring terminals provide secure wire-to-stud electrical connections for industrial and automotive applications."
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
  const heroHighlights =
    isLocalizedRoute && overviewKeyPoints.length > 0
      ? overviewKeyPoints.slice(0, 3)
      : isRingTerminals
        ? ["High conductivity copper", "Controlled crimp geometry", "Batch-level quality checks"]
        : ["Engineering-grade materials", "Stable production process", "Consistent quality control"];

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} locale={locale} />
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
                <div className="relative h-[260px] overflow-hidden rounded-[18px] border border-slate-200/20 bg-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:h-[320px] lg:h-[360px]">
                  <Image
                    src={heroVisualImage}
                    alt={`${category.name} manufacturing process`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 520px"
                    unoptimized={shouldBypassNextImageOptimization(heroVisualImage)}
                    className="object-cover"
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
        <section className="py-6 md:py-10">
          <div className="container">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary mb-6">Subcategories</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={categoryUrl(category.slug, urlOptions)}
                className="inline-flex items-center rounded-sm border border-border bg-white px-4 py-2 transition-colors hover:border-primary hover:text-primary dark:bg-slate-900"
              >
                All {category.name}
              </Link>
              {category.children.map((child) => (
                <Link
                  key={child._id}
                  href={categoryUrl(child.slug, urlOptions)}
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

      <section className="py-6 md:py-10">
        <div className="container">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <CategoryFilterSidebar
              filterGroups={filterGroups}
              activeFilters={activeFilters}
              contentView={contentView}
              familyCount={content.families.length}
              productCount={content.products.length}
              collapsedFilterGroupKeys={collapsedFilterGroupKeys}
            />

            <div className="flex-1 rounded-none border border-border bg-white p-4 md:p-6 dark:bg-slate-900">
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
                        locale={locale}
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
                        locale={locale}
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

      {(cleanAboutIntroParagraphs.length > 0 || cleanOverviewKeyPoints.length > 0 || cleanTypesPoints.length > 0 || cleanApplicationsItems.length > 0 || cleanSelectionGuideSteps.length > 0) && (
        <section className="py-6 md:py-10 bg-slate-50 dark:bg-slate-950/50 border-y border-border">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <div className="border border-border bg-white p-5 shadow-sm dark:bg-slate-900 md:p-8">
                <div className="mb-8 border-b border-border pb-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                    Engineering Guide
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                    {isRingTerminals ? "Ring Terminals Design Guide" : "Category Design Guide"}
                  </h2>
                </div>
                
                <div className="relative ml-2 md:ml-4">
                  {/* Reading Axis */}
                  <div className="absolute top-2 bottom-4 left-[11px] w-[2px] bg-slate-200 dark:bg-slate-800" />
                  
                  <div className="space-y-10">
                    {/* Layer 1: Introduction */}
                    {cleanAboutIntroParagraphs.length > 0 && (
                      <div className="relative pl-10 md:pl-16 scroll-mt-20">
                        <div className="absolute left-0 top-1.5 h-6 w-6 border-4 border-white bg-slate-300 dark:border-slate-900 dark:bg-slate-700 shadow-sm" />
                        <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
                          {isRingTerminals ? "What Are Ring Terminals?" : "Introduction"}
                        </h3>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-7 text-slate-700 dark:text-slate-300">
                          {cleanAboutIntroParagraphs.map((text, index) => (
                            <p key={index} className="mb-4 last:mb-0">
                              {text}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Layer 2: Features (Cards) */}
                    {cleanOverviewKeyPoints.length > 0 && (
                      <div className="relative pl-10 md:pl-16 scroll-mt-20">
                        <div className="absolute left-0 top-1.5 h-6 w-6 border-4 border-white bg-primary dark:border-slate-900 shadow-sm" />
                        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                          Key Features
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {cleanOverviewKeyPoints.map((point, index) => (
                            <div key={index} className="border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
                              <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                                {point}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Layer 3: Types (Table) */}
                    {cleanTypesPoints.length > 0 && (
                      <div className="relative pl-10 md:pl-16 scroll-mt-20">
                        <div className="absolute left-0 top-1.5 h-6 w-6 border-4 border-white bg-slate-400 dark:border-slate-900 dark:bg-slate-600 shadow-sm" />
                        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                          Available Types
                        </h3>
                        {isRingTerminals ? (
                          <div className="overflow-hidden border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                              <thead className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                                <tr>
                                  <th className="px-5 py-3 font-semibold border-b border-slate-200 dark:border-slate-800">Type</th>
                                  <th className="px-5 py-3 font-semibold border-b border-slate-200 dark:border-slate-800">Material</th>
                                  <th className="px-5 py-3 font-semibold border-b border-slate-200 dark:border-slate-800">Insulation</th>
                                  <th className="px-5 py-3 font-semibold border-b border-slate-200 dark:border-slate-800">Typical Use</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">PVC</td>
                                  <td className="px-5 py-3">Copper</td>
                                  <td className="px-5 py-3">PVC</td>
                                  <td className="px-5 py-3">General wiring</td>
                                </tr>
                                <tr className="bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/30 dark:hover:bg-slate-800/80 transition-colors">
                                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">Nylon</td>
                                  <td className="px-5 py-3">Copper</td>
                                  <td className="px-5 py-3">Nylon</td>
                                  <td className="px-5 py-3">Higher temperature</td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">Bare</td>
                                  <td className="px-5 py-3">Copper</td>
                                  <td className="px-5 py-3">None</td>
                                  <td className="px-5 py-3">Industrial</td>
                                </tr>
                                <tr className="bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/30 dark:hover:bg-slate-800/80 transition-colors">
                                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">Heavy Duty</td>
                                  <td className="px-5 py-3">Copper</td>
                                  <td className="px-5 py-3">None</td>
                                  <td className="px-5 py-3">High Current</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {cleanTypesPoints.map((point, index) => (
                              <div key={index} className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {point}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Layer 4: Applications (Logo Wall / Grid) */}
                    {(cleanApplicationsItems.length > 0 || cleanApplicationsParagraphs.length > 0) && (
                      <div className="relative pl-10 md:pl-16 scroll-mt-20">
                        <div className="absolute left-0 top-1.5 h-6 w-6 border-4 border-white bg-indigo-500 dark:border-slate-900 shadow-sm" />
                        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                          Applications
                        </h3>
                        {cleanApplicationsParagraphs.length > 0 && (
                          <div className="mb-5 prose prose-slate dark:prose-invert max-w-none text-base text-slate-700 dark:text-slate-300">
                            {cleanApplicationsParagraphs.map((text, index) => (
                              <p key={index}>{text}</p>
                            ))}
                          </div>
                        )}
                        {cleanApplicationsItems.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {cleanApplicationsItems.map((item, index) => (
                              <span key={index} className="inline-flex items-center border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors hover:border-slate-300 dark:hover:border-slate-600">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Layer 5: Selection Flow (Vertical Stepper) */}
                    {(cleanSelectionGuideSteps.length > 0 || cleanSelectionGuideParagraphs.length > 0) && (
                      <div className="relative pl-10 md:pl-16 scroll-mt-20">
                        <div className="absolute left-0 top-1.5 h-6 w-6 border-4 border-white bg-green-500 dark:border-slate-900 shadow-sm" />
                        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                          Selection Guide
                        </h3>
                        {cleanSelectionGuideParagraphs.length > 0 && (
                          <div className="mb-6 prose prose-slate dark:prose-invert max-w-none text-base text-slate-700 dark:text-slate-300">
                            {cleanSelectionGuideParagraphs.map((text, index) => (
                              <p key={index}>{text}</p>
                            ))}
                          </div>
                        )}
                        {cleanSelectionGuideSteps.length > 0 && (
                          <div className="space-y-4">
                            {cleanSelectionGuideSteps.map((step, index) => (
                              <div key={index} className="flex gap-4">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {index + 1}
                                </div>
                                <div className="pt-1 text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {step}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {showDownloads && (
        <section className="py-6 md:py-10">
          <div className="container">
            <div className="w-full border border-border bg-white p-4 md:p-5 dark:bg-slate-900">
              <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                Engineering Resources
              </h2>
              <p className="mb-4 text-sm text-secondary">
                Technical catalogs, selection guides and application documents.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(category.resources || []).map((resource) => {
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

      {showFaq && (
        <section className="py-6 md:py-10 bg-muted border-y border-border">
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
