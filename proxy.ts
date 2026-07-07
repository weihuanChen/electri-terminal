import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  I18N_REQUEST_LOCALE_HEADER,
  resolveLocaleFromPathname,
} from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/rfq" ||
    request.nextUrl.pathname.startsWith("/rfq/")
  ) {
    const redirectUrl = new URL(`/contact${request.nextUrl.search}`, request.url);
    redirectUrl.hash = "request-quote";

    return NextResponse.redirect(redirectUrl, 301);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    I18N_REQUEST_LOCALE_HEADER,
    resolveLocaleFromPathname(request.nextUrl.pathname)
  );

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/rfq/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|favicon-16x16.png|favicon-32x32.png|apple-touch-icon.png|android-chrome-192x192.png|android-chrome-512x512.png|robots.txt|sitemap.xml|sitemap-images.xml|.*\\..*).*)",
  ],
};
