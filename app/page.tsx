import type { Metadata } from "next";

import HomePageClient from "./HomePageClient";

const homeTitle =
  "Electri Terminal | Ring Terminal & Cable Gland Manufacturer";
const homeDescription =
  "Electri Terminal manufactures ring terminals, cable glands, and precision copper connector parts for industrial wiring, control cabinets, and OEM assemblies.";

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  keywords: [
    "ring terminal manufacturer",
    "ring terminal supplier",
    "cable gland manufacturer",
    "cable gland supplier",
    "precision copper parts",
    "copper connector parts",
    "copper terminal manufacturer",
    "industrial electrical connectors",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
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
