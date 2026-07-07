import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categoryUrl, familyUrl, productUrl } from "@/lib/routes";

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
        { name: "Push-in Terminal Blocks", href: familyUrl("push-in-terminal-blocks") },
        { name: "Screw Terminal Blocks", href: familyUrl("screw-terminal-blocks") },
        { name: "Spring Clamp Terminal Blocks", href: familyUrl("spring-clamp-terminal-blocks") },
        { name: "Ground Terminal Blocks", href: familyUrl("ground-terminal-blocks") },
    ];

    const relatedCategories = [
        { name: "Cable Glands", href: categoryUrl("cable-glands") },
        { name: "Electrical Enclosures", href: categoryUrl("electrical-enclosures") },
        { name: "DIN Rail Accessories", href: categoryUrl("din-rail-accessories") },
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
        { name: "Push-in Terminal Blocks", href: familyUrl("push-in-terminal-blocks") },
        { name: "Screw Terminal Blocks", href: familyUrl("screw-terminal-blocks") },
        { name: "Spring Clamp Terminal Blocks", href: familyUrl("spring-clamp-terminal-blocks") },
    ];

    const specifications = [
        { name: "800V Terminal Blocks", description: "High voltage applications", href: productUrl("800v-terminals") },
        { name: "32A Terminal Blocks", description: "Standard current rating", href: productUrl("32a-terminals") },
    ];

    const relatedCategories = [
        { name: "Cable Glands", href: categoryUrl("cable-glands") },
        { name: "Electrical Enclosures", href: categoryUrl("electrical-enclosures") },
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
        { name: "UK-2.5", href: productUrl("uk-2-5") },
        { name: "UK-4", href: productUrl("uk-4") },
        { name: "UK-6", href: productUrl("uk-6") },
        { name: "UK-10", href: productUrl("uk-10") },
    ];

    const relatedSeries = [
        { name: "PT Series Terminal Blocks", description: "Push-in connection technology", href: familyUrl("pt-series") },
        { name: "ST Series Terminal Blocks", description: "Spring clamp connection", href: familyUrl("st-series") },
    ];

    const relatedCategories = [
        { name: "Cable Glands", href: categoryUrl("cable-glands") },
        { name: "DIN Rail Accessories", href: categoryUrl("din-rail-accessories") },
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
        { name: "Push-in Terminal Blocks", href: familyUrl("push-in-terminal-blocks") },
        { name: "Screw Terminal Blocks", href: familyUrl("screw-terminal-blocks") },
        { name: "Spring Clamp Terminal Blocks", href: familyUrl("spring-clamp-terminal-blocks") },
        { name: "Ground Terminal Blocks", href: familyUrl("ground-terminal-blocks") },
        { name: "Double-Level Terminal Blocks", href: familyUrl("double-level-terminal-blocks") },
        { name: "Fuse Terminal Blocks", href: familyUrl("fuse-terminal-blocks") },
        { name: "Disconnect Terminal Blocks", href: familyUrl("disconnect-terminal-blocks") },
    ];

    const relatedSeries = [
        {
            name: "UK Series Terminal Blocks",
            description: "Universal screw connection technology",
            href: familyUrl("uk-series"),
        },
        {
            name: "PT Series Push-in Terminal Blocks",
            description: "Tool-free wiring in seconds",
            href: familyUrl("pt-series"),
        },
        {
            name: "ST Series Spring Clamp Terminal Blocks",
            description: "Vibration-resistant connections",
            href: familyUrl("st-series"),
        },
    ];

    const relatedCategories = [
        { name: "Cable Glands", href: categoryUrl("cable-glands") },
        { name: "Electrical Enclosures", href: categoryUrl("electrical-enclosures") },
        { name: "DIN Rail Accessories", href: categoryUrl("din-rail-accessories") },
        { name: "Relays & Sockets", href: categoryUrl("relays-sockets") },
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
        { name: "Brass Cable Glands", href: familyUrl("brass-cable-glands") },
        { name: "Stainless Steel Cable Glands", href: familyUrl("stainless-steel-cable-glands") },
        { name: "Nylon Cable Glands", href: familyUrl("nylon-cable-glands") },
        { name: "Explosion-Proof Cable Glands", href: familyUrl("explosion-proof-cable-glands") },
    ];

    const relatedSeries = [
        {
            name: "MG Series Brass Cable Glands",
            description: "IP68 rated, metric thread",
            href: familyUrl("mg-series"),
        },
        {
            name: "SS Series Stainless Steel Glands",
            description: "For corrosive environments",
            href: familyUrl("ss-series"),
        },
    ];

    const relatedCategories = [
        { name: "Terminal Blocks", href: categoryUrl("terminal-blocks") },
        { name: "Electrical Enclosures", href: categoryUrl("electrical-enclosures") },
        { name: "Conduit Systems", href: categoryUrl("conduit-systems") },
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
