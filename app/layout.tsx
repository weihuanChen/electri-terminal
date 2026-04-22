import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { Toaster } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { makeOrganizationSchema, makeWebsiteSchema } from "@/lib/schema";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Electri Terminal - Professional Electrical Solutions",
  description: "Electri Terminal provides professional electrical solutions for industrial and commercial applications.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = [makeOrganizationSchema(), makeWebsiteSchema()];

  return (
    <html lang="en">
      <body className="antialiased">
        <JsonLd data={structuredData} />
        <ConvexClientProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ConvexClientProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
