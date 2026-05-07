"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Breadcrumb, DownloadCard, ResourceNav } from "@/components/shared";

export type ResourceDocumentType =
  | "catalog"
  | "datasheet"
  | "certificate"
  | "cad"
  | "manual";

type ResourceFilterType = "all" | ResourceDocumentType;

export type PublicResourceDocument = {
  _id: string;
  title: string;
  type: ResourceDocumentType;
  fileUrl: string;
  previewImage?: string;
  fileSize?: number | string;
  language?: string;
  version?: string;
};

type ResourcesPageClientProps = {
  initialResources: PublicResourceDocument[];
  initialType: ResourceFilterType;
  initialSearchQuery: string;
};

export default function ResourcesPageClient({
  initialResources,
  initialType,
  initialSearchQuery,
}: ResourcesPageClientProps) {
  const pathname = usePathname();
  const [activeType, setActiveType] = useState<ResourceFilterType>(initialType);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextQuery = deferredSearchQuery.trim();

    if (activeType === "all") {
      params.delete("type");
    } else {
      params.set("type", activeType);
    }

    if (nextQuery.length === 0) {
      params.delete("q");
    } else {
      params.set("q", nextQuery);
    }

    const nextQueryString = params.toString();
    const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [activeType, deferredSearchQuery, pathname]);

  useEffect(() => {
    const syncFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      const nextType = params.get("type");
      const nextQuery = params.get("q") ?? "";
      const normalizedType: ResourceFilterType =
        nextType === "catalog" ||
        nextType === "datasheet" ||
        nextType === "certificate" ||
        nextType === "cad" ||
        nextType === "manual"
          ? nextType
          : "all";

      setActiveType(normalizedType);
      setSearchQuery(nextQuery);
    };

    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  const filteredResources = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return initialResources.filter((resource) => {
      const typeMatches = activeType === "all" || resource.type === activeType;
      const searchMatches =
        normalizedQuery.length === 0 ||
        resource.title.toLowerCase().includes(normalizedQuery);

      return typeMatches && searchMatches;
    });
  }, [activeType, initialResources, searchQuery]);

  const breadcrumbItems = [{ label: "Resources" }];

  return (
    <>
      <div className="bg-muted border-b border-border">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">Documentation Support</h1>
            <p className="text-lg text-secondary">
              Browse publicly available catalogs, datasheets, certificates, CAD drawings, and manuals for supported product lines.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-muted">
        <div className="container">
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search available documents..."
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <ResourceNav activeType={activeType} onTypeChange={setActiveType} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mb-8 text-sm text-secondary">
            Showing {filteredResources.length} document{filteredResources.length !== 1 ? "s" : ""}
            {activeType !== "all" && ` in ${activeType}`}
            {searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
          </div>

          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <DownloadCard
                  key={resource._id}
                  title={resource.title}
                  type={resource.type}
                  fileUrl={resource.fileUrl}
                  previewImage={resource.previewImage}
                  fileSize={resource.fileSize}
                  language={resource.language}
                  version={resource.version}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary">No public documents found matching your criteria.</p>
              <p className="mt-2 text-sm text-secondary">
                Need model-specific documentation? Submit your item numbers and request details.
              </p>
              <button
                onClick={() => {
                  setActiveType("all");
                  setSearchQuery("");
                }}
                className="mt-4 text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-muted">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">Can&apos;t Find What You&apos;re Looking For?</h2>
            <p className="text-secondary mb-6">
              Share your product models or item numbers and we&apos;ll prepare the required documentation package.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn btn-primary">
                Request Documentation
              </Link>
              <Link href="/rfq" className="btn btn-secondary">
                Submit RFQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3">Latest Updates</h3>
              <p className="text-sm text-secondary mb-4">
                Our product pages and technical references are updated as new models and revisions are released.
              </p>
              <Link href="/blog" className="text-sm text-primary hover:underline">
                View Updates →
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3">Need Technical Support?</h3>
              <p className="text-sm text-secondary mb-4">
                Our engineering team can support model selection and provide project-specific technical files.
              </p>
              <Link href="/contact" className="text-sm text-primary hover:underline">
                Get Support →
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3">Custom Solutions</h3>
              <p className="text-sm text-secondary mb-4">
                Certificates and custom product documentation are available upon request for selected models.
              </p>
              <Link href="/rfq" className="text-sm text-primary hover:underline">
                Start Request →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
