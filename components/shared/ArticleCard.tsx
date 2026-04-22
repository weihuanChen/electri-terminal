import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  type?: string;
  publishedAt?: number;
  categoryNames?: string[];
}

export default function ArticleCard({
  slug,
  title,
  excerpt,
  coverImage,
  type,
  publishedAt,
  categoryNames,
}: ArticleCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadTime = (text?: string) => {
    if (!text) return "5 min read";
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <Link href={`/blog/${slug}`} className="card group block h-full">
      {coverImage && (
        <div className="relative h-48 bg-muted overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {type && (
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-3 uppercase">
            {type}
          </span>
        )}

        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        {excerpt && (
          <p className="text-sm text-secondary mb-4 line-clamp-3">{excerpt}</p>
        )}

        <div className="flex items-center justify-between text-xs text-secondary">
          <div className="flex items-center gap-4">
            {publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(publishedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getReadTime(excerpt)}</span>
            </div>
          </div>

          {categoryNames && categoryNames.length > 0 && (
            <div className="flex items-center gap-2">
              {categoryNames.slice(0, 2).map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-muted rounded text-xs"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
