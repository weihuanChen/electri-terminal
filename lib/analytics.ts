"use client";

import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

export const GA_MEASUREMENT_ID = "G-F5M3QMLTL1";

export type GtagEventParams = Record<
  string,
  string | number | boolean | null | undefined | (() => void)
>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "event",
      eventName: string,
      eventParams?: GtagEventParams,
    ) => void;
  }
}

export function trackGA4Event(eventName: string, params: GtagEventParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const eventParams = {
    ...params,
    send_to: GA_MEASUREMENT_ID,
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, eventParams);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["event", eventName, eventParams]);
}

function withoutLocalePrefix(pathname: string) {
  const segments = pathname.split("/");
  if (SUPPORTED_LOCALES.some((locale) => locale === segments[1])) {
    return `/${segments.slice(2).join("/")}`;
  }
  return pathname;
}

export function isQuoteLink(href: string, pageUrl: string): boolean {
  try {
    const page = new URL(pageUrl);
    const destination = new URL(href, page);
    if (destination.origin !== page.origin) return false;

    const pathname = withoutLocalePrefix(destination.pathname).replace(/\/$/, "");
    return (
      pathname === "/rfq" ||
      (pathname === "/contact" && destination.hash === "#request-quote") ||
      destination.hash === "#inquiry-form"
    );
  } catch {
    return false;
  }
}

export function getPageType(rawPathname: string): string {
  const pathname = withoutLocalePrefix(rawPathname);
  if (pathname === "/") return "home";
  if (pathname.startsWith("/blog")) return "blog";
  if (pathname.startsWith("/selection-guide")) return "selection_guide";
  if (pathname.startsWith("/categories")) return "category";
  if (pathname.startsWith("/families")) return "family";
  if (pathname.startsWith("/products")) return "product";
  if (pathname.startsWith("/manufacturing")) return "manufacturing";
  if (pathname.startsWith("/quality-certifications")) return "certification";
  if (pathname.startsWith("/contact")) return "contact";
  return "other";
}
