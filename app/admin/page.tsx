import { Doc } from "@/convex/_generated/dataModel";
import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import {
  Folder,
  Layers,
  Package,
  FileText,
  MessageSquare,
  Upload,
  BarChart3,
  TrendingUp,
} from "lucide-react";

import {
  createArticleAction,
  createCategoryAction,
  createFamilyAction,
  createProductAction,
  logoutAction,
  updateInquiryStatusAction,
} from "./actions";

import {
  StatCard,
  WelcomeHeader,
  InquiryOverview,
  ImportJobStatus,
  ContentOverview,
  QuickActions,
  ActivityFeed,
  DashboardLayout,
} from "./components";

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-zinc-900 dark:bg-zinc-100 px-2 py-1 text-xs font-medium text-white dark:text-zinc-900">{status}</span>
  );
}

function categoryLabelById(categories: Doc<"categories">[]) {
  return new Map(categories.map((item) => [item._id, item.name]));
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const message = params.success ?? params.error;
  const isError = Boolean(params.error);

  const { categories, families, products, articles, inquiries, importJobs, loadError } =
    await loadAdminData();
  const categoryMap = categoryLabelById(categories);

  // Calculate inquiry statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inquiriesToday = inquiries.filter(i => new Date(i._creationTime) >= today).length;

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const inquiriesThisWeek = inquiries.filter(i => new Date(i._creationTime) >= weekAgo).length;

  const unassignedInquiries = inquiries.filter(i => i.status === "new").length;

  // Mock activity data (in real implementation, this would come from the database)
  const activities = [
    {
      id: "1",
      type: "product" as const,
      action: "created" as const,
      description: "New product UK-2.5B added to Terminal Blocks",
      timestamp: Date.now() - 3600000,
      user: "Admin",
    },
    {
      id: "2",
      type: "article" as const,
      action: "published" as const,
      description: "Blog post 'How to Choose Terminal Blocks' published",
      timestamp: Date.now() - 7200000,
      user: "Editor",
    },
    {
      id: "3",
      type: "import" as const,
      action: "completed" as const,
      description: "CSV import completed: 150 products processed",
      timestamp: Date.now() - 14400000,
      user: "Admin",
    },
    {
      id: "4",
      type: "inquiry" as const,
      action: "updated" as const,
      description: "Inquiry from Acme Corp marked as resolved",
      timestamp: Date.now() - 28800000,
      user: "Sales",
    },
    {
      id: "5",
      type: "category" as const,
      action: "created" as const,
      description: "New category 'DIN Rail Accessories' created",
      timestamp: Date.now() - 43200000,
      user: "Admin",
    },
  ];

  // Count products by status
  const publishedProducts = products.filter((p) => p.status === "published").length;
  const draftProducts = products.filter((p) => p.status === "draft").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader
          user={{ name: "Admin", email: "admin@electripro.com" }}
          systemMessage="Manage your product catalog, content, inquiries, and import jobs."
        />

        {/* Message Alerts */}
        {message ? (
          <p
            className={`rounded-lg border px-4 py-3 text-sm ${
              isError
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {Array.isArray(message) ? message[0] : message}
          </p>
        ) : null}
        {loadError ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
          </p>
        ) : null}

        {/* System Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Categories"
            value={categories.length}
            icon={Folder}
            href="#categories"
            description="Product categories"
          />
          <StatCard
            title="Families"
            value={families.length}
            icon={Layers}
            href="#families"
            description="Product series"
          />
          <StatCard
            title="SKUs"
            value={products.length}
            icon={Package}
            href="#products"
            description="Total products"
          />
          <StatCard
            title="Published"
            value={publishedProducts}
            icon={TrendingUp}
            description="Live products"
          />
          <StatCard
            title="Drafts"
            value={draftProducts}
            icon={FileText}
            description="Pending review"
          />
          <StatCard
            title="Articles"
            value={articles.length}
            icon={BarChart3}
            href="#articles"
            description="Content pieces"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Inquiry Overview */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Inquiry Overview</h2>
              <InquiryOverview
                inquiries={inquiries}
                totalToday={inquiriesToday}
                totalThisWeek={inquiriesThisWeek}
                unassigned={unassignedInquiries}
              />
            </section>

            {/* Import Job Status */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Import Jobs</h2>
              <ImportJobStatus importJobs={importJobs} />
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Content Overview */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Content Overview</h2>
              <ContentOverview articles={articles} />
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Quick Actions</h2>
              <QuickActions />
            </section>
          </div>
        </div>

        {/* Activity Feed */}
        <section>
          <ActivityFeed activities={activities} limit={10} />
        </section>
      </div>
    </DashboardLayout>
  );
}
