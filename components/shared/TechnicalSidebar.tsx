import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface NavigationItem {
    name: string;
    href: string;
    description?: string;
}

interface ProductSeries {
    name: string;
    href: string;
}

interface TechnicalSidebarProps {
    /**
     * Current category title
     */
    categoryTitle: string;

    /**
     * List of product series within the current category
     */
    productSeries: ProductSeries[];

    /**
     * List of related product series with descriptions
     */
    relatedSeries?: NavigationItem[];

    /**
     * List of related product categories
     */
    relatedCategories?: NavigationItem[];

    /**
     * Specifications list (for product detail pages)
     */
    specifications?: NavigationItem[];

    /**
     * Current active path (optional, for highlighting)
     */
    activePath?: string;

    /**
     * Sidebar variant type
     */
    variant?: "category" | "subcategory" | "product";
}

export default function TechnicalSidebar({
    categoryTitle,
    productSeries,
    relatedSeries = [],
    relatedCategories = [],
    specifications = [],
    activePath,
    variant = "category",
}: TechnicalSidebarProps) {
    return (
        <aside className="w-full border border-gray-300 bg-white">
            {/* 1. Product Navigation / Series Models */}
            <div className="border-b border-gray-300">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                    <h3 className="font-semibold text-gray-900 text-sm">
                        {variant === "product" ? "Series Models" : categoryTitle}
                    </h3>
                </div>
                <nav aria-label={`${categoryTitle} navigation`}>
                    <ul className="divide-y divide-gray-200">
                        {productSeries.map((series) => {
                            const isActive = activePath === series.href;
                            return (
                                <li key={series.href}>
                                    <Link
                                        href={series.href}
                                        className={`
                                            sidebar-nav-item flex items-center justify-between
                                            ${isActive ? 'active' : ''}
                                        `}
                                    >
                                        <span className="flex-1">{series.name}</span>
                                        <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* 2. Specifications (Product Detail Pages Only) */}
            {variant === "product" && specifications.length > 0 && (
                <div className="border-b border-gray-300">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-900 text-sm">Related Specifications</h3>
                    </div>
                    <nav aria-label="Related specifications navigation">
                        <ul className="divide-y divide-gray-200">
                            {specifications.map((spec) => (
                                <li key={spec.href}>
                                    <Link
                                        href={spec.href}
                                        className="sidebar-nav-item"
                                    >
                                        <div className="font-medium">{spec.name}</div>
                                        {spec.description && (
                                            <div className="text-xs text-gray-500 mt-0.5">{spec.description}</div>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}

            {/* 3. Related Series (All Pages) */}
            {relatedSeries.length > 0 && (
                <div className="border-b border-gray-300">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-900 text-sm">
                            {variant === "subcategory" ? "Other Terminal Block Types" : "Related Series"}
                        </h3>
                    </div>
                    <nav aria-label="Related product series navigation">
                        <ul className="divide-y divide-gray-200">
                            {relatedSeries.map((series) => (
                                <li key={series.href}>
                                    <Link
                                        href={series.href}
                                        className="sidebar-nav-item"
                                    >
                                        <div className="font-medium">{series.name}</div>
                                        {series.description && (
                                            <div className="text-xs text-gray-500 mt-0.5">{series.description}</div>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}

            {/* 4. Related Product Categories */}
            {relatedCategories.length > 0 && (
                <div>
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-900 text-sm">Related Categories</h3>
                    </div>
                    <nav aria-label="Related product categories navigation">
                        <ul className="divide-y divide-gray-200">
                            {relatedCategories.map((category) => (
                                <li key={category.href}>
                                    <Link
                                        href={category.href}
                                        className="sidebar-nav-item flex items-center justify-between"
                                    >
                                        <span className="flex-1">{category.name}</span>
                                        <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}
        </aside>
    );
}

/**
 * Helper function for Category Page Sidebar
 * Example: Terminal Blocks Category Page
 */
export function CategoryPageSidebar({
    activePath,
}: {
    activePath?: string;
}) {
    const productSeries = [
        { name: "Push-in Terminal Blocks", href: "/families/push-in-terminal-blocks" },
        { name: "Screw Terminal Blocks", href: "/families/screw-terminal-blocks" },
        { name: "Spring Clamp Terminal Blocks", href: "/families/spring-clamp-terminal-blocks" },
        { name: "Ground Terminal Blocks", href: "/families/ground-terminal-blocks" },
    ];

    const relatedCategories = [
        { name: "Cable Glands", href: "/categories/cable-glands" },
        { name: "Electrical Enclosures", href: "/categories/electrical-enclosures" },
        { name: "DIN Rail Accessories", href: "/categories/din-rail-accessories" },
    ];

    return (
        <TechnicalSidebar
            categoryTitle="Product Series"
            productSeries={productSeries}
            relatedCategories={relatedCategories}
            activePath={activePath}
            variant="category"
        />
    );
}

/**
 * Helper function for Subcategory Page Sidebar
 * Example: Push-in Terminal Blocks Subcategory Page
 */
export function SubcategoryPageSidebar({
    activePath,
}: {
    activePath?: string;
}) {
    const productSeries = [
        { name: "Push-in Terminal Blocks", href: "/families/push-in-terminal-blocks" },
        { name: "Screw Terminal Blocks", href: "/families/screw-terminal-blocks" },
        { name: "Spring Clamp Terminal Blocks", href: "/families/spring-clamp-terminal-blocks" },
    ];

    const specifications = [
        { name: "800V Terminal Blocks", description: "High voltage applications", href: "/products/800v-terminals" },
        { name: "32A Terminal Blocks", description: "Standard current rating", href: "/products/32a-terminals" },
    ];

    const relatedCategories = [
        { name: "Cable Glands", href: "/categories/cable-glands" },
        { name: "Electrical Enclosures", href: "/categories/electrical-enclosures" },
    ];

    return (
        <TechnicalSidebar
            categoryTitle="Other Terminal Block Types"
            productSeries={productSeries}
            specifications={specifications}
            relatedCategories={relatedCategories}
            activePath={activePath}
            variant="subcategory"
        />
    );
}

/**
 * Helper function for Product Detail Page Sidebar
 * Example: UK-2.5 Product Detail Page
 */
export function ProductDetailSidebar({
    activePath,
}: {
    activePath?: string;
}) {
    const seriesModels = [
        { name: "UK-2.5", href: "/products/uk-2-5" },
        { name: "UK-4", href: "/products/uk-4" },
        { name: "UK-6", href: "/products/uk-6" },
        { name: "UK-10", href: "/products/uk-10" },
    ];

    const relatedSeries = [
        { name: "PT Series Terminal Blocks", description: "Push-in connection technology", href: "/families/pt-series" },
        { name: "ST Series Terminal Blocks", description: "Spring clamp connection", href: "/families/st-series" },
    ];

    const relatedCategories = [
        { name: "Cable Glands", href: "/categories/cable-glands" },
        { name: "DIN Rail Accessories", href: "/categories/din-rail-accessories" },
    ];

    return (
        <TechnicalSidebar
            categoryTitle="Series Models"
            productSeries={seriesModels}
            relatedSeries={relatedSeries}
            relatedCategories={relatedCategories}
            activePath={activePath}
            variant="product"
        />
    );
}

/**
 * Legacy helper function to create a TechnicalSidebar for Terminal Blocks category
 * @deprecated Use CategoryPageSidebar instead
 */
export function TerminalBlocksSidebar({
    activePath,
}: {
    activePath?: string;
}) {
    const terminalBlocksSeries = [
        { name: "Push-in Terminal Blocks", href: "/families/push-in-terminal-blocks" },
        { name: "Screw Terminal Blocks", href: "/families/screw-terminal-blocks" },
        { name: "Spring Clamp Terminal Blocks", href: "/families/spring-clamp-terminal-blocks" },
        { name: "Ground Terminal Blocks", href: "/families/ground-terminal-blocks" },
        { name: "Double-Level Terminal Blocks", href: "/families/double-level-terminal-blocks" },
        { name: "Fuse Terminal Blocks", href: "/families/fuse-terminal-blocks" },
        { name: "Disconnect Terminal Blocks", href: "/families/disconnect-terminal-blocks" },
    ];

    const relatedSeries = [
        {
            name: "UK Series Terminal Blocks",
            description: "Universal screw connection technology",
            href: "/families/uk-series",
        },
        {
            name: "PT Series Push-in Terminal Blocks",
            description: "Tool-free wiring in seconds",
            href: "/families/pt-series",
        },
        {
            name: "ST Series Spring Clamp Terminal Blocks",
            description: "Vibration-resistant connections",
            href: "/families/st-series",
        },
    ];

    const relatedCategories = [
        { name: "Cable Glands", href: "/categories/cable-glands" },
        { name: "Electrical Enclosures", href: "/categories/electrical-enclosures" },
        { name: "DIN Rail Accessories", href: "/categories/din-rail-accessories" },
        { name: "Relays & Sockets", href: "/categories/relays-sockets" },
    ];

    return (
        <TechnicalSidebar
            categoryTitle="Terminal Blocks"
            productSeries={terminalBlocksSeries}
            relatedSeries={relatedSeries}
            relatedCategories={relatedCategories}
            activePath={activePath}
            variant="category"
        />
    );
}

/**
 * Legacy helper function to create a TechnicalSidebar for Cable Glands category
 * @deprecated Use CategoryPageSidebar with custom data instead
 */
export function CableGlandsSidebar({
    activePath,
}: {
    activePath?: string;
}) {
    const cableGlandsSeries = [
        { name: "Brass Cable Glands", href: "/families/brass-cable-glands" },
        { name: "Stainless Steel Cable Glands", href: "/families/stainless-steel-cable-glands" },
        { name: "Nylon Cable Glands", href: "/families/nylon-cable-glands" },
        { name: "Explosion-Proof Cable Glands", href: "/families/explosion-proof-cable-glands" },
    ];

    const relatedSeries = [
        {
            name: "MG Series Brass Cable Glands",
            description: "IP68 rated, metric thread",
            href: "/families/mg-series",
        },
        {
            name: "SS Series Stainless Steel Glands",
            description: "For corrosive environments",
            href: "/families/ss-series",
        },
    ];

    const relatedCategories = [
        { name: "Terminal Blocks", href: "/categories/terminal-blocks" },
        { name: "Electrical Enclosures", href: "/categories/electrical-enclosures" },
        { name: "Conduit Systems", href: "/categories/conduit-systems" },
    ];

    return (
        <TechnicalSidebar
            categoryTitle="Cable Glands"
            productSeries={cableGlandsSeries}
            relatedSeries={relatedSeries}
            relatedCategories={relatedCategories}
            activePath={activePath}
            variant="category"
        />
    );
}
