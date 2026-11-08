import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { contactUrl } from "@/lib/routes";

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
        <section className="section relative bg-slate-950 text-white overflow-hidden py-20 md:py-28">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(249,115,22,0.08),transparent_40%)]" />
            <div className="container max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

                    {/* Left: Short factory credibility block */}
                    <div className="flex-1 w-full space-y-7">
                        <div className="inline-flex items-center gap-2.5">
                            <span className="h-0.5 w-8 bg-primary rounded-full block"></span>
                            <span className="text-xs font-bold text-primary uppercase tracking-[0.16em]">
                                Factory in Action
                            </span>
                        </div>

                        <h2 className="!text-slate-50 text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight">
                            Inside Our Production
                        </h2>

                        <p className="max-w-xl text-base text-slate-300 leading-relaxed md:text-lg">
                            From raw material processing to finished terminals — real workshop equipment, disciplined process control, and verifiable batch quality.
                        </p>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4">
                            <div className="rounded-card border border-slate-800/90 bg-slate-900/60 p-5 backdrop-blur-xs">
                                <h4 className="!text-slate-100 text-xl font-bold mb-1.5 md:text-2xl">Process</h4>
                                <p className="text-xs sm:text-sm font-medium text-slate-400">Stamping & Precision Crimping</p>
                            </div>
                            <div className="rounded-card border border-slate-800/90 bg-slate-900/60 p-5 backdrop-blur-xs">
                                <h4 className="!text-slate-100 text-xl font-bold mb-1.5 md:text-2xl">Quality</h4>
                                <p className="text-xs sm:text-sm font-medium text-slate-400">Batch Inspection & Packaging</p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link
                                href={contactUrl()}
                                className="inline-flex items-center text-primary hover:text-white font-semibold text-base transition-colors group"
                            >
                                Request Factory Capability Details
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Staggered 2x2 Factory Image Grid */}
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-2 gap-4 sm:gap-5">
                            {factoryImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`relative group rounded-card overflow-hidden aspect-[4/3] sm:aspect-square border border-slate-800/80 bg-slate-900 shadow-lg ${
                                        index % 2 === 1 ? "sm:translate-y-5" : ""
                                    }`}
                                >
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4">
                                        <span className="inline-block text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-0.5">
                                            0{index + 1}
                                        </span>
                                        <p className="text-sm font-semibold text-white tracking-wide">
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
