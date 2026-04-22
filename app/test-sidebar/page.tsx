import {
    CategoryPageSidebar,
    SubcategoryPageSidebar,
    ProductDetailSidebar,
} from "@/components/shared/TechnicalSidebar";

export default function TestSidebarPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Technical Sidebar Component Variants</h1>
                <p className="text-gray-600 mb-8">Three sidebar configurations for different page types</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Variant 1: Category Page Sidebar */}
                    <div>
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-2">
                                Category Page
                            </span>
                            <h2 className="text-lg font-semibold text-gray-900">Terminal Blocks Category</h2>
                            <p className="text-sm text-gray-600">Product series + Related categories</p>
                        </div>
                        <CategoryPageSidebar activePath="/families/push-in-terminal-blocks" />
                    </div>

                    {/* Variant 2: Subcategory Page Sidebar */}
                    <div>
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-2">
                                Subcategory Page
                            </span>
                            <h2 className="text-lg font-semibold text-gray-900">Push-in Terminal Blocks</h2>
                            <p className="text-sm text-gray-600">Other types + Specifications + Related categories</p>
                        </div>
                        <SubcategoryPageSidebar activePath="/families/push-in-terminal-blocks" />
                    </div>

                    {/* Variant 3: Product Detail Page Sidebar */}
                    <div>
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full mb-2">
                                Product Detail Page
                            </span>
                            <h2 className="text-lg font-semibold text-gray-900">UK-2.5 Product</h2>
                            <p className="text-sm text-gray-600">Series models + Related series + Related categories</p>
                        </div>
                        <ProductDetailSidebar activePath="/products/uk-2-5" />
                    </div>
                </div>

                {/* Usage Examples */}
                <div className="mt-12 space-y-8">
                    {/* Category Page Example */}
                    <div className="bg-white border border-gray-300 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Page Usage</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { CategoryPageSidebar } from "@/components/shared/TechnicalSidebar";

export default function CategoryPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <main className="lg:col-span-3">
                <h1>Terminal Blocks</h1>
                {/* Page content */}
            </main>
            <aside className="lg:col-span-1">
                <CategoryPageSidebar activePath="/current-path" />
            </aside>
        </div>
    );
}`}
                        </pre>
                    </div>

                    {/* Subcategory Page Example */}
                    <div className="bg-white border border-gray-300 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subcategory Page Usage</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { SubcategoryPageSidebar } from "@/components/shared/TechnicalSidebar";

export default function SubcategoryPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <main className="lg:col-span-3">
                <h1>Push-in Terminal Blocks</h1>
                {/* Page content */}
            </main>
            <aside className="lg:col-span-1">
                <SubcategoryPageSidebar activePath="/current-path" />
            </aside>
        </div>
    );
}`}
                        </pre>
                    </div>

                    {/* Product Detail Page Example */}
                    <div className="bg-white border border-gray-300 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Detail Page Usage</h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`import { ProductDetailSidebar } from "@/components/shared/TechnicalSidebar";

export default function ProductPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <main className="lg:col-span-3">
                <h1>UK-2.5 Terminal Block</h1>
                {/* Page content */}
            </main>
            <aside className="lg:col-span-1">
                <ProductDetailSidebar activePath="/products/uk-2-5" />
            </aside>
        </div>
    );
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
