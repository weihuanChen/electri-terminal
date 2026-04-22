import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  href?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  href,
  trend,
  description,
}: StatCardProps) {
  const cardContent = (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-all hover:shadow-md hover:border-zinc-300 dark:border-zinc-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {value.toLocaleString()}
          </p>
          {description && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
          )}
          {trend && (
            <div
              className={`mt-2 flex items-center text-sm ${
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              <span>
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="ml-1 text-zinc-500 dark:text-zinc-400">vs last month</span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3 text-zinc-600 dark:text-zinc-400 transition-colors group-hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {href && (
        <div className="mt-4 flex items-center text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
          View details
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );

  if (href) {
    return <a href={href}>{cardContent}</a>;
  }

  return cardContent;
}
