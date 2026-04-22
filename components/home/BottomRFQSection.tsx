import Link from "next/link";
import { ArrowRight, FileText, Check } from "lucide-react";

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
    href: "/contact",
  },
  secondaryCta = {
    text: "Request Documentation",
    href: "/contact",
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
    <section className="border-t border-border bg-white py-16 md:py-24">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          {/* Clear Headline */}
          <h2 className="mb-6 text-3xl font-semibold text-gray-900 md:text-4xl">
            {title}
          </h2>

          {/* Short Supporting Description */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600">
            {subtitle}
          </p>

          {/* Two Action Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <Link
              href={primaryCta.href}
              className="btn btn-primary btn-lg gap-2"
            >
              {primaryCta.text}
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href={secondaryCta.href}
              className="btn btn-secondary btn-lg gap-2"
            >
              <FileText className="h-5 w-5" />
              {secondaryCta.text}
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mx-auto grid max-w-3xl gap-6 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-700"
              >
                <Check className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {contactLinks && contactLinks.length > 0 && (
            <div className="mx-auto mt-8 max-w-3xl border-t border-border pt-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Direct Contact
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {contactLinks.map((contact) => {
                  if (!contact.href) {
                    return (
                      <div
                        key={`${contact.label}-${contact.value}`}
                        className="btn btn-outline cursor-default"
                      >
                        <span className="text-xs uppercase tracking-wide text-secondary">
                          {contact.label}
                        </span>
                        <span className="font-medium text-foreground">{contact.value}</span>
                      </div>
                    );
                  }

                  const isExternal =
                    contact.external === true || /^https?:\/\//.test(contact.href);

                  return (
                    <Link
                      key={`${contact.label}-${contact.value}`}
                      href={contact.href}
                      className="btn btn-outline"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      <span className="text-xs uppercase tracking-wide text-secondary">
                        {contact.label}
                      </span>
                      <span className="font-medium text-foreground">{contact.value}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
