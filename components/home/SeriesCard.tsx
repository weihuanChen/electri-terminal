import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, ShoppingCart } from "lucide-react";
import { categoryUrl, familyUrl } from "@/lib/routes";

interface ProductSeries {
  _id: string;
  name: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
  shortDescription?: string;
  heroImage?: string;
  quickSpecs?: Array<{
    label: string;
    value: string;
  }>;
}

interface SeriesCardProps {
  series: ProductSeries;
  showQuickSpecs?: boolean;
  showActions?: boolean;
}

export default function SeriesCard({
  series,
  showQuickSpecs = true,
  showActions = true,
}: SeriesCardProps) {
  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Series Info */}
      <div className="relative h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        {series.heroImage ? (
          <Image
            src={series.heroImage}
            alt={series.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl font-bold text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors">
              {series.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Link
            href={categoryUrl(series.category.slug)}
            className="inline-block px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-sm text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:text-primary transition-colors"
          >
            {series.category.name}
          </Link>
        </div>
      </div>

      {/* Series Info */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {series.name}
        </h3>

        {series.shortDescription && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 h-10">
            {series.shortDescription}
          </p>
        )}

        {/* Quick Specs */}
        {showQuickSpecs && series.quickSpecs && series.quickSpecs.length > 0 && (
          <div className="mb-5 space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-sm border border-slate-100 dark:border-slate-800">
            {series.quickSpecs.slice(0, 3).map((spec, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">{spec.label}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-right w-1/2 line-clamp-1" title={spec.value}>{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href={familyUrl(series.slug)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary transition-colors gap-2 shadow-sm"
            >
              Details
            </Link>
            <Link
              href={`/rfq?series=${series._id}`}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-semibold rounded-sm hover:bg-primary/90 transition-colors gap-2 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Quote
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
