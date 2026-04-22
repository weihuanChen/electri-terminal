import { Doc } from "@/convex/_generated/dataModel";
import { MessageSquare, Clock, UserCheck, FileText } from "lucide-react";

interface InquiryOverviewProps {
  inquiries: Doc<"inquiries">[];
  totalToday: number;
  totalThisWeek: number;
  unassigned: number;
}

function getStatusColor(status: string) {
  const colors = {
    new: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-amber-100 text-amber-700 border-amber-200",
    resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    closed: "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800",
    spam: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return colors[status as keyof typeof colors] || colors.new;
}

function getStatusLabel(status: string) {
  const labels = {
    new: "New",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    spam: "Spam",
  };
  return labels[status as keyof typeof labels] || status;
}

export function InquiryOverview({
  inquiries,
  totalToday,
  totalThisWeek,
  unassigned,
}: InquiryOverviewProps) {
  const latestInquiries = inquiries.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Today</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalToday}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">New inquiries</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">This Week</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalThisWeek}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Total inquiries</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <Clock className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Unassigned</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{unassigned}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Need attention</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <UserCheck className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Latest Inquiries List */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Latest Inquiries</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Recent customer submissions</p>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {latestInquiries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">No inquiries yet</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Customer inquiries will appear here
              </p>
            </div>
          ) : (
            latestInquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {inquiry.name}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
                          inquiry.status
                        )}`}
                      >
                        {getStatusLabel(inquiry.status)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{inquiry.email}</p>
                    <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {inquiry.message}
                    </p>
                    {inquiry.company && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        Company: {inquiry.company}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-col sm:items-end sm:gap-1">
                    <p>
                      {new Date(inquiry._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {inquiries.length > 5 && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <a
              href="#inquiries"
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all {inquiries.length} inquiries →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
