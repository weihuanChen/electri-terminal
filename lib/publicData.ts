import { unstable_cache } from "next/cache";

import {
  type PublicContactSettings,
  normalizePublicContactSettings,
} from "@/lib/contactConfig";
import { getAdminConvexClient } from "@/lib/convex-admin";

export interface NavigationCategory {
  _id: string;
  slug: string;
  name: string;
  level: number;
  sortOrder: number;
  isVisibleInNav: boolean;
}

export interface ProductsHubCategory {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  familyCount: number;
  productCount: number;
}

export interface ProductsHubFamily {
  _id: string;
  slug: string;
  name: string;
  summary?: string;
  heroImage?: string;
  highlights?: string[];
  productCount: number;
  category?: {
    slug: string;
    name: string;
  } | null;
}

export interface ProductsHubData {
  categories: ProductsHubCategory[];
  featuredFamilies: ProductsHubFamily[];
}

export interface HomePageCategory {
  _id: string;
  slug: string;
  name: string;
}

export interface HomePageFeaturedProduct {
  _id: string;
  slug: string;
  title: string;
  summary?: string;
  mainImage?: string;
  categoryId: string;
}

export interface HomePageApplicationArticle {
  title: string;
  slug: string;
  excerpt?: string;
  productCount: number;
  coverImage?: string;
}

export interface HomePageData {
  categories: HomePageCategory[];
  featuredProducts: HomePageFeaturedProduct[];
  applications: HomePageApplicationArticle[];
  contactSettings: PublicContactSettings;
}

export const getHeaderNavigation = unstable_cache(
  async () => {
    const categories = (await getAdminConvexClient().query("frontend:listCategoriesForPublic", {
      limit: 20,
    })) as NavigationCategory[];

    return categories
      .filter((category) => category.isVisibleInNav && category.level === 0)
      .sort((left, right) => left.sortOrder - right.sortOrder);
  },
  ["header-navigation"],
  { revalidate: 3600 }
);

export const getProductsHubData = unstable_cache(
  async () => {
    return (await getAdminConvexClient().query("frontend:getProductsHubData", {
      categoryLimit: 8,
      featuredFamilyLimit: 6,
    })) as ProductsHubData;
  },
  ["products-hub-data-v2"],
  { revalidate: 3600 }
);

export const getPublicContactSettings = unstable_cache(
  async (): Promise<PublicContactSettings> => {
    const rawSettings = (await getAdminConvexClient().query("frontend:getPublicContactSettings", {})) as
      | Partial<PublicContactSettings>
      | null;

    return normalizePublicContactSettings(rawSettings);
  },
  ["public-contact-settings"],
  { revalidate: 3600 }
);

export const getHomePageData = unstable_cache(
  async (): Promise<HomePageData> => {
    const [categories, featuredProducts, applications, rawSettings] =
      await Promise.all([
        getAdminConvexClient().query("frontend:listCategoriesForPublic", {
          limit: 20,
        }) as Promise<HomePageCategory[]>,
        getAdminConvexClient().query("frontend:listFeaturedProducts", {
          limit: 24,
        }) as Promise<HomePageFeaturedProduct[]>,
        getAdminConvexClient().query("frontend:listApplicationArticles", {
          limit: 8,
        }) as Promise<HomePageApplicationArticle[]>,
        getAdminConvexClient().query("frontend:getPublicContactSettings", {}) as Promise<
          Partial<PublicContactSettings> | null
        >,
      ]);

    return {
      categories,
      featuredProducts,
      applications,
      contactSettings: normalizePublicContactSettings(rawSettings),
    };
  },
  ["home-page-data-v1"],
  { revalidate: 3600 }
);
