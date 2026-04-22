import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllText?: string;
  viewAllHref?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
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
    <div className={`mb-8 ${alignmentClasses[align]} ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className={`flex-1 ${align === "center" ? "mx-auto" : ""}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-base text-secondary max-w-2xl ${subtitleAlignmentClasses[align]}`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {showViewAll && (
          <Link
            href={viewAllHref}
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex-shrink-0"
          >
            {viewAllText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
