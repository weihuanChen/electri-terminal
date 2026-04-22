import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, Cable, Layers3, Wrench } from "lucide-react";

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
  primaryCta = { text: "Discuss Your Requirements", href: "/contact" },
  secondaryCta = { text: "Contact Us", href: "/contact" },
}: SecondaryCapabilitySectionProps) {
  return (
    <section className="section border-t border-border bg-background">
      <div className="container">
        <div className="mx-auto max-w-5xl rounded-sm border border-border bg-card p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
              Secondary Capability
            </p>
            <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
            <p className="max-w-3xl text-secondary">{subtitle}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {points.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="rounded-sm border border-border bg-background p-5">
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <h3 className="mb-2 text-base font-semibold text-foreground">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-secondary">{point.description}</p>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-secondary">
            Contact us to discuss your specific needs. Deep cable gland parameter libraries are not
            yet published in this phase, and technical scope is confirmed during inquiry.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={primaryCta.href} className="btn btn-primary">
              {primaryCta.text}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={secondaryCta.href} className="btn btn-secondary">
              {secondaryCta.text}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
