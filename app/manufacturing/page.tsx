import Link from "next/link";
import { Breadcrumb, FAQAccordion, ImagePreview } from "@/components/shared";
import {
  CapabilityCard,
  ManufacturingSectionHeading,
  ProcessStepCard,
  ProductionImageCard,
} from "@/components/manufacturing/ManufacturingBlocks";
import { CheckCircle2, ClipboardCheck, Gauge, PackageCheck, ShieldCheck } from "lucide-react";

const heroImage = "https://assets.electriterminal.com/factory/cnc-machining-copper-tube.webp";

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
    question: "What processes are involved in terminal manufacturing?",
    answer:
      "Terminal manufacturing typically includes material preparation, cutting, forming, structuring, and inspection before storage and shipment.",
  },
  {
    question: "How do you maintain consistency across batches?",
    answer:
      "Consistency is supported through controlled forming processes, stable material selection, and structured inspection workflows.",
  },
  {
    question: "Do you support custom production requirements?",
    answer:
      "Production processes can be adapted to meet application-specific requirements, including dimensional and structural adjustments.",
  },
  {
    question: "How are finished terminals stored before shipment?",
    answer:
      "Finished products are organized by batch to improve traceability, handling efficiency, and shipment preparation.",
  },
];

const seoReadMoreItems = [
  {
    title: "What This Process Supports",
    body: "Our manufacturing workflow is designed to support dimensional consistency, stable terminal structure, and reliable electrical performance across applications.",
  },
  {
    title: "Why Process Control Matters",
    body: "Controlled cutting, forming, and inspection steps help reduce variation and improve consistency between production batches.",
  },
  {
    title: "Where These Products Are Used",
    body: "Manufactured terminals are widely applied in industrial equipment, control panels, automotive wiring, and power distribution systems.",
  },
  {
    title: "Storage and Delivery Readiness",
    body: "Organized storage and batch handling improve product traceability and ensure efficient delivery workflows.",
  },
];

export default function ManufacturingPage() {
  const breadcrumbItems = [{ label: "Manufacturing" }];

  return (
    <>
      <div className="border-b border-border bg-muted">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="border-b border-slate-800 bg-[#11151A] py-14 md:py-20">
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
                <Link href="/contact" className="btn btn-primary">
                  View Manufacturing Process →
                </Link>
                <Link href="/rfq" className="btn btn-hero-secondary">
                  Request Quote
                </Link>
              </div>
              <ul className="space-y-2 pt-1 text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  Precision forming workflows
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  Controlled production processes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-300" />
                  Batch-level inspection and handling
                </li>
              </ul>
            </div>

            <div className="relative h-[300px] overflow-hidden rounded-sm border border-slate-700 bg-slate-900 shadow-2xl md:h-[440px]">
              <ImagePreview
                src={heroImage}
                alt="CNC machining line in active industrial manufacturing"
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">
                  Live Production Visual
                </p>
                <p className="mt-1 text-sm text-slate-100 md:text-base">
                  High-speed CNC machining under continuous process control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="01 Process Overview"
            title="Manufacturing Process Overview"
            description="Each stage of production is organized to improve dimensional accuracy, structural integrity, and consistency across batches."
            descriptionClassName="!text-slate-500"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => (
              <ProcessStepCard key={step.title} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section className="section border-y border-slate-300 bg-[#EEF2F6]">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="02 Shopfloor"
            title="Real Production Environment"
            description="Consistent production depends not only on equipment, but also on disciplined on-site workflows and process control."
            titleClassName="!text-slate-900"
            descriptionClassName="!text-slate-700"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {productionEnvironment.map((item) => (
              <ProductionImageCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="03 Output & Storage"
            title="Finished Products & Storage"
            description="From controlled production to organized storage, finished terminals are prepared for efficient handling and shipment readiness."
            descriptionClassName="!text-slate-500"
          />
          <div className="mt-10 overflow-hidden rounded-sm border border-border bg-slate-950">
            <div className="relative h-[360px] w-full md:h-[460px]">
              <ImagePreview
                src="https://assets.electriterminal.com/factory/5s-managed-cable-glands-warehouse.webp"
                alt="Warehouse storage area with organized finished goods"
                unoptimized
                loading="lazy"
                sizes="100vw"
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/45 to-transparent" />
              <div className="absolute left-0 top-0 z-10 max-w-xl p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  Current Warehouse Visual
                </p>
                <h3 className="mt-2 text-2xl font-semibold !text-white md:text-3xl">
                  5S-Managed Storage for Ready-to-Ship Batches
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-200 md:text-base">
                  Clear batch organization supports accurate picking and delivery processes.
                  Structured storage improves visibility, consistency, and overall logistics
                  efficiency.
                </p>
              </div>
              <div className="absolute bottom-4 right-4 z-10 hidden w-[320px] overflow-hidden rounded-sm border border-slate-500/70 bg-slate-900/85 p-3 backdrop-blur-sm md:block">
                <div className="relative h-40 w-full overflow-hidden rounded-sm">
                  <ImagePreview
                    src="https://assets.electriterminal.com/factory/cable-glands-packed-ready-for-shipment.webp"
                    alt="Packed finished products ready for shipment"
                    unoptimized
                    loading="lazy"
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-200">
                  Finished Packaging Close-Up
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 block md:hidden">
            <div className="card overflow-hidden p-3">
              <div className="relative h-48 w-full overflow-hidden rounded-sm">
                <ImagePreview
                  src="https://assets.electriterminal.com/factory/cable-glands-packed-ready-for-shipment.webp"
                  alt="Packed finished products ready for shipment"
                  unoptimized
                  loading="lazy"
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                Finished Packaging Close-Up
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-y border-slate-300 bg-[#EEF2F6]">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="04 Capability Highlights"
            title="Built for Consistency"
            description="Structured capability points for engineering evaluation and sourcing-side due diligence."
            titleClassName="!text-slate-900"
            descriptionClassName="!text-slate-700"
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {capabilityHighlights.map((item) => (
              <CapabilityCard key={item.title} {...item} />
            ))}
          </div>
          <div className="mt-10 rounded-sm border border-slate-300 bg-white p-6 md:p-8">
            <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
              Need Manufacturing Support for Engineering Review?
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-secondary md:text-base">
              Share your model requirements and target application. Our team can support technical
              review with process-focused manufacturing information.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/contact" className="btn btn-primary">
                Contact Engineering Team
              </Link>
              <Link href="/rfq" className="btn btn-secondary">
                Submit RFQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <ManufacturingSectionHeading
            eyebrow="05 FAQ"
            title="Manufacturing FAQ"
            description="Common process and storage questions for industrial terminal manufacturing."
            descriptionClassName="!text-slate-500"
          />
          <div className="mt-8 max-w-4xl">
            <FAQAccordion items={faqItems} />
          </div>
        </div>
      </section>

      <section className="section-compact bg-slate-50 pb-14 md:pb-16">
        <div className="container">
          <div className="mx-auto max-w-[980px]">
            <details className="group rounded-sm border border-border bg-white p-5 md:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-[0.12em] text-secondary">
                Read More: Manufacturing Notes
                <span className="text-primary transition-transform duration-200 group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {seoReadMoreItems.map((entry) => (
                  <article key={entry.title} className="rounded-sm border border-border bg-muted p-4">
                    <h3 className="mb-2 text-base font-semibold text-slate-900">{entry.title}</h3>
                    <p className="text-sm leading-7 text-secondary">{entry.body}</p>
                  </article>
                ))}
              </div>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
