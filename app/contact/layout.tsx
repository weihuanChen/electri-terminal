import type { Metadata } from "next";
import { contactUrl } from "@/lib/routes";

const metadataTitle =
  "Contact Electri Terminal | OEM Electrical Terminal Manufacturer";
const metadataDescription =
  "Contact Electri Terminal for OEM electrical terminals, copper connector components, custom manufacturing inquiries, and industrial wiring project support.";

export const metadata: Metadata = {
  title: metadataTitle,
  description: metadataDescription,
  alternates: {
    canonical: contactUrl(),
  },
  openGraph: {
    type: "website",
    title: metadataTitle,
    description: metadataDescription,
    url: contactUrl(),
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
