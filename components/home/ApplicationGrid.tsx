import ApplicationCard from "./ApplicationCard";
import SectionHeader from "@/components/shared/SectionHeader";

interface Application {
  title: string;
  slug: string;
  description: string;
  icon?: any;
  image?: string;
  productCount?: number;
}

interface ApplicationGridProps {
  applications: Application[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export default function ApplicationGrid({
  applications,
  title = "Industry Applications",
  subtitle = "Our products serve diverse industries with reliable electrical connections and protection solutions",
  showViewAll = false,
}: ApplicationGridProps) {
  if (!applications || applications.length === 0) {
    return null;
  }

  return (
    <section className="section bg-white dark:bg-slate-900">
      <div className="container">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          showViewAll={showViewAll}
          align="center"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {applications.map((application, index) => (
            <ApplicationCard key={index} application={application} />
          ))}
        </div>
      </div>
    </section>
  );
}
