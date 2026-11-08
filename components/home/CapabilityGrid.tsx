import TrustBadge from "@/components/shared/TrustBadge";
import SectionHeader from "@/components/shared/SectionHeader";
import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Users,
  HeadphonesIcon,
  Zap,
  Globe,
  FileText,
} from "lucide-react";

interface Capability {
  icon?: LucideIcon;
  title: string;
  description: string;
}

interface CapabilityGridProps {
  capabilities?: Capability[];
  title?: string;
  subtitle?: string;
}

export default function CapabilityGrid({
  capabilities,
  title = "Why Choose Us",
  subtitle = "Factory-focused industrial B2B support with structured communication and documentation workflows",
}: CapabilityGridProps) {
  const defaultCapabilities: Capability[] = [
    {
      icon: ShieldCheck,
      title: "Stable Quality Control",
      description: "Structured quality checkpoints and inspection records across manufacturing stages.",
    },
    {
      icon: Users,
      title: "OEM/ODM Support",
      description: "Custom manufacturing solutions tailored to your specifications with flexible production capabilities.",
    },
    {
      icon: HeadphonesIcon,
      title: "Technical Support",
      description: "Technical support for product selection, application matching, and sourcing communication.",
    },
    {
      icon: Zap,
      title: "Fast Sampling",
      description: "Sample arrangements are planned according to item number availability and project scope.",
    },
    {
      icon: Globe,
      title: "Export Experience",
      description: "Cross-region B2B communication support for sourcing, packaging, and shipping coordination.",
    },
    {
      icon: FileText,
      title: "Documentation Support",
      description: "Custom product documentation and certificates are available upon request for selected models.",
    },
  ];

  const displayCapabilities = capabilities || defaultCapabilities;
  const isFourItemSplit = displayCapabilities.length === 4;

  return (
    <section className="section bg-gradient-to-b from-slate-50/90 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-950">
      <div className="container">
        {isFourItemSplit ? (
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-14">
            <div className="lg:sticky lg:top-28 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Direct Factory Advantage
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-base leading-relaxed text-secondary">
                  {subtitle}
                </p>
              )}
              <div className="pt-2 border-l-2 border-primary/40 pl-4 space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  Built for Industrial Sourcing & OEM Teams
                </p>
                <p className="text-sm text-secondary leading-relaxed">
                  Every batch is backed by real workshop processes, flexible order planning, and direct technical communication.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
              {displayCapabilities.map((capability, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 rounded-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-xs"
                >
                  <TrustBadge
                    icon={capability.icon}
                    title={capability.title}
                    description={capability.description}
                    variant="detailed"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <SectionHeader
              eyebrow="Direct Factory Advantage"
              title={title}
              subtitle={subtitle}
              align="center"
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {displayCapabilities.map((capability, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 rounded-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-xs"
                >
                  <TrustBadge
                    icon={capability.icon}
                    title={capability.title}
                    description={capability.description}
                    variant="detailed"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
