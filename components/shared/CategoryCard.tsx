import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { categoryUrl } from "@/lib/routes";
import { shouldUseUnoptimizedImage } from "@/lib/images";

interface CategoryCardProps {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  productCount?: number;
  showProductCount?: boolean;
  descriptionLines?: 1 | 2;
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
}: CategoryCardProps) {
  const iconImageSource = isIconImageSource(icon) ? icon?.trim() : undefined;
  const descriptionClampClass = descriptionLines === 1 ? "line-clamp-1" : "line-clamp-2";

  return (
    <Link
      href={categoryUrl(slug)}
      className="group flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary transition-all duration-300 rounded-sm overflow-hidden"
    >
      {/* Full-bleed photo area */}
      <div className="relative h-48 overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800 sm:h-56">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            unoptimized={shouldUseUnoptimizedImage(image)}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : iconImageSource ? (
          <Image
            src={iconImageSource}
            alt={`${name} icon`}
            fill
            unoptimized={shouldUseUnoptimizedImage(iconImageSource)}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
      <div className="flex min-h-[170px] flex-grow flex-col p-5 sm:p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="min-h-[3.25rem] pr-4 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white sm:min-h-[3.5rem] sm:text-xl line-clamp-2">
            {name}
          </h3>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
        </div>

        {description && (
          <p className={`text-sm text-slate-600 dark:text-slate-400 mb-4 flex-grow leading-relaxed ${descriptionClampClass}`}>
            {description}
          </p>
        )}

        {showProductCount && productCount !== undefined && (
          <div className="mt-auto inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-sm self-start">
            {productCount} Series
          </div>
        )}
      </div>
    </Link>
  );
}
