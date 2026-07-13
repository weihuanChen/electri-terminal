import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import { requireAdmin } from "@/lib/admin-auth";
import { queryAdmin } from "@/lib/convex-admin";
import { DEFAULT_LOCALE, LANGUAGE_CONFIGS, STATIC_PAGE_DEFINITIONS, SUPPORTED_LOCALES, isLocale, type Locale } from "@/lib/i18n";
import { DashboardLayout } from "../../components/DashboardLayout";

type SearchParams = Record<string, string | string[] | undefined>;
const labels: Record<string, string> = {
  home: "Homepage", categories: "Categories hub", products: "Products hub", manufacturing: "Manufacturing",
  "selection-guide": "Selection guide", resources: "Resources", "quality-certifications": "Quality certifications",
  blog: "Blog hub", contact: "Contact", "privacy-policy": "Privacy policy",
};

export default async function StaticPageLocalizations({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  await requireAdmin();
  const params = (await searchParams) ?? {};
  const raw = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const targets = SUPPORTED_LOCALES.filter((item) => item !== DEFAULT_LOCALE);
  const locale: Locale = raw && isLocale(raw) && raw !== DEFAULT_LOCALE ? raw : targets[0];
  const records = await queryAdmin<Doc<"localizations">[]>("queries/modules/localizations:listLocalizations", {
    locale, entityType: "staticPage", limit: 100,
  });
  const bySource = new Map(records.map((record) => [record.sourceId, record]));

  return <DashboardLayout><div className="space-y-6">
    <div className="flex items-end justify-between gap-4"><div><h1 className="text-2xl font-bold">L1 Static Page Localizations</h1><p className="text-zinc-500">Human-reviewed copy and SEO fields required for language release.</p></div>
      <div className="flex gap-2">{targets.map((item) => <Link key={item} href={`/admin/localizations/static-pages?locale=${item}`} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${item === locale ? "bg-slate-900 text-white" : "bg-white"}`}>{LANGUAGE_CONFIGS[item].displayName}</Link>)}</div>
    </div>
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-zinc-50 text-xs uppercase text-zinc-500"><tr><th className="px-5 py-3">Page</th><th className="px-5 py-3">Release</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y">
      {STATIC_PAGE_DEFINITIONS.map((page) => { const record = bySource.get(page.key); return <tr key={page.key}><td className="px-5 py-4"><p className="font-semibold">{labels[page.key]}</p><p className="text-xs text-zinc-500">{page.path}</p></td><td className="px-5 py-4">{page.requiredForLanguageLaunch ? "Required" : "Optional"}</td><td className="px-5 py-4">{record?.status ?? "missing"}</td><td className="px-5 py-4 text-right"><Link className="font-semibold text-cyan-700" href={`/admin/localizations/static-pages/${page.key}?locale=${locale}`}>Edit</Link></td></tr>; })}
    </tbody></table></div>
  </div></DashboardLayout>;
}
