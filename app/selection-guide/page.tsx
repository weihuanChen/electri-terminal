import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { Breadcrumb, FAQAccordion, ImagePreview } from "@/components/shared";
import { homeUrl, productsUrl, requestQuoteUrl, selectionGuideUrl } from "@/lib/routes";
import { makeBreadcrumbSchema, makeCollectionPageSchema, makeFAQPageSchema } from "@/lib/schema";
import {
  colorWireRows,
  insulationRows,
  insulationVisualCards,
  readMoreItems,
  selectionGuideFaqItems,
  selectionGuideImages,
  selectionGuideReferences,
  studSizeRows,
  terminalTypeRows,
} from "@/lib/selectionGuideData";
import QuoteSpecBuilder from "./QuoteSpecBuilder";

const pageTitle = "Ring Terminal Stud Size Chart, AWG Color Code & Type Guide";
const pageDescription =
  "Ring terminal stud size chart from #2 to 15/16\" with hole sizes in mm and inch, plus AWG/mm² color codes, insulation codes, and terminal type references.";
const chromeExtensionUrl =
  "https://chromewebstore.google.com/detail/dfdocgenkkgomcccpgeldinfgkkgckgm?utm_source=item-share-cb";

const sectionLinks = [
  { href: "#section-a", title: "Terminal Type", description: "Decode model families and type codes." },
  {
    href: "#section-b",
    title: "Insulation + Color/Wire",
    description: "Confirm insulation style and stable wire ranges.",
  },
  { href: "#section-c", title: "Stud Size", description: "Match stud and hole dimensions." },
  {
    href: "#section-d",
    title: "AWG + mm2 Guide",
    description: "Compare cable diameters and convert AWG to mm2.",
  },
  {
    href: "#references",
    title: "Sources",
    description: "Review standards and manufacturer references.",
  },
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

function ReferenceLink({ id }: { id: number }) {
  const reference = selectionGuideReferences.find((item) => item.id === id);
  if (!reference) return null;

  return (
    <a
      href={reference.url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
      aria-label={`${reference.organization}: ${reference.title}`}
    >
      [{reference.id}]
    </a>
  );
}

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: selectionGuideUrl(),
  },
  openGraph: {
    type: "website",
    title: pageTitle,
    description: pageDescription,
    url: selectionGuideUrl(),
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
      { name: "Home", path: homeUrl() },
      { name: "Terminal Selection Guide", path: selectionGuideUrl() },
    ]),
    makeCollectionPageSchema({
      name: "Terminal Selection Guide",
      description: pageDescription,
      path: selectionGuideUrl(),
    }),
    makeFAQPageSchema({
      path: selectionGuideUrl(),
      items: selectionGuideFaqItems.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    }),
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="border-b border-border-light bg-slate-50/80 dark:bg-slate-900/40">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="relative overflow-hidden bg-[#10151C] py-14 md:py-22">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_38%)]" />
        <div className="container relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5 md:space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
                Engineering Reference Guide
              </p>
              <h1 className="text-3xl font-bold tracking-tight leading-tight !text-white md:text-5xl">
                Ring Terminal Stud Size Chart & Selection Guide
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                Match terminal type, insulation code, wire-size interval, and stud dimensions with
                structured tables designed for engineering selection.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="#section-c" className="btn btn-primary w-full justify-center sm:w-auto">
                  Jump to Stud Size Chart
                </Link>
                <Link href="#get-quote" className="btn btn-hero-secondary w-full justify-center sm:w-auto">
                  Quote Your Selection
                </Link>
              </div>
              <div className="flex flex-wrap gap-2.5 text-xs text-slate-200">
                {[
                  { href: "#section-a", label: "Type reference" },
                  { href: "#section-b", label: "Insulation codes" },
                  { href: "#section-c", label: "Stud size chart" },
                ].map((chip) => (
                  <a
                    key={chip.href}
                    href={chip.href}
                    className="rounded-control border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 backdrop-blur-xs transition-colors hover:border-blue-400 hover:text-white"
                  >
                    {chip.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-card border border-slate-700/70 bg-slate-900/80 p-5 md:p-6 shadow-2xl backdrop-blur-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <figure className="space-y-2.5">
                  <div className="relative h-52 overflow-hidden rounded-card border border-slate-700/70 bg-slate-800/90">
                    <Image
                      src={selectionGuideImages.namingDiagramTerminal}
                      alt="Terminal model naming diagram"
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority
                      unoptimized
                      className="object-contain p-2"
                    />
                  </div>
                  <figcaption className="text-xs font-medium text-slate-300 pl-1">
                    Terminal naming structure
                  </figcaption>
                </figure>
                <figure className="space-y-2.5">
                  <div className="relative h-52 overflow-hidden rounded-card border border-slate-700/70 bg-slate-800/90">
                    <Image
                      src={selectionGuideImages.namingDiagramConnector}
                      alt="Connector model naming diagram"
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority
                      unoptimized
                      className="object-contain p-2"
                    />
                  </div>
                  <figcaption className="text-xs font-medium text-slate-300 pl-1">
                    Connector naming structure
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white dark:bg-slate-950">
        <div className="container space-y-8">
          {/* Open 3-Step Workflow Banner (No nested boxes) */}
          <div className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-blue-50/35 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-800/40 p-6 sm:p-8 lg:p-10 shadow-xs">
            <div className="max-w-3xl mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Selection Workflow
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                How to Use This Guide
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-secondary md:text-base">
                For reliable selection, first identify terminal form, then confirm insulation and
                wire interval, and finally verify stud compatibility for installation.
              </p>
            </div>

            <ol className="grid gap-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-slate-200/80 dark:md:divide-slate-800 pt-6 border-t border-slate-200/70 dark:border-slate-800">
              <li className="md:pr-8">
                <span className="inline-flex items-center rounded-control bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary mb-2.5">
                  Step 01
                </span>
                <p className="font-semibold text-foreground text-base">Identify Terminal Form</p>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  Locate the ring, fork, pin, or blade series and model prefix in Section A.
                </p>
              </li>
              <li className="md:px-8">
                <span className="inline-flex items-center rounded-control bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary mb-2.5">
                  Step 02
                </span>
                <p className="font-semibold text-foreground text-base">Match Insulation & Wire</p>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  Confirm vinyl/nylon sleeve codes and match stable AWG or mm² intervals in Section B.
                </p>
              </li>
              <li className="md:pl-8">
                <span className="inline-flex items-center rounded-control bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary mb-2.5">
                  Step 03
                </span>
                <p className="font-semibold text-foreground text-base">Verify Stud & Hole Size</p>
                <p className="mt-1 text-sm text-secondary leading-relaxed">
                  Cross-check fastener stud diameter against terminal clearance hole in Section C.
                </p>
              </li>
            </ol>
          </div>

          {/* Compact Quick Jump Strip */}
          <div>
            <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Quick Reference Sections
            </p>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
              {sectionLinks.map((item, idx) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group rounded-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-primary">
                      0{idx + 1}
                    </span>
                    <p className="mt-1 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-secondary">
                      {item.description}
                    </p>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1">
                    Jump to section <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-[#F7F9FC] dark:bg-slate-950/90">
        <div className="container with-sidebar">
          <div className="sticky top-16 z-20 min-w-0 -mx-6 border-y border-border-light bg-white/95 px-6 py-3 backdrop-blur lg:hidden dark:bg-slate-950/95">
            <div className="overflow-x-auto">
              <div className="flex min-w-max snap-x snap-mandatory gap-2 pr-6">
                {sectionLinks.map((item) => (
                  <a
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className="snap-start whitespace-nowrap rounded-control border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-primary shadow-2xs dark:border-slate-700 dark:bg-slate-900"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <article className="min-w-0 space-y-14 md:space-y-16">
            <section id="section-a" className="min-w-0 scroll-mt-28 space-y-5 md:space-y-6">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Section A
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                  Terminal Type Reference
                </h2>
                <p className="text-sm leading-relaxed text-secondary md:text-base max-w-3xl">
                  Use terminal form and model code as the first filter before checking insulation or
                  mounting dimensions.
                </p>
              </header>

              <div className="space-y-3 md:hidden">
                <p className="text-xs font-medium text-secondary pl-1">
                  Mobile view: card layout for faster scanning.
                </p>
                <div className="space-y-3">
                  {terminalTypeRows.map((row) => (
                    <article
                      key={`mobile-${row.terminalType}-${row.code}`}
                      className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-4 shadow-2xs dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-semibold leading-5 text-foreground">
                          {row.terminalType}
                        </h3>
                        <span className="shrink-0 rounded-control bg-primary/10 px-2.5 py-1 text-xs font-semibold tracking-[0.08em] text-primary">
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

              <div className="hidden overflow-x-auto rounded-card border border-slate-200/80 dark:border-slate-800 bg-white shadow-xs md:block dark:bg-slate-900">
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
                        <td className="font-medium text-foreground">{row.terminalType}</td>
                        <td>
                          <span className="inline-flex rounded-control bg-primary/8 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                            {row.code}
                          </span>
                        </td>
                        <td>{row.insulationCode || "-"}</td>
                        <td>{row.wireSizeRef || "-"}</td>
                        <td>{row.sizeRef || "-"}</td>
                        <td>{row.tongueWidthRef || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="border-l-2 border-primary/50 pl-4 py-1 text-sm leading-relaxed text-secondary">
                The type codes and example dimensions in this table are Electri Terminal factory
                references, not universal designation codes. General product terminology and crimp
                connection context can be cross-checked against IEC 60352-2 <ReferenceLink id={1} />,
                DIN 46234 <ReferenceLink id={3} />, and DIN 46237 <ReferenceLink id={4} />.
              </p>

              <figure className="overflow-hidden rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-3 sm:p-4 shadow-xs dark:bg-slate-900">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card">
                  <ImagePreview
                    src="https://assets.electriterminal.com/system/wire-terminal-types-overview-main.webp"
                    alt="Wire terminal types, uses & identification guide"
                    sizes="(min-width: 768px) 860px, 100vw"
                    className="object-contain bg-white dark:bg-slate-900"
                    previewLabel="View Large"
                  />
                </div>
              </figure>
            </section>

            <section id="section-b" className="min-w-0 scroll-mt-28 space-y-5 md:space-y-6">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Section B
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                  Insulation & Color/Wire Reference
                </h2>
                <p className="text-sm leading-relaxed text-secondary md:text-base max-w-3xl">
                  Confirm insulation category first, then match wire-size intervals from stable
                  color ranges.
                </p>
              </header>

              <div className="space-y-3 md:hidden">
                <p className="text-xs font-medium text-secondary pl-1">
                  Mobile view: card layout for faster scanning.
                </p>
                <div className="space-y-3">
                  {insulationRows.map((row) => (
                    <article
                      key={`mobile-insulation-${row.code}`}
                      className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-4 shadow-2xs dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-semibold leading-5 text-foreground">{row.crimpType}</h3>
                        <span className="shrink-0 rounded-control bg-primary/10 px-2.5 py-1 text-xs font-semibold tracking-[0.08em] text-primary">
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

              <div className="hidden overflow-x-auto rounded-card border border-slate-200/80 dark:border-slate-800 bg-white shadow-xs md:block dark:bg-slate-900">
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
                        <td className="font-medium text-foreground">{row.crimpType}</td>
                        <td>
                          <span className="inline-flex rounded-control bg-primary/8 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                            {row.code}
                          </span>
                        </td>
                        <td>{row.material}</td>
                        <td>{row.temperatureRating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="border-l-2 border-primary/50 pl-4 py-1 text-sm leading-relaxed text-secondary">
                Temperature ratings are product-family ratings and must be verified on the target
                datasheet. Comparable published examples include ABB vinyl-insulated terminals at
                75°C <ReferenceLink id={9} /> and TE PIDG terminal families up to 105°C{" "}
                <ReferenceLink id={10} />; these references support the material-and-temperature
                context but do not certify Electri Terminal item numbers.
              </p>

              <section aria-labelledby="b1-5-visual-insulation" className="space-y-4 pt-2">
                <header className="space-y-1.5">
                  <h3 id="b1-5-visual-insulation" className="text-xl font-bold tracking-tight md:text-2xl">
                    Typical Insulation Structures
                  </h3>
                  <p className="text-sm leading-relaxed text-secondary md:text-base">
                    Visual comparison of common insulation structures used across terminal families.
                  </p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {insulationVisualCards.map((card) => (
                    <article key={card.code} className="card overflow-hidden flex flex-col">
                      <div className="relative h-36 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <Image
                          src={card.image}
                          alt={card.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                          unoptimized
                          className="object-contain p-3"
                        />
                      </div>
                      <div className="space-y-2 p-4 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.11em] text-primary">
                          {card.title}
                        </p>
                        <h4 className="text-base font-semibold leading-6 text-foreground">
                          {card.subtitle}
                        </h4>
                        <p className="text-sm leading-relaxed text-secondary">{card.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <div className="rounded-card border border-amber-200/80 bg-amber-50/80 px-5 py-4 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                Main selection range keeps stable source intervals up to <strong>60.57 mm2</strong>
                . Large-conductor tail segments at and above 76.28 mm2 are excluded from the main
                table pending data review. Need a larger cable size?{" "}
                <Link
                  href={requestQuoteUrl({ query: { source: "selection-guide", cta: "large-conductor" } })}
                  className="font-semibold underline underline-offset-2 hover:no-underline"
                >
                  Send your drawing for a custom lug quote
                </Link>
                .
              </div>

              <div className="space-y-3 md:hidden">
                <p className="text-xs font-medium text-secondary pl-1">
                  Mobile view: card layout for faster scanning.
                </p>
                <div className="space-y-3">
                  {colorWireRows.map((row, index) => (
                    <article
                      key={`mobile-${row.colorCode}-${row.wireSizeRangeMm2}-${row.awg}-${index}`}
                      className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-4 shadow-2xs dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-semibold text-foreground">{row.colorCode}</h3>
                        <span className="shrink-0 rounded-control bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
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

              <div className="hidden overflow-x-auto rounded-card border border-slate-200/80 dark:border-slate-800 bg-white shadow-xs md:block dark:bg-slate-900">
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
                        <td className="font-medium text-foreground">{row.colorCode}</td>
                        <td>{row.wireSizeRangeMm2}</td>
                        <td>{row.awg}</td>
                        <td>{row.maxCurrentA}</td>
                        <td>{row.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="border-l-2 border-amber-500/70 pl-4 py-1 text-sm leading-relaxed text-secondary">
                <strong className="text-foreground">Engineering-data note:</strong> the color ranges and maximum-current
                values above come from Electri Terminal factory selection data. Color is a
                product-family identifier rather than a universal ampacity standard; comparable
                manufacturer systems also map colors to particular wire ranges and tooling{" "}
                <ReferenceLink id={8} /> <ReferenceLink id={9} />. Current capacity must be
                confirmed for the exact terminal, conductor, crimp, ambient temperature, and
                installation conditions <ReferenceLink id={11} />.
              </p>

              <figure className="overflow-hidden rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-3 sm:p-4 shadow-xs dark:bg-slate-900">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card">
                  <ImagePreview
                    src="https://assets.electriterminal.com/system/wire-terminal-color-code-awg-chart-main.webp"
                    alt="Wire terminal color code and size selection guide"
                    sizes="(min-width: 768px) 860px, 100vw"
                    className="object-contain bg-white dark:bg-slate-900"
                    previewLabel="View Large"
                  />
                </div>
              </figure>
            </section>

            <section id="section-c" className="min-w-0 scroll-mt-28 space-y-5 md:space-y-6">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Section C
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                  Stud Size Reference
                </h2>
                <p className="text-sm leading-relaxed text-secondary md:text-base max-w-3xl">
                  Match stud diameter and terminal hole size to ensure stable fastening and contact
                  consistency.
                </p>
              </header>

              <div className="grid gap-5 md:gap-6 lg:grid-cols-[1fr_1.1fr]">
                <div className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-5 md:p-6 shadow-xs dark:bg-slate-900">
                  <h3 className="text-lg font-bold tracking-tight">Stud and Hole Interpretation</h3>
                  <p className="mt-3 text-sm leading-relaxed text-secondary">
                    Stud size indicates the bolt or screw diameter. Hole size indicates the opening
                    needed on the terminal tongue. Keep clearance controlled to avoid loose
                    fastening and vibration-related risk.
                  </p>
                  <ul className="mt-4 space-y-2.5 text-sm text-secondary">
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>Use actual fastener size as primary constraint.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>Avoid oversized hole clearance unless required by assembly tolerance.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>Verify both wire-side and stud-side requirements in final selection.</span>
                    </li>
                  </ul>
                </div>
                <div className="relative h-64 overflow-hidden rounded-card border border-slate-200/80 dark:border-slate-800 bg-white shadow-xs dark:bg-slate-900 sm:h-72 lg:h-full lg:min-h-[280px]">
                  <Image
                    src={selectionGuideImages.studSizeChart}
                    alt="Stud size and hole size chart"
                    fill
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    unoptimized
                    className="object-contain p-3"
                  />
                </div>
              </div>

              <div className="space-y-3 md:hidden">
                <p className="text-xs font-medium text-secondary pl-1">
                  Mobile view: card layout for faster scanning.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {studSizeRows.map((row) => (
                    <article
                      key={`mobile-stud-${row.studSizeInch}-${row.holeSizeInch}`}
                      className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-4 shadow-2xs dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-semibold text-foreground">{row.studSizeInch}</h3>
                        <span className="shrink-0 rounded-control bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
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

              <div className="hidden overflow-x-auto rounded-card border border-slate-200/80 dark:border-slate-800 bg-white shadow-xs md:block dark:bg-slate-900">
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
                        <td className="font-medium text-foreground">{row.studSizeInch}</td>
                        <td>{row.studSizeMm}</td>
                        <td>{row.holeSizeMm}</td>
                        <td>{row.holeSizeInch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="border-l-2 border-primary/50 pl-4 py-1 text-sm leading-relaxed text-secondary">
                The listed stud-to-hole mappings are Electri Terminal product-fit references.
                ISO 273 defines general-purpose clearance-hole series for metric fasteners{" "}
                <ReferenceLink id={7} />, while finished terminal dimensions still need to be
                checked against the selected item drawing. TE&apos;s published ring-terminal range is
                one comparable example of product-specific stud mapping <ReferenceLink id={10} />.
              </p>

              <figure className="overflow-hidden rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-3 sm:p-4 shadow-xs dark:bg-slate-900">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card">
                  <ImagePreview
                    src="https://assets.electriterminal.com/system/ring-terminal-stud-size-chart-main.webp"
                    alt="Ring terminal stud size matching chart for different terminal types and screw sizes"
                    sizes="(min-width: 768px) 860px, 100vw"
                    className="object-contain bg-white dark:bg-slate-900"
                    previewLabel="View Large"
                  />
                </div>
              </figure>
            </section>

            <QuoteSpecBuilder />

            <section id="section-d"className="min-w-0 scroll-mt-28 space-y-5 md:space-y-6">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Section D
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                  AWG and mm2 Conversion Guide
                </h2>
                <p className="text-sm leading-relaxed text-secondary md:text-base max-w-3xl">
                  Use these two reference charts to compare conductor cross-sections and convert
                  between AWG and mm2 sizes during cable and terminal selection.
                </p>
              </header>

              <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
                <article className="space-y-3.5 rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-5 shadow-xs dark:bg-slate-900">
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    Cable Cross-Section Comparison
                  </h3>
                  <p className="text-sm leading-relaxed text-secondary">
                    Visual overview of common cable diameters and cross-sectional differences for
                    practical size comparison before final wire selection.
                  </p>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <ImagePreview
                      src="https://assets.electriterminal.com/system/awg-wire-gauge-size-comparison-main.webp"
                      alt="Cable wire diameter and cross-section comparison with size reference table"
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-contain bg-white dark:bg-slate-900"
                      previewLabel="View Large"
                    />
                  </div>
                </article>

                <article className="space-y-3.5 rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-5 shadow-xs dark:bg-slate-900">
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    AWG to mm2 Conversion
                  </h3>
                  <p className="text-sm leading-relaxed text-secondary">
                    Quick conversion chart for AWG and mm2 sizing, used to align US gauge notation
                    with metric wire specifications.
                  </p>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <ImagePreview
                      src="https://assets.electriterminal.com/system/awg-to-mm2-conversion-chart-main.webp"
                      alt="AWG to mm2 wire size conversion chart"
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-contain bg-white dark:bg-slate-900"
                      previewLabel="View Large"
                    />
                  </div>
                </article>
              </div>

              <p className="border-l-2 border-primary/50 pl-4 py-1 text-sm leading-relaxed text-secondary">
                Use guide logic: first compare physical cable cross-section, then map to AWG/mm2
                equivalent values, and finally validate current rating and application standards in
                your project specification. ASTM B258 defines nominal AWG dimensions and areas{" "}
                <ReferenceLink id={5} />, while IEC 60228 defines metric conductor sizes and classes{" "}
                <ReferenceLink id={6} />. Treat AWG/mm2 entries as selection comparisons rather than
                exact interchangeable product sizes.
              </p>
            </section>

            <section id="references" className="scroll-mt-28 space-y-5" aria-labelledby="references-title">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Sources &amp; Engineering Basis
                </p>
                <h2
                  id="references-title"
                  className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100"
                >
                  References
                </h2>
                <p className="text-sm leading-relaxed text-secondary md:text-base max-w-3xl">
                  Standards support the general engineering method. Exact codes, dimensions,
                  temperatures, colors, and reference currents remain manufacturer- or
                  product-specific unless an individual certified datasheet states otherwise.
                </p>
              </header>

              <blockquote
                cite="https://webstore.iec.ch/en/publication/68899"
                className="rounded-r-card border-l-4 border-primary bg-primary/5 px-5 py-4 text-sm leading-relaxed text-secondary"
              >
                <p>“Information on the materials and data from industrial experience is included.”</p>
                <footer className="mt-2 not-italic">
                  — IEC 60352-2:2024 scope summary <ReferenceLink id={1} />
                </footer>
              </blockquote>

              <ol className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
                {selectionGuideReferences.map((reference) => (
                  <li
                    key={reference.id}
                    id={`reference-${reference.id}`}
                    className="p-4 sm:p-5 text-sm hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <p className="font-semibold leading-6 text-foreground">
                        <span className="mr-1.5 font-mono text-xs text-primary">
                          [{reference.id}]
                        </span>
                        {reference.organization}.{" "}
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
                        >
                          {reference.title}
                        </a>
                      </p>
                      <span className="w-fit shrink-0 rounded-control bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-secondary">
                        {reference.sourceType}
                      </span>
                    </div>
                    <p className="mt-1.5 leading-relaxed text-secondary">{reference.supports}</p>
                  </li>
                ))}
              </ol>

              <p className="rounded-card border border-sky-200/80 bg-sky-50/70 px-5 py-3.5 text-sm leading-relaxed text-sky-950 dark:border-sky-800/70 dark:bg-sky-950/40 dark:text-sky-100">
                Last source review: July 23, 2026. Standards may require purchase for full text;
                links above point to the issuing organization&apos;s public record or to an original
                manufacturer document.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                Quick Selection Logic
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {quickLogic.map((item, idx) => (
                  <div key={item.title} className="card p-5 sm:p-6">
                    <span className="inline-block text-xs font-mono font-semibold text-primary mb-2">
                      0{idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-secondary">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
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
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                Read More: Selection Notes
              </h2>
              <div className="space-y-3">
                {readMoreItems.map((item) => (
                  <details key={item.title} className="card group overflow-hidden">
                    <summary className="cursor-pointer list-none px-6 py-4 text-base font-semibold flex items-center justify-between hover:text-primary transition-colors">
                      <span>{item.title}</span>
                      <span className="ml-4 text-xs font-semibold text-primary group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 text-sm leading-relaxed text-secondary">
                      {item.body}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="space-y-2.5 rounded-card border border-slate-200/80 dark:border-slate-800 bg-white p-5 shadow-xs dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary mb-3">
                  On This Page
                </p>
                {sectionLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="sidebar-nav-item rounded-control border-l-0 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    {item.title}
                  </a>
                ))}
                <div className="space-y-2 pt-2">
                  <Link href="#get-quote" className="btn btn-primary w-full justify-center text-center">
                    Quote Your Selection
                  </Link>
                  <Link href={productsUrl()} className="btn btn-outline w-full text-center">
                    Browse Products
                  </Link>
                </div>
              </div>

              <a
                href={chromeExtensionUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get Electri Terminal Calculator from the Chrome Web Store"
                className="group block overflow-hidden rounded-card border border-slate-700/80 bg-[#10151C] p-5 text-white shadow-md transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-sm">
                    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-7">
                      <path fill="#FFC107" d="M43.6 20H24l-6-10.4A18 18 0 0 1 43.6 20Z" />
                      <path fill="#F44336" d="M18 9.6 27.8 27 16 47.3A24 24 0 0 1 18 9.6Z" />
                      <path fill="#4CAF50" d="M16 47.3 25.8 30H46a24 24 0 0 1-30 17.3Z" />
                      <circle cx="24" cy="24" r="9" fill="#1976D2" />
                      <circle cx="24" cy="24" r="5.5" fill="#90CAF9" />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300">
                      Chrome Extension
                    </span>
                    <span className="mt-1 block text-sm font-semibold leading-5 text-white">
                      Electri Terminal Calculator
                    </span>
                  </span>
                </div>
                <span className="mt-3 block text-xs leading-5 text-slate-300">
                  Check AWG/mm², stud and hole sizes, terminal types, and insulation codes as you browse.
                </span>
                <span className="mt-3.5 flex items-center justify-between border-t border-slate-800 pt-3 text-xs font-semibold text-blue-300">
                  Add to Chrome
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  >
                    <path
                      d="M6 14 14 6m-6 0h6v6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
