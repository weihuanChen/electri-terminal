"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Linkedin,
  Menu,
  Search,
  X,
} from "lucide-react";
import { getSocialMediaDisplayLabel } from "@/lib/contactConfig";
import {
  blogUrl,
  categoriesUrl,
  contactUrl,
  homeUrl,
  manufacturingUrl,
  productsUrl,
  qualityCertificationsUrl,
  requestQuoteUrl,
  searchUrl,
  selectionGuideUrl,
} from "@/lib/routes";
import type { Locale } from "@/lib/i18n/config";

interface HeaderCategory {
  name: string;
  href: string;
  children?: HeaderCategory[];
}

interface HeaderClientProps {
  locale: Locale;
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

export default function HeaderClient({
  locale,
  productCategories,
  socialLink = null,
}: HeaderClientProps) {
  const common = useTranslations("common");
  const navigation = useTranslations("navigation");
  const urlOptions = { locale };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      name: common("products"),
      href: productsUrl(urlOptions),
      children: productCategories,
    },
    { name: common("categories"), href: categoriesUrl(urlOptions) },
    { name: navigation("selectionGuide"), href: selectionGuideUrl(urlOptions) },
    { name: navigation("manufacturing"), href: manufacturingUrl(urlOptions) },
    { name: navigation("quality"), href: qualityCertificationsUrl(urlOptions) },
    { name: common("blog"), href: blogUrl(urlOptions) },
    { name: common("contact"), href: contactUrl(urlOptions) },
  ];

  const handleDropdownToggle = (itemName: string) => {
    setActiveDropdown((current) => (current === itemName ? null : itemName));
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
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
          <Link href={homeUrl(urlOptions)} className="flex items-center space-x-2">
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
                onMouseEnter={() =>
                  item.children && setActiveDropdown(item.name)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.children?.length ? (
                  <>
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={activeDropdown === item.name}
                      className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-orange-500"
                      onClick={() => handleDropdownToggle(item.name)}
                    >
                      {item.name}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {activeDropdown === item.name && (
                      <div className="absolute left-0 top-full z-50 pt-5">
                        <div 
                          className="w-[960px] max-w-[calc(100vw-2rem)] rounded-none bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] ring-1 ring-slate-200 border-t-4 border-t-orange-500 overflow-hidden"
                        >
                          {/* Header section */}
                          <div 
                            className="flex items-center justify-between bg-slate-100 px-8 py-4 border-b border-slate-200"
                          >
                            <Link
                              href={item.href}
                              className="group inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:text-orange-600 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {navigation("exploreAllProducts")}
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-200 px-2.5 py-1 rounded-none">
                              {common("categories")}
                            </span>
                          </div>

                          {/* Content section */}
                          <div className="max-h-[calc(100vh-140px)] overflow-y-auto p-8">
                            <div className="grid grid-cols-12 gap-x-6 gap-y-8">
                              {item.children.map((category) => {
                                const hasChildren = Boolean(category.children?.length);
                                const numChildren = category.children?.length ?? 0;
                                
                                // Dynamically allocate width based on how many subcategories there are.
                                // 1-3 items = 1 inner column (takes 1/3 of row)
                                // 4-6 items = 2 inner columns (takes 1/2 of row)
                                // 7-9 items = 3 inner columns (takes 2/3 of row)
                                // 10+ items = 4+ inner columns (takes full row)
                                let colSpanClass = "col-span-4";
                                if (numChildren > 3) colSpanClass = "col-span-6";
                                if (numChildren > 6) colSpanClass = "col-span-8";
                                if (numChildren > 9) colSpanClass = "col-span-12";

                                return (
                                  <div
                                    key={category.href}
                                    className={`min-w-0 ${colSpanClass}`}
                                  >
                                    <Link
                                      href={category.href}
                                      className="group flex items-center justify-between gap-3 border-b-2 border-slate-200 pb-3 text-base font-bold text-slate-950 hover:border-orange-500 transition-colors"
                                      onClick={() => setActiveDropdown(null)}
                                    >
                                      <span className="truncate group-hover:text-orange-600 transition-colors">
                                        {category.name}
                                      </span>
                                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-all group-hover:text-orange-500 group-hover:translate-x-1" />
                                    </Link>

                                    {hasChildren ? (
                                      <div
                                        className={
                                          category.children &&
                                          category.children.length > 3
                                            ? "mt-4 grid grid-rows-3 grid-flow-col auto-cols-fr gap-x-6 gap-y-0.5"
                                            : "mt-4 space-y-0.5"
                                        }
                                      >
                                        {category.children?.map((child) => (
                                          <Link
                                            key={child.href}
                                            href={child.href}
                                            className="group/link flex items-center gap-2 rounded-none px-2 py-1.5 text-sm font-medium text-slate-900 transition-all duration-200 hover:bg-orange-50 hover:text-orange-700 hover:shadow-sm hover:translate-x-1"
                                            onClick={() =>
                                              setActiveDropdown(null)
                                            }
                                          >
                                            <div className="h-1.5 w-1.5 rounded-none bg-slate-400 transition-colors group-hover/link:bg-orange-500" />
                                            {child.name}
                                          </Link>
                                        ))}
                                      </div>
                                    ) : (
                                      <Link
                                        href={category.href}
                                        className="mt-4 group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-orange-600 transition-colors"
                                        onClick={() => setActiveDropdown(null)}
                                      >
                                        {navigation("browseCategory")}
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                      </Link>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-orange-500"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <Link
              href={searchUrl(undefined, urlOptions)}
              className="p-2 text-slate-300 hover:text-orange-500 transition-colors"
              aria-label={common("search")}
            >
              <Search className="h-4 w-4" />
            </Link>

            <button
              className="hidden sm:flex p-2 text-slate-300 hover:text-orange-500 transition-colors items-center space-x-1"
              aria-label={common("languageSwitcher")}
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">{locale.toUpperCase()}</span>
            </button>

            {socialLink && (
              <a
                href={socialLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center rounded-md border border-slate-700 p-2 text-slate-300 transition-colors hover:border-orange-500 hover:text-orange-500"
                aria-label={getSocialMediaDisplayLabel(socialLink)}
                title={getSocialMediaDisplayLabel(socialLink)}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}

            <Link
              href={requestQuoteUrl(urlOptions)}
              className="hidden sm:inline-flex btn btn-primary btn-sm"
            >
              {navigation("requestQuote")}
            </Link>

            <button
              className="lg:hidden p-2 text-slate-300 hover:text-white"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={common("toggleMenu")}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
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
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 hover:text-orange-500"
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
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={activeDropdown === item.name}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-100 hover:bg-slate-800"
                        onClick={() => handleDropdownToggle(item.name)}
                      >
                        {item.name}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            activeDropdown === item.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {activeDropdown === item.name && (
                        <div className="mt-1 space-y-3 border-l border-slate-700 pl-3">
                          <Link
                            href={item.href}
                            className="block px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800 hover:text-orange-500"
                            onClick={closeMenu}
                          >
                            {navigation("productDirectory")}
                          </Link>

                          {item.children.map((category) => (
                            <div key={category.href} className="space-y-1">
                              <Link
                                href={category.href}
                                className="block px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800 hover:text-orange-500"
                                onClick={closeMenu}
                              >
                                {category.name}
                              </Link>

                              {category.children?.length ? (
                                <div className="space-y-1 pl-3">
                                  {category.children.map((child) => (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className="block px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-orange-500"
                                      onClick={closeMenu}
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 hover:text-orange-500"
                      onClick={closeMenu}
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
