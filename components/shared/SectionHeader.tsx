import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showViewAll?: boolean;
  viewAllText?: string;
  viewAllHref?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  eyebrow,
  showViewAll = false,
  viewAllText = "View All",
  viewAllHref = "#",
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const subtitleAlignmentClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  return (
    <div className={`mb-10 md:mb-12 ${alignmentClasses[align]} ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className={`flex-1 ${align === "center" ? "mx-auto" : ""}`}>
          {eyebrow && (
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </p>
          )}
          <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-bold tracking-tight text-foreground mb-3">
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-base leading-relaxed text-secondary max-w-2xl ${subtitleAlignmentClasses[align]}`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {showViewAll && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex-shrink-0 group"
          >
            {viewAllText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
