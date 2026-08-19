import Link from "next/link";
import { homeUrl } from "@/lib/routes";
import type { Locale } from "@/lib/i18n/config";
import { useTranslations } from "next-intl";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    showHome?: boolean;
    locale?: Locale;
}

export default function Breadcrumb({ items, showHome = true, locale }: BreadcrumbProps) {
    const common = useTranslations("common");
    return (
        <nav className="flex min-w-0 items-center overflow-hidden whitespace-nowrap py-3 text-xs text-gray-600" aria-label={common("breadcrumb")}>
            {/* Home */}
            {showHome && (
                <>
                    <Link
                        href={homeUrl(locale ? { locale } : undefined)}
                        className="hover:text-gray-900 transition-colors"
                        aria-label={common("home")}
                    >
                        {common("home")}
                    </Link>
                    <span className="mx-2 text-gray-400">›</span>
                </>
            )}

            {/* Breadcrumb Items */}
            {items.map((item, index) => (
                <div key={index} className="flex min-w-0 items-center">
                    <span className="mx-2 text-gray-400">›</span>
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="max-w-[200px] truncate transition-colors hover:text-gray-900"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="max-w-[200px] truncate font-medium text-gray-900">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
