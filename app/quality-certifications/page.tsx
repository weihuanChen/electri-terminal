import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";

import JsonLd from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/shared";
import { makeBreadcrumbSchema, makeCollectionPageSchema } from "@/lib/schema";
import { toAbsoluteSiteUrl } from "@/lib/site";

import CertificateCard from "./_components/CertificateCard";
import ComplianceRequestForm from "./_components/ComplianceRequestForm";
import ULListedCard from "./_components/ULListedCard";
import {
  buyerBenefits,
  certificateCards,
  coverageRows,
  heroTags,
  qualitySteps,
  trustSummary,
  ulListedCard,
} from "./data";

const pageTitle = "Quality Certifications for Electrical Terminals & Components";
const pageDescription =
  "Our products are tested and verified according to international electrical safety and environmental compliance standards, helping distributors, OEMs and project buyers source with confidence.";

const trustIcons = [BadgeCheck, FlaskConical, ShieldCheck, FileCheck2];
const benefitIcons = [ShieldCheck, FileCheck2, CheckCircle2];
const benefitIconStyles = [
  "border-orange-200 bg-orange-100 text-orange-700",
  "border-blue-200 bg-blue-100 text-blue-700",
  "border-orange-200 bg-orange-100 text-orange-700",
];

export const metadata: Metadata = {
  title: `${pageTitle} | Electri Terminal`,
  description: pageDescription,
  alternates: {
    canonical: "/quality-certifications",
  },
  openGraph: {
    type: "website",
    title: pageTitle,
    description: pageDescription,
    url: "/quality-certifications",
    images: [
      {
        url: "https://assets.electriterminal.com/certifications/ce-ring-terminals-certificate.webp",
        alt: "Quality certificates for electrical terminals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [
      "https://assets.electriterminal.com/certifications/ce-ring-terminals-certificate.webp",
    ],
  },
};

export default function QualityCertificationsPage() {
  const breadcrumbItems = [{ label: "Quality & Certifications" }];
  const structuredData = [
    makeBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Quality & Certifications", path: "/quality-certifications" },
    ]),
    makeCollectionPageSchema({
      name: "Quality & Certifications",
      description: pageDescription,
      path: "/quality-certifications",
    }),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Certificate Gallery",
      url: toAbsoluteSiteUrl("/quality-certifications"),
      itemListElement: [ulListedCard.title, ...certificateCards.map((card) => card.title)].map(
        (name, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
      })
      ),
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

      <section className="border-b border-slate-800 bg-[#0E141B] py-14 md:py-20">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.02fr]">
            <div className="space-y-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                Quality & Certifications
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight !text-white md:text-5xl">
                {pageTitle}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                {pageDescription}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="#request-documents"
                  className="btn btn-primary w-full justify-center sm:w-auto"
                >
                  Request Certificates
                </Link>
                <Link
                  href="/contact"
                  className="btn btn-hero-secondary w-full justify-center sm:w-auto"
                >
                  Contact Sales
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {heroTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-slate-600 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-sm border border-slate-700 bg-slate-900 p-5 shadow-2xl md:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.18),_transparent_36%)]" />
              <div className="relative grid gap-4 md:grid-cols-[1.12fr_0.88fr]">
                <div className="rounded-sm border border-slate-700 bg-white p-3 shadow-lg">
                  <div className="relative h-[330px] overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
                    <CertificateCardPreview />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-sm border border-slate-700 bg-slate-950/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Compliance Snapshot
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        "International safety and environmental standards",
                        "Third-party laboratory reports for selected materials",
                        "Document support for customs and project approvals",
                      ].map((item) => (
                        <div key={item} className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                          <p className="text-sm leading-6 text-slate-200">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href="#gallery"
                    className="group flex items-center justify-between rounded-sm border border-slate-700 bg-slate-900/90 px-4 py-4 text-sm font-semibold text-white transition hover:border-blue-500 hover:bg-slate-900"
                  >
                    Browse certificate previews
                    <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-[#FFFFFF]">
        <div className="container text-zinc-950">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
              Trust Summary
            </p>
            <h2 className="text-3xl font-semibold text-[#0F172A] md:text-4xl">
              Compliance signals buyers can verify quickly
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {trustSummary.map((item, index) => {
              const Icon = trustIcons[index];
              return (
                <article
                  key={item.title}
                  className="card card-hoverable h-full border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm hover:bg-[#F8FAFC]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[#0F172A]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#64748B]">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="gallery" className="section border-y border-slate-200 bg-[#F8FAFC]">
        <div className="container text-zinc-950">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
              Certificate Gallery
            </p>
            <h2 className="text-3xl font-semibold text-[#0F172A] md:text-4xl">
              Preview selected certificates and test reports
            </h2>
            <p className="mt-4 text-base leading-7 text-[#475569]">
              Website previews are intended for initial supplier qualification. Full copies can be
              shared with qualified buyers when project scope, product model, and required batch are
              confirmed.
            </p>
          </div>

          <div className="mt-10 space-y-8">
            <ULListedCard listing={ulListedCard} />
            {certificateCards.map((certificate) => (
              <CertificateCard key={certificate.title} certificate={certificate} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[#FFFFFF]">
        <div className="container text-zinc-950">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                Compliance Coverage
              </p>
              <h2 className="text-3xl font-semibold text-[#0F172A] md:text-4xl">
                Coverage is model-specific, material-specific, and batch-sensitive
              </h2>
              <p className="mt-5 text-base leading-7 text-[#475569]">
                Our certification and test reports cover selected product families, materials and
                production batches.
              </p>
              <p className="mt-4 text-base leading-7 text-[#475569]">
                For project purchasing or customs clearance, please contact us to confirm whether
                the specific model, material and batch you require is covered by the latest
                certificate or test report.
              </p>
            </div>

            <div className="overflow-hidden rounded-sm border border-slate-200 bg-[#FFFFFF] text-[#1E293B] shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Category
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Certificate / Report
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Coverage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverageRows.map((row) => (
                      <tr
                        key={`${row.category}-${row.document}`}
                        className="border-t border-slate-200 odd:bg-[#FFFFFF] even:bg-[#F8FAFC]"
                      >
                        <td className="px-4 py-4 text-sm font-semibold text-[#1E293B]">{row.category}</td>
                        <td className="px-4 py-4 text-sm font-medium text-[#1E293B]">{row.document}</td>
                        <td className="px-4 py-4 text-sm text-[#475569]">{row.coverage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-y border-slate-200 bg-[#F8FAFC]">
        <div className="container text-zinc-950">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
              Quality Control Process
            </p>
            <h2 className="text-3xl font-semibold text-[#0F172A] md:text-4xl">
              How inspection and documentation move through production
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-6">
            {qualitySteps.map((step, index) => (
              <div key={step.title} className="flex h-full">
                <article className="card flex h-full flex-1 flex-col border-slate-200 bg-[#FFFFFF] p-5 text-[#0F172A] shadow-sm transition hover:bg-[#F1F5F9]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                      Step {index + 1}
                    </span>
                    {index < qualitySteps.length - 1 && (
                      <ChevronRight className="hidden h-4 w-4 text-[#94A3B8] lg:block" />
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#1E293B]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#64748B]">{step.description}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[#FFFFFF]">
        <div className="container text-zinc-950">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                Why Certificates Matter
              </p>
              <h2 className="text-3xl font-semibold text-[#0F172A] md:text-4xl">
                Documents that reduce friction for procurement teams
              </h2>
              <p className="mt-5 text-base leading-7 text-[#475569]">
                For distributors, OEM buyers and project contractors, compliance documents help
                reduce sourcing risk, simplify supplier evaluation and support import
                documentation.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {buyerBenefits.map((item, index) => {
                const Icon = benefitIcons[index];
                const iconStyle = benefitIconStyles[index];
                return (
                  <article
                    key={item.title}
                    className="card h-full border-slate-200 bg-[#FFFFFF] p-6 shadow-sm transition hover:bg-[#F1F5F9]"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-sm border ${iconStyle}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-[#1E293B]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#64748B]">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="request-documents" className="section border-t border-slate-200 bg-[#0E141B]">
        <div className="container">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Request Documents
            </p>
            <h2 className="text-3xl font-semibold !text-white md:text-4xl">
              Need Full Certificates for Your Project?
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-200">
              To protect supplier information and document traceability, some sensitive details may
              be masked on the website.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-200">
              Full certificates and test reports can be provided to qualified buyers upon request.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="space-y-4 rounded-sm border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex items-start gap-3">
                <CircleHelp className="mt-1 h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold !text-white">
                    What helps us respond faster
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Include exact model numbers, target country, and the certificate type required
                    by your customer, customs broker, or project specification.
                  </p>
                </div>
              </div>
              <div className="rounded-sm border border-slate-800 bg-slate-900 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Typical requests
                </p>
                <ul className="mt-3 space-y-3 text-sm text-slate-300">
                  <li>CE file for terminal families in EU distribution projects</li>
                  <li>RoHS report for material compliance checks</li>
                  <li>REACH report for customs or customer qualification</li>
                </ul>
              </div>
            </aside>

            <ComplianceRequestForm />
          </div>
        </div>
      </section>
    </>
  );
}

function CertificateCardPreview() {
  return (
    <div className="absolute inset-0 grid grid-rows-[1.15fr_0.85fr] bg-white">
      <div className="border-b border-slate-200 p-3">
        <div className="h-full rounded-sm border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-2.5 w-28 rounded-full bg-blue-700" />
              <div className="mt-3 h-2 w-40 rounded-full bg-slate-300" />
            </div>
            <div className="h-10 w-10 rounded-sm border border-slate-300" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-2 rounded-full bg-slate-200" />
            <div className="h-2 rounded-full bg-slate-200" />
            <div className="h-2 w-5/6 rounded-full bg-slate-200" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-sm border border-slate-200 bg-slate-50" />
            <div className="h-16 rounded-sm border border-slate-200 bg-slate-50" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-3">
        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
          <div className="h-2 w-16 rounded-full bg-orange-300" />
          <div className="mt-3 space-y-2">
            <div className="h-2 rounded-full bg-slate-200" />
            <div className="h-2 rounded-full bg-slate-200" />
            <div className="h-2 w-2/3 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
          <div className="h-2 w-16 rounded-full bg-emerald-300" />
          <div className="mt-3 space-y-2">
            <div className="h-2 rounded-full bg-slate-200" />
            <div className="h-2 rounded-full bg-slate-200" />
            <div className="h-2 w-2/3 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
