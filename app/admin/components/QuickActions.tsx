import {
  FolderPlus,
  Layers,
  Package,
  Upload,
  FileText,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Create Category",
    description: "Add new product category",
    icon: FolderPlus,
    href: "#create-category",
    color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  },
  {
    label: "Create Family",
    description: "Add product series",
    icon: Layers,
    href: "#create-family",
    color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  },
  {
    label: "Create SKU",
    description: "Add new product",
    icon: Package,
    href: "#create-product",
    color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  },
  {
    label: "Upload Resource",
    description: "Add files or assets",
    icon: Upload,
    href: "#upload-resource",
    color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  },
  {
    label: "Write Article",
    description: "Create blog post",
    icon: FileText,
    href: "#create-article",
    color: "bg-rose-50 text-rose-600 hover:bg-rose-100",
  },
  {
    label: "View Inquiries",
    description: "Manage RFQs",
    icon: MessageSquare,
    href: "#inquiries",
    color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Quick Actions</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Frequently used tasks and shortcuts
        </p>
      </div>

      <div className="grid gap-1 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.label}
              href={action.href}
              className="group flex items-center gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:border-zinc-300 dark:border-zinc-700 hover:shadow-md"
            >
              <div className={`rounded-lg p-2.5 transition-colors ${action.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-colors group-hover:text-zinc-600 dark:text-zinc-400 shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
