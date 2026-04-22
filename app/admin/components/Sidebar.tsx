"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderKanban,
  Layers,
  Package,
  FileStack,
  FileText,
  SlidersHorizontal,
  Link2,
  MessageSquare,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Categories", href: "/admin/categories", icon: FolderKanban },
  { label: "Families", href: "/admin/families", icon: Layers },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Assets", href: "/admin/assets", icon: FileStack },
  { label: "Templates", href: "/admin/attribute-templates", icon: SlidersHorizontal },
  { label: "Articles", href: "/admin/articles", icon: FileText },
  { label: "Relations", href: "/admin/relations", icon: Link2 },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Import Center", href: "/admin/import", icon: Upload },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-72"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-200 dark:border-zinc-800">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">EP</span>
              </div>
              <div>
                <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Electri Pro</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Admin Panel</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">EP</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-12rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${isActive
                    ? "bg-slate-900 dark:bg-slate-800 text-white shadow-sm"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-semibold shrink-0">
                  A
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">Admin</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">admin@electripro.com</p>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden">
                  <Link
                    href="/admin/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Profile Settings</span>
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Logout</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapse Button (Desktop) */}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="hidden lg:flex absolute bottom-20 right-4 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="hidden lg:flex absolute bottom-4 right-4 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        )}
      </aside>

      {/* Mobile Close Button */}
      {mobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
