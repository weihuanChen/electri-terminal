import Image from "next/image";
import SectionHeader from "@/components/shared/SectionHeader";
import { ArrowRight } from "lucide-react";

export default function ProductionProcessSection() {
    const steps = [
        {
            title: "Raw Material",
            description: "Selected conductive metals and insulation materials according to product requirements.",
            image: "https://images.unsplash.com/photo-1623912642502-31518bd13bc0?q=80&w=2070&auto=format&fit=crop",
        },
        {
            title: "Injection & CNC",
            description: "Precision molding and machining with tight tolerances.",
            image: "https://images.unsplash.com/photo-1537750793774-82ee1705e4d2?q=80&w=2070&auto=format&fit=crop",
        },
        {
            title: "Assembly",
            description: "Automated and semi-automated integration lines.",
            image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop",
        },
        {
            title: "Inspection",
            description: "Optical and electrical checks based on model-specific quality plans.",
            image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2070&auto=format&fit=crop",
        },
        {
            title: "Packaging",
            description: "Secure, anti-static, and weather-resistant packing.",
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop",
        },
    ];

    return (
        <section className="section bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="container">
                <SectionHeader
                    title="End-to-End Production Process"
                    subtitle="Structured manufacturing workflow with process control at each stage"
                    align="center"
                />

                <div className="mt-16 flex flex-col lg:flex-row justify-between items-start relative px-4 sm:px-0">
                    {/* Connecting Line for Desktop */}
                    <div className="hidden lg:block absolute top-[100px] left-0 w-full h-[2px] bg-slate-200 dark:bg-slate-700 z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex flex-col items-center group w-full lg:w-[18%] mb-12 lg:mb-0">
                            {/* Photo Node */}
                            <div className="relative w-48 h-48 sm:w-full sm:h-52 rounded-sm overflow-hidden bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-md group-hover:border-primary transition-colors duration-300">
                                <Image
                                    src={step.image}
                                    alt={step.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-sm text-white font-bold flex items-center justify-center border border-white/20">
                                    {index + 1}
                                </div>
                            </div>

                            {/* Mobile Connector Arrow */}
                            {index < steps.length - 1 && (
                                <ArrowRight className="lg:hidden w-6 h-6 text-slate-300 dark:text-slate-600 my-4" />
                            )}

                            {/* Text */}
                            <div className="mt-6 text-center">
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{step.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed px-2">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
