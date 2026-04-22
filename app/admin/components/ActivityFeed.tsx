import { Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "product" | "sku" | "import" | "article" | "category" | "inquiry";
  action: "created" | "updated" | "deleted" | "published" | "completed";
  description: string;
  timestamp: number;
  user?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  limit?: number;
}

function getActivityIcon(type: string, action: string) {
  const icons = {
    product: "📦",
    sku: "🏷️",
    import: "📥",
    article: "📝",
    category: "📁",
    inquiry: "💬",
  };
  return icons[type as keyof typeof icons] || "📌";
}

function getActionColor(action: string) {
  const colors = {
    created: "bg-emerald-100 text-emerald-700 border-emerald-200",
    updated: "bg-blue-100 text-blue-700 border-blue-200",
    deleted: "bg-rose-100 text-rose-700 border-rose-200",
    published: "bg-purple-100 text-purple-700 border-purple-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return colors[action as keyof typeof colors] || colors.updated;
}

function formatTimestamp(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ActivityFeed({ activities, limit = 10 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, limit);

  // Group activities by date
  const groupedActivities = displayActivities.reduce(
    (acc, activity) => {
      const date = new Date(activity.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    },
    {} as Record<string, ActivityItem[]>
  );

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Activity Feed</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Recent system activity
            </p>
          </div>
          <Activity className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {displayActivities.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              No activity yet
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              System activity will appear here
            </p>
          </div>
        ) : (
          <div className="px-6 py-4">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date} className="mb-6 last:mb-0">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {date === new Date().toDateString()
                    ? "Today"
                    : new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                </p>
                <div className="space-y-3">
                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <div className="flex shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 text-lg">
                        {getActivityIcon(activity.type, activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {activity.description}
                          </p>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getActionColor(
                              activity.action
                            )}`}
                          >
                            {activity.action}
                          </span>
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="capitalize">{activity.type}</span>
                          {activity.user && (
                            <>
                              <span>•</span>
                              <span>{activity.user}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatTimestamp(activity.timestamp)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activities.length > limit && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
          <a
            href="#activity"
            className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all activity →
          </a>
        </div>
      )}
    </div>
  );
}
