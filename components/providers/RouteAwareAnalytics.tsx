"use client";

import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import {
  GA_MEASUREMENT_ID,
  getPageType,
  trackGA4Event,
  type GtagEventParams,
} from "@/lib/analytics";

function isAdminPath(pathname: string | null) {
  return pathname === "/admin" || pathname?.startsWith("/admin/");
}

function getPdfDownloadInfo(anchor: HTMLAnchorElement) {
  const rawHref = anchor.getAttribute("href");

  if (!rawHref) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(rawHref, window.location.href);
  } catch {
    return null;
  }

  if (!url.pathname.toLowerCase().endsWith(".pdf")) {
    return null;
  }

  const fileName = decodeURIComponent(url.pathname.split("/").pop() || "download.pdf");
  const pdfName = fileName.replace(/\.pdf$/i, "");

  return {
    fileName,
    linkUrl: url.href,
    pdfName,
  };
}

function getDeclaredTrackingEvent(element: Element) {
  const trackedElement = element.closest<HTMLElement>("[data-ga-event]");
  const eventName = trackedElement?.dataset.gaEvent;

  if (!trackedElement || !eventName) {
    return null;
  }

  const params: GtagEventParams = {};

  for (const attribute of trackedElement.attributes) {
    if (!attribute.name.startsWith("data-ga-param-")) {
      continue;
    }

    const parameterName = attribute.name.slice("data-ga-param-".length).replaceAll("-", "_");
    params[parameterName] = attribute.value;
  }

  return { eventName, params, trackedElement };
}

export default function RouteAwareAnalytics() {
  const pathname = usePathname();
  const isAdmin = isAdminPath(pathname);

  useEffect(() => {
    if (isAdmin || !pathname) return;
    const baseParams = { page_path: pathname, page_type: getPageType(pathname) };
    let engaged = false;
    let deepEngaged = false;
    const startedAt = Date.now();
    const emitEngagement = () => {
      const elapsed = Date.now() - startedAt;
      const progress = (window.scrollY + window.innerHeight) / Math.max(document.documentElement.scrollHeight, 1);
      if (!engaged && (elapsed >= 30_000 || progress >= 0.5)) {
        engaged = true;
        trackGA4Event("content_engaged", baseParams);
      }
      if (!deepEngaged && elapsed >= 60_000 && progress >= 0.75) {
        deepEngaged = true;
        trackGA4Event("content_deep_engaged", baseParams);
      }
    };
    const timer = window.setInterval(emitEngagement, 5_000);
    window.addEventListener("scroll", emitEngagement, { passive: true });
    emitEngagement();
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", emitEngagement);
    };
  }, [isAdmin, pathname]);

  useEffect(() => {
    if (isAdmin) return;
    let started = false;
    const handleFocus = (event: FocusEvent) => {
      if (started || !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) return;
      const form = event.target.closest("form");
      if (!form || !form.querySelector('[name="email"]') || !form.querySelector('[name="message"]')) return;
      started = true;
      trackGA4Event("rfq_start", { page_path: window.location.pathname, page_type: getPageType(window.location.pathname) });
    };
    document.addEventListener("focusin", handleFocus);
    return () => document.removeEventListener("focusin", handleFocus);
  }, [isAdmin, pathname]);

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");

      const declaredEvent = getDeclaredTrackingEvent(target);
      if (declaredEvent) {
        trackGA4Event(declaredEvent.eventName, {
          ...declaredEvent.params,
          page_type: getPageType(window.location.pathname),
          link_text: declaredEvent.trackedElement.textContent?.trim().slice(0, 120) || undefined,
          link_url: anchor instanceof HTMLAnchorElement ? anchor.href : undefined,
          page_path: window.location.pathname,
        });
      }

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.href.toLowerCase();
      if (href.startsWith("mailto:")) {
        trackGA4Event("email_click", {
          page_path: window.location.pathname,
          page_type: getPageType(window.location.pathname),
          link_text: anchor.textContent?.trim().slice(0, 120) || undefined,
        });
      } else if (href.startsWith("https://wa.me/") || href.startsWith("whatsapp:")) {
        trackGA4Event("whatsapp_click", {
          page_path: window.location.pathname,
          page_type: getPageType(window.location.pathname),
          link_text: anchor.textContent?.trim().slice(0, 120) || undefined,
        });
      }

      if (event.defaultPrevented) {
        return;
      }

      const downloadInfo = getPdfDownloadInfo(anchor);

      if (!downloadInfo) {
        return;
      }

      const eventParams: GtagEventParams = {
        file_extension: "pdf",
        file_name: downloadInfo.fileName,
        link_text: anchor.textContent?.trim().slice(0, 120) || undefined,
        link_url: downloadInfo.linkUrl,
        page_path: window.location.pathname,
        pdf_name: downloadInfo.pdfName,
        send_to: GA_MEASUREMENT_ID,
      };

      const shouldWaitForEvent =
        event.button === 0 &&
        !event.metaKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !anchor.hasAttribute("download") &&
        (!anchor.target || anchor.target === "_self");

      if (!shouldWaitForEvent) {
        trackGA4Event("catalog_download", { ...eventParams, page_type: getPageType(window.location.pathname) });
        return;
      }

      event.preventDefault();

      let hasNavigated = false;
      const continueNavigation = () => {
        if (hasNavigated) {
          return;
        }

        hasNavigated = true;
        window.location.href = anchor.href;
      };

      trackGA4Event("catalog_download", {
        ...eventParams,
        event_callback: continueNavigation,
        event_timeout: 800,
        page_type: getPageType(window.location.pathname),
      });

      window.setTimeout(continueNavigation, 900);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isAdmin]);

  if (isAdmin) {
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
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted'
          });
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Analytics />
    </>
  );
}
