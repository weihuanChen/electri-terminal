"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Globe, Linkedin, Menu, Search, X } from "lucide-react";
import { getSocialMediaDisplayLabel } from "@/lib/contactConfig";

interface HeaderCategory {
  name: string;
  href: string;
}

interface HeaderClientProps {
  productCategories: HeaderCategory[];
  socialLink?: {
    platform: string;
    label?: string;
    url: string;
  } | null;
}

interface NavItem {
  name: string;
  href: string;
  children?: HeaderCategory[];
}

const STATIC_NAV_ITEMS: NavItem[] = [
  {
    name: "Categories",
    href: "/categories",
  },
  {
    name: "Selection Guide",
    href: "/selection-guide",
  },
  {
    name: "Manufacturing",
    href: "/manufacturing",
  },
  {
    name: "Quality",
    href: "/quality-certifications",
  },
  {
    name: "Blog",
    href: "/blog",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

export default function HeaderClient({ productCategories, socialLink = null }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      name: "Products",
      href: "/products",
      children: productCategories,
    },
    ...STATIC_NAV_ITEMS,
  ];

  const handleDropdownToggle = (itemName: string) => {
    setActiveDropdown((current) => (current === itemName ? null : itemName));
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        borderColor: "var(--surface-dark-800)",
        backgroundColor: "var(--surface-dark-900)",
      }}
    >
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/electri-terminal-logo-white.svg"
              alt="Electri Terminal"
              width={128}
              height={71}
              className="h-8 w-auto"
            />
            <span className="hidden text-base font-semibold text-slate-100 sm:block">
              Electri Terminal
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.children?.length ? (
                  <>
                    <button
                      className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-blue-300"
                      onClick={() => handleDropdownToggle(item.name)}
                    >
                      {item.name}
                      <svg
                        className={`ml-1 h-4 w-4 transition-transform ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {activeDropdown === item.name && (
                      <div className="absolute left-0 mt-0 w-56 bg-white border border-slate-200 shadow-lg">
                        <div className="py-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-blue-300"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <Link
              href="/search"
              className="p-2 text-slate-300 hover:text-blue-300 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <button
              className="hidden sm:flex p-2 text-slate-300 hover:text-blue-300 transition-colors items-center space-x-1"
              aria-label="Language switcher"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">EN</span>
            </button>

            {socialLink && (
              <a
                href={socialLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center rounded-md border border-slate-700 p-2 text-slate-300 transition-colors hover:border-blue-400 hover:text-blue-300"
                aria-label={getSocialMediaDisplayLabel(socialLink)}
                title={getSocialMediaDisplayLabel(socialLink)}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}

            <Link href="/rfq" className="hidden sm:inline-flex btn btn-primary btn-sm">
              Request Quote
            </Link>

            <button
              className="lg:hidden p-2 text-slate-300 hover:text-white"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className="lg:hidden py-4 border-t"
            style={{
              borderColor: "var(--surface-dark-800)",
              backgroundColor: "var(--surface-dark-950)",
            }}
          >
            <nav className="flex flex-col space-y-1">
              {socialLink && (
                <a
                  href={socialLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 hover:text-blue-300"
                >
                  <Linkedin className="h-4 w-4" />
                  {getSocialMediaDisplayLabel(socialLink)}
                </a>
              )}
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.children?.length ? (
                    <>
                      <button
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-100 hover:bg-slate-800"
                        onClick={() => handleDropdownToggle(item.name)}
                      >
                        {item.name}
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            activeDropdown === item.name ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {activeDropdown === item.name && (
                        <div className="mt-1 space-y-1 pl-4">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-blue-300"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 hover:text-blue-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
