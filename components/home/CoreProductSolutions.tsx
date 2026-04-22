import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { categoryUrl } from "@/lib/routes";

interface SolutionFeature {
    title: string;
}

interface CoreSolution {
    title: string;
    slug: string;
    description: string;
    features?: SolutionFeature[];
    image: string;
}

interface CoreProductSolutionsProps {
    solutions: CoreSolution[];
}

export default function CoreProductSolutions({ solutions }: CoreProductSolutionsProps) {
    return (
        <section className="section bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-24">
            <div className="container max-w-7xl mx-auto space-y-32">
                {solutions.map((solution, index) => {
                    // Alternating layour: even index (0, 2) = image right. odd index (1, 3) = image left.
                    const isImageRight = index % 2 === 0;

                    return (
                        <div
                            key={`${solution.slug}-${index}`}
                            className={`flex flex-col gap-12 lg:gap-20 items-center ${isImageRight ? "lg:flex-row" : "lg:flex-row-reverse"
                                }`}
                        >
                            {/* Text Content */}
                            <div className="flex-1 w-full flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <span className="h-px w-8 bg-primary block"></span>
                                    <span className="text-sm font-bold text-primary uppercase tracking-widest">
                                        Core Category 0{index + 1}
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                                    {solution.title}
                                </h2>

                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl">
                                    {solution.description}
                                </p>

                                {solution.features && solution.features.length > 0 && (
                                    <ul className="space-y-4 mb-10">
                                        {solution.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                                <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                                    {feature.title}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div>
                                    <Link
                                        href={categoryUrl(solution.slug)}
                                        className="btn btn-primary inline-flex items-center px-8 py-4 text-base font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        Browse Products
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            {/* Image Content */}
                            <div className="flex-1 w-full relative">
                                {/* Decorative background element */}
                                <div className={`absolute -inset-4 bg-slate-100 dark:bg-slate-900 rounded-sm transform ${isImageRight ? '-rotate-2' : 'rotate-2'} -z-10 transition-transform duration-500 hover:rotate-0`}></div>

                                <div className="relative aspect-[4/3] w-full rounded-sm overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl bg-slate-200 dark:bg-slate-800">
                                    <Image
                                        src={solution.image}
                                        alt={solution.title}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                    {/* Subtle vignette/overlay for cinematic feel */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none"></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
