export default function GlobalMarketSection() {
    const stats = [
        { value: "Multi-Region", label: "Project Coverage" },
        { value: "B2B Focus", label: "Customer Type" },
        { value: "Factory-Direct", label: "Communication" },
        { value: "OEM / ODM", label: "Service Mode" },
    ];

    return (
        <section className="global-market-section relative overflow-hidden border-t text-white">
            {/* Subtle Industrial Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" aria-hidden="true">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="industrial-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                            <rect width="50" height="50" fill="none" />
                            <circle cx="25" cy="25" r="1.5" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#industrial-grid)" />
                </svg>
            </div>

            <div className="container relative z-10 py-16 md:py-24">
                {/* Section Title */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="global-market-title mb-5 text-2xl font-semibold tracking-tight md:text-4xl">
                        Built for Industrial B2B Projects
                    </h2>
                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                        Supporting manufacturers, system integrators, and distributors with factory-based communication and practical product sourcing workflows.
                    </p>
                </div>

                {/* Metrics Display - Clean Horizontal Row */}
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            {/* Large Number */}
                            <div className="mb-3 text-[clamp(30px,5vw,56px)] font-bold tracking-tight text-white">
                                {stat.value}
                            </div>

                            {/* Small Label */}
                            <div className="text-sm font-medium uppercase tracking-wide text-slate-300 md:text-base">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
