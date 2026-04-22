import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/shared";
import { categoryUrl, familyUrl } from "@/lib/routes";
import { getProductsHubData } from "@/lib/publicData";
import { makeProductsHubSchemas } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Products | Industrial Electrical Components Catalogue",
  description:
    "Browse published product categories and featured series for terminal blocks, cable glands, enclosures, and DIN rail accessories.",
};

export default async function ProductsHubPage() {
  const data = await getProductsHubData();
  const breadcrumbItems = [{ label: "Products" }];
  const structuredData = makeProductsHubSchemas({
    categories: data.categories.map((category) => ({
      slug: category.slug,
      name: category.name,
    })),
    families: data.featuredFamilies.map((family) => ({
      slug: family.slug,
      name: family.name,
    })),
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <JsonLd data={structuredData} />

      <div className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="container py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="container py-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Product Directory
          </h1>
          <p className="mt-2 max-w-3xl text-slate-500 dark:text-slate-300">
            Browse live product categories and representative series pulled from the published
            dataset. This page is the main crawlable entry into the product architecture.
          </p>
        </div>
      </div>

      <section className="border-b border-slate-200 py-16 dark:border-slate-800">
        <div className="container">
          <h2 className="mb-8 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Product Categories
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.categories.map((category) => (
              <article
                key={category._id}
                className="overflow-hidden rounded-none border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-56 bg-slate-100 dark:bg-slate-800">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                      {category.name}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 p-8 dark:border-slate-800">
                  <div className="mb-3 flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    <span>{category.familyCount} series</span>
                    <span>{category.productCount} products</span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">{category.name}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-300">
                    {category.description || "Published category overview and product access."}
                  </p>
                  <Link
                    href={categoryUrl(category.slug)}
                    className="mt-6 inline-flex items-center text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    View Category
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="container">
          <h2 className="mb-8 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Featured Series
          </h2>

          <div className="divide-y divide-slate-200 border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {data.featuredFamilies.map((family) => (
              <article key={family._id} className="flex flex-col md:flex-row">
                <div className="relative h-52 w-full shrink-0 bg-slate-100 dark:bg-slate-800 md:h-auto md:w-64 lg:w-80">
                  {family.heroImage ? (
                    <Image
                      src={family.heroImage}
                      alt={family.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                      {family.name}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-center border-t border-slate-200 p-8 dark:border-slate-800 md:border-l md:border-t-0">
                  <div className="mb-2 flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {family.category?.name ? <span>{family.category.name}</span> : null}
                    <span>{family.productCount} models</span>
                  </div>
                  <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">{family.name}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-300">
                    {family.summary || "Published series page with model table and technical assets."}
                  </p>
                  {family.highlights?.length ? (
                    <ul className="mt-4 space-y-2">
                      {family.highlights.slice(0, 3).map((highlight) => (
                        <li key={highlight} className="text-sm text-slate-600 dark:text-slate-300">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link
                    href={familyUrl(family.slug)}
                    className="mt-6 inline-flex items-center text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    View Series
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
