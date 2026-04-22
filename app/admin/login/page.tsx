import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/admin-auth";

import { loginAction } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin");
  }

  const params = await searchParams;
  const error = params.error;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1f2937,#030712_55%)] px-6 py-20 text-zinc-100">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-300">Electri Pro</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-sm text-zinc-300">Use the administrator credentials from environment variables.</p>

        {error ? (
          <p className="mt-4 rounded-lg border border-rose-300/40 bg-rose-500/20 px-3 py-2 text-sm text-rose-100">
            Invalid email or password.
          </p>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-200">Email</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-white/20 bg-black/25 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 outline-none ring-cyan-400 transition focus:ring"
              placeholder="admin@example.com"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-zinc-200">Password</span>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-white/20 bg-black/25 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 outline-none ring-cyan-400 transition focus:ring"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
