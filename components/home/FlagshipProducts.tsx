import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import { productUrl } from "@/lib/routes";

interface FlagshipProduct {
    _id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    heroImage?: string;
}

interface FlagshipProductsProps {
    products: FlagshipProduct[];
    title?: string;
    subtitle?: string;
    limit?: number;
    ctaLabel?: string;
}

export default function FlagshipProducts({
    products,
    title = "Featured Ring Terminal Models",
    subtitle = "Selected models for practical industrial wiring and sourcing workflows.",
    limit = 8,
    ctaLabel = "View Product",
}: FlagshipProductsProps) {
    const displayProducts = products.slice(0, limit);
    if (displayProducts.length === 0) return null;

    const useFourColumns = displayProducts.length >= 4 && displayProducts.length % 3 !== 0;

    return (
        <section className="section bg-slate-50/70 dark:bg-slate-900/80 overflow-hidden">
            <div className="container max-w-7xl mx-auto">
                <SectionHeader
                    eyebrow="Featured Models"
                    title={title}
                    subtitle={subtitle}
                    align="left"
                />

                <div
                    className={`grid sm:grid-cols-2 ${
                        useFourColumns ? "lg:grid-cols-4" : "lg:grid-cols-3"
                    } gap-6`}
                >
                    {displayProducts.map((product) => (
                        <Link
                            key={product._id}
                            href={productUrl(product.slug)}
                            className="group bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-card overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/60 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                        >
                            {/* Product Image */}
                            <div className="relative aspect-[4/3] bg-slate-100/70 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 overflow-hidden">
                                {product.heroImage ? (
                                    <Image
                                        src={product.heroImage}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                        <span className="text-slate-400 font-medium text-sm">No Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="p-6 flex flex-col flex-grow">
                                <span className="mb-2.5 inline-flex self-start rounded-control bg-slate-100 dark:bg-slate-800/90 px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    {product.slug.toUpperCase()}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-primary transition-colors line-clamp-2">
                                    {product.name}
                                </h3>

                                {product.shortDescription && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                                        {product.shortDescription}
                                    </p>
                                )}

                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-primary font-semibold text-sm">
                                    <span>{ctaLabel}</span>
                                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
