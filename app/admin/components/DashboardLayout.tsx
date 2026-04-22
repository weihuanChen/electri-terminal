"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="admin-panel min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}
        `}
      >
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
