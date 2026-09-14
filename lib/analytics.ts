"use client";

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

export function getPageType(pathname: string): string {
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
