import Link from "next/link";
import { Linkedin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  getEnabledSocialMediaLinks,
  getSocialMediaDisplayLabel,
} from "@/lib/contactConfig";
import {
  blogUrl,
  categoriesUrl,
  categoryUrl,
  contactUrl,
  homeUrl,
  privacyPolicyUrl,
  productsUrl,
  requestQuoteUrl,
  resourcesUrl,
  searchUrl,
} from "@/lib/routes";
import { getPublicContactSettings } from "@/lib/publicData";
import { getRequestLocale } from "@/lib/i18n/requestLocale";

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

function isInternalLink(href: string) {
  return href.startsWith("/");
}

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const [contactSettings, locale, common, footer] = await Promise.all([
    getPublicContactSettings(),
    getRequestLocale(),
    getTranslations("common"),
    getTranslations("footer"),
  ]);
  const urlOptions = { locale };
  const socialLinks = getEnabledSocialMediaLinks(contactSettings);

  const baseFooterSections: FooterSection[] = [
    {
      title: footer("company"),
      links: [
        { name: common("home"), href: homeUrl(urlOptions) },
        { name: common("products"), href: productsUrl(urlOptions) },
        { name: common("categories"), href: categoriesUrl(urlOptions) },
        { name: common("blog"), href: blogUrl(urlOptions) },
      ],
    },
    {
      title: common("products"),
      links: [
        { name: footer("ringTerminals"), href: categoryUrl("ring-terminals", urlOptions) },
        { name: footer("forkTerminals"), href: categoryUrl("fork-terminals", urlOptions) },
        { name: footer("spadeTerminals"), href: categoryUrl("spade-terminals", urlOptions) },
        {
          name: footer("quickDisconnectTerminals"),
          href: categoryUrl("quick-disconnect-terminals", urlOptions),
        },
      ],
    },
    {
      title: footer("support"),
      links: [
        { name: footer("contactSupport"), href: contactUrl(urlOptions) },
        { name: footer("submitRfq"), href: requestQuoteUrl(urlOptions) },
        { name: footer("searchProducts"), href: searchUrl(undefined, urlOptions) },
      ],
    },
  ];

  const contactLinks: FooterLink[] = [
    { name: footer("contactForm"), href: contactUrl(urlOptions) },
    ...(contactSettings.email.enabled && contactSettings.email.value
      ? [
          {
            name: contactSettings.email.value,
            href: `mailto:${contactSettings.email.value}`,
          },
        ]
      : []),
    ...(contactSettings.whatsapp.enabled &&
    contactSettings.whatsapp.value &&
    contactSettings.whatsapp.href
      ? [
          {
            name: contactSettings.whatsapp.value,
            href: contactSettings.whatsapp.href,
            external: true,
          },
        ]
      : []),
    ...(contactSettings.phone.enabled && contactSettings.phone.value
      ? [
          {
            name: contactSettings.phone.value,
            href: `tel:${contactSettings.phone.value.replace(/\s+/g, "")}`,
          },
        ]
      : []),
  ];

  const footerSections = [
    ...baseFooterSections,
    {
      title: common("contact"),
      links: contactLinks,
    },
  ];

  const addressLines =
    contactSettings.address.enabled && contactSettings.address.lines.length > 0
      ? contactSettings.address.lines
      : [];

  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--surface-dark-800)",
        backgroundColor: "var(--background-footer)",
      }}
    >
      <div className="container max-w-7xl mx-auto px-4">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="!text-slate-100 text-sm font-semibold mb-4" style={{ fontWeight: 600 }}>
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {isInternalLink(link.href) ? (
                        <Link
                          href={link.href}
                          className="text-sm text-slate-300 hover:text-blue-300 transition-colors"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-sm text-slate-300 hover:text-blue-300 transition-colors"
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noopener noreferrer" : undefined}
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="py-8 border-t" style={{ borderColor: "var(--surface-dark-800)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
                  <span className="text-sm font-bold text-white">ET</span>
                </div>
                <span className="text-base font-semibold text-slate-100" style={{ fontWeight: 600 }}>
                  Electri Terminal
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {footer("description")}
              </p>
              {socialLinks.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {socialLinks.map((item) => {
                    const isLinkedIn = item.platform.trim().toLowerCase() === "linkedin";

                    return (
                      <a
                        key={`${item.platform}-${item.url}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-blue-400 hover:text-blue-300"
                      >
                        {isLinkedIn && <Linkedin className="h-4 w-4" />}
                        <span>{getSocialMediaDisplayLabel(item)}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {addressLines.length > 0 && (
              <div className="text-sm text-slate-300">
                <p className="mb-1">
                  <span className="font-medium text-slate-100">{common("address")}:</span>
                </p>
                {addressLines.map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="py-6 border-t" style={{ borderColor: "var(--surface-dark-800)" }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-slate-400">
              © {currentYear} Electri Terminal. {footer("rightsReserved")}
            </p>

            <div className="flex space-x-6">
              <Link
                href={resourcesUrl(urlOptions)}
                className="text-sm text-slate-400 hover:text-blue-300 transition-colors"
              >
                {footer("documentationRequests")}
              </Link>
              <Link
                href={privacyPolicyUrl(urlOptions)}
                className="text-sm text-slate-400 hover:text-blue-300 transition-colors"
              >
                {footer("privacyPolicy")}
              </Link>
              <Link
                href={contactUrl(urlOptions)}
                className="text-sm text-slate-400 hover:text-blue-300 transition-colors"
              >
                {common("contact")}
              </Link>
              <Link
                href={requestQuoteUrl(urlOptions)}
                className="text-sm text-slate-400 hover:text-blue-300 transition-colors"
              >
                {footer("rfq")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
