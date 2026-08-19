"use client";

import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import {
  GA_MEASUREMENT_ID,
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

function isRequestQuoteLink(anchor: HTMLAnchorElement) {
  try {
    const url = new URL(anchor.href, window.location.href);
    return url.hash === "#request-quote";
  } catch {
    return false;
  }
}

export default function RouteAwareAnalytics() {
  const pathname = usePathname();
  const isAdmin = isAdminPath(pathname);

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
          link_text: declaredEvent.trackedElement.textContent?.trim().slice(0, 120) || undefined,
          link_url: anchor instanceof HTMLAnchorElement ? anchor.href : undefined,
          page_path: window.location.pathname,
        });
      }

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (!declaredEvent && isRequestQuoteLink(anchor)) {
        trackGA4Event("rfq_start", {
          link_text: anchor.textContent?.trim().slice(0, 120) || undefined,
          link_url: anchor.href,
          page_path: window.location.pathname,
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
        trackGA4Event("pdf_download", eventParams);
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

      trackGA4Event("pdf_download", {
        ...eventParams,
        event_callback: continueNavigation,
        event_timeout: 800,
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
