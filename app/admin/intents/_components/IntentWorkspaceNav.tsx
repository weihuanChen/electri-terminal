"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FileText,
  FolderTree,
  Gauge,
  PanelsTopLeft,
} from "lucide-react";

const items = [
  { href: "/admin/intents", label: "Overview", icon: Gauge },
  {
    href: "/admin/intents/families-products",
    label: "Families & Products",
    icon: Boxes,
  },
  {
    href: "/admin/intents/static-pages",
    label: "L1 Static Pages",
    icon: PanelsTopLeft,
  },
  {
    href: "/admin/intents/categories",
    label: "Categories",
    icon: FolderTree,
  },
  { href: "/admin/intents/articles", label: "Articles · L3", icon: FileText },
] as const;

export function IntentWorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Intent management workspaces"
      className="flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin/intents"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              active
                ? "bg-slate-950 text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
