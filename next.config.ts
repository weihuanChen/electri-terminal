import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
      {
        source: "/series/:slug",
        destination: "/families/:slug",
        permanent: true,
      },
      {
        source: "/product/:slug",
        destination: "/products/:slug",
        permanent: true,
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

export default nextConfig;
