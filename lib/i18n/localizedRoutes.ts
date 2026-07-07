import {
  type Locale,
  type LocalizableEntityType,
  type StaticPageKey,
  getStaticPageDefinition,
} from "./config";
import { type PublicUrlEntityRef, normalizePublicPath } from "./urlResolver";

export type LocalizedRouteKind = LocalizableEntityType | "blogPage";

export type LocalizedRouteMatch =
  | {
      kind: "staticPage";
      locale: Locale;
      path: string;
      pageKey: StaticPageKey;
    }
  | {
      kind: "category";
      locale: Locale;
      path: string;
      slug: string;
    }
  | {
      kind: "family";
      locale: Locale;
      path: string;
      slug: string;
    }
  | {
      kind: "product";
      locale: Locale;
      path: string;
      slug: string;
    }
  | {
      kind: "article";
      locale: Locale;
      path: string;
      slug: string;
    }
  | {
      kind: "blogPage";
      locale: Locale;
      path: string;
      page: number;
    };

const STATIC_PATH_TO_PAGE_KEY: ReadonlyMap<string, StaticPageKey> = new Map(
  [
    "home",
    "categories",
    "products",
    "manufacturing",
    "selection-guide",
    "resources",
    "quality-certifications",
    "blog",
    "contact",
    "privacy-policy",
  ].map((key) => {
    const pageKey = key as StaticPageKey;
    const page = getStaticPageDefinition(pageKey);
    if (!page) {
      throw new Error(`Missing static page definition for ${pageKey}`);
    }
    return [page.path, pageKey] as const;
  })
);

function parsePositiveInteger(value: string) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function matchLocalizedRoute(locale: Locale, rawPath: string): LocalizedRouteMatch | null {
  const path = normalizePublicPath(rawPath);
  const staticPageKey = STATIC_PATH_TO_PAGE_KEY.get(path);

  if (staticPageKey) {
    return {
      kind: "staticPage",
      locale,
      path,
      pageKey: staticPageKey,
    };
  }

  const segments = path.split("/").filter(Boolean);

  if (segments.length === 2 && segments[0] === "categories") {
    return {
      kind: "category",
      locale,
      path,
      slug: segments[1],
    };
  }

  if (segments.length === 2 && segments[0] === "families") {
    return {
      kind: "family",
      locale,
      path,
      slug: segments[1],
    };
  }

  if (segments.length === 2 && segments[0] === "products") {
    return {
      kind: "product",
      locale,
      path,
      slug: segments[1],
    };
  }

  if (segments.length === 2 && segments[0] === "blog") {
    return {
      kind: "article",
      locale,
      path,
      slug: segments[1],
    };
  }

  if (segments.length === 3 && segments[0] === "blog" && segments[1] === "page") {
    const page = parsePositiveInteger(segments[2]);
    if (!page || page <= 1) {
      return null;
    }

    return {
      kind: "blogPage",
      locale,
      path,
      page,
    };
  }

  return null;
}

export function getLocalizedRouteEntity(route: LocalizedRouteMatch): PublicUrlEntityRef {
  switch (route.kind) {
    case "staticPage":
      return { type: "staticPage", key: route.pageKey };
    case "category":
    case "family":
    case "product":
    case "article":
      return { type: route.kind, slug: route.slug };
    case "blogPage":
      return { type: "blogPage", page: route.page };
  }
}
