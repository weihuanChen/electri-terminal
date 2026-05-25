import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const redirectUrl = new URL(`/contact${request.nextUrl.search}`, request.url);
  redirectUrl.hash = "request-quote";

  return NextResponse.redirect(redirectUrl, 301);
}

export const config = {
  matcher: ["/rfq/:path*"],
};
