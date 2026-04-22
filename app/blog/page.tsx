"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArticleCard } from "@/components/shared";
import { Breadcrumb } from "@/components/shared";
import Link from "next/link";
import { useState } from "react";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // In production, you would add filtering queries
  const articles = useQuery(api.frontend.listLatestArticles, { limit: 20 });
  const categories = useQuery(api.frontend.listCategoriesForPublic, {
    limit: 20,
  });

  const articleTypes = ["blog", "guide", "faq", "application"];

  // Filter articles based on selections
  const filteredArticles = articles?.filter((article) => {
    if (selectedType && article.type !== selectedType) return false;
    // Add category filtering logic when category names are available
    return true;
  });

  const breadcrumbItems = [{ label: "Blog", href: "/blog" }];

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Page Header */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">Blog & Resources</h1>
            <p className="text-lg text-secondary">
              Stay updated with industry insights, product guides, and technical articles.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Articles Grid */}
            <div className="lg:col-span-3">
              {/* Active Filters */}
              {(selectedCategory || selectedType) && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      Category
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="hover:text-primary-dark"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedType && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {selectedType}
                      <button
                        onClick={() => setSelectedType(null)}
                        className="hover:text-primary-dark"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedType(null);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Articles */}
              {filteredArticles && filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article._id}
                      slug={article.slug}
                      title={article.title}
                      excerpt={article.excerpt}
                      coverImage={article.coverImage}
                      type={article.type}
                      publishedAt={article.publishedAt}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-secondary">
                  No articles found matching your filters.
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="space-y-8">
                {/* Article Types */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Article Type</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedType(null)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        !selectedType
                          ? "bg-primary text-white"
                          : "hover:bg-muted text-secondary"
                      }`}
                    >
                      All Types
                    </button>
                    {articleTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors capitalize ${
                          selectedType === type
                            ? "bg-primary text-white"
                            : "hover:bg-muted text-secondary"
                        }`}
                      >
                        {type}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                {categories && categories.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Categories</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          !selectedCategory
                            ? "bg-primary text-white"
                            : "hover:bg-muted text-secondary"
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.slice(0, 10).map((category) => (
                        <button
                          key={category._id}
                          onClick={() => setSelectedCategory(category._id)}
                          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === category._id
                              ? "bg-primary text-white"
                              : "hover:bg-muted text-secondary"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    <Link href="/categories" className="block text-sm hover:text-primary">
                      Browse Products
                    </Link>
                    <Link href="/resources" className="block text-sm hover:text-primary">
                      Documentation Support
                    </Link>
                    <Link href="/contact" className="block text-sm hover:text-primary">
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section bg-muted">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-4">Stay Updated</h2>
            <p className="text-secondary mb-8">
              Subscribe to our newsletter for the latest articles, product updates, and industry news.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

    </>
  );
}
