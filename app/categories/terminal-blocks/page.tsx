import Breadcrumb from "@/components/shared/Breadcrumb";
import { TerminalBlocksSidebar } from "@/components/shared/TechnicalSidebar";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "Terminal Blocks | Industrial Electrical Components",
    description: "DIN rail terminal blocks for control cabinets, automation equipment, and power distribution systems. Screw, push-in, and spring clamp connections.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function TerminalBlocksCategoryPage() {
    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Terminal Blocks" },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* 1. Breadcrumb Navigation */}
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
                        {/* 2. Category Title and Introduction */}
                        <section className="border-b border-gray-200 mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Terminal Blocks
                            </h1>
                            <p className="text-gray-700 leading-relaxed">
                                DIN rail terminal blocks provide reliable electrical connections for control cabinets, automation equipment, and power distribution systems. Multiple connection technologies including screw, push-in, and spring clamp are available for different industrial environments.
                            </p>
                        </section>

                        {/* 3. Product Series Navigation */}
                        <section className="border-b border-gray-200 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Series</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Screw Terminal Blocks",
                                description: "Universal screw connection technology for reliable, maintenance-free connections",
                                href: "/products"
                            },
                            {
                                name: "Push-in Terminal Blocks",
                                description: "Tool-free wiring for solid conductors and ferrules. Fast installation",
                                href: "/families/push-in-terminal-blocks"
                            },
                            {
                                name: "Spring Clamp Terminal Blocks",
                                description: "Constant contact force. Ideal for high-vibration environments",
                                href: "/products"
                            },
                            {
                                name: "Ground Terminal Blocks",
                                description: "Secure mechanical and electrical connection to DIN rail",
                                href: "/products"
                            },
                            {
                                name: "Double-Level Terminal Blocks",
                                description: "Compact design for space-saving control cabinet wiring",
                                href: "/products"
                            },
                            {
                                name: "Fuse Terminal Blocks",
                                description: "Integrated fuse holder for circuit protection applications",
                                href: "/products"
                            }
                        ].map((series, idx) => (
                            <Link
                                key={idx}
                                href={series.href}
                                className="card card-clickable border border-gray-300 p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{series.name}</h3>
                                        <p className="text-sm text-gray-600 leading-snug">{series.description}</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                                </div>
                            </Link>
                        ))}
                    </div>
                        </section>

                        {/* 4. Representative Product Series */}
                        <section className="border-b border-gray-200 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-8">Featured Series</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Series 1 */}
                        <div className="border border-gray-300">
                            <div className="h-64 bg-gray-100 relative">
                                <Image
                                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&auto=format&fit=crop"
                                    alt="UK Series Universal Terminal Blocks"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">UK Series Universal Terminal Blocks</h3>
                                <div className="space-y-2 mb-5">
                                    <p className="text-sm text-gray-700">Key features:</p>
                                    <ul className="space-y-1">
                                        <li className="text-sm text-gray-600">• Rated up to 800V</li>
                                        <li className="text-sm text-gray-600">• Universal screw connection technology</li>
                                        <li className="text-sm text-gray-600">• Flame-retardant Nylon 66 housing</li>
                                    </ul>
                                </div>
                                <Link
                                    href="/products"
                                    className="link-arrow inline-flex items-center text-sm font-medium"
                                >
                                    View Published Series <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Series 2 */}
                        <div className="border border-gray-300">
                            <div className="h-64 bg-gray-100 relative">
                                <Image
                                    src="https://images.unsplash.com/photo-1544256718-3b6102dd0db6?w=800&auto=format&fit=crop"
                                    alt="PT Series Push-in Terminal Blocks"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">PT Series Push-in Terminal Blocks</h3>
                                <div className="space-y-2 mb-5">
                                    <p className="text-sm text-gray-700">Key features:</p>
                                    <ul className="space-y-1">
                                        <li className="text-sm text-gray-600">• Tool-free wiring in seconds</li>
                                        <li className="text-sm text-gray-600">• Vibration-resistant connection</li>
                                        <li className="text-sm text-gray-600">• Operating current up to 41A</li>
                                    </ul>
                                </div>
                                <Link
                                    href="/products"
                                    className="link-arrow inline-flex items-center text-sm font-medium"
                                >
                                    View Published Series <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            </div>
                        </div>
                        </section>

                        {/* 5. Product Category Overview */}
                        <section className="border-b border-gray-200 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-8">Category Overview</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Connection Technologies */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">Connection Technologies</h3>
                            <ul className="space-y-2">
                                <li className="text-sm text-gray-700">- Screw connection</li>
                                <li className="text-sm text-gray-700">- Push-in connection</li>
                                <li className="text-sm text-gray-700">- Spring clamp connection</li>
                            </ul>
                        </div>

                        {/* Mounting Types */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">Mounting Type</h3>
                            <ul className="space-y-2">
                                <li className="text-sm text-gray-700">- Standard 35mm DIN rail</li>
                                <li className="text-sm text-gray-700">- 15mm DIN rail (select models)</li>
                            </ul>
                        </div>

                        {/* Typical Ratings */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">Typical Electrical Ratings</h3>
                            <ul className="space-y-2">
                                <li className="text-sm text-gray-700">- Voltage and current ranges vary by series</li>
                                <li className="text-sm text-gray-700">- Conductor range depends on item number</li>
                                <li className="text-sm text-gray-700">- Confirm exact values with the model specification table</li>
                            </ul>
                        </div>
                    </div>
                        </section>

                        {/* 6. Typical Applications */}
                        <section className="border-b border-gray-200 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Typical Applications</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            "Industrial Automation",
                            "Control Cabinets",
                            "Power Distribution",
                            "Machine Manufacturing"
                        ].map((app, idx) => (
                            <div key={idx} className="border border-gray-300 p-4 text-center">
                                <p className="text-sm font-medium text-gray-900">{app}</p>
                            </div>
                        ))}
                    </div>
                        </section>

                        {/* 7. Manufacturing and Quality */}
                        <section className="border-b border-gray-200 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manufacturing and Quality</h2>
                    <div className="max-w-4xl">
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Product structures, housing materials, and conductor materials differ by model family and intended application.
                            Compliance files and test references are provided according to selected item numbers and project requirements.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            For detailed parameters such as insulation class, conductor material, and reference standards,
                            contact our team with your target models for confirmation before order placement.
                        </p>
                    </div>
                        </section>

                        {/* 8. Related Product Categories */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Product Categories</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            },
                            {
                                name: "Relays & Sockets",
                                description: "Electromechanical switching and control devices",
                                href: "/categories/relays-sockets"
                            }
                        ].map((category, idx) => (
                            <Link
                                key={idx}
                                href={category.href}
                                className="border border-gray-300 p-5 hover:border-gray-500 transition-colors group"
                            >
                                <div className="aspect-video bg-gray-100 mb-3 relative">
                                    <Image
                                        src={`https://images.unsplash.com/photo-15${85000000 + idx * 100000000}?w=400&auto=format&fit=crop`}
                                        alt={category.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-600">{category.name}</h3>
                                <p className="text-sm text-gray-600">{category.description}</p>
                            </Link>
                        ))}
                    </div>
                        </section>
                    </main>

                    {/* Technical Sidebar */}
                    <aside className="lg:col-span-1">
                        <TerminalBlocksSidebar activePath="/categories/terminal-blocks" />
                    </aside>
                </div>
            </div>
        </div>
    );
}
