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
