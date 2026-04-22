/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_index from "../admin/index.js";
import type * as frontend from "../frontend.js";
import type * as http from "../http.js";
import type * as lib_attributes from "../lib/attributes.js";
import type * as lib_categoryPageConfig from "../lib/categoryPageConfig.js";
import type * as lib_familyPageConfig from "../lib/familyPageConfig.js";
import type * as lib_siteSettings from "../lib/siteSettings.js";
import type * as lib_validators from "../lib/validators.js";
import type * as mutations from "../mutations.js";
import type * as mutations_admin from "../mutations/admin.js";
import type * as mutations_admin_articles from "../mutations/admin/articles.js";
import type * as mutations_admin_assets from "../mutations/admin/assets.js";
import type * as mutations_admin_attributeTemplates from "../mutations/admin/attributeTemplates.js";
import type * as mutations_admin_catalog from "../mutations/admin/catalog.js";
import type * as mutations_admin_categories from "../mutations/admin/categories.js";
import type * as mutations_admin_imports from "../mutations/admin/imports.js";
import type * as mutations_admin_index from "../mutations/admin/index.js";
import type * as mutations_admin_inquiries from "../mutations/admin/inquiries.js";
import type * as mutations_admin_navigation from "../mutations/admin/navigation.js";
import type * as mutations_admin_productFamilies from "../mutations/admin/productFamilies.js";
import type * as mutations_admin_productVariants from "../mutations/admin/productVariants.js";
import type * as mutations_admin_products from "../mutations/admin/products.js";
import type * as mutations_admin_relations from "../mutations/admin/relations.js";
import type * as mutations_admin_seed from "../mutations/admin/seed.js";
import type * as mutations_admin_shared from "../mutations/admin/shared.js";
import type * as mutations_admin_siteSettings from "../mutations/admin/siteSettings.js";
import type * as queries from "../queries.js";
import type * as queries_common from "../queries/common.js";
import type * as queries_index from "../queries/index.js";
import type * as queries_modules_articles from "../queries/modules/articles.js";
import type * as queries_modules_assets from "../queries/modules/assets.js";
import type * as queries_modules_attributeTemplates from "../queries/modules/attributeTemplates.js";
import type * as queries_modules_categories from "../queries/modules/categories.js";
import type * as queries_modules_imports from "../queries/modules/imports.js";
import type * as queries_modules_index from "../queries/modules/index.js";
import type * as queries_modules_inquiries from "../queries/modules/inquiries.js";
import type * as queries_modules_navigation from "../queries/modules/navigation.js";
import type * as queries_modules_products from "../queries/modules/products.js";
import type * as queries_modules_relations from "../queries/modules/relations.js";
import type * as queries_modules_shared from "../queries/modules/shared.js";
import type * as r2Assets from "../r2Assets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/index": typeof admin_index;
  frontend: typeof frontend;
  http: typeof http;
  "lib/attributes": typeof lib_attributes;
  "lib/categoryPageConfig": typeof lib_categoryPageConfig;
  "lib/familyPageConfig": typeof lib_familyPageConfig;
  "lib/siteSettings": typeof lib_siteSettings;
  "lib/validators": typeof lib_validators;
  mutations: typeof mutations;
  "mutations/admin": typeof mutations_admin;
  "mutations/admin/articles": typeof mutations_admin_articles;
  "mutations/admin/assets": typeof mutations_admin_assets;
  "mutations/admin/attributeTemplates": typeof mutations_admin_attributeTemplates;
  "mutations/admin/catalog": typeof mutations_admin_catalog;
  "mutations/admin/categories": typeof mutations_admin_categories;
  "mutations/admin/imports": typeof mutations_admin_imports;
  "mutations/admin/index": typeof mutations_admin_index;
  "mutations/admin/inquiries": typeof mutations_admin_inquiries;
  "mutations/admin/navigation": typeof mutations_admin_navigation;
  "mutations/admin/productFamilies": typeof mutations_admin_productFamilies;
  "mutations/admin/productVariants": typeof mutations_admin_productVariants;
  "mutations/admin/products": typeof mutations_admin_products;
  "mutations/admin/relations": typeof mutations_admin_relations;
  "mutations/admin/seed": typeof mutations_admin_seed;
  "mutations/admin/shared": typeof mutations_admin_shared;
  "mutations/admin/siteSettings": typeof mutations_admin_siteSettings;
  queries: typeof queries;
  "queries/common": typeof queries_common;
  "queries/index": typeof queries_index;
  "queries/modules/articles": typeof queries_modules_articles;
  "queries/modules/assets": typeof queries_modules_assets;
  "queries/modules/attributeTemplates": typeof queries_modules_attributeTemplates;
  "queries/modules/categories": typeof queries_modules_categories;
  "queries/modules/imports": typeof queries_modules_imports;
  "queries/modules/index": typeof queries_modules_index;
  "queries/modules/inquiries": typeof queries_modules_inquiries;
  "queries/modules/navigation": typeof queries_modules_navigation;
  "queries/modules/products": typeof queries_modules_products;
  "queries/modules/relations": typeof queries_modules_relations;
  "queries/modules/shared": typeof queries_modules_shared;
  r2Assets: typeof r2Assets;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  r2: {
    lib: {
      deleteMetadata: FunctionReference<
        "mutation",
        "internal",
        { bucket: string; key: string },
        null
      >;
      deleteObject: FunctionReference<
        "mutation",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      deleteR2Object: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      getMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        {
          bucket: string;
          bucketLink: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
          url: string;
        } | null
      >;
      listMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          cursor?: string;
          endpoint: string;
          limit?: number;
          secretAccessKey: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            bucket: string;
            bucketLink: string;
            contentType?: string;
            key: string;
            lastModified: string;
            link: string;
            sha256?: string;
            size?: number;
            url: string;
          }>;
          pageStatus?: null | "SplitRecommended" | "SplitRequired";
          splitCursor?: null | string;
        }
      >;
      store: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          secretAccessKey: string;
          url: string;
        },
        any
      >;
      syncMetadata: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          onComplete?: string;
          secretAccessKey: string;
        },
        null
      >;
      upsertMetadata: FunctionReference<
        "mutation",
        "internal",
        {
          bucket: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
        },
        { isNew: boolean }
      >;
    };
  };
};
