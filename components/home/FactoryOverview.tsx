import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FactoryOverview() {
    const factoryImages = [
        {
            src: "https://assets.electriterminal.com/factory/high-speed-cutting-copper-tubes.webp",
            alt: "High-speed cutting process for copper tubes",
            label: "Tube Cutting",
        },
        {
            src: "https://assets.electriterminal.com/factory/precision-hole-machining-copper-tube.webp",
            alt: "Precision hole machining for copper tube terminals",
            label: "Hole Machining",
        },
        {
            src: "https://assets.electriterminal.com/factory/copper-tube-stamping-process.webp",
            alt: "Copper tube stamping and finishing process",
            label: "Stamping",
        },
        {
            src: "https://assets.electriterminal.com/factory/automatic-copper-tube-forming-process.webp",
            alt: "Automatic copper tube forming output",
            label: "Auto Forming",
        },
    ];

    return (
        <section className="section bg-slate-950 text-white overflow-hidden py-24 border-t border-slate-800">
            <div className="container max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    {/* Left: Short factory credibility block */}
                    <div className="flex-1 w-full space-y-8">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <span className="h-px w-8 bg-primary block"></span>
                            <span className="text-sm font-bold text-primary uppercase tracking-widest">
                                Factory in Action
                            </span>
                        </div>

                        <h2 className="!text-slate-50 text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                            Inside Our Production
                        </h2>

                        <p className="max-w-2xl text-base text-slate-300 leading-relaxed md:text-lg">
                            From raw material processing to finished terminals - real production, real control.
                        </p>

                        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-800">
                            <div>
                                <h4 className="!text-slate-100 text-2xl font-bold mb-2 md:text-3xl">Process</h4>
                                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Stamping and Crimping</p>
                            </div>
                            <div>
                                <h4 className="!text-slate-100 text-2xl font-bold mb-2 md:text-3xl">Quality</h4>
                                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Inspection and Packaging</p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Link
                                href="/contact"
                                className="inline-flex items-center text-primary hover:text-white font-bold text-lg transition-colors group"
                            >
                                Request Factory Capability Details
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: 2x2 Factory Image Grid */}
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-2 gap-4">
                            {factoryImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`relative group rounded-sm overflow-hidden aspect-square border border-slate-800 bg-slate-900 ${index === 0 ? "rounded-tl-2xl" :
                                        index === 1 ? "rounded-tr-2xl" :
                                            index === 2 ? "rounded-bl-2xl" :
                                                "rounded-br-2xl"
                                        }`}
                                >
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        fill
                                        unoptimized
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-sm font-bold text-white uppercase tracking-wider">
                                            {img.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
