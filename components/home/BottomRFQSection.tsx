import Link from "next/link";
import { ArrowRight, FileText, Check } from "lucide-react";
import { contactUrl, requestQuoteUrl } from "@/lib/routes";

interface BottomRFQSectionProps {
  title?: string;
  subtitle?: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  benefits?: string[];
  contactLinks?: Array<{
    label: string;
    value: string;
    href?: string;
    external?: boolean;
  }>;
}

export default function BottomRFQSection({
  title = "Partner with a Reliable Industrial Manufacturer",
  subtitle = "Share your item numbers and quantity plan. MOQ and lead time are confirmed per item number and order quantity.",
  primaryCta = {
    text: "Contact Sales",
    href: requestQuoteUrl(),
  },
  secondaryCta = {
    text: "Request Documentation",
    href: contactUrl(),
  },
  benefits = [
    "Direct factory communication",
    "MOQ confirmed by item number",
    "Lead time confirmed by order quantity",
    "Certificates available on request",
  ],
  contactLinks,
}: BottomRFQSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-slate-900 via-[#131C27] to-slate-950 text-white p-8 sm:p-12 lg:p-14 shadow-xl border border-slate-800/80">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.12),transparent_40%)]" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">
                Project Quotation & Support
              </p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight !text-white md:text-4xl leading-tight">
                {title}
              </h2>
              <p className="mb-8 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
                {subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={primaryCta.href}
                  className="btn btn-primary btn-lg gap-2"
                >
                  {primaryCta.text}
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  href={secondaryCta.href}
                  className="btn btn-hero-secondary btn-lg gap-2"
                >
                  <FileText className="h-5 w-5" />
                  {secondaryCta.text}
                </Link>
              </div>
            </div>

            <div className="rounded-card border border-white/10 bg-white/[0.04] p-6 sm:p-7 backdrop-blur-xs space-y-6">
              <div>
                <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  What You Can Expect
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-sm text-slate-200"
                    >
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-medium leading-snug">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {contactLinks && contactLinks.length > 0 && (
                <div className="border-t border-white/10 pt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Direct Channels
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {contactLinks.map((contact) => {
                      if (!contact.href) {
                        return (
                          <div
                            key={`${contact.label}-${contact.value}`}
                            className="inline-flex items-center gap-2 rounded-control border border-white/15 bg-white/5 px-3 py-1.5 text-xs"
                          >
                            <span className="uppercase tracking-wider text-slate-400">
                              {contact.label}:
                            </span>
                            <span className="font-medium text-white">{contact.value}</span>
                          </div>
                        );
                      }

                      const isExternal =
                        contact.external === true || /^https?:\/\//.test(contact.href);

                      return (
                        <Link
                          key={`${contact.label}-${contact.value}`}
                          href={contact.href}
                          className="inline-flex items-center gap-2 rounded-control border border-white/15 bg-white/5 hover:bg-white/12 hover:border-white/30 px-3 py-1.5 text-xs transition-colors"
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                        >
                          <span className="uppercase tracking-wider text-slate-300">
                            {contact.label}:
                          </span>
                          <span className="font-medium text-white">{contact.value}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
