interface WelcomeHeaderProps {
  user: {
    name: string;
    email: string;
  } | null;
  systemMessage?: string;
  onLogout?: () => void;
}

export function WelcomeHeader({
  user,
  systemMessage = "Manage your product catalog, content, and inquiries.",
}: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
      <div className="relative px-6 py-6 md:px-8 md:py-8">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="relative">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Electri Pro Dashboard
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {getGreeting()}, {user?.name || "Admin"}
            </h1>
            <p className="max-w-2xl text-sm text-zinc-300 md:text-base">
              {systemMessage}
            </p>
          </div>

          {/* Quick stats bar */}
          <div className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">System Status</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-sm font-medium">Operational</span>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Last Sync</p>
              <p className="mt-2 text-sm font-medium">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Role</p>
              <p className="mt-2 text-sm font-medium">Administrator</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Workspace</p>
              <p className="mt-2 text-sm font-medium">Production</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
