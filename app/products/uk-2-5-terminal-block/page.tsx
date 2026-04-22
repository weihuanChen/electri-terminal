import Breadcrumb from "@/components/shared/Breadcrumb";
import { ProductDetailSidebar } from "@/components/shared/TechnicalSidebar";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
    title: "UK-2.5 Universal Terminal Block | Industrial Electrical Components",
    description: "UK-2.5 screw terminal block. Rated 800V/32A, wire size 0.2-4mm².",
    robots: {
        index: false,
        follow: false,
    },
};

export default function UK25TerminalBlockPage() {
    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Terminal Blocks", href: "/categories/terminal-blocks" },
        { label: "Screw Terminal Blocks", href: "/families/screw-terminal-blocks" },
        { label: "UK-2.5 Terminal Block" },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb Navigation */}
            <div className="border-b border-gray-300">
                <div className="container max-w-7xl mx-auto px-4 py-3">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        {/* Product Overview */}
                        <section className="border-b border-gray-200 mb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Product Image */}
                                <div className="order-2 lg:order-1">
                                    <div className="image-hover bg-gray-100 border border-gray-300 h-[400px] relative">
                                        <Image
                                            src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&auto=format&fit=crop"
                                            alt="UK-2.5 Universal Terminal Block"
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="order-1 lg:order-2">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                        UK-2.5 Universal Terminal Block
                                    </h1>

                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        Universal screw terminal block for industrial control cabinets and automation systems.
                                        The UK-2.5 features proven screw connection technology with high contact force and vibration resistance.
                                    </p>

                                    {/* Basic Specifications */}
                                    <div className="border border-gray-300 mb-6">
                                        <div className="grid grid-cols-2 border-b border-gray-300">
                                            <div className="p-3 bg-gray-50 border-r border-gray-300">
                                                <span className="text-sm text-gray-600">Rated Voltage</span>
                                            </div>
                                            <div className="p-3">
                                                <span className="text-sm font-medium text-gray-900">800V</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 border-b border-gray-300">
                                            <div className="p-3 bg-gray-50 border-r border-gray-300">
                                                <span className="text-sm text-gray-600">Rated Current</span>
                                            </div>
                                            <div className="p-3">
                                                <span className="text-sm font-medium text-gray-900">32A</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2">
                                            <div className="p-3 bg-gray-50 border-r border-gray-300">
                                                <span className="text-sm text-gray-600">Wire Size</span>
                                            </div>
                                            <div className="p-3">
                                                <span className="text-sm font-medium text-gray-900">0.2-4 mm²</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href="/rfq"
                                        className="inline-block px-6 py-3 bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors"
                                    >
                                        Request Quote
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Product Features */}
                        <section className="border-b border-gray-200 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border border-gray-300 p-5">
                                    <h3 className="font-semibold text-gray-900 mb-2">Universal Screw Connection</h3>
                                    <p className="text-sm text-gray-600">
                                        Proven screw connection technology with high contact force.
                                    </p>
                                </div>
                                <div className="border border-gray-300 p-5">
                                    <h3 className="font-semibold text-gray-900 mb-2">High Conductivity</h3>
                                    <p className="text-sm text-gray-600">
                                        Copper alloy current bar with tin plating ensures low contact resistance.
                                    </p>
                                </div>
                                <div className="border border-gray-300 p-5">
                                    <h3 className="font-semibold text-gray-900 mb-2">Flame-Retardant Housing</h3>
                                    <p className="text-sm text-gray-600">
                                        Polyamide 6.6 (PA66) housing with V0 flammability rating.
                                    </p>
                                </div>
                                <div className="border border-gray-300 p-5">
                                    <h3 className="font-semibold text-gray-900 mb-2">Vibration-Resistant Design</h3>
                                    <p className="text-sm text-gray-600">
                                        Gas-tight connection with high contact force ensures reliability.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Technical Specifications */}
                        <section className="border-b border-gray-200 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Technical Specifications</h2>
                            <div className="max-w-4xl">
                                <div className="border border-gray-300 technical-table">
                                    <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                        <div className="p-3 bg-gray-50 border-r border-gray-300">
                                            <span className="text-sm text-gray-600">Rated Voltage</span>
                                        </div>
                                        <div className="p-3 md:col-span-2">
                                            <span className="text-sm text-gray-900">800V</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                        <div className="p-3 bg-gray-50 border-r border-gray-300">
                                            <span className="text-sm text-gray-600">Rated Current</span>
                                        </div>
                                        <div className="p-3 md:col-span-2">
                                            <span className="text-sm text-gray-900">32A</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                        <div className="p-3 bg-gray-50 border-r border-gray-300">
                                            <span className="text-sm text-gray-600">Wire Size</span>
                                        </div>
                                        <div className="p-3 md:col-span-2">
                                            <span className="text-sm text-gray-900">0.2 - 4 mm²</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3">
                                        <div className="p-3 bg-gray-50 border-r border-gray-300">
                                            <span className="text-sm text-gray-600">Mounting</span>
                                        </div>
                                        <div className="p-3 md:col-span-2">
                                            <span className="text-sm text-gray-900">35mm DIN Rail</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Related Products */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Products</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { name: "UK-4", voltage: "800V", current: "41A", href: "/products" },
                                    { name: "UK-6", voltage: "1000V", current: "57A", href: "/products" },
                                    { name: "UK-10", voltage: "1000V", current: "76A", href: "/products" },
                                ].map((product) => (
                                    <Link
                                        key={product.name}
                                        href={product.href}
                                        className="border border-gray-300 p-5 hover:border-gray-500 transition-colors"
                                    >
                                        <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                                        <p className="text-sm text-gray-600">{product.voltage} / {product.current}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </main>

                    {/* Product Detail Sidebar */}
                    <aside className="lg:col-span-1">
                        <ProductDetailSidebar activePath="/products/uk-2-5-terminal-block" />
                    </aside>
                </div>
            </div>
        </div>
    );
}
