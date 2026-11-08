import type { Metadata } from "next";

import HomePageClient from "./HomePageClient";
import { homeUrl } from "@/lib/routes";

// Homepage targets commercial "custom/OEM copper terminal manufacturer" intent.
// Generic "ring terminal(s)" queries belong to /categories/ring-terminals to avoid cannibalization
// (GSC Aug–Nov 2026: home ranked ~10.6 with 918 impressions; ring-terminals category had 2,034).
const homeTitle = "Custom Copper Terminal & Lug Manufacturer | Electri Terminal";
const homeDescription =
  "Factory since 2009 making custom copper terminals, ring terminals, and cable lugs to your drawing. 99.9% copper, tin-plated. OEM supplier to Amazon brand sellers.";

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  keywords: [
    "custom copper terminal manufacturer",
    "copper terminal manufacturer",
    "OEM copper terminals",
    "custom cable lugs",
    "copper lug manufacturer",
    "ring terminal manufacturer",
    "precision copper parts",
  ],
  alternates: {
    canonical: homeUrl(),
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: homeUrl(),
    siteName: "Electri Terminal",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: homeTitle,
    description: homeDescription,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
