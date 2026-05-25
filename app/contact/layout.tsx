import type { Metadata } from "next";

const metadataTitle =
  "Contact Electri Terminal | OEM Electrical Terminal Manufacturer";
const metadataDescription =
  "Contact Electri Terminal for OEM electrical terminals, copper connector components, custom manufacturing inquiries, and industrial wiring project support.";

export const metadata: Metadata = {
  title: metadataTitle,
  description: metadataDescription,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    title: metadataTitle,
    description: metadataDescription,
    url: "/contact",
  },
  twitter: {
    card: "summary",
    title: metadataTitle,
    description: metadataDescription,
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
