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

    return (
        <section className="section bg-slate-50 dark:bg-slate-900 overflow-hidden py-24">
            <div className="container max-w-7xl mx-auto">
                <SectionHeader
                    title={title}
                    subtitle={subtitle}
                    align="center"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
                    {displayProducts.map((product) => (
                        <div key={product._id} className="group bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">

                            {/* Product Image */}
                            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
                                {product.heroImage ? (
                                    <Image
                                        src={product.heroImage}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                                        <span className="text-slate-400 font-medium">No Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="p-8 flex flex-col flex-grow">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Model: {product.slug.toUpperCase()}
                                </p>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                                    {product.name}
                                </h3>

                                {product.shortDescription && (
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 line-clamp-3">
                                        {product.shortDescription}
                                    </p>
                                )}

                                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href={productUrl(product.slug)}
                                        className="inline-flex items-center text-primary font-bold hover:text-primary/80 transition-colors uppercase tracking-wide text-sm"
                                    >
                                        {ctaLabel}
                                        <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
