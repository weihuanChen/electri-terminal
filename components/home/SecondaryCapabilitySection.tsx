import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, Cable, Layers3, Wrench } from "lucide-react";
import { contactUrl } from "@/lib/routes";

interface CapabilityPoint {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface SecondaryCapabilitySectionProps {
  title?: string;
  subtitle?: string;
  points?: CapabilityPoint[];
  primaryCta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
}

export default function SecondaryCapabilitySection({
  title = "Custom Solutions & Extended Products",
  subtitle = "Beyond standard ring terminals, we also support cable glands, custom terminal designs, and project-based sourcing for special requirements.",
  points = [
    {
      icon: Cable,
      title: "Cable Glands",
      description:
        "Waterproof connector capability for project-based sourcing communication.",
    },
    {
      icon: Wrench,
      title: "Custom Terminal Designs",
      description:
        "Customization support based on drawings, samples, and application requirements.",
    },
    {
      icon: Layers3,
      title: "Project-Based Sourcing",
      description:
        "Extended sourcing support for special requirements and combined component needs.",
    },
  ],
  primaryCta = { text: "Discuss Your Requirements", href: contactUrl() },
  secondaryCta = { text: "Contact Us", href: contactUrl() },
}: SecondaryCapabilitySectionProps) {
  return (
    <section className="section bg-background">
      <div className="container">
        <div className="rounded-card border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-800/50 p-7 sm:p-10 lg:p-12 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Extended Sourcing Scope
              </p>
              <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {title}
              </h2>
              <p className="max-w-2xl text-secondary leading-relaxed">{subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href={primaryCta.href} className="btn btn-primary">
                {primaryCta.text}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={secondaryCta.href} className="btn btn-secondary">
                {secondaryCta.text}
              </Link>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-slate-200/80 dark:md:divide-slate-800 pt-8 border-t border-slate-200/70 dark:border-slate-800/80">
            {points.map((point, index) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className={index === 0 ? "md:pr-8" : index === 1 ? "md:px-8" : "md:pl-8"}
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-secondary">{point.description}</p>
                </div>
              );
            })}
          </div>

          <p className="mt-8 border-l-2 border-primary/40 pl-3.5 text-xs sm:text-sm text-secondary">
            Contact us to discuss your specific needs. Deep cable gland parameter libraries are not
            yet published in this phase, and technical scope is confirmed during inquiry.
          </p>
        </div>
      </div>
    </section>
  );
}
