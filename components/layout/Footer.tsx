"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { categoryUrl } from "@/lib/routes";
import { normalizePublicContactSettings } from "@/lib/contactConfig";

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const BASE_FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Company",
    links: [
      { name: "Home", href: "/" },
      { name: "Products", href: "/products" },
      { name: "Categories", href: "/categories" },
      { name: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Products",
    links: [
      { name: "Ring Terminals", href: categoryUrl("ring-terminals") },
      { name: "Fork Terminals", href: categoryUrl("fork-terminals") },
      { name: "Spade Terminals", href: categoryUrl("spade-terminals") },
      { name: "Quick Disconnect Terminals", href: categoryUrl("quick-disconnect-terminals") },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Support", href: "/contact" },
      { name: "Submit RFQ", href: "/rfq" },
      { name: "Search Products", href: "/search" },
    ],
  },
];

function isInternalLink(href: string) {
  return href.startsWith("/");
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const contactSettings = normalizePublicContactSettings(
    useQuery(api.frontend.getPublicContactSettings)
  );

  const contactLinks: FooterLink[] = [
    { name: "Contact Form", href: "/contact" },
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
    ...BASE_FOOTER_SECTIONS,
    {
      title: "Contact",
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
                Professional electrical components for industrial applications.
                Custom product documentation and certificates are available upon request.
              </p>
            </div>

            {addressLines.length > 0 && (
              <div className="text-sm text-slate-300">
                <p className="mb-1">
                  <span className="font-medium text-slate-100">Address:</span>
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
            <p className="text-sm text-slate-400">© {currentYear} Electri Terminal. All rights reserved.</p>

            <div className="flex space-x-6">
              <Link
                href="/resources"
                className="text-sm text-slate-400 hover:text-blue-300 transition-colors"
              >
                Documentation Requests
              </Link>
              <Link
                href="/contact"
                className="text-sm text-slate-400 hover:text-blue-300 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/rfq"
                className="text-sm text-slate-400 hover:text-blue-300 transition-colors"
              >
                RFQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
