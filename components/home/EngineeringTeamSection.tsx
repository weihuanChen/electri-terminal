import Image from "next/image";
import SectionHeader from "@/components/shared/SectionHeader";
import { Mail, Phone } from "lucide-react";

export default function EngineeringTeamSection() {
    const teamMembers = [
        {
            name: "Dr. Wei Chen",
            role: "Chief Electrical Engineer",
            bio: "Power systems engineering background with hands-on industrial component design experience.",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop", // placeholder portrait
        },
        {
            name: "Sarah Jenkins",
            role: "Head of QA / QC",
            bio: "Leads QA/QC inspection workflows and coordinates audit preparation activities.",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop",
        },
        {
            name: "Michael Chang",
            role: "Technical Support Lead",
            bio: "Dedicated to solving complex wiring and panel integration challenges.",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=987&auto=format&fit=crop",
        },
        {
            name: "Elena Rodriguez",
            role: "Automation Specialist",
            bio: "Expert in CNC precision machining and robotic assembly line setup.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=988&auto=format&fit=crop",
        },
    ];

    return (
        <section className="section bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div className="container">
                <SectionHeader
                    title="Our Engineering Expertise"
                    subtitle="Meet the technical team supporting product design, application matching, and process quality"
                    align="center"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="group">
                            <div className="relative w-full aspect-[4/5] rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800 mb-5">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                                />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{member.name}</h4>
                                <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">{member.role}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {member.bio}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="font-medium">engineering@company.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary" />
                        <span className="font-medium">Direct Technical Line: +86 (555) 123-4567</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
