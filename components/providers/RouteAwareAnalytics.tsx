"use client";

import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const GA_MEASUREMENT_ID = "G-F5M3QMLTL1";

function isAdminPath(pathname: string | null) {
  return pathname === "/admin" || pathname?.startsWith("/admin/");
}

export default function RouteAwareAnalytics() {
  const pathname = usePathname();

  if (isAdminPath(pathname)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Analytics />
    </>
  );
}
