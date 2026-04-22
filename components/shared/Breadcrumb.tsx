import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    showHome?: boolean;
}

export default function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
    return (
        <nav className="flex items-center text-xs text-gray-600 py-3" aria-label="Breadcrumb">
            {/* Home */}
            {showHome && (
                <>
                    <Link
                        href="/"
                        className="hover:text-gray-900 transition-colors"
                        aria-label="Home"
                    >
                        Home
                    </Link>
                    <span className="mx-2 text-gray-400">›</span>
                </>
            )}

            {/* Breadcrumb Items */}
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <span className="mx-2 text-gray-400">›</span>
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-gray-900 transition-colors truncate max-w-[200px]"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
