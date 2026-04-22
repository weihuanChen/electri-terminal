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

  return (
    <section className="section bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
      <div className="container">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          align="center"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {displayCapabilities.map((capability, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-sm hover:border-primary/50 transition-colors shadow-sm">
              <TrustBadge
                icon={capability.icon}
                title={capability.title}
                description={capability.description}
                variant="detailed"
                className=""
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
