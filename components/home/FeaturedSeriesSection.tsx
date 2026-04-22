import SeriesCard from "./SeriesCard";
import SectionHeader from "@/components/shared/SectionHeader";

interface ProductSeries {
  _id: string;
  name: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
  shortDescription?: string;
  heroImage?: string;
  quickSpecs?: Array<{
    label: string;
    value: string;
  }>;
}

interface FeaturedSeriesSectionProps {
  series: ProductSeries[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
}

export default function FeaturedSeriesSection({
  series,
  title = "Featured Product Series",
  subtitle = "Discover our most popular product series with technical specifications and quick quote options",
  showViewAll = true,
  viewAllHref = "/series",
}: FeaturedSeriesSectionProps) {
  if (!series || series.length === 0) {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {series.slice(0, 6).map((item) => (
            <SeriesCard key={item._id} series={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
