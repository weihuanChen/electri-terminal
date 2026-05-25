import type { Metadata } from "next";

const metadataTitle =
  "Industrial Electrical Connection Components | Electri Terminal";
const metadataDescription =
  "Explore industrial electrical connection components including terminals, copper connectors, wiring accessories, and OEM connection systems for industrial and commercial applications.";

export const metadata: Metadata = {
  title: metadataTitle,
  description: metadataDescription,
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    type: "website",
    title: metadataTitle,
    description: metadataDescription,
    url: "/categories",
  },
  twitter: {
    card: "summary",
    title: metadataTitle,
    description: metadataDescription,
  },
};

export default function CategoriesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
