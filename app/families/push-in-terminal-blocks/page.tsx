import Breadcrumb from "@/components/shared/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "Push-in Terminal Blocks | Industrial Electrical Components",
    description: "Push-in terminal blocks for fast, tool-free wiring in industrial control and panel applications. Model-specific parameters are confirmed by item number.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function PushInTerminalBlocksPage() {
    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Terminal Blocks", href: "/categories/terminal-blocks" },
        { label: "Push-in Terminal Blocks" },
    ];

    const productModels = [
        {
            name: "PT 2.5",
            description: "Standard push-in terminal for control cabinet wiring",
            voltage: "800V",
            current: "24A",
            wireSize: "0.2–4 mm²",
            color: "Gray",
            href: "/products"
        },
        {
            name: "PT 4",
            description: "High-current push-in terminal for power applications",
            voltage: "800V",
            current: "32A",
            wireSize: "0.5–6 mm²",
            color: "Gray",
            href: "/products"
        },
        {
            name: "PT 6",
            description: "Heavy-duty push-in terminal for high-power applications",
            voltage: "1000V",
            current: "41A",
            wireSize: "0.5–10 mm²",
            color: "Gray",
            href: "/products"
        },
        {
            name: "PT 10",
            description: "High-capacity push-in terminal for main power distribution",
            voltage: "1000V",
            current: "57A",
            wireSize: "2–16 mm²",
            color: "Gray",
            href: "/products"
        },
        {
            name: "PT 16",
            description: "Maximum capacity push-in terminal for heavy loads",
            voltage: "1000V",
            current: "76A",
            wireSize: "4–25 mm²",
            color: "Gray",
            href: "/products"
        },
        {
            name: "PT 2.5-PE",
            description: "Push-in ground terminal with DIN rail connection",
            voltage: "800V",
            current: "24A",
            wireSize: "0.2–4 mm²",
            color: "Green/Yellow",
            href: "/products"
        },
        {
            name: "PT 4-P",
            description: "Push-in terminal with disconnect lever for circuit isolation",
            voltage: "800V",
            current: "32A",
            wireSize: "0.5–6 mm²",
            color: "Gray/Black",
            href: "/products"
        },
        {
            name: "PT 6-F",
            description: "Push-in terminal with integrated fuse holder",
            voltage: "800V",
            current: "32A",
            wireSize: "0.5–6 mm²",
            color: "Black/Green",
            href: "/products"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* 1. Breadcrumb Navigation */}
            <div className="border-b border-gray-300">
                <div className="container max-w-7xl mx-auto px-4 py-3">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
            </div>

            {/* 2. Series Title and Introduction */}
            <section className="border-b border-gray-200">
                <div className="container max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Push-in Terminal Blocks
                    </h1>
                    <p className="text-gray-700 max-w-4xl leading-relaxed">
                        Push-in terminal blocks provide fast and reliable wiring for industrial control cabinets and automation systems. The push-in connection technology allows tool-free installation while maintaining strong vibration resistance. Conductors are simply inserted into the clamping point, where they are securely held by a spring mechanism.
                    </p>
                </div>
            </section>

            {/* 3. Product Model List */}
            <section className="border-b border-gray-200">
                <div className="container max-w-7xl mx-auto px-4 py-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Models</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {productModels.map((product, idx) => (
                            <div key={idx} className="border border-gray-300">
                                <div className="flex">
                                    {/* Product Image Placeholder */}
                                    <div className="w-48 flex-shrink-0 bg-gray-100 border-r border-gray-300">
                                        <div className="h-full min-h-[160px] relative">
                                            <Image
                                                src={`https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&auto=format&fit=crop`}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {product.description}
                                        </p>

                                        {/* Specifications */}
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Rated Voltage:</span>
                                                <span className="ml-2 text-gray-900 font-medium">{product.voltage}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Rated Current:</span>
                                                <span className="ml-2 text-gray-900 font-medium">{product.current}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Wire Size:</span>
                                                <span className="ml-2 text-gray-900 font-medium">{product.wireSize}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Color:</span>
                                                <span className="ml-2 text-gray-900 font-medium">{product.color}</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={product.href}
                                            className="inline-flex items-center text-sm text-gray-900 hover:text-gray-600 font-medium"
                                        >
                                            View Product Details <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Product Specification Overview */}
            <section className="border-b border-gray-200">
                <div className="container max-w-7xl mx-auto px-4 py-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Specification Overview</h2>

                    <div className="max-w-4xl">
                        <div className="border border-gray-300">
                            {/* Spec Rows */}
                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Connection Type</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Push-in connection technology with spring clamp
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Mounting Type</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Standard 35mm DIN rail (EN 60715)
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Rated Voltage</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Confirm by item number and insulation structure
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Rated Current</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Confirm by item number and conductor cross section
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Wire Range</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Model-dependent; use the variant table for exact ranges
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Operating Temperature</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Depends on housing material and model rating
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Housing Material</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Varies by model family; confirm with selected item numbers
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Conductor Material</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Defined by model and project requirements
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-300">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Screw Material</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Defined by model and production specification
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3">
                                <div className="p-4 bg-gray-50 border-r border-gray-300">
                                    <h3 className="font-semibold text-gray-900 text-sm">Standards</h3>
                                </div>
                                <div className="p-4 md:col-span-2 text-gray-700 text-sm">
                                    Reference standards and certificates are provided per model on request
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Typical Applications */}
            <section className="border-b border-gray-200">
                <div className="container max-w-7xl mx-auto px-4 py-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Typical Applications</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                name: "Industrial Automation",
                                image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop"
                            },
                            {
                                name: "Control Cabinets",
                                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop"
                            },
                            {
                                name: "Power Distribution",
                                image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop"
                            },
                            {
                                name: "Machine Manufacturing",
                                image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&auto=format&fit=crop"
                            }
                        ].map((app, idx) => (
                            <div key={idx} className="border border-gray-300">
                                <div className="h-48 bg-gray-100 relative">
                                    <Image
                                        src={app.image}
                                        alt={app.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <p className="font-medium text-gray-900">{app.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Related Series */}
            <section className="border-b border-gray-200">
                <div className="container max-w-7xl mx-auto px-4 py-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Series</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                name: "Screw Terminal Blocks",
                                href: "/products"
                            },
                            {
                                name: "Spring Clamp Terminal Blocks",
                                href: "/products"
                            },
                            {
                                name: "Ground Terminal Blocks",
                                href: "/products"
                            },
                            {
                                name: "Double-Level Terminal Blocks",
                                href: "/products"
                            },
                            {
                                name: "Fuse Terminal Blocks",
                                href: "/products"
                            },
                            {
                                name: "Disconnect Terminal Blocks",
                                href: "/products"
                            }
                        ].map((series, idx) => (
                            <Link
                                key={idx}
                                href={series.href}
                                className="border border-gray-300 p-4 hover:border-gray-500 transition-colors flex items-center justify-between"
                            >
                                <span className="text-gray-900 font-medium">{series.name}</span>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Related Product Categories */}
            <section>
                <div className="container max-w-7xl mx-auto px-4 py-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Product Categories</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                name: "Cable Glands",
                                description: "Cable entry protection for enclosures and cabinets",
                                href: "/categories/cable-glands"
                            },
                            {
                                name: "Electrical Enclosures",
                                description: "Protection for electrical components in industrial environments",
                                href: "/categories/electrical-enclosures"
                            },
                            {
                                name: "DIN Rail Accessories",
                                description: "End brackets, mounting rails, and labeling systems",
                                href: "/categories/din-rail-accessories"
                            }
                        ].map((category, idx) => (
                            <Link
                                key={idx}
                                href={category.href}
                                className="border border-gray-300 p-5 hover:border-gray-500 transition-colors group"
                            >
                                <div className="aspect-video bg-gray-100 mb-3 relative">
                                    <Image
                                        src={`https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&auto=format&fit=crop`}
                                        alt={category.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-600">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-gray-600">{category.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
