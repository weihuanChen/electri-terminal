import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { SolutionIndustry } from "../data";

type ApplicationDetailSectionProps = {
  industry: SolutionIndustry;
  index: number;
  categoryHref: string;
};

export default function ApplicationDetailSection({
  industry,
  index,
  categoryHref,
}: ApplicationDetailSectionProps) {
  const imageFirst = index % 2 === 1;

  return (
    <article
      id={industry.slug}
      className="scroll-mt-28 border-b border-slate-200 dark:border-slate-800 last:border-b-0"
    >
      <div className="container py-12 md:py-16">
        <div
          className={`grid items-center gap-10 lg:grid-cols-2 ${
            imageFirst ? "lg:[&>div:first-child]:order-2" : ""
          }`}
        >
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              {industry.shortTitle}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 md:text-3xl">
              {industry.seoTitle}
            </h2>
            <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
              {industry.description}
            </p>
            <ul className="space-y-2">
              {industry.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <Link
              href={categoryHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {industry.categoryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className="relative aspect-[4/3] overflow-hidden rounded-sm border border-slate-200 dark:border-slate-700 bg-[#EEF2F6] dark:bg-slate-900"
          >
            <Image
              src={`/images/solutions/${industry.slug}-engineer.webp`}
              alt={industry.imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
