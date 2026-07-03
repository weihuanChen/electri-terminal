import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Cookie,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRoundX,
} from "lucide-react";

import JsonLd from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/shared";
import { makeBreadcrumbSchema } from "@/lib/schema";
import { toAbsoluteSiteUrl } from "@/lib/site";

const pageTitle = "Privacy Policy";
const pageDescription =
  "Privacy Policy for Electri Terminal, explaining our no-login approach, voluntary inquiry handling, and limited analytics used to improve the public website experience.";
const lastUpdated = "July 3, 2026";

const privacyHighlights = [
  {
    title: "No account or login",
    description:
      "Visitors can browse our public product and company information without registering, creating a profile, or signing in.",
    icon: UserRoundX,
  },
  {
    title: "Limited analytics only",
    description:
      "Analytics tools may measure page views, document downloads, and general usage patterns to help improve the website experience.",
    icon: Cookie,
  },
  {
    title: "No sales of user data",
    description:
      "We do not sell visitor information, build advertising profiles, or store analytics events in our own business database.",
    icon: ShieldCheck,
  },
];

const policySections = [
  {
    title: "1. Scope of This Policy",
    body: [
      "This Privacy Policy explains how Electri Terminal handles privacy for visitors, buyers, distributors, and other business contacts who use our public website.",
      "Our website is primarily an informational B2B website for electrical terminal products, technical resources, manufacturing information, and business inquiries.",
    ],
  },
  {
    title: "2. Information We Do Not Require",
    body: [
      "We do not require visitors to create an account, log in, or provide personal information in order to browse the public website.",
      "We do not intentionally collect sensitive personal information, payment card details, government identification numbers, or login credentials from public website visitors.",
      "We do not use normal website browsing to create customer accounts, sales leads, personal dossiers, or visitor records in our own business database.",
    ],
  },
  {
    title: "3. Limited Website Analytics",
    body: [
      "We may use analytics tools, such as Google Analytics and Vercel Analytics, to understand how visitors use the public website. This may include information such as pages visited, approximate location, browser or device type, referring pages, document download events, and general interaction patterns.",
      "Analytics information is used only to improve website performance, product content, navigation, documentation availability, and user experience. We do not use analytics data to identify individual visitors, sell user information, or build advertising profiles.",
      "Analytics reports are processed by the relevant analytics service providers. Electri Terminal does not store these analytics events in its own product, inquiry, or customer database.",
    ],
  },
  {
    title: "4. Information You Voluntarily Provide",
    body: [
      "If you choose to contact us by email, contact form, RFQ form, phone, WhatsApp, LinkedIn, or another business communication channel, you may voluntarily provide information such as your name, company name, email address, phone number, country or region, product requirements, technical files, and message content.",
      "This information is provided by you for business communication. We use it only to respond to your inquiry, prepare quotations, discuss product requirements, provide documentation, arrange samples, support orders, or maintain reasonable business records.",
    ],
  },
  {
    title: "5. Cookies and Similar Technologies",
    body: [
      "Because the public website does not require visitor accounts, there are no account-login cookies for normal browsing.",
      "Analytics providers may use cookies or similar technologies to measure website usage. These tools are used for website improvement and reporting, not for account login, payment processing, retargeting, or selling visitor information.",
    ],
  },
  {
    title: "6. How We Use Voluntary Business Information",
    body: [
      "When you voluntarily send us business information, we may use it to communicate with you, confirm product specifications, prepare commercial offers, arrange documentation, provide after-sales support, improve our product information, and comply with applicable business or legal obligations.",
      "We do not sell, rent, trade, or commercially share your submitted business contact information with unrelated third parties for their own marketing purposes.",
    ],
  },
  {
    title: "7. Sharing and Disclosure",
    body: [
      "We may share necessary business information with service providers or partners only when needed to handle your request, such as logistics, document delivery, technical review, or order-related support.",
      "We may also disclose information if required by applicable law, regulation, legal process, or a legitimate request from a competent authority.",
    ],
  },
  {
    title: "8. International Business Communications",
    body: [
      "As an export-oriented business website, inquiries may be handled across different countries or regions depending on the destination market, product requirements, and communication channel.",
      "By voluntarily contacting us, you understand that your submitted business information may be processed for international B2B communication and order support.",
    ],
  },
  {
    title: "9. Data Retention",
    body: [
      "We retain voluntarily submitted inquiry or order-related information only for as long as reasonably necessary for the business purpose for which it was provided, including quotation follow-up, project support, compliance documentation, dispute prevention, and legal or accounting requirements.",
      "You may contact us to request deletion of your submitted contact information where applicable and technically feasible.",
    ],
  },
  {
    title: "10. Security",
    body: [
      "We use reasonable administrative and technical measures to protect business communications and submitted inquiry information against unauthorized access, misuse, loss, or disclosure.",
      "No method of internet transmission or electronic storage can be guaranteed as completely secure, so please avoid sending highly sensitive personal information through public forms or email.",
    ],
  },
  {
    title: "11. Third-Party Links",
    body: [
      "Our website may contain links to third-party websites, social media pages, logistics providers, document platforms, or other external resources.",
      "We are not responsible for the privacy practices, content, or security of third-party websites. Please review their privacy policies before providing information to them.",
    ],
  },
  {
    title: "12. Children's Privacy",
    body: [
      "Our website is intended for business users and is not directed to children. We do not knowingly collect personal information from children.",
    ],
  },
  {
    title: "13. Your Choices and Requests",
    body: [
      "Because the public website does not require login accounts, visitors can browse without creating a personal profile.",
      "If you have voluntarily submitted information to us, you may contact us to request access, correction, update, or deletion, subject to applicable business, legal, and technical limitations.",
    ],
  },
  {
    title: "14. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect website changes, business practices, or legal requirements.",
      "The updated version will be posted on this page with a revised last updated date.",
    ],
  },
];

export const metadata: Metadata = {
  title: `${pageTitle} | Electri Terminal`,
  description: pageDescription,
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    type: "website",
    title: `${pageTitle} | Electri Terminal`,
    description: pageDescription,
    url: "/privacy-policy",
  },
  twitter: {
    card: "summary",
    title: `${pageTitle} | Electri Terminal`,
    description: pageDescription,
  },
};

export default function PrivacyPolicyPage() {
  const breadcrumbItems = [{ label: pageTitle }];
  const structuredData = [
    makeBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: pageTitle, path: "/privacy-policy" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: pageTitle,
      description: pageDescription,
      url: toAbsoluteSiteUrl("/privacy-policy"),
      dateModified: "2026-07-03",
      inLanguage: "en",
    },
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="border-b border-border bg-muted">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="border-b border-slate-800 bg-[#10151B] py-14 md:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                Privacy Statement
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight !text-white md:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Electri Terminal keeps the public website simple: no account registration, no
                required login, limited website analytics for experience improvement, and no storage
                of analytics events in our own inquiry or customer database.
              </p>
              <p className="mt-5 text-sm font-medium text-slate-400">
                Last updated: {lastUpdated}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:justify-self-end">
              {privacyHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="border border-slate-700 bg-slate-900/70 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center border border-slate-600 bg-slate-950 text-orange-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold !text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-[#FFFFFF]">
        <div className="container text-zinc-950">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-start">
            <aside className="lg:sticky lg:top-24">
              <div className="border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-slate-300 bg-white text-slate-700">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Plain Summary
                    </p>
                    <p className="text-base font-semibold text-slate-950">Privacy by default</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    "No visitor account is required.",
                    "Analytics is used to improve website content and usability.",
                    "Analytics events are not stored in our own inquiry or customer database.",
                    "Contact details are used when you choose to send an inquiry.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <p className="text-sm leading-6 text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/contact"
                  className="btn btn-outline mt-6 w-full justify-center bg-white"
                >
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Link>
              </div>
            </aside>

            <div className="space-y-5">
              <div className="border border-slate-200 bg-white p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Policy Overview
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950 md:text-3xl">
                      A practical privacy policy for a public B2B website
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-orange-200 bg-orange-50 text-orange-700">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                  This page describes our privacy approach in practical terms. Visitors do not need
                  accounts to browse the website. We use limited analytics to understand and improve
                  the public website, while business contact information is handled only when a buyer,
                  distributor, or business partner voluntarily contacts us.
                </p>
              </div>

              {policySections.map((section) => (
                <article
                  key={section.title}
                  className="border border-slate-200 bg-white p-6 md:p-8"
                >
                  <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-base leading-7 text-slate-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}

              <article className="border border-slate-800 bg-slate-950 p-6 text-white md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Contact for Privacy Requests
                </p>
                <h2 className="mt-3 text-2xl font-semibold !text-white">
                  Questions about this Privacy Policy
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  For privacy questions, business information updates, or deletion requests, please
                  contact Electri Terminal through our contact page or by email at{" "}
                  <a
                    href="mailto:info@electriterminal.com"
                    className="font-semibold text-orange-300 underline underline-offset-4 hover:text-orange-200"
                  >
                    info@electriterminal.com
                  </a>
                  .
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
