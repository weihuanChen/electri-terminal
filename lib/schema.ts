import { categoryUrl, productUrl } from "@/lib/routes";
import { toAbsoluteSiteUrl } from "@/lib/site";

type BreadcrumbItem = {
  name: string;
  path?: string;
};

type ItemListEntry = {
  name: string;
  url: string;
};

type FaqEntry = {
  question: string;
  answer: string;
};

type ProductAttributeValue = string | number | boolean | string[];

function normalizeSchemaImage(url?: string) {
  return url ? toAbsoluteSiteUrl(url) : undefined;
}

export function makeOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${toAbsoluteSiteUrl("/")}#organization`,
    name: "Electri Terminal",
    url: toAbsoluteSiteUrl("/"),
    email: "info@electriterminal.com",
  };
}

export function makeWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${toAbsoluteSiteUrl("/")}#website`,
    name: "Electri Terminal",
    url: toAbsoluteSiteUrl("/"),
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${toAbsoluteSiteUrl("/search")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function makeBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path ? toAbsoluteSiteUrl(item.path) : undefined,
    })),
  };
}

export function makeCollectionPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description?: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: toAbsoluteSiteUrl(path),
  };
}

export function makeItemListSchema({
  name,
  path,
  items,
}: {
  name: string;
  path: string;
  items: ItemListEntry[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: toAbsoluteSiteUrl(path),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteSiteUrl(item.url),
      name: item.name,
    })),
  };
}

export function makeFAQPageSchema({
  path,
  items,
}: {
  path: string;
  items: FaqEntry[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: toAbsoluteSiteUrl(path),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function makeProductSchema({
  slug,
  name,
  description,
  image,
  brand,
  model,
  sku,
  mpn,
  categoryName,
  attributes,
}: {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  brand?: string;
  model?: string;
  sku?: string;
  mpn?: string;
  categoryName?: string;
  attributes?: Record<string, ProductAttributeValue>;
}) {
  const normalizedImage = normalizeSchemaImage(image);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url: toAbsoluteSiteUrl(productUrl(slug)),
    description,
    image: normalizedImage ? [normalizedImage] : undefined,
    brand: brand
      ? {
          "@type": "Brand",
          name: brand,
        }
      : undefined,
    model,
    sku,
    mpn,
    category: categoryName,
    additionalProperty: Object.entries(attributes ?? {})
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .slice(0, 12)
      .map(([key, value]) => ({
        "@type": "PropertyValue",
        name: key,
        value: Array.isArray(value) ? value.join(", ") : String(value),
      })),
  };
}

export function makeSearchResultsSchema({
  query,
  items,
}: {
  query: string;
  items: ItemListEntry[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: `Search results for ${query}`,
    url: `${toAbsoluteSiteUrl("/search")}?q=${encodeURIComponent(query)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: toAbsoluteSiteUrl(item.url),
      })),
    },
  };
}

export function makeArticleSchema({
  slug,
  title,
  description,
  image,
  publishedAt,
  updatedAt,
}: {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  publishedAt?: number;
  updatedAt?: number;
}) {
  const normalizedImage = normalizeSchemaImage(image);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: toAbsoluteSiteUrl(`/blog/${slug}`),
    image: normalizedImage ? [normalizedImage] : undefined,
    publisher: {
      "@type": "Organization",
      name: "Electri Terminal",
      url: toAbsoluteSiteUrl("/"),
    },
    author: {
      "@type": "Organization",
      name: "Electri Terminal",
    },
    datePublished: publishedAt ? new Date(publishedAt).toISOString() : undefined,
    dateModified: updatedAt ? new Date(updatedAt).toISOString() : undefined,
  };
}

export function makeProductsHubSchemas({
  categories,
  families,
}: {
  categories: Array<{ slug: string; name: string }>;
  families: Array<{ slug: string; name: string }>;
}) {
  return [
    makeCollectionPageSchema({
      name: "Products",
      description: "Browse product categories and featured series for industrial electrical components.",
      path: "/products",
    }),
    makeItemListSchema({
      name: "Product Categories",
      path: "/products",
      items: categories.map((category) => ({
        name: category.name,
        url: categoryUrl(category.slug),
      })),
    }),
    makeItemListSchema({
      name: "Featured Product Series",
      path: "/products",
      items: families.map((family) => ({
        name: family.name,
        url: familyUrl(family.slug),
      })),
    }),
  ];
}
