import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import BottomRFQSection from "@/components/home/BottomRFQSection";
import JsonLd from "@/components/seo/JsonLd";
import { Breadcrumb, FAQAccordion } from "@/components/shared";
import {
  categoryUrl,
  contactUrl,
  homeUrl,
  manufacturingUrl,
  productsUrl,
  qualityCertificationsUrl,
  requestQuoteUrl,
  selectionGuideUrl,
  solutionsUrl,
} from "@/lib/routes";
import { makeBreadcrumbSchema, makeCollectionPageSchema, makeFAQPageSchema } from "@/lib/schema";

import ApplicationDetailSection from "./_components/ApplicationDetailSection";
import IndustryOverviewCard from "./_components/IndustryOverviewCard";
import {
  exportMarkets,
  exportMarketsDescription,
  exportMarketsTitle,
  industriesOverviewSubtitle,
  industriesOverviewTitle,
  materialHighlights,
  materialSectionDescription,
  materialSectionTitle,
  solutionIndustries,
  solutionsFaqItems,
  solutionsFaqTitle,
  solutionsHeroDescription,
  solutionsHeroEyebrow,
  solutionsHeroTitle,
  solutionsMetadataDescription,
  solutionsMetadataTitle,
} from "./data";

const pagePath = solutionsUrl();

export const metadata: Metadata = {
  title: solutionsMetadataTitle,
  description: solutionsMetadataDescription,
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    type: "website",
    title: solutionsMetadataTitle,
    description: solutionsMetadataDescription,
    url: pagePath,
  },
  twitter: {
    card: "summary_large_image",
    title: solutionsMetadataTitle,
    description: solutionsMetadataDescription,
  },
};

export default function SolutionsPage() {
  const breadcrumbItems = [{ label: "Solutions" }];

  const structuredData = [
    makeBreadcrumbSchema([
      { name: "Home", path: homeUrl() },
      { name: "Solutions", path: pagePath },
    ]),
    makeCollectionPageSchema({
      name: solutionsHeroTitle,
      description: solutionsMetadataDescription,
      path: pagePath,
    }),
    makeFAQPageSchema({
      path: pagePath,
      items: solutionsFaqItems,
    }),
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="border-b border-border bg-muted dark:bg-slate-900/40">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="border-b border-slate-800 bg-[#11151A] py-14 md:py-20">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
            <div className="space-y-7">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
                {solutionsHeroEyebrow}
              </p>
              <h1 className="text-4xl font-semibold leading-tight !text-white md:text-5xl">
                {solutionsHeroTitle}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                {solutionsHeroDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="#applications-overview" className="btn btn-primary">
                  Browse Applications
                </Link>
                <Link href={requestQuoteUrl()} className="btn btn-hero-secondary">
                  Request Quote
                </Link>
              </div>
              <ul className="space-y-2 pt-1 text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  Nine industrial application areas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  99.9% copper with matte tin plating
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  Export support for DE, FR, US, and JP
                </li>
              </ul>
            </div>

            <div
              className="relative h-[300px] overflow-hidden rounded-sm border border-slate-700 bg-slate-900 md:h-[440px]"
            >
              <Image
                src="/images/solutions/solutions-hero.webp"
                alt="Industrial electrical control cabinet with copper terminal connections"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/10" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8">
        <div className="container">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            Jump to Application
          </p>
          <nav
            className="flex flex-wrap gap-2"
            aria-label="Application industry navigation"
          >
            {solutionIndustries.map((industry) => (
              <Link
                key={industry.slug}
                href={`#${industry.slug}`}
                className="rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
              >
                {industry.shortTitle}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="section bg-[#EEF2F6] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 md:text-3xl">
              {materialSectionTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              {materialSectionDescription}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {materialHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
            <Link
              href={manufacturingUrl()}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
            >
              Manufacturing processes
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={qualityCertificationsUrl()}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
            >
              Compliance documentation
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={selectionGuideUrl()}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
            >
              Terminal selection guide
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        id="applications-overview"
        className="section scroll-mt-28 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="container">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 md:text-3xl">
              {industriesOverviewTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              {industriesOverviewSubtitle}
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutionIndustries.map((industry) => (
              <IndustryOverviewCard key={industry.slug} industry={industry} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        {solutionIndustries.map((industry, index) => (
          <ApplicationDetailSection
            key={industry.slug}
            industry={industry}
            index={index}
            categoryHref={categoryUrl(industry.categorySlug)}
          />
        ))}
      </section>

      <section className="section border-y border-slate-200 dark:border-slate-800 bg-[#EEF2F6] dark:bg-slate-900">
        <div className="container">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 md:text-3xl">
              {exportMarketsTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              {exportMarketsDescription}
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {exportMarkets.map((market) => (
              <div
                key={market.country}
                className="rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6"
              >
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  {market.regionLabel}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {market.country}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {market.summary}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href={contactUrl()} className="text-primary hover:text-primary/80">
              Contact for export projects →
            </Link>
            <Link href={qualityCertificationsUrl()} className="text-primary hover:text-primary/80">
              Request compliance documents →
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-white dark:bg-slate-950">
        <div className="container">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 md:text-3xl">
              {solutionsFaqTitle}
            </h2>
          </div>
          <FAQAccordion items={solutionsFaqItems} />
          <div className="mt-10 flex flex-wrap gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <Link href={productsUrl()} className="text-primary hover:text-primary/80">
              Browse all products
            </Link>
            <Link href={selectionGuideUrl()} className="text-primary hover:text-primary/80">
              Open selection guide
            </Link>
          </div>
        </div>
      </section>

      <BottomRFQSection
        title="Get Terminal Recommendations for Your Application"
        subtitle="Share your application, wire size, stud size, and target market. We will respond with suitable terminal types, sample options, and project-based MOQ and lead time."
        primaryCta={{
          text: "Request a Quote",
          href: requestQuoteUrl(),
        }}
        secondaryCta={{
          text: "Contact Engineering",
          href: contactUrl(),
        }}
        benefits={[
          "Application-based terminal recommendations",
          "Engineering samples for qualified projects",
          "Export documentation support",
          "MOQ confirmed per item number",
        ]}
      />
    </>
  );
}
