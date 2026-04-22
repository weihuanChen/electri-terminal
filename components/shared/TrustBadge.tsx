import { LucideIcon } from "lucide-react";

interface TrustBadgeProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

export default function TrustBadge({
  icon: Icon,
  title,
  description,
  variant = "default",
  className = "",
}: TrustBadgeProps) {
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</span>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={`flex items-start gap-4 ${className}`}>
        {Icon && (
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h4>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {Icon && (
        <div className="w-12 h-12 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</span>
    </div>
  );
}
