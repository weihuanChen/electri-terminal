"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

function normalizeConvexUrl(url: string) {
  return url.replace(/\/+$/, "");
}

const convex = new ConvexReactClient(
  normalizeConvexUrl(process.env.NEXT_PUBLIC_CONVEX_URL!)
);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
