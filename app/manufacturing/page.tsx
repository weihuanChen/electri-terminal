import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, FAQAccordion, ImagePreview } from "@/components/shared";
import {
  CapabilityCard,
  ManufacturingSectionHeading,
  ProcessStepCard,
  ProductionImageCard,
} from "@/components/manufacturing/ManufacturingBlocks";
import {
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  PackageCheck,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const heroImage = "https://assets.electriterminal.com/factory/cnc-machining-copper-tube.webp";
const metadataTitle =
  "Electrical Terminal Manufacturing & CNC Copper Processing | Electri Terminal";
const metadataDescription =
  "Manufacturing processes for insulated terminals, copper lugs, and custom electrical connection components, including CNC machining, inspection workflows, and OEM production capabilities.";

export const metadata: Metadata = {
  title: metadataTitle,
  description: metadataDescription,
  alternates: {
    canonical: "/manufacturing",
  },
  openGraph: {
    type: "website",
    title: metadataTitle,
    description: metadataDescription,
    url: "/manufacturing",
    images: [
      {
        url: heroImage,
        alt: "Electrical terminal manufacturing and CNC copper processing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: metadataTitle,
    description: metadataDescription,
    images: [heroImage],
  },
};

const processSteps = [
  {
    step: "01",
    title: "Material Preparation",
    description:
      "Selected conductive materials are prepared to support stable forming performance and reliable electrical characteristics.",
    controlPoint: "Conductive material readiness before forming",
    imageSrc: "https://assets.electriterminal.com/factory/high-speed-cutting-copper-tubes.webp",
    imageAlt: "High-speed cutting of copper tubes in manufacturing",
  },
  {
    step: "02",
    title: "Cutting, Drilling & Forming",
    description:
      "Cutting, hole-making, and forming operations are controlled to achieve accurate geometry and repeatable terminal structure.",
    controlPoint: "Geometry and repeatability across operations",
    imageSrc:
      "https://assets.electriterminal.com/factory/precision-hole-machining-copper-tube.webp",
    imageAlt: "Precision hole machining on copper tube parts",
  },
  {
    step: "03",
    title: "Terminal Structuring",
    description:
      "Forming details are managed to ensure reliable crimping zones, stable fastening areas, and consistent finished dimensions.",
    controlPoint: "Crimping and fastening structure consistency",
    imageSrc: "https://assets.electriterminal.com/factory/copper-tube-stamping-process.webp",
    imageAlt: "Copper tube stamping and finishing process",
  },
  {
    step: "04",
    title: "Inspection & Storage",
    description:
      "Finished batches are inspected, organized, and stored to support traceability and efficient shipment preparation.",
    controlPoint: "Batch inspection and storage readiness",
    imageSrc:
      "https://assets.electriterminal.com/factory/automatic-copper-tube-forming-process.webp",
    imageAlt: "Automatic copper tube forming process producing parts",
  },
];

const productionEnvironment = [
  {
    title: "Process Operation",
    caption:
      "Machine-side operations are carried out under controlled conditions to support stable forming and cutting quality.",
    imageSrc:
      "https://assets.electriterminal.com/factory/crimp-terminals-packaging-process-factory.webp",
    imageAlt: "Crimp terminals packaging process in factory",
  },
  {
    title: "Inventory Management",
    caption:
      "Organized material handling and batch tracking improve workflow efficiency and product traceability.",
    imageSrc:
      "https://assets.electriterminal.com/factory/green-insulated-terminals-warehouse-stock.webp",
    imageAlt: "Warehouse stock of green insulated terminals",
  },
  {
    title: "Process Monitoring",
    caption:
      "On-site supervision helps maintain alignment with dimensional and production requirements.",
    imageSrc:
      "https://assets.electriterminal.com/factory/terminal-production-quality-inspection-weighing.webp",
    imageAlt: "Terminal production quality inspection and weighing process",
  },
];

const capabilityHighlights = [
  {
    title: "Controlled Forming Accuracy",
    description:
      "Machining and forming steps are structured to maintain stable terminal dimensions.",
    icon: Gauge,
  },
  {
    title: "Reliable Material Selection",
    description:
      "Conductive materials are selected to support consistent electrical and mechanical performance.",
    icon: ShieldCheck,
  },
  {
    title: "Batch-Level Inspection",
    description:
      "Inspection workflows help reduce variation and maintain production consistency.",
    icon: ClipboardCheck,
  },
  {
    title: "Organized Storage & Delivery",
    description:
      "Structured storage and batch handling support traceability and efficient shipment processes.",
    icon: PackageCheck,
  },
];

const faqItems = [
  {
    question: "Do you support private-label manufacturing for OEM projects?",
    answer:
      "Yes. Depending on the product family, we support private labeling, laser marking, custom packaging, carton labeling and OEM documentation for qualified manufacturing projects.",
  },
  {
    question: "Can you support certification requirements for OEM projects?",
    answer:
      "We support certification planning based on project requirements. Existing certifications cover selected product families, while additional certification or testing can be discussed according to application and order requirements.",
  },
  {
    question: "How does your minimum order quantity (MOQ) work?",
    answer:
      "MOQ depends on product type, factory packaging, customization requirements and project scope rather than a fixed quantity.",
  },
  {
    question: "How are production lead times determined for manufacturing orders?",
    answer:
      "Production lead times depend on product type, order quantity, customization requirements, material availability, and production scheduling. Standard catalog products are typically completed within approximately one working week after order confirmation, while customized projects require additional engineering review and production planning.",
  },
  {
    question: "What types of product customization do you support?",
    answer:
      "Customization can include material, dimensions, thread, color, marking and packaging, depending on the product family and project requirements.",
  },
  {
    question: "What packaging options are available for manufacturing orders?",
    answer:
      "Packaging options include factory pack, bulk carton, inner box, private label, export packaging and pallet arrangements.",
  },
];

const oemProjectWorkflowSteps = [
  {
    step: "Step 1",
    title: "Discuss Your Requirements",
    details: ["OEM", "Thread", "Material", "Packaging"],
  },
  {
    step: "Step 2",
    title: "Engineering Review",
    details: ["Samples", "Drawings", "MOQ"],
  },
  {
    step: "Step 3",
    title: "Production & Quality Control",
    details: ["Inspection", "Batch Consistency", "Documentation"],
  },
  {
    step: "Step 4",
    title: "Packaging & Global Delivery",
    details: ["Private Label", "Export Cartons", "Air & Sea Freight"],
  },
];

const manufacturingInformationRows = [
  {
    label: "MOQ",
    value: "Determined by product type, factory packaging and customization requirements.",
  },
  {
    label: "Production Lead Time",
    value:
      "Standard catalog products are typically completed within approximately one working week after order confirmation.",
  },
  {
    label: "Shipping",
    value:
      "Air freight for samples and urgent orders; sea freight for production shipments. Transit time depends on destination and carrier schedules.",
  },
  {
    label: "Samples",
    value: "Engineering samples are available before mass production for qualified projects.",
  },
  {
    label: "Packaging",
    value: "Standard export packaging and OEM/private-label packaging options are available.",
  },
];

export default function ManufacturingPage() {
  const breadcrumbItems = [{ label: "Manufacturing" }];

  return (
    <>
      <div className="border-b border-border bg-muted dark:bg-slate-900/40 transition-colors duration-300">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="border-b border-slate-800 bg-[#11151A] py-14 md:py-20 transition-colors duration-300">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
            <div className="space-y-7">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
                Precision Terminal Manufacturing
              </p>
              <h1 className="text-4xl font-semibold leading-tight !text-white md:text-5xl">
                Controlled Processes. Reliable Output.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                From copper processing to final inspection, our manufacturing workflow is designed
                to deliver stable electrical performance, consistent dimensions, and dependable
                batch quality for industrial applications.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="btn btn-primary transition-all duration-300">
                  View Manufacturing Process →
                </Link>
                <Link href="/contact#request-quote" className="btn btn-hero-secondary transition-all duration-300">
                  Request Quote
                </Link>
              </div>
              <ul className="space-y-2 pt-1 text-sm text-slate-200">
                <li className="flex items-center gap-2 transition-colors duration-300">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  Precision forming workflows
                </li>
                <li className="flex items-center gap-2 transition-colors duration-300">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  Controlled production processes
                </li>
                <li className="flex items-center gap-2 transition-colors duration-300">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  Batch-level inspection and handling
                </li>
              </ul>
            </div>

            <div className="relative h-[300px] overflow-hidden rounded-sm border border-slate-700 bg-slate-900 shadow-2xl md:h-[440px] transition-colors duration-300">
              <ImagePreview
                src={heroImage}
                alt="CNC machining line in active industrial manufacturing"
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 transition-colors duration-300">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition-colors duration-300">
                  Live Production Visual
                </p>
                <p className="mt-1 text-sm text-slate-100 md:text-base transition-colors duration-300">
                  High-speed CNC machining under continuous process control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="01 Process Overview"
            title="Manufacturing Process Overview"
            description="Each stage of production is organized to improve dimensional accuracy, structural integrity, and consistency across batches."
            descriptionClassName="!text-slate-500 dark:!text-slate-400"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => (
              <ProcessStepCard key={step.title} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section className="section border-y border-slate-300 dark:border-slate-800 bg-[#EEF2F6] dark:bg-slate-900 transition-colors duration-300">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="02 Shopfloor"
            title="Real Production Environment"
            description="Consistent production depends not only on equipment, but also on disciplined on-site workflows and process control."
            titleClassName="!text-slate-900 dark:!text-slate-50"
            descriptionClassName="!text-slate-700 dark:!text-slate-300"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {productionEnvironment.map((item) => (
              <ProductionImageCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="03 Output & Storage"
            title="Finished Products & Storage"
            description="From controlled production to organized storage, finished terminals are prepared for efficient handling and shipment readiness."
            descriptionClassName="!text-slate-500 dark:!text-slate-400"
          />
          <div className="mt-10 overflow-hidden rounded-sm border border-border dark:border-slate-800 bg-slate-950 transition-colors duration-300">
            <div className="relative h-[360px] w-full md:h-[460px]">
              <ImagePreview
                src="https://assets.electriterminal.com/factory/5s-managed-cable-glands-warehouse.webp"
                alt="Warehouse storage area with organized finished goods"
                unoptimized
                loading="lazy"
                sizes="100vw"
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/45 to-transparent transition-colors duration-300" />
              <div className="absolute left-0 top-0 z-10 max-w-xl p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 transition-colors duration-300">
                  Current Warehouse Visual
                </p>
                <h3 className="mt-2 text-2xl font-semibold !text-white md:text-3xl transition-colors duration-300">
                  5S-Managed Storage for Ready-to-Ship Batches
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-200 md:text-base transition-colors duration-300">
                  Clear batch organization supports accurate picking and delivery processes.
                  Structured storage improves visibility, consistency, and overall logistics
                  efficiency.
                </p>
              </div>
              <div className="absolute bottom-4 right-4 z-10 hidden w-[320px] overflow-hidden rounded-sm border border-slate-500/70 dark:border-slate-600/70 bg-slate-900/85 p-3 backdrop-blur-sm md:block transition-colors duration-300">
                <div className="relative h-40 w-full overflow-hidden rounded-sm transition-colors duration-300">
                  <ImagePreview
                    src="https://assets.electriterminal.com/factory/cable-glands-packed-ready-for-shipment.webp"
                    alt="Packed finished products ready for shipment"
                    unoptimized
                    loading="lazy"
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-200 transition-colors duration-300">
                  Finished Packaging Close-Up
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 block md:hidden transition-colors duration-300">
            <div className="card overflow-hidden p-3 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-300">
              <div className="relative h-48 w-full overflow-hidden rounded-sm transition-colors duration-300">
                <ImagePreview
                  src="https://assets.electriterminal.com/factory/cable-glands-packed-ready-for-shipment.webp"
                  alt="Packed finished products ready for shipment"
                  unoptimized
                  loading="lazy"
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 dark:text-slate-400 transition-colors duration-300">
                Finished Packaging Close-Up
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-y border-slate-300 dark:border-slate-800 bg-[#EEF2F6] dark:bg-slate-900 transition-colors duration-300">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="04 Capability Highlights"
            title="Built for Consistency"
            description="Structured capability points for engineering evaluation and sourcing-side due diligence."
            titleClassName="!text-slate-900 dark:!text-slate-50"
            descriptionClassName="!text-slate-700 dark:!text-slate-300"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 transition-colors duration-300">
            {capabilityHighlights.map((item) => (
              <CapabilityCard key={item.title} {...item} />
            ))}
          </div>
          <div className="mt-12 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm md:p-10 transition-colors duration-300">
            <div className="mb-10 flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-8 md:flex-row md:items-end md:justify-between transition-colors duration-300">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-blue-700 dark:text-blue-300 transition-colors duration-300">
                  <Workflow className="h-4 w-4" />
                  OEM Project Workflow
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl transition-colors duration-300">
                  From RFQ Review to Global Delivery
                </h3>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400 md:text-right transition-colors duration-300">
                A practical decision path for OEM, custom manufacturing, packaging, and delivery planning before production starts.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_1fr] transition-colors duration-300">
              {/* Left Column: Timeline */}
              <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute bottom-10 left-[27px] top-6 hidden w-[2px] bg-slate-200 dark:bg-slate-700 md:block transition-colors duration-300">
                  <div className="h-1/3 w-full bg-gradient-to-b from-blue-500 to-transparent transition-colors duration-300"></div>
                </div>
                <div className="relative flex flex-col gap-6">
                  {oemProjectWorkflowSteps.map((entry, index) => (
                    <div key={entry.step} className="group/step relative flex flex-col gap-4 md:flex-row md:gap-6">
                      <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-[3px] border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-base font-bold text-slate-500 dark:text-slate-400 shadow-sm transition-all duration-300 group-hover/step:bg-blue-600 group-hover/step:border-blue-100 group-hover/step:text-white group-hover/step:scale-105">
                        {index + 1}
                      </div>
                      <div className="flex-1 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300 group-hover/step:-translate-y-1 group-hover/step:border-blue-300 group-hover/step:bg-blue-50/40 dark:group-hover/step:bg-blue-900/20 group-hover/step:shadow-md">
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400 transition-colors duration-300">
                          {entry.step}
                        </p>
                        <h4 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">
                          {entry.title}
                        </h4>
                        <div className="mt-4 flex flex-wrap gap-2 transition-colors duration-300">
                          {entry.details.map((detail) => (
                            <span
                              key={detail}
                              className="rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors group-hover/step:border-blue-300 group-hover/step:bg-white dark:group-hover/step:bg-slate-900 group-hover/step:text-blue-700 dark:group-hover/step:text-blue-400"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Information & Decision Logic */}
              <div className="flex flex-col gap-6 transition-colors duration-300">
                <div className="flex-1 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 transition-colors duration-300">
                  <div className="mb-6 flex items-center gap-3 transition-colors duration-300">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm transition-colors duration-300">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <h4 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 transition-colors duration-300">
                      Manufacturing Information
                    </h4>
                  </div>
                  <div className="flex flex-col gap-3 transition-colors duration-300">
                    {manufacturingInformationRows.map((row) => (
                      <div
                        key={row.label}
                        className="group flex flex-col gap-1.5 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm"
                      >
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-800 dark:text-slate-200 transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-400">
                          {row.label}
                        </span>
                        <span className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400 transition-colors duration-300">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-sm bg-blue-600 dark:bg-blue-700 p-6 text-white shadow-md md:p-8 transition-colors duration-300">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white opacity-10 blur-3xl transition-transform duration-700 hover:scale-150"></div>
                  <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-400 dark:bg-blue-500 opacity-20 blur-2xl transition-colors duration-300"></div>
                  <div className="relative z-10 transition-colors duration-300">
                    <span className="mb-3 inline-block rounded-sm border border-blue-400/50 bg-blue-700/50 dark:bg-blue-900/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100 transition-colors duration-300">
                      Decision Logic
                    </span>
                    <p className="text-base font-medium leading-relaxed text-blue-50 md:text-lg transition-colors duration-300">
                      Confirm buyer requirements, review feasibility, align MOQ and lead time, then finalize packaging and shipping before production release.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 transition-colors duration-300">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 md:text-2xl transition-colors duration-300">
              Need Manufacturing Support for Engineering Review?
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-secondary dark:text-slate-400 md:text-base transition-colors duration-300">
              Share your model requirements and target application. Our team can support technical
              review with process-focused manufacturing information.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 transition-colors duration-300">
              <Link href="/contact" className="btn btn-primary transition-all duration-300">
                Contact Engineering Team
              </Link>
              <Link href="/contact#request-quote" className="btn btn-secondary transition-all duration-300">
                Submit RFQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="05 FAQ"
            title="Manufacturing FAQ"
            description="Common OEM, manufacturing, and ordering questions from industrial buyers."
            descriptionClassName="!text-slate-500 dark:!text-slate-400"
          />
          <div className="mt-8 max-w-4xl transition-colors duration-300">
            <FAQAccordion items={faqItems} />
          </div>
        </div>
      </section>
    </>
  );
}
