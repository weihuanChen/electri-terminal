import { unstable_cache } from "next/cache";

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
