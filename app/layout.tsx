import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import LazyToaster from "@/components/providers/LazyToaster";
import RouteAwareAnalytics from "@/components/providers/RouteAwareAnalytics";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { makeOrganizationSchema, makeWebsiteSchema } from "@/lib/schema";
import { getSiteUrl } from "@/lib/site"; // Force HMR

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Electri Terminal - Professional Electrical Solutions",
  description: "Electri Terminal provides professional electrical solutions for industrial and commercial applications.",
  verification: {
    yandex: "a16d516d193917a4",
  },
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <JsonLd data={structuredData} />
        <ConvexClientProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ConvexClientProvider>
        <LazyToaster />
        <RouteAwareAnalytics />
      </body>
    </html>
  );
}
