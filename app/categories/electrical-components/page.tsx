import { Breadcrumb, CTABanner } from "@/components/shared";
import Image from "next/image";
import Link from "next/link";
import {
    CheckCircle2,
    ShieldCheck,
    Settings2,
    Truck,
    Zap,
    Factory,
    Cpu,
    Sun
} from "lucide-react";

export default function ElectricalComponentsCategory() {
    const breadcrumbItems = [
        { label: "Categories", href: "/categories" },
        { label: "Electrical Components" },
    ];

    const filterGroups = [
        {
            id: "type",
            label: "Product Type",
            options: ["Terminal Blocks", "Cable Glands", "Electrical Enclosures", "DIN Rail Accessories", "Connectors"]
        },
        {
            id: "material",
            label: "Material",
            options: ["Polycarbonate", "Nylon 66", "Stainless Steel", "Brass", "Aluminum"]
        },
        {
            id: "voltage",
            label: "Rated Voltage",
            options: ["250V", "400V", "600V", "800V", "1000V"]
        },
        {
            id: "current",
            label: "Rated Current",
            options: ["10A", "20A", "32A", "50A", "100A+"]
        },
        {
            id: "mounting",
            label: "Mounting Type",
            options: ["DIN Rail 35mm", "Panel Mount", "PCB Mount", "Surface Mount"]
        },
        {
            id: "certification",
            label: "Certification",
            options: ["CE", "UL", "RoHS", "TUV", "CSA"]
        },
        {
            id: "ip_rating",
            label: "IP Rating",
            options: ["IP20", "IP44", "IP65", "IP67", "IP68"]
        }
    ];

    const products = [
        {
            id: 1,
            name: "UK Series Universal Terminal Blocks",
            image: "https://images.unsplash.com/photo-1580983546257-19ce9f43063f?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "800V", current: "32A", material: "Nylon 66" }
        },
        {
            id: 2,
            name: "PG Series Nylon Cable Glands",
            image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "N/A", current: "N/A", material: "Polyamide" }
        },
        {
            id: 3,
            name: "IP65 Waterproof Electrical Enclosure",
            image: "https://images.unsplash.com/photo-1620247690278-f6285a8f4c28?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "1000V", current: "N/A", material: "Polycarbonate" }
        },
        {
            id: 4,
            name: "Aluminum DIN Rail 35mm",
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "N/A", current: "N/A", material: "Aluminum Alloy" }
        },
        {
            id: 5,
            name: "PT Series Push-in Terminal Blocks",
            image: "https://images.unsplash.com/photo-1544256718-3b6102dd0db6?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "800V", current: "24A", material: "Nylon 66" }
        },
        {
            id: 6,
            name: "M Series Brass Cable Glands",
            image: "https://images.unsplash.com/photo-1614948842429-1ad3ed7bc2d0?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "N/A", current: "N/A", material: "Nickel-plated Brass" }
        },
        {
            id: 7,
            name: "Heavy Duty Stainless Steel Enclosure",
            image: "https://images.unsplash.com/photo-1621503930062-817ab56a88ab?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "1000V", current: "N/A", material: "Stainless Steel 304" }
        },
        {
            id: 8,
            name: "E/UK End Brackets",
            image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "N/A", current: "N/A", material: "Polyamide" }
        },
        {
            id: 9,
            name: "ST Series Spring Terminal Blocks",
            image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "800V", current: "32A", material: "Nylon 66" }
        },
        {
            id: 10,
            name: "NPT Series Waterproof Cable Gland",
            image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "N/A", current: "N/A", material: "Nylon" }
        },
        {
            id: 11,
            name: "Wall Mount ABS Control Box",
            image: "https://images.unsplash.com/photo-1580983218524-2c7003883cd2?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "600V", current: "N/A", material: "ABS Plastic" }
        },
        {
            id: 12,
            name: "Copper Busbars 100A",
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
            specs: { voltage: "600V", current: "100A", material: "Red Copper" }
        }
    ];

    const applications = [
        {
            title: "Industrial Automation",
            icon: <Factory className="w-8 h-8 text-primary" />,
            desc: "Reliable connections for PLCs, sensors, and actuators in automated production lines.",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop"
        },
        {
            title: "Power Distribution",
            icon: <Zap className="w-8 h-8 text-primary" />,
            desc: "High-current terminal blocks and busbars for safe electrical distribution networks.",
            image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=600&auto=format&fit=crop"
        },
        {
            title: "Control Cabinets",
            icon: <Cpu className="w-8 h-8 text-primary" />,
            desc: "Complete DIN rail accessories and wiring solutions for tidy and secure control panels.",
            image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop"
        },
        {
            title: "Renewable Energy",
            icon: <Sun className="w-8 h-8 text-primary" />,
            desc: "UV-resistant and waterproof components for solar and wind power installations.",
            image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop"
        }
    ];

    return (
        <div className="bg-[#F8FAFC]">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-border">
                <div className="container py-3">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
            </div>

            {/* 1. Hero Section */}
            <section className="relative bg-[#0A192F] text-white py-20 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
                    <Image
                        src="https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=1000&auto=format&fit=crop"
                        alt="Industrial Background"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] to-transparent"></div>
                </div>

                <div className="container relative z-10">
                    <div className="max-w-2xl">
                        <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/30">
                            Premium Industrial Components
                        </div>
                        <h1
                            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight !text-white"
                            style={{ color: "#f8fafc", textShadow: "0 2px 14px rgba(0, 0, 0, 0.35)" }}
                        >
                            Electrical Components
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                            Terminal blocks, cable glands, and enclosures for industrial applications, with model-specific compliance support available on request.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="#products" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
                                Browse Products
                            </Link>
                            <Link href="/rfq" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium rounded-lg transition-all backdrop-blur-sm flex items-center gap-2">
                                Request Quote
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container py-12" id="products">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* 2. Product Filter Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-slate-500" />
                                    Filters
                                </h2>
                                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Clear All</button>
                            </div>
                            <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                                {filterGroups.map((group) => (
                                    <div key={group.id} className="space-y-3">
                                        <h3 className="font-medium text-sm text-slate-900">{group.label}</h3>
                                        <div className="space-y-2">
                                            {group.options.map((option, idx) => (
                                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input type="checkbox" className="peer sr-only" />
                                                        <div className="w-4 h-4 rounded text-blue-600 bg-white border border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* 3. Product Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-slate-500 text-sm">
                                Showing <span className="font-medium text-slate-900">12</span> sample items in this preview
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500">Sort by:</span>
                                <select className="text-sm border-slate-200 rounded-lg bg-white px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                    <option>Most Popular</option>
                                    <option>Newest Additions</option>
                                    <option>Name A-Z</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors"></div>
                                        <button className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-sm text-slate-900 font-medium py-2 rounded-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-sm hover:bg-white">
                                            Quick View
                                        </button>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="space-y-2 mb-6 mt-auto">
                                            <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                                                <span className="text-slate-500">Voltage</span>
                                                <span className="font-medium text-slate-700">{product.specs.voltage}</span>
                                            </div>
                                            <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                                                <span className="text-slate-500">Current</span>
                                                <span className="font-medium text-slate-700">{product.specs.current}</span>
                                            </div>
                                            <div className="flex justify-between text-xs py-1 border-slate-100">
                                                <span className="text-slate-500">Material</span>
                                                <span className="font-medium text-slate-700 text-right">{product.specs.material}</span>
                                            </div>
                                        </div>
                                        <Link
                                            href="/rfq"
                                            className="w-full text-center block py-2.5 px-4 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                                        >
                                            Request Quote
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-center">
                            <button className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                                Load More Products
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Advantages Section */}
            <section className="bg-white py-20 border-y border-slate-200">
                <div className="container">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Our Components?</h2>
                        <p className="text-slate-600 text-lg">
                            Structured manufacturing support for industrial wiring, enclosure, and cable entry applications.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900">Industrial Quality</h3>
                            <p className="text-slate-600">
                                Material combinations and electrical ratings are defined per model and application context.
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900">Compliance Support</h3>
                            <p className="text-slate-600">
                                Certificate scope and applicable files are confirmed by item number and destination requirements.
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                <Settings2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900">Custom OEM Service</h3>
                            <p className="text-slate-600">Tailored solutions from specific colors to completely custom mold development.</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-900">Fast Delivery</h3>
                            <p className="text-slate-600">Production and delivery schedules are confirmed per item number and order quantity.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Application Section */}
            <section className="py-20 bg-slate-50 hidden sm:block">
                <div className="container">
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Industries</h2>
                        <p className="text-slate-600 text-lg max-w-2xl">Versatile electrical components for industrial automation, power distribution, and control applications.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {applications.map((app, idx) => (
                            <div key={idx} className="group relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all h-64 flex border border-slate-200">
                                <div className="w-1/2 p-8 flex flex-col justify-center relative z-10 bg-white/90 backdrop-blur-md">
                                    <div className="mb-4 bg-slate-50 p-3 inline-block rounded-xl border border-slate-100">
                                        {app.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{app.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{app.desc}</p>
                                </div>
                                <div className="w-1/2 relative">
                                    <Image
                                        src={app.image}
                                        alt={app.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/90"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. CTA Section */}
            <CTABanner
                title="Need Help Choosing the Right Product?"
                description="Our technical experts are ready to assist you in selecting the perfect electrical components for your specific industrial application."
                primaryCTA={{
                    label: "Request Quote",
                    href: "/rfq",
                }}
                secondaryCTA={{
                    label: "Contact Sales",
                    href: "/contact",
                }}
            />

            {/* 7. SEO Content Block */}
            <section className="bg-white py-12 border-t border-slate-200">
                <div className="container max-w-4xl text-center">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">About Our Electrical Components</h2>
                    <div className="prose prose-sm prose-slate mx-auto text-slate-500">
                        <p>
                            We supply terminal blocks, cable glands, electrical enclosures, and DIN rail accessories for industrial B2B applications. Product details and compatibility should be verified by model and project requirements.
                        </p>
                        <p className="mt-4">
                            We support OEM/ODM communication and model-specific documentation requests. Certificates and technical files are available upon request for selected products. Contact our sales engineering team with item numbers to confirm details for your project.
                        </p>
                    </div>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}} />
        </div>
    );
}
export const metadata = {
    robots: {
        index: false,
        follow: false,
    },
};
