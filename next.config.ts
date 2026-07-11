import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { FAMILY_REDIRECTS } from "./lib/familyRedirects";
import { PRODUCT_REDIRECTS } from "./lib/productRedirects";

const URL_MIGRATION_STATUS_CODE = 301 as const;
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "electri-terminal.vercel.app",
          },
        ],
        destination: "https://electriterminal.com/:path*",
        permanent: true,
      },
      ...FAMILY_REDIRECTS.map((redirect) => ({
        source: `/families/${redirect.sourceSlug}`,
        destination: `/families/${redirect.destinationSlug}`,
        statusCode: URL_MIGRATION_STATUS_CODE,
      })),
      ...PRODUCT_REDIRECTS.map((redirect) => ({
        source: `/products/${redirect.sourceSlug}`,
        destination: `/products/${redirect.destinationSlug}`,
        statusCode: URL_MIGRATION_STATUS_CODE,
      })),
      {
        source: "/series/:slug",
        destination: "/families/:slug",
        statusCode: URL_MIGRATION_STATUS_CODE,
      },
      {
        source: "/product/:slug",
        destination: "/products/:slug",
        statusCode: URL_MIGRATION_STATUS_CODE,
      },
      {
        source: "/products/categories/:slug",
        destination: "/categories/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.electriterminal.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
