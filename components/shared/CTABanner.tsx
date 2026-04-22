import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  title: string;
  description?: string;
  primaryCTA?: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
  variant?: "default" | "primary" | "muted";
}

export default function CTABanner({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  variant = "default",
}: CTABannerProps) {
  const backgroundStyles = {
    default: "bg-muted border-y border-border",
    primary: "cta-banner-primary",
    muted: "bg-white border-y border-border",
  };
  const descriptionClass = variant === "primary" ? "text-slate-300" : "text-secondary";
  const titleClass = variant === "primary" ? "!text-white dark:!text-white" : "";

  return (
    <div className={`section ${backgroundStyles[variant]}`}>
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`mb-4 text-3xl font-semibold md:text-4xl ${titleClass}`}>{title}</h2>
          {description && (
            <p className={`text-lg mb-8 ${descriptionClass}`}>
              {description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {primaryCTA && (
              <Link
                href={primaryCTA.href}
                className={`btn btn-lg ${
                  variant === "primary"
                    ? "btn-inverse-solid"
                    : "btn-primary"
                }`}
              >
                {primaryCTA.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className={`btn btn-lg ${
                  variant === "primary"
                    ? "btn-inverse-outline"
                    : "btn-secondary"
                }`}
              >
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
