import { Doc } from "@/convex/_generated/dataModel";
import { Upload, CheckCircle, XCircle, Clock as ClockIcon, AlertCircle } from "lucide-react";

interface ImportJobStatusProps {
  importJobs: Doc<"importJobs">[];
}

function getJobStatusIcon(status: string) {
  const icons = {
    completed: CheckCircle,
    failed: XCircle,
    in_progress: ClockIcon,
    pending: ClockIcon,
  };
  const Icon = icons[status as keyof typeof icons] || AlertCircle;
  return <Icon className="h-5 w-5" />;
}

function getJobStatusColor(status: string) {
  const colors = {
    completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
    failed: "text-rose-600 bg-rose-50 border-rose-200",
    in_progress: "text-blue-600 bg-blue-50 border-blue-200",
    pending: "text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
  };
  return colors[status as keyof typeof colors] || colors.pending;
}

function getJobStatusLabel(status: string) {
  const labels = {
    completed: "Completed",
    failed: "Failed",
    in_progress: "In Progress",
    pending: "Pending",
  };
  return labels[status as keyof typeof labels] || status;
}

export function ImportJobStatus({ importJobs }: ImportJobStatusProps) {
  const recentJobs = importJobs.slice(0, 5);
  const successCount = importJobs.filter((j) => j.status === "completed").length;
  const failedCount = importJobs.filter((j) => j.status === "failed").length;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Import Jobs</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Recent CSV imports</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                {successCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5">
              <XCircle className="h-4 w-4 text-rose-600" />
              <span className="text-sm font-medium text-rose-700">{failedCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {recentJobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Upload className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              No import jobs yet
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              CSV import history will appear here
            </p>
          </div>
        ) : (
          recentJobs.map((job) => {
            const successRows = job.successRows || 0;
            const failedRows = job.failedRows || 0;
            const totalRows = successRows + failedRows;
            const successRate =
              totalRows > 0 ? Math.round((successRows / totalRows) * 100) : 0;

            return (
              <div
                key={job._id}
                className="px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getJobStatusColor(
                          job.status
                        )}`}
                      >
                        {getJobStatusIcon(job.status)}
                        {getJobStatusLabel(job.status)}
                      </span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {job.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span>
                        Total: <span className="font-medium">{totalRows}</span>
                      </span>
                      <span className="text-emerald-600">
                        Success: <span className="font-medium">{successRows}</span>
                      </span>
                      {failedRows > 0 && (
                        <span className="text-rose-600">
                          Failed: <span className="font-medium">{failedRows}</span>
                        </span>
                      )}
                      <span className="text-zinc-500 dark:text-zinc-400">
                        Rate:{" "}
                        <span
                          className={`font-medium ${
                            successRate >= 90
                              ? "text-emerald-600"
                              : successRate >= 70
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {successRate}%
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                    <p>
                      {new Date(job._creationTime).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(job._creationTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {importJobs.length > 5 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
          <a
            href="#import-center"
            className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View Import Center →
          </a>
        </div>
      )}
    </div>
  );
}
