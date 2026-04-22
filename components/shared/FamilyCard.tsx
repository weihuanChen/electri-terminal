import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { familyUrl } from "@/lib/routes";
import { shouldBypassNextImageOptimization } from "@/lib/images";

interface FamilyCardProps {
  slug: string;
  name: string;
  summary?: string;
  heroImage?: string;
  highlights?: string[];
}

export default function FamilyCard({
  slug,
  name,
  summary,
  heroImage,
  highlights,
}: FamilyCardProps) {
  return (
    <Link
      href={familyUrl(slug)}
      className="card group block h-full overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden bg-muted sm:h-56">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={name}
            fill
            unoptimized={shouldBypassNextImageOptimization(heroImage)}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <span className="text-3xl font-bold text-primary">
                {name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="mb-3 text-lg font-semibold transition-colors group-hover:text-primary sm:text-xl">
          {name}
        </h3>

        {summary && (
          <div className="mb-4 line-clamp-2 text-sm font-semibold text-secondary">{summary}</div>
        )}

        {highlights && highlights.length > 0 && (
          <ul className="space-y-2 mb-4">
            {highlights.slice(0, 3).map((highlight, index) => (
              <li
                key={index}
                className="flex items-start text-sm text-secondary"
              >
                <span className="mr-2 text-primary">•</span>
                <span className="line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
          View Series
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
