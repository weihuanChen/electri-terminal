import CategoryCard from "@/components/shared/CategoryCard";
import SectionHeader from "@/components/shared/SectionHeader";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  productCount?: number;
}

interface CategoryGridProps {
  categories: Category[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  columns?: 4 | 6 | 8;
}

export default function CategoryGrid({
  categories,
  title = "Product Categories",
  subtitle = "Explore published industrial electrical product categories and series",
  showViewAll = true,
  viewAllHref = "/categories",
  columns = 6,
}: CategoryGridProps) {
  const gridCols = {
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    8: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="section bg-white dark:bg-slate-900">
      <div className="container">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          showViewAll={showViewAll}
          viewAllHref={viewAllHref}
          align="center"
        />

        <div className={`grid ${gridCols[columns]} gap-6 md:gap-8`}>
          {categories.slice(0, columns).map((category) => (
            <CategoryCard
              key={category._id}
              name={category.name}
              slug={category.slug}
              description={category.description}
              image={category.image}
              icon={category.icon}
              productCount={category.productCount}
              showProductCount
            />
          ))}
        </div>
      </div>
    </section>
  );
}
