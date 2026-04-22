import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
  primaryCta = { text: "Browse Products", href: "/categories" },
  secondaryCta = { text: "Request Quote", href: "/rfq" },
  imageUrl = "https://assets.electriterminal.com/factory/copper-tube-cutting-manufacturing-process.webp",
  imageAlt = "engineer cutting copper tubes in terminal manufacturing workshop, industrial electrical connector production process",
}: HeroSectionProps) {
  return (
    <section className="hero-shell relative overflow-hidden border-b">
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
          unoptimized
          sizes="100vw"
          priority
        />
        <div className="hero-overlay absolute inset-0"></div>
      </div>

      <div className="hero-content-wrap container relative z-10">
        <div className="max-w-[700px]">
          {/* Trust Badge */}
          <div className="mb-6">
            <div className="hero-trust-badge inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span>{trustLine}</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title mb-6 text-4xl md:text-5xl font-semibold leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="mb-4 text-sm uppercase tracking-widest text-orange-200">
              {subtitle}
            </p>
          )}

          {/* Supporting Description */}
          <p className="mb-8 max-w-[600px] text-lg leading-relaxed text-slate-300">
            {description}
          </p>

          {/* Core Product Indicators */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {categories.map((category, index) => (
              <div
                key={index}
                className="hero-chip flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm border transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-accent" />
                <span>{category}</span>
              </div>
            ))}
          </div>

          {/* Call to Action Buttons */}
          <div className="hero-actions flex flex-wrap items-center gap-4">
            <Link
              href={primaryCta.href}
              className="btn btn-primary btn-lg"
            >
              {primaryCta.text}
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href={secondaryCta.href}
              className="btn btn-hero-secondary btn-lg"
            >
              {secondaryCta.text}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
