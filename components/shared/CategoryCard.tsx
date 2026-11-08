import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { categoryUrl } from "@/lib/routes";
import { shouldBypassNextImageOptimization } from "@/lib/images";
import type { Locale } from "@/lib/i18n/config";

interface CategoryCardProps {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  productCount?: number;
  showProductCount?: boolean;
  descriptionLines?: 1 | 2 | 3 | 4 | 5;
  locale?: Locale;
}

function isIconImageSource(icon?: string) {
  if (!icon) return false;
  const normalized = icon.trim();
  return normalized.startsWith("/") || /^https?:\/\//i.test(normalized);
}

export default function CategoryCard({
  name,
  slug,
  description,
  image,
  icon,
  productCount,
  showProductCount = false,
  descriptionLines = 2,
  locale,
}: CategoryCardProps) {
  const iconImageSource = isIconImageSource(icon) ? icon?.trim() : undefined;
  const descriptionClampClass = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
    5: "line-clamp-5",
  }[descriptionLines];
  const contentHeightClass = descriptionLines > 2 ? "min-h-[250px]" : "min-h-[170px]";

  return (
    <Link
      href={categoryUrl(slug, locale ? { locale } : undefined)}
      className="group flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary/70 dark:hover:border-primary transition-all duration-300 rounded-card overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1"
    >
      {/* Full-bleed photo area */}
      <div className="relative h-48 overflow-hidden border-b border-slate-100 bg-slate-100/80 dark:border-slate-800/80 dark:bg-slate-800/60 sm:h-56">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            unoptimized={shouldBypassNextImageOptimization(image)}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : iconImageSource ? (
          <Image
            src={iconImageSource}
            alt={`${name} icon`}
            fill
            unoptimized={shouldBypassNextImageOptimization(iconImageSource)}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : icon ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-6xl text-slate-400 group-hover:text-primary transition-colors">{icon}</div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl font-bold text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={`flex flex-grow flex-col p-5 sm:p-6 ${contentHeightClass}`}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="min-h-[3.25rem] pr-4 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white sm:min-h-[3.5rem] sm:text-xl line-clamp-2">
            {name}
          </h3>
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all group-hover:bg-primary/10 group-hover:text-primary dark:bg-slate-800 dark:text-slate-400">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {description && (
          <p className={`text-sm text-slate-600 dark:text-slate-400 mb-5 flex-grow leading-relaxed ${descriptionClampClass}`}>
            {description}
          </p>
        )}

        {showProductCount && productCount !== undefined && (
          <div className="mt-auto inline-flex items-center px-3 py-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-control self-start">
            {productCount} Series
          </div>
        )}
      </div>
    </Link>
  );
}
