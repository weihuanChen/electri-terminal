import Image from "next/image";
import SectionHeader from "@/components/shared/SectionHeader";

export default function ManufacturingSection() {
    return (
        <section className="section bg-slate-900 border-t border-slate-800 text-white overflow-hidden">
            <div className="container">
                <SectionHeader
                    title="Factory & Manufacturing Capability"
                    subtitle="Factory production workflows for stable industrial component manufacturing"
                    align="center"
                    className="[&_h2]:!text-white [&_p]:!text-slate-300"
                />

                <div className="mt-12 space-y-8">
                    {/* Focal Point: Massive Factory Photo */}
                    <div className="relative w-full h-[500px] md:h-[600px] rounded-sm overflow-hidden bg-slate-800 shadow-2xl">
                        <Image
                            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
                            alt="Industrial Factory Facility"
                            fill
                            className="object-cover"
                        />
                        {/* Overlay with authoritative stats */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                            <div className="max-w-3xl">
                                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Integrated Production Facility</h3>
                                <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed">
                                    Our manufacturing workflows include stamping, molding, assembly, and inspection to support OEM/ODM industrial projects.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Supporting Images */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="relative h-64 rounded-sm overflow-hidden bg-slate-800 group">
                            <Image
                                src="https://images.unsplash.com/photo-1565514020179-026b92b647bf?q=80&w=2070&auto=format&fit=crop"
                                alt="Automated CNC Machining"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6">
                                <h4 className="font-bold text-white text-lg">Automated Production</h4>
                            </div>
                        </div>
                        <div className="relative h-64 rounded-sm overflow-hidden bg-slate-800 group">
                            <Image
                                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop"
                                alt="Precision Assembly Line"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6">
                                <h4 className="font-bold text-white text-lg">Integrated Assembly</h4>
                            </div>
                        </div>
                        <div className="relative h-64 rounded-sm overflow-hidden bg-slate-800 group">
                            <Image
                                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
                                alt="Smart Logistics Warehouse"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6">
                                <h4 className="font-bold text-white text-lg">Smart Logistics</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
