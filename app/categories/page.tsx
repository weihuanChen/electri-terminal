"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Factory,
  Settings2,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { Breadcrumb } from "@/components/shared";
import { api } from "@/convex/_generated/api";
import { shouldBypassNextImageOptimization } from "@/lib/images";
import { categoryUrl } from "@/lib/routes";

const HERO_IMAGE =
  "https://assets.electriterminal.com/factory/insulated-terminals-warehouse-stock-packed-bags-clean.webp";
const MANUFACTURING_CAPABILITY_IMAGE =
  "https://assets.electriterminal.com/factory/terminal-production-quality-inspection-weighing.webp";

const PRODUCT_TYPE_COPY = [
  {
    name: "Ring Terminals",
    slugHints: ["ring-terminals"],
    description:
      "For secure wire-to-stud connections in vibration-resistant and high-reliability applications.",
  },
  {
    name: "Fork Terminals",
    slugHints: ["fork-terminals", "spade-terminals"],
    description:
      "Designed for quick installation and easy removal in screw-based electrical connections.",
  },
  {
    name: "Blade Terminals",
    slugHints: ["blade-terminals"],
    description:
      "Flat connection terminals suitable for compact electrical assemblies and quick-connect systems.",
  },
  {
    name: "Pin Terminals",
    slugHints: ["pin-terminals"],
    description:
      "Used for inserting stranded wires into terminal blocks for stable and reliable connections.",
  },
  {
    name: "Flag Terminals",
    slugHints: ["flag-terminals"],
    description: "Right-angle terminals designed for space-constrained wiring environments.",
  },
  {
    name: "Quick Disconnect Terminals",
    slugHints: ["quick-disconnect-terminals"],
    description: "Enable fast connection and disconnection without tools in maintenance-friendly systems.",
  },
  {
    name: "Cord End Terminals",
    slugHints: ["cord-end-terminals"],
    description:
      "Provide clean and secure wire ends for insertion into terminal blocks and connectors.",
  },
  {
    name: "Splice Connectors",
    slugHints: ["splice-connectors"],
    description: "Used to join wires securely for continuous electrical transmission.",
  },
  {
    name: "Copper Lugs",
    slugHints: ["copper-lugs"],
    description: "Heavy-duty connectors designed for high-current and power distribution applications.",
  },
  {
    name: "Terminal Sleeves",
    slugHints: ["terminal-sleeves-accessories"],
    description: "Insulation and protection components for improving connection safety and durability.",
  },
  {
    name: "Accessories",
    slugHints: ["terminal-sleeves-accessories", "terminals"],
    description: "Supporting components for installation, insulation, and connection enhancement.",
  },
] as const;

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export default function CategoriesPage() {
  const categories = useQuery(api.frontend.listCategoriesForPublic, {
    limit: 100,
  });

  const normalizedCategories = (categories ?? []).map((category) => ({
    _id: String(category._id),
    name: category.name ?? "",
    slug: category.slug ?? "",
    parentId: category.parentId ? String(category.parentId) : null,
    shortDescription: category.shortDescription ?? "",
    seoDescription: category.seoDescription ?? "",
    description: category.description ?? "",
  }));

  const rootCategories = normalizedCategories.filter((category) => !category.parentId);
  const childCategories = normalizedCategories.filter((category) => Boolean(category.parentId));
  const breadcrumbItems = [{ label: "Categories" }];

  const findCategoryHref = (slugHints: readonly string[], nameHints: readonly string[] = []) => {
    const slugSet = new Set(slugHints.map((hint) => hint.toLowerCase()));
    const normalizedNameHints = new Set(nameHints.map((hint) => normalizeText(hint)));

    const bySlug = normalizedCategories.find((category) => slugSet.has(category.slug.toLowerCase()));
    if (bySlug) {
      return categoryUrl(bySlug.slug);
    }

    if (normalizedNameHints.size > 0) {
      const byName = normalizedCategories.find((category) => {
        const normalizedName = normalizeText(category.name);
        return Array.from(normalizedNameHints).some(
          (hint) => normalizedName === hint || normalizedName.includes(hint),
        );
      });
      if (byName) {
        return categoryUrl(byName.slug);
      }
    }

    return "/categories";
  };

  const coreSystemCards = [
    {
      title: "Wire Termination Systems",
      description:
        "Reliable solutions for secure wire-to-terminal connections, covering a wide range of crimped and insulated terminal types.",
      cta: "Explore Termination Solutions",
      href: findCategoryHref(["terminals"], ["terminals", "wire termination"]),
      tags: ["Ring Terminals", "Fork Terminals", "Pin Terminals", "Cord End Terminals"],
      icon: <Zap className="h-5 w-5" aria-hidden="true" />,
    },
    {
      title: "Cable Protection & Entry",
      description:
        "Protect cables from mechanical stress and environmental exposure with durable sealing and insulation solutions.",
      cta: "Explore Cable Protection",
      href: findCategoryHref(["electrical-components", "cable-glands"], ["cable glands", "protection"]),
      tags: ["Cable Glands", "Heat Shrink", "Sleeves"],
      icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
    },
    {
      title: "Connection & Distribution",
      description:
        "Structured connection solutions for electrical panels and system-level power distribution.",
      cta: "Explore Distribution Systems",
      href: findCategoryHref(
        ["terminal-blocks", "electrical-components", "terminals"],
        ["terminal blocks", "distribution"],
      ),
      tags: ["Terminal Blocks", "Junction Systems"],
      icon: <Settings2 className="h-5 w-5" aria-hidden="true" />,
    },
    {
      title: "Installation Tools",
      description:
        "Professional tools designed to ensure consistent crimping performance and installation reliability.",
      cta: "Explore Tools",
      href: findCategoryHref(["crimping-tools", "tools", "terminals"], ["crimping tools", "tools"]),
      tags: ["Crimping Tools", "Accessories"],
      icon: <Factory className="h-5 w-5" aria-hidden="true" />,
    },
  ];

  const productTypeCards = PRODUCT_TYPE_COPY.map((item) => ({
    ...item,
    href: findCategoryHref(item.slugHints, [item.name]),
  }));

  const whyChooseCards = [
    {
      title: "Controlled Crimping Process",
      description: "Precision tooling ensures consistent terminal performance across batches.",
      icon: <CheckCircle2 className="h-5 w-5" aria-hidden="true" />,
    },
    {
      title: "High-Conductivity Materials",
      description: "Selected copper materials for stable electrical transmission.",
      icon: <Zap className="h-5 w-5" aria-hidden="true" />,
    },
    {
      title: "In-House Quality Inspection",
      description: "Every batch is checked for dimensional and mechanical consistency.",
      icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
    },
    {
      title: "Flexible Production Support",
      description: "Adaptable to OEM requirements and custom specifications.",
      icon: <Truck className="h-5 w-5" aria-hidden="true" />,
    },
  ];

  const technicalGuides = [
    {
      title: "How to Choose the Right Terminal Type",
      description:
        "Understand how wire size, connection method, and insulation requirements affect terminal selection.",
      href: "/blog",
    },
    {
      title: "Crimping Best Practices",
      description: "Ensure reliable connections with proper crimping techniques and tool selection.",
      href: "/blog",
    },
    {
      title: "Understanding Terminal Materials",
      description: "Compare copper, brass, and plated terminals for different electrical applications.",
      href: "/blog",
    },
  ];

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="relative overflow-hidden border-y border-slate-800 bg-[#0B1625] text-slate-100">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(52% 55% at 16% 22%, rgba(59,130,246,0.32) 0%, rgba(59,130,246,0) 100%), radial-gradient(40% 55% at 78% 6%, rgba(249,115,22,0.24) 0%, rgba(249,115,22,0) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.38) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.38) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container relative py-12 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-center">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center rounded-full border border-slate-500/70 bg-slate-700/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                Industrial Electrical Connection Systems
              </p>
              <h1
                className="mb-6 text-3xl font-semibold leading-tight !text-white md:text-5xl"
                style={{ color: "#f8fafc", textShadow: "0 2px 14px rgba(0, 0, 0, 0.42)" }}
              >
                Reliable Electrical Connection Solutions
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-200/90 md:text-lg">
                From wire termination to cable protection, explore a complete range of industrial
                connection components designed for stable performance, long-term durability, and
                consistent quality.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="#core-systems" className="btn btn-primary btn-arrow">
                  Explore Connection Systems
                </Link>
                <Link href="#product-types" className="btn btn-hero-secondary">
                  Browse Product Categories
                </Link>
              </div>
              <div className="mt-8 grid gap-2 text-sm text-slate-200 sm:grid-cols-3">
                {[
                  "High-conductivity copper",
                  "Controlled crimping geometry",
                  "Batch-level quality inspection",
                ].map((tag) => (
                  <p
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-sm border border-white/15 bg-white/[0.045] px-3 py-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-orange-300" aria-hidden="true" />
                    {tag}
                  </p>
                ))}
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.12em] text-slate-300/90">
                {rootCategories.length > 0
                  ? `${rootCategories.length} Core Categories • ${childCategories.length} Product-Type Categories`
                  : "Industrial-grade catalog architecture"}
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-slate-500/45">
                <Image
                  src={HERO_IMAGE}
                  alt="Copper tube cutting manufacturing process"
                  fill
                  unoptimized={shouldBypassNextImageOptimization(HERO_IMAGE)}
                  className="object-cover"
                  priority
                />
                <div className="absolute left-4 right-4 bottom-4 rounded-sm border border-slate-300/35 bg-slate-900/62 p-4 backdrop-blur-[2px]">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-200/90">
                    Manufacturing Insight
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-100/95">
                    Precision copper processing and controlled forming deliver dependable crimping
                    performance in high-demand installations.
                  </p>
                </div>
              </div>

              <div className="absolute -left-4 -top-4 hidden w-32 rounded-sm border border-blue-300/35 bg-[#102139]/88 p-3 text-xs text-slate-200/90 md:block">
                Process Stability
              </div>
              <div className="absolute -bottom-4 -right-4 hidden w-32 rounded-sm border border-orange-300/35 bg-[#2A1A0E]/90 p-3 text-xs text-orange-100/95 md:block">
                Consistent Geometry
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="core-systems" className="section bg-[#F5F8FC] dark:bg-slate-950">
        <div className="container">
          <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Core Structure
              </p>
              <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
                Core Connection Systems
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-secondary md:text-right">
              Explore our product categories organized by real-world industrial applications.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {coreSystemCards.map((card) => (
              <article
                key={card.title}
                className="group relative overflow-hidden rounded-sm border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-[0_16px_30px_rgba(30,64,175,0.16)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
              >
                <div className="absolute right-0 top-0 h-20 w-20 bg-gradient-to-bl from-blue-100/70 to-transparent dark:from-blue-500/15" />
                <div className="mb-4 inline-flex rounded-sm border border-slate-300 bg-slate-100 p-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {card.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{card.title}</h3>
                <p className="text-sm leading-7 text-secondary">{card.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={card.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:text-accent"
                >
                  {card.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product-types" className="section">
        <div className="container">
          <div className="mb-8 md:mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Product Type Access
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
              Browse by Product Type
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-secondary">
              Select a category to explore terminal types, specifications, and available series
              options.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productTypeCards.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group rounded-sm border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-[0_10px_24px_rgba(30,64,175,0.12)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
              >
                <div className="mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100">
                  {item.name}
                </h3>
                <p className="truncate text-sm text-secondary">{item.description}</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  View Category
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[#0F1B2D] text-slate-100">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:items-stretch">
            <div className="relative overflow-hidden rounded-sm border border-slate-600/70 bg-slate-900/50 min-h-[320px]">
              <Image
                src={MANUFACTURING_CAPABILITY_IMAGE}
                alt="Terminal production quality inspection and weighing process"
                fill
                unoptimized={shouldBypassNextImageOptimization(MANUFACTURING_CAPABILITY_IMAGE)}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08111E]/82 via-[#08111E]/42 to-[#08111E]/20" />
              <div className="absolute left-5 right-5 bottom-5 rounded-sm border border-slate-300/35 bg-slate-900/62 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-200/90">
                  Why Choose Electri Terminal
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-100/95">
                  Real production environment, process control, and inspection standards designed for
                  repeatable industrial performance.
                </p>
              </div>
            </div>

            <div className="flex flex-col rounded-sm border border-slate-600/70 bg-slate-900/45 p-6 md:p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                Why Choose Electri Terminal
              </p>
              <h2 className="text-2xl font-semibold !text-white md:text-3xl">
                REAL MANUFACTURING CAPABILITY
              </h2>
              <p className="mt-3 text-sm uppercase tracking-[0.08em] text-slate-300/95">
                Built for Consistency, Not Just Claims
              </p>

              <div className="mt-6 space-y-3">
                {whyChooseCards.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-sm border border-slate-600/70 bg-slate-800/45 p-4 transition-colors hover:border-slate-400/90"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex rounded-sm border border-slate-500/60 bg-slate-700/55 p-2 text-orange-300">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold !text-white">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-[#F7F9FC] dark:bg-slate-950">
        <div className="container">
          <div className="mb-8 md:mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Engineering Content
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">
              Technical Resources & Selection Guides
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {technicalGuides.map((guide) => (
              <article
                key={guide.title}
                className="rounded-sm border border-slate-200 bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{guide.title}</h3>
                <p className="mt-3 text-sm leading-7 text-secondary">{guide.description}</p>
                <Link
                  href={guide.href}
                  className="mt-5 inline-flex items-center text-sm font-semibold text-primary hover:text-accent"
                >
                  Read Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="rounded-sm border border-slate-300 bg-gradient-to-br from-[#10233A] to-[#1A2D47] p-8 text-slate-100 md:p-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
              Project Support
            </p>
            <h2 className="text-2xl font-semibold !text-white md:text-4xl">
              Need Help Selecting the Right Product?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
              Our team can help you identify the most suitable terminal or connection solution
              based on your application requirements.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/rfq" className="btn btn-inverse-solid btn-arrow">
                Request a Quote
              </Link>
              <Link href="/contact" className="btn btn-inverse-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-compact">
        <div className="container">
          <div className="mx-auto max-w-[840px]">
            <details className="group rounded-sm border border-border bg-white p-5 md:p-6 dark:bg-slate-900">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-[0.12em] text-secondary">
                Read More: Electrical Connection Solutions
                <span className="text-primary transition-transform duration-200 group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  {
                    title: "What Are Electrical Terminals?",
                    body: "Electrical terminals are components used to connect wires and cables to electrical systems, ensuring stable and secure current transmission.",
                  },
                  {
                    title: "Types of Electrical Connections",
                    body: "Different terminal types are designed for various connection methods, including crimping, fastening, and quick-disconnect applications.",
                  },
                  {
                    title: "How to Select the Right Terminal",
                    body: "Selecting the right terminal depends on wire size, connection type, mechanical requirements, and environmental conditions.",
                  },
                  {
                    title: "Applications Across Industries",
                    body: "Electrical terminals are widely used in industrial equipment, automotive systems, control panels, and power distribution applications.",
                  },
                ].map((entry) => (
                  <article key={entry.title} className="rounded-sm border border-border bg-muted p-4">
                    <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">{entry.title}</h3>
                    <p className="text-sm leading-7 text-secondary">{entry.body}</p>
                  </article>
                ))}
              </div>
            </details>
          </div>
        </div>
      </section>

      {categories && categories.length === 0 && (
        <section className="section-compact">
          <div className="container">
            <div className="rounded-sm border border-border bg-muted p-4 text-center">
              <p className="text-sm text-secondary">
                Live category data is temporarily unavailable. Structure and navigation remain ready
                for selection flow.
              </p>
            </div>
          </div>
        </section>
      )}

    </>
  );
}
