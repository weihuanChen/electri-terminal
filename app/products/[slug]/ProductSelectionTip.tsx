import Link from "next/link";
import { ArrowUpRight, Signpost } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Locale } from "@/lib/i18n/config";
import { productUrl } from "@/lib/routes";

export interface SelectionRelatedProduct {
  _id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  model?: string;
}

export default function ProductSelectionTip({
  tip,
  products,
  locale,
}: {
  tip?: string;
  products?: SelectionRelatedProduct[];
  locale?: Locale;
}) {
  const t = useTranslations("catalog");
  const cleanTip = tip?.trim();
  const relatedProducts = (products ?? []).slice(0, 2);

  if (!cleanTip && relatedProducts.length === 0) return null;

  const urlOptions = locale ? { locale } : undefined;

  return (
    <aside
      aria-label={t("selectionTip")}
      className="border border-slate-300 border-l-4 border-l-amber-500 bg-white px-4 py-4 dark:border-slate-700 dark:border-l-amber-400 dark:bg-slate-900"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
        <Signpost className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        {t("selectionTip")}
      </div>

      {cleanTip && (
        <p className="mt-2.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
          {cleanTip}
        </p>
      )}

      {relatedProducts.length > 0 && (
        <div className="mt-3 border-t border-slate-200 pt-2 dark:border-slate-800">
          {relatedProducts.map((product) => (
            <Link
              key={product._id}
              href={productUrl(product.slug, urlOptions)}
              className="group flex min-h-10 items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm font-semibold text-slate-900 last:border-b-0 hover:text-primary dark:border-slate-800 dark:text-slate-100 dark:hover:text-primary"
            >
              <span className="min-w-0">
                <span className="block leading-5">{product.shortTitle || product.title}</span>
                {product.model && (
                  <span className="mt-0.5 block font-mono text-[11px] font-medium text-slate-500">
                    {product.model}
                  </span>
                )}
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
