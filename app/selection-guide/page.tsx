import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { Breadcrumb, FAQAccordion } from "@/components/shared";
import { makeBreadcrumbSchema, makeCollectionPageSchema, makeFAQPageSchema } from "@/lib/schema";
import {
  colorWireRows,
  insulationRows,
  insulationVisualCards,
  readMoreItems,
  selectionGuideFaqItems,
  selectionGuideImages,
  studSizeRows,
  terminalTypeRows,
} from "@/lib/selectionGuideData";

const pageTitle = "Terminal Type, Insulation & Stud Size Selection Guide";
const pageDescription =
  "Use this engineering reference to match terminal type, insulation code, wire size ranges, and stud dimensions for faster and more reliable terminal selection.";

const sectionLinks = [
  { href: "#section-a", title: "Terminal Type", description: "Decode model families and type codes." },
  {
    href: "#section-b",
    title: "Insulation + Color/Wire",
    description: "Confirm insulation style and stable wire ranges.",
  },
  { href: "#section-c", title: "Stud Size", description: "Match stud and hole dimensions." },
] as const;

const quickLogic = [
  {
    title: "Choose by Terminal Form",
    text: "Start with ring, spade, blade, pin, or disconnect form before checking other dimensions.",
  },
  {
    title: "Confirm Insulation and Wire",
    text: "Validate code, material, and wire-size interval from the stable range table.",
  },
  {
    title: "Verify Stud Compatibility",
    text: "Check stud size and required hole diameter to prevent mounting mismatch.",
  },
] as const;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/selection-guide",
  },
  openGraph: {
    type: "website",
    title: pageTitle,
    description: pageDescription,
    url: "/selection-guide",
    images: [
      {
        url: selectionGuideImages.namingDiagramTerminal,
        alt: "Terminal type naming reference diagram",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [selectionGuideImages.namingDiagramTerminal],
  },
};

export default function SelectionGuidePage() {
  const breadcrumbItems = [{ label: "Selection Guide" }];

  const structuredData = [
    makeBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Terminal Selection Guide", path: "/selection-guide" },
    ]),
    makeCollectionPageSchema({
      name: "Terminal Selection Guide",
      description: pageDescription,
      path: "/selection-guide",
    }),
    makeFAQPageSchema({
      path: "/selection-guide",
      items: selectionGuideFaqItems.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    }),
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="border-b border-border bg-muted">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="border-b border-slate-800 bg-[#10151C] py-12 md:py-20">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5 md:space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                Engineering Reference Guide
              </p>
              <h1 className="text-3xl font-semibold leading-tight !text-white md:text-5xl">
                Terminal Type, Insulation & Stud Size Guide
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Match terminal type, insulation code, wire-size interval, and stud dimensions with
                structured tables designed for engineering selection.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="#section-a" className="btn btn-primary w-full justify-center sm:w-auto">
                  Start with Terminal Type
                </Link>
                <Link href="/contact" className="btn btn-hero-secondary w-full justify-center sm:w-auto">
                  Request Quote
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                <span className="rounded-sm border border-slate-600 bg-slate-900/70 px-2 py-1">
                  Type reference
                </span>
                <span className="rounded-sm border border-slate-600 bg-slate-900/70 px-2 py-1">
                  Insulation codes
                </span>
                <span className="rounded-sm border border-slate-600 bg-slate-900/70 px-2 py-1">
                  Stud size matching
                </span>
              </div>
            </div>

            <div className="rounded-sm border border-slate-700 bg-slate-900 p-4 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <figure className="space-y-3">
                  <div className="relative h-52 overflow-hidden rounded-sm border border-slate-700 bg-slate-800">
                    <Image
                      src={selectionGuideImages.namingDiagramTerminal}
                      alt="Terminal model naming diagram"
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <figcaption className="text-xs text-slate-300">Terminal naming structure</figcaption>
                </figure>
                <figure className="space-y-3">
                  <div className="relative h-52 overflow-hidden rounded-sm border border-slate-700 bg-slate-800">
                    <Image
                      src={selectionGuideImages.namingDiagramConnector}
                      alt="Connector model naming diagram"
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <figcaption className="text-xs text-slate-300">Connector naming structure</figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white dark:bg-slate-950">
        <div className="container">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
              Quick Reference Sections
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {sectionLinks.map((item) => (
                <a key={item.href} href={item.href} className="card card-hoverable block p-5">
                  <p className="text-lg font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm text-secondary">{item.description}</p>
                  <p className="mt-4 text-sm font-medium text-primary">Go to section</p>
                </a>
              ))}
            </div>

            <div className="rounded-sm border border-border bg-muted p-5">
              <h3 className="text-xl font-semibold">How to Use This Guide</h3>
              <p className="mt-3 text-sm leading-6 text-secondary md:text-base">
                For reliable selection, first identify terminal form, then confirm insulation and
                wire interval, and finally verify stud compatibility for installation.
              </p>
              <ol className="mt-4 grid gap-3 text-sm text-secondary md:grid-cols-3">
                <li className="rounded-sm border border-border bg-white p-3 dark:bg-slate-900">
                  1. Identify terminal form and code.
                </li>
                <li className="rounded-sm border border-border bg-white p-3 dark:bg-slate-900">
                  2. Match insulation code with stable wire range.
                </li>
                <li className="rounded-sm border border-border bg-white p-3 dark:bg-slate-900">
                  3. Confirm stud and hole size before final model lock.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-y border-border bg-[#F6F8FB] dark:bg-slate-950">
        <div className="container with-sidebar">
          <div className="sticky top-16 z-20 min-w-0 -mx-6 border-y border-border bg-white/95 px-6 py-3 backdrop-blur lg:hidden dark:bg-slate-950/95">
            <div className="overflow-x-auto">
              <div className="flex min-w-max snap-x snap-mandatory gap-2 pr-6">
                {sectionLinks.map((item) => (
                  <a
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className="snap-start whitespace-nowrap rounded-sm border border-border bg-white px-3 py-2 text-sm font-medium text-primary shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <article className="min-w-0 space-y-10 md:space-y-12">
            <section id="section-a" className="min-w-0 scroll-mt-28 space-y-4 md:space-y-5">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Section A
                </p>
                <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
                  Terminal Type Reference
                </h2>
                <p className="text-sm leading-6 text-secondary md:text-base">
                  Use terminal form and model code as the first filter before checking insulation or
                  mounting dimensions.
                </p>
              </header>

              <div className="space-y-3 md:hidden">
                <p className="rounded-sm border border-border bg-muted px-4 py-2 text-xs text-secondary">
                  Mobile view: card layout for faster scanning.
                </p>
                <div className="space-y-3">
                  {terminalTypeRows.map((row) => (
                    <article
                      key={`mobile-${row.terminalType}-${row.code}`}
                      className="rounded-sm border border-border bg-white p-4 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                        <h3 className="text-sm font-semibold leading-5 text-foreground">
                          {row.terminalType}
                        </h3>
                        <span className="shrink-0 rounded-sm bg-primary/10 px-2 py-1 text-xs font-semibold tracking-[0.08em] text-primary">
                          {row.code}
                        </span>
                      </div>
                      <dl className="mt-3 grid min-w-0 grid-cols-[minmax(0,120px)_1fr] gap-x-3 gap-y-2 text-sm">
                        <dt className="break-words text-secondary">Insulation Code Ref</dt>
                        <dd className="break-words font-medium text-foreground">{row.insulationCode || "-"}</dd>
                        <dt className="break-words text-secondary">Wire Size Ref</dt>
                        <dd className="break-words font-medium text-foreground">{row.wireSizeRef || "-"}</dd>
                        <dt className="break-words text-secondary">Size Ref</dt>
                        <dd className="break-words font-medium text-foreground">{row.sizeRef || "-"}</dd>
                        <dt className="break-words text-secondary">Tongue Width Ref</dt>
                        <dd className="break-words font-medium text-foreground">{row.tongueWidthRef || "-"}</dd>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>

              <div className="hidden overflow-x-auto rounded-sm border border-border bg-white md:block dark:bg-slate-900">
                <table className="technical-table min-w-[860px]">
                  <caption className="sr-only">Terminal type and code reference table</caption>
                  <thead>
                    <tr>
                      <th scope="col">Terminal Type</th>
                      <th scope="col">Code</th>
                      <th scope="col">Insulation Code Ref</th>
                      <th scope="col">Wire Size Ref</th>
                      <th scope="col">Size Ref</th>
                      <th scope="col">Tongue Width Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terminalTypeRows.map((row) => (
                      <tr key={`${row.terminalType}-${row.code}`}>
                        <td>{row.terminalType}</td>
                        <td>{row.code}</td>
                        <td>{row.insulationCode || "-"}</td>
                        <td>{row.wireSizeRef || "-"}</td>
                        <td>{row.sizeRef || "-"}</td>
                        <td>{row.tongueWidthRef || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="section-b" className="min-w-0 scroll-mt-28 space-y-5 md:space-y-6">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Section B
                </p>
                <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
                  Insulation & Color/Wire Reference
                </h2>
                <p className="text-sm leading-6 text-secondary md:text-base">
                  Confirm insulation category first, then match wire-size intervals from stable
                  color ranges.
                </p>
              </header>

              <div className="space-y-3 md:hidden">
                <p className="rounded-sm border border-border bg-muted px-4 py-2 text-xs text-secondary">
                  Mobile view: card layout for faster scanning.
                </p>
                <div className="space-y-3">
                  {insulationRows.map((row) => (
                    <article
                      key={`mobile-insulation-${row.code}`}
                      className="rounded-sm border border-border bg-white p-4 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                        <h3 className="text-sm font-semibold leading-5 text-foreground">{row.crimpType}</h3>
                        <span className="shrink-0 rounded-sm bg-primary/10 px-2 py-1 text-xs font-semibold tracking-[0.08em] text-primary">
                          {row.code}
                        </span>
                      </div>
                      <dl className="mt-3 grid min-w-0 grid-cols-[minmax(0,120px)_1fr] gap-x-3 gap-y-2 text-sm">
                        <dt className="break-words text-secondary">Insulation Material</dt>
                        <dd className="break-words font-medium text-foreground">{row.material}</dd>
                        <dt className="break-words text-secondary">Temperature Rating</dt>
                        <dd className="break-words font-medium text-foreground">{row.temperatureRating}</dd>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>

              <div className="hidden overflow-x-auto rounded-sm border border-border bg-white md:block dark:bg-slate-900">
                <table className="technical-table min-w-[760px]">
                  <caption className="sr-only">Insulation type reference table</caption>
                  <thead>
                    <tr>
                      <th scope="col">Crimp Type</th>
                      <th scope="col">Code</th>
                      <th scope="col">Insulation Material</th>
                      <th scope="col">Temperature Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insulationRows.map((row) => (
                      <tr key={row.code}>
                        <td>{row.crimpType}</td>
                        <td>{row.code}</td>
                        <td>{row.material}</td>
                        <td>{row.temperatureRating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <section aria-labelledby="b1-5-visual-insulation" className="space-y-4">
                <header className="space-y-2">
                  <h3 id="b1-5-visual-insulation" className="text-xl font-semibold md:text-2xl">
                    Typical Insulation Structures
                  </h3>
                  <p className="text-sm leading-6 text-secondary md:text-base">
                    Visual comparison of common insulation structures used across terminal families.
                  </p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {insulationVisualCards.map((card) => (
                    <article key={card.code} className="card overflow-hidden">
                      <div className="relative h-36 border-b border-border bg-white dark:bg-slate-900">
                        <Image
                          src={card.image}
                          alt={card.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                          unoptimized
                          className="object-contain p-3"
                        />
                      </div>
                      <div className="space-y-2 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.11em] text-primary">
                          {card.title}
                        </p>
                        <h4 className="text-base font-semibold leading-6 text-foreground">
                          {card.subtitle}
                        </h4>
                        <p className="text-sm leading-6 text-secondary">{card.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <div className="rounded-sm border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                Main selection range keeps stable source intervals up to <strong>60.57 mm2</strong>
                . Large-conductor tail segments at and above 76.28 mm2 are excluded from the main
                table pending data review.
              </div>

              <div className="space-y-3 md:hidden">
                <p className="rounded-sm border border-border bg-muted px-4 py-2 text-xs text-secondary">
                  Mobile view: card layout for faster scanning.
                </p>
                <div className="space-y-3">
                  {colorWireRows.map((row, index) => (
                    <article
                      key={`mobile-${row.colorCode}-${row.wireSizeRangeMm2}-${row.awg}-${index}`}
                      className="rounded-sm border border-border bg-white p-4 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                        <h3 className="text-sm font-semibold text-foreground">{row.colorCode}</h3>
                        <span className="shrink-0 rounded-sm bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                          AWG {row.awg}
                        </span>
                      </div>
                      <dl className="mt-3 grid min-w-0 grid-cols-[minmax(0,120px)_1fr] gap-x-3 gap-y-2 text-sm">
                        <dt className="break-words text-secondary">Wire Size (mm2)</dt>
                        <dd className="break-words font-medium text-foreground">{row.wireSizeRangeMm2}</dd>
                        <dt className="break-words text-secondary">Max Current (A)</dt>
                        <dd className="break-words font-medium text-foreground">{row.maxCurrentA}</dd>
                        <dt className="break-words text-secondary">Notes</dt>
                        <dd className="break-words font-medium text-foreground">{row.notes || "-"}</dd>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>

              <div className="hidden overflow-x-auto rounded-sm border border-border bg-white md:block dark:bg-slate-900">
                <table className="technical-table min-w-[860px]">
                  <caption className="sr-only">Color code and wire range reference table</caption>
                  <thead>
                    <tr>
                      <th scope="col">Color Code</th>
                      <th scope="col">Wire Size Range (mm2)</th>
                      <th scope="col">AWG</th>
                      <th scope="col">Max Current (A)</th>
                      <th scope="col">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colorWireRows.map((row, index) => (
                      <tr key={`${row.colorCode}-${row.wireSizeRangeMm2}-${row.awg}-${index}`}>
                        <td>{row.colorCode}</td>
                        <td>{row.wireSizeRangeMm2}</td>
                        <td>{row.awg}</td>
                        <td>{row.maxCurrentA}</td>
                        <td>{row.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="section-c" className="min-w-0 scroll-mt-28 space-y-5 md:space-y-6">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Section C
                </p>
                <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
                  Stud Size Reference
                </h2>
                <p className="text-sm leading-6 text-secondary md:text-base">
                  Match stud diameter and terminal hole size to ensure stable fastening and contact
                  consistency.
                </p>
              </header>

              <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_1.1fr]">
                <div className="rounded-sm border border-border bg-white p-4 md:p-5 dark:bg-slate-900">
                  <h3 className="text-lg font-semibold">Stud and Hole Interpretation</h3>
                  <p className="mt-3 text-sm leading-6 text-secondary">
                    Stud size indicates the bolt or screw diameter. Hole size indicates the opening
                    needed on the terminal tongue. Keep clearance controlled to avoid loose
                    fastening and vibration-related risk.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-secondary">
                    <li>Use actual fastener size as primary constraint.</li>
                    <li>Avoid oversized hole clearance unless required by assembly tolerance.</li>
                    <li>Verify both wire-side and stud-side requirements in final selection.</li>
                  </ul>
                </div>
                <div className="relative h-64 overflow-hidden rounded-sm border border-border bg-white dark:bg-slate-900 sm:h-72 lg:h-full lg:min-h-[280px]">
                  <Image
                    src={selectionGuideImages.studSizeChart}
                    alt="Stud size and hole size chart"
                    fill
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    unoptimized
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="space-y-3 md:hidden">
                <p className="rounded-sm border border-border bg-muted px-4 py-2 text-xs text-secondary">
                  Mobile view: card layout for faster scanning.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {studSizeRows.map((row) => (
                    <article
                      key={`mobile-stud-${row.studSizeInch}-${row.holeSizeInch}`}
                      className="rounded-sm border border-border bg-white p-4 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                        <h3 className="text-sm font-semibold text-foreground">{row.studSizeInch}</h3>
                        <span className="shrink-0 rounded-sm bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                          {row.studSizeMm} mm
                        </span>
                      </div>
                      <dl className="mt-3 grid min-w-0 grid-cols-[minmax(0,110px)_1fr] gap-x-3 gap-y-2 text-sm">
                        <dt className="break-words text-secondary">Hole Size (mm)</dt>
                        <dd className="break-words font-medium text-foreground">{row.holeSizeMm}</dd>
                        <dt className="break-words text-secondary">Hole Size (inch)</dt>
                        <dd className="break-words font-medium text-foreground">{row.holeSizeInch}</dd>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>

              <div className="hidden overflow-x-auto rounded-sm border border-border bg-white md:block dark:bg-slate-900">
                <table className="technical-table min-w-[760px]">
                  <caption className="sr-only">Stud size and hole size chart</caption>
                  <thead>
                    <tr>
                      <th scope="col">Stud Size (inch)</th>
                      <th scope="col">Stud Size (mm)</th>
                      <th scope="col">Hole Size (mm)</th>
                      <th scope="col">Hole Size (inch)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studSizeRows.map((row) => (
                      <tr key={`${row.studSizeInch}-${row.holeSizeInch}`}>
                        <td>{row.studSizeInch}</td>
                        <td>{row.studSizeMm}</td>
                        <td>{row.holeSizeMm}</td>
                        <td>{row.holeSizeInch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
                Quick Selection Logic
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {quickLogic.map((item) => (
                  <div key={item.title} className="card p-5">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-secondary">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
                Selection FAQ
              </h2>
              <FAQAccordion
                items={selectionGuideFaqItems.map((item) => ({
                  question: item.question,
                  answer: item.answer,
                }))}
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
                Read More: Selection Notes
              </h2>
              <div className="space-y-3">
                {readMoreItems.map((item) => (
                  <details key={item.title} className="card overflow-hidden">
                    <summary className="cursor-pointer list-none px-5 py-4 text-base font-semibold">
                      {item.title}
                    </summary>
                    <div className="border-t border-border px-5 py-4 text-sm leading-6 text-secondary">
                      {item.body}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-3 rounded-sm border border-border bg-white p-4 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                On This Page
              </p>
              {sectionLinks.map((item) => (
                <a key={item.href} href={item.href} className="sidebar-nav-item rounded-sm border-l-0">
                  {item.title}
                </a>
              ))}
              <Link href="/products" className="btn btn-outline mt-2 w-full text-center">
                Browse Products
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
