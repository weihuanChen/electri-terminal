import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { categoriesUrl, requestQuoteUrl } from "@/lib/routes";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  trustLine?: string;
  categories?: string[];
  primaryCta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  imageUrl?: string;
  imageAlt?: string;
  /** Verifiable facts shown as a strip under the CTAs (e.g. year founded, material, lead time). */
  stats?: HeroStat[];
}

export interface HeroStat {
  value: string;
  label: string;
}

export default function HeroSection({
  title = "Precision Manufacturing of Industrial Electrical Components",
  subtitle = "Direct from the Factory. OEM/ODM Available.",
  description = "Factory-focused manufacturing support for terminal blocks, cable glands, and related industrial electrical components.",
  trustLine = "Factory-Direct Technical Support",
  categories = [
    "Terminal Blocks",
    "Cable Glands",
    "Electrical Enclosures",
    "DIN Rail Accessories",
  ],
  primaryCta = { text: "Browse Products", href: categoriesUrl() },
  secondaryCta = { text: "Request Quote", href: requestQuoteUrl() },
  imageUrl = "https://assets.electriterminal.com/factory/copper-tube-cutting-manufacturing-process.webp",
  imageAlt = "engineer cutting copper tubes in terminal manufacturing workshop, industrial electrical connector production process",
  stats = [],
}: HeroSectionProps) {
  return (
    <section className="hero-shell relative overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          style={{
            objectPosition: "center center",
            opacity: 0.62,
            transform: "translateX(clamp(72px, 12vw, 220px)) scale(1.18)",
            transformOrigin: "center center",
          }}
          sizes="100vw"
          fetchPriority="high"
          loading="eager"
          priority
        />
        <div className="hero-overlay absolute inset-0"></div>
      </div>

      <div className="hero-content-wrap container relative z-10">
        <div className="max-w-[720px]">
          {/* Trust Badge */}
          <div className="mb-6">
            <div className="hero-trust-badge inline-flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-control backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
              <span>{trustLine}</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title mb-6 text-4xl md:text-5xl lg:text-[3.25rem] font-semibold leading-[1.15] tracking-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-orange-200/95">
              {subtitle}
            </p>
          )}

          {/* Supporting Description */}
          <p className="mb-8 max-w-[600px] text-base sm:text-lg leading-relaxed text-slate-300">
            {description}
          </p>

          {/* Core Product Indicators */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 mb-10">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="hero-chip flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-control border backdrop-blur-xs transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-accent" />
                  <span>{category}</span>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action Buttons */}
          <div className="hero-actions flex flex-wrap items-center gap-4">
            <Link
              href={primaryCta.href}
              className="btn btn-primary btn-lg"
              data-ga-event="hero_cta_click"
              data-ga-param-cta="primary"
            >
              {primaryCta.text}
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href={secondaryCta.href}
              className="btn btn-hero-secondary btn-lg"
              data-ga-event="hero_cta_click"
              data-ga-param-cta="secondary"
            >
              {secondaryCta.text}
            </Link>
          </div>

          {/* Verifiable factory facts */}
          {stats.length > 0 && (
            <dl className="hero-stats mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-card sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="hero-stat flex flex-col-reverse px-4 py-3.5">
                  <dt className="mt-1 text-xs leading-snug text-slate-300">{stat.label}</dt>
                  <dd className="text-lg font-semibold leading-tight text-white sm:text-xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
