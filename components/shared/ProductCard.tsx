import Link from "next/link";
import Image from "next/image";
import { productUrl } from "@/lib/routes";
import { shouldBypassNextImageOptimization } from "@/lib/images";

interface ProductCardProps {
  slug: string;
  title: string;
  shortTitle?: string;
  mainImage?: string;
  summary?: string;
  isFeatured?: boolean;
}

export default function ProductCard({
  slug,
  title,
  shortTitle,
  mainImage,
  summary,
  isFeatured = false,
}: ProductCardProps) {
  const displayName = shortTitle || title;

  return (
    <Link href={productUrl(slug)} className="card group block h-full">
      <div className="relative h-44 overflow-hidden bg-muted sm:h-48">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={displayName}
            fill
            unoptimized={shouldBypassNextImageOptimization(mainImage)}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl font-bold text-primary">
                {displayName.charAt(0)}
              </span>
            </div>
          </div>
        )}
        {isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent text-white">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="mb-2 text-base font-semibold transition-colors group-hover:text-primary line-clamp-1 sm:text-lg">
          {displayName}
        </h3>
        {summary && (
          <p className="text-sm text-secondary line-clamp-2">{summary}</p>
        )}
      </div>
    </Link>
  );
}
