"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Breadcrumb, DownloadCard, ResourceNav } from "@/components/shared";
import { Search } from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
  const [activeType, setActiveType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const resources = useQuery(api.frontend.listPublicResources, {
    type:
      activeType === "all"
        ? undefined
        : (activeType as "catalog" | "datasheet" | "certificate" | "cad" | "manual"),
    search: searchQuery || undefined,
    limit: 100,
  });

  // Filter resources based on type and search query
  const filteredResources = resources || [];

  const breadcrumbItems = [{ label: "Resources" }];

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
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">Documentation Support</h1>
            <p className="text-lg text-secondary">
              Technical documentation is available upon request based on selected models, item numbers, and project requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="section bg-muted">
        <div className="container">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search available documents..."
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Resource Type Navigation */}
            <div className="flex justify-center">
              <ResourceNav activeType={activeType} onTypeChange={setActiveType} />
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section">
        <div className="container">
          {/* Results Count */}
          <div className="mb-8 text-sm text-secondary">
            Showing {filteredResources.length} document{filteredResources.length !== 1 ? "s" : ""}
            {activeType !== "all" && ` in ${activeType}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>

          {/* Resources Grid */}
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <DownloadCard
                  key={resource.id}
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

      {/* Help Section */}
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

      {/* Additional Resources Info */}
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
