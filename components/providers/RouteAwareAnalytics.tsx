"use client";

import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

const GA_MEASUREMENT_ID = "G-F5M3QMLTL1";

type GtagEventParams = Record<
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

function sendPdfDownloadEvent(params: GtagEventParams) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "pdf_download", params);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["event", "pdf_download", params]);
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

      if (!(target instanceof Element) || event.defaultPrevented) {
        return;
      }

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
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
        sendPdfDownloadEvent(eventParams);
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

      sendPdfDownloadEvent({
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
