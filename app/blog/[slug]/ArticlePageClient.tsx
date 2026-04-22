import { Breadcrumb, ProductCard, CTABanner } from "@/components/shared";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { shouldBypassNextImageOptimization } from "@/lib/images";

interface RelatedProduct {
  _id: string;
  slug: string;
  title: string;
  model?: string;
  shortTitle?: string;
  mainImage?: string;
  summary?: string;
}

export interface ArticlePageData {
  _id: string;
  title: string;
  type: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  createdAt: number;
  publishedAt?: number;
  relatedProducts?: RelatedProduct[];
}

interface ArticlePageClientProps {
  article: ArticlePageData;
}

export default function ArticlePageClient({ article }: ArticlePageClientProps) {
  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    { label: article.type, href: `/blog?type=${article.type}` },
    { label: article.title },
  ];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const tocItems = [
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "key-features", title: "Key Features", level: 2 },
    { id: "benefits", title: "Benefits", level: 2 },
    { id: "conclusion", title: "Conclusion", level: 2 },
  ];

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {article.type && (
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4 uppercase">
                {article.type}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-semibold mb-6">{article.title}</h1>

            {article.excerpt && (
              <p className="text-xl text-secondary mb-8">{article.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-sm text-secondary mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>5 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Electri Terminal Team</span>
              </div>
            </div>

            {article.coverImage && (
              <div className="relative h-96 rounded-lg overflow-hidden mb-12">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  unoptimized={shouldBypassNextImageOptimization(article.coverImage)}
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-sm font-semibold mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm text-secondary hover:text-primary transition-colors"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                {article.content ? (
                  <div className="whitespace-pre-line text-foreground leading-relaxed">
                    {article.content}
                  </div>
                ) : (
                  <div className="space-y-6 text-foreground leading-relaxed">
                    <p id="introduction">
                      This is a comprehensive guide about {article.title.toLowerCase()}. In this article,
                      we&apos;ll explore the key aspects, features, and benefits that you need to know.
                    </p>

                    <h2 id="key-features" className="text-2xl font-semibold mt-8 mb-4">
                      Key Features
                    </h2>
                    <p>
                      Understanding the essential features is crucial for making informed decisions.
                      Here are the main characteristics that set this solution apart.
                    </p>

                    <h2 id="benefits" className="text-2xl font-semibold mt-8 mb-4">
                      Benefits
                    </h2>
                    <p>
                      Implementing this solution offers numerous advantages for your operations.
                      From improved efficiency to cost savings, the benefits are substantial.
                    </p>

                    <h2 id="conclusion" className="text-2xl font-semibold mt-8 mb-4">
                      Conclusion
                    </h2>
                    <p>
                      In conclusion, {article.title} represents an excellent choice for your needs.
                      If you have any questions or would like to learn more, please don&apos;t hesitate to
                      contact our team.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {article.relatedProducts && article.relatedProducts.length > 0 && (
        <section className="section bg-muted">
          <div className="container">
            <h2 className="text-3xl font-semibold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {article.relatedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  slug={product.slug}
                  title={product.title}
                  shortTitle={product.shortTitle}
                  mainImage={product.mainImage}
                  summary={product.summary}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <h2 className="text-3xl font-semibold mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/blog?type=guide" className="card group block">
              <div className="p-6">
                <span className="text-xs font-semibold text-primary uppercase">Guide</span>
                <h3 className="text-xl font-semibold mt-2 mb-3 group-hover:text-primary">
                  Technical Selection Guides
                </h3>
                <p className="text-sm text-secondary line-clamp-2">
                  Browse published guide articles for model selection and sourcing workflows.
                </p>
              </div>
            </Link>

            <Link href="/blog?type=blog" className="card group block">
              <div className="p-6">
                <span className="text-xs font-semibold text-primary uppercase">Blog</span>
                <h3 className="text-xl font-semibold mt-2 mb-3 group-hover:text-primary">
                  Industry and Product Updates
                </h3>
                <p className="text-sm text-secondary line-clamp-2">
                  Read recent updates and practical notes from production and application scenarios.
                </p>
              </div>
            </Link>

            <Link href="/blog?type=faq" className="card group block">
              <div className="p-6">
                <span className="text-xs font-semibold text-primary uppercase">FAQ</span>
                <h3 className="text-xl font-semibold mt-2 mb-3 group-hover:text-primary">
                  Common Technical Questions
                </h3>
                <p className="text-sm text-secondary line-clamp-2">
                  Check FAQ posts for documentation, parameters, and inquiry preparation details.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <CTABanner
        title="Have Questions?"
        description="Our team is here to help you find the perfect solution for your needs."
        primaryCTA={{
          label: "Contact Us",
          href: "/contact",
        }}
        secondaryCTA={{
          label: "Browse Products",
          href: "/categories",
        }}
      />

    </>
  );
}
