import Image from "next/image";
import SectionHeader from "@/components/shared/SectionHeader";

export default function QualityControlSection() {
    const qcSteps = [
        {
            title: "Raw Material Inspection",
            description: "Incoming material checks for key conductive and insulation components before production starts.",
            image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2070&auto=format&fit=crop",
        },
        {
            title: "In-Process Testing",
            description: "Visual and process checks during critical assembly phases.",
            image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop",
        },
        {
            title: "Performance Validation",
            description: "Verification tests based on product type and project requirements.",
            image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop",
        },
        {
            title: "Final QA Release",
            description: "Final quality release checks before packaging and dispatch.",
            image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=2070&auto=format&fit=crop",
        },
    ];

    return (
        <section className="section bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="container">
                <SectionHeader
                    title="Rigorous Quality Control"
                    subtitle="Structured quality checkpoints across incoming materials, production, and final release"
                    align="center"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                    {qcSteps.map((step, index) => (
                        <div key={index} className="group flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                <Image
                                    src={step.image}
                                    alt={step.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Step 0{index + 1}</div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{step.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
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
