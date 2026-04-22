import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  readTime?: string;
  featuredImage?: string;
  category?: string;
}

interface ResourceArticleGridProps {
  articles: Article[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
}

export default function ResourceArticleGrid({
  articles,
  title = "Technical Resources & Insights",
  subtitle = "Stay updated with industry trends, technical guides, and product applications",
  showViewAll = true,
  viewAllHref = "/blog",
}: ResourceArticleGridProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="section bg-slate-50 dark:bg-slate-800/50">
      <div className="container">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          showViewAll={showViewAll}
          viewAllHref={viewAllHref}
          align="center"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.slice(0, 3).map((article) => (
            <Link
              key={article._id}
              href={`/blog/${article.slug}`}
              className="card group block h-full"
            >
              {/* Article Image */}
              {article.featuredImage && (
                <div className="relative h-48 bg-muted overflow-hidden">
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="p-6">
                {/* Category & Meta */}
                <div className="flex items-center gap-3 text-xs text-secondary mb-3">
                  {article.category && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                      {article.category}
                    </span>
                  )}
                  {article.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                  {article.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-sm text-secondary line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>
                )}

                {/* Read More Link */}
                <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
