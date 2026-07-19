import "server-only";

import { getAdminConvexClient } from "@/lib/convex-admin";
import {
  DEFAULT_LOCALE,
  createGscLinkIntegrityCandidate,
  resolveEntityPath,
  resolveSeoOutput,
  runGscLinkIntegrityGate,
  type PublicUrlEntityRef,
  type StaticPageKey,
} from "@/lib/i18n";
import {
  buildLlmsTxt,
  type LlmsTxtPageCandidate,
  type LlmsTxtSection,
} from "@/lib/llms-txt";

type LlmsTxtContentItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  canonical?: string;
  sortOrder?: number;
  contentSignalCount?: number;
  relatedCount?: number;
  updatedAt?: number;
};

type LlmsTxtContent = {
  categories: Array<
    LlmsTxtContentItem & {
      level: number;
      isVisibleInNav: boolean;
    }
  >;
  families: Array<LlmsTxtContentItem & { categoryId: string }>;
  products: Array<
    LlmsTxtContentItem & {
      categoryId: string;
      familyId: string;
      isFeatured: boolean;
    }
  >;
  articles: Array<
    LlmsTxtContentItem & {
      articleType: "blog" | "guide" | "faq" | "application";
      featured: boolean;
      publishedAt?: number;
    }
  >;
};

type StaticCandidateDefinition = {
  key: StaticPageKey;
  title: string;
  description: string;
  section: LlmsTxtSection;
  baseScore: number;
  sortOrder: number;
};

const STATIC_CANDIDATES: StaticCandidateDefinition[] = [
  {
    key: "home",
    title: "Electri Terminal Overview",
    description:
      "Overview of Electri Terminal products, manufacturing capabilities, industrial applications, and sourcing support.",
    section: "core",
    baseScore: 110,
    sortOrder: 0,
  },
  {
    key: "selection-guide",
    title: "Terminal Type, Insulation & Stud Size Guide",
    description:
      "Engineering reference for terminal types, insulation codes, wire-size ranges, stud dimensions, and AWG-to-mm² conversion.",
    section: "core",
    baseScore: 100,
    sortOrder: 1,
  },
  {
    key: "manufacturing",
    title: "Manufacturing Capabilities",
    description:
      "Factory processes, production equipment, material handling, customization support, and quality-control capabilities.",
    section: "core",
    baseScore: 95,
    sortOrder: 2,
  },
  {
    key: "quality-certifications",
    title: "Quality and Certifications",
    description:
      "Quality controls, testing capabilities, compliance documentation, and certificate request information.",
    section: "core",
    baseScore: 95,
    sortOrder: 3,
  },
  {
    key: "categories",
    title: "Electrical Component Categories",
    description:
      "Browse the main electrical terminal and connector categories before narrowing to a product family or model.",
    section: "categories",
    baseScore: 100,
    sortOrder: -1,
  },
  {
    key: "products",
    title: "All Products",
    description:
      "Search and browse the complete published product catalog by category, family, and model.",
    section: "optional",
    baseScore: 60,
    sortOrder: 0,
  },
  {
    key: "resources",
    title: "Technical Resources",
    description:
      "Public catalogs, datasheets, certificates, CAD files, manuals, and other downloadable product resources.",
    section: "optional",
    baseScore: 55,
    sortOrder: 1,
  },
  {
    key: "blog",
    title: "Technical Article Library",
    description:
      "Technical guides and application articles about electrical terminals, connectors, crimping, and industrial wiring.",
    section: "optional",
    baseScore: 50,
    sortOrder: 2,
  },
  {
    key: "contact",
    title: "Contact and Request a Quote",
    description:
      "Contact the sales team to confirm specifications, samples, customization, MOQ, lead time, pricing, or documentation.",
    section: "optional",
    baseScore: 30,
    sortOrder: 3,
  },
];

function resolveEligibleUrl(entity: PublicUrlEntityRef, canonical?: string) {
  const fallbackPath = resolveEntityPath(entity);
  const seo = resolveSeoOutput({
    locale: DEFAULT_LOCALE,
    entity,
    fallbackPath,
    canonical,
    sourceStatus: "published",
    localizationStatus: "published",
  });

  if (!seo.canonical || !seo.indexable || !seo.sitemapEligible) return null;

  const report = runGscLinkIntegrityGate([
    createGscLinkIntegrityCandidate({
      source: "sitemap",
      entity,
      seo,
    }),
  ]);

  return report.passed ? seo.canonical : null;
}

function buildStaticCandidates() {
  return STATIC_CANDIDATES.flatMap<LlmsTxtPageCandidate>((definition) => {
    const entity = { type: "staticPage", key: definition.key } as const;
    const url = resolveEligibleUrl(entity);
    if (!url) return [];

    return [
      {
        id: `static:${definition.key}`,
        kind: "static",
        section: definition.section,
        title: definition.title,
        description: definition.description,
        url,
        baseScore: definition.baseScore,
        sortOrder: definition.sortOrder,
        contentSignalCount: 2,
      },
    ];
  });
}

function buildDynamicCandidates(content: LlmsTxtContent) {
  const candidates: LlmsTxtPageCandidate[] = [];

  for (const category of content.categories) {
    const entity = { type: "category", slug: category.slug } as const;
    const url = resolveEligibleUrl(entity, category.canonical);
    if (!url) continue;
    candidates.push({
      ...category,
      id: `category:${category.id}`,
      kind: "category",
      section: "categories",
      url,
      featured: category.isVisibleInNav && category.level === 0,
      visibleInNavigation: category.isVisibleInNav,
    });
  }

  for (const family of content.families) {
    const entity = { type: "family", slug: family.slug } as const;
    const url = resolveEligibleUrl(entity, family.canonical);
    if (!url) continue;
    candidates.push({
      ...family,
      id: `family:${family.id}`,
      kind: "family",
      section: "families",
      url,
      groupId: family.categoryId,
    });
  }

  for (const product of content.products) {
    const entity = { type: "product", slug: product.slug } as const;
    const url = resolveEligibleUrl(entity, product.canonical);
    if (!url) continue;
    candidates.push({
      ...product,
      id: `product:${product.id}`,
      kind: "product",
      section: "products",
      url,
      featured: product.isFeatured,
      groupId: product.familyId,
    });
  }

  for (const article of content.articles) {
    const entity = { type: "article", slug: article.slug } as const;
    const url = resolveEligibleUrl(entity, article.canonical);
    if (!url) continue;
    candidates.push({
      ...article,
      id: `article:${article.id}`,
      kind: "article",
      section: "guides",
      url,
      featured: article.featured,
      updatedAt: article.publishedAt ?? article.updatedAt,
      baseScore:
        article.articleType === "guide"
          ? 80
          : article.articleType === "application"
            ? 78
            : article.articleType === "blog"
              ? 75
              : 68,
    });
  }

  return candidates;
}

export function buildStaticLlmsTxt() {
  return buildLlmsTxt(buildStaticCandidates());
}

export async function buildDynamicLlmsTxt() {
  const content = (await getAdminConvexClient().query(
    "frontend:listLlmsTxtContent",
    {}
  )) as LlmsTxtContent;

  return buildLlmsTxt([
    ...buildStaticCandidates(),
    ...buildDynamicCandidates(content),
  ]);
}
