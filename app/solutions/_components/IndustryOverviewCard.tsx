import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SolutionIndustry } from "../data";

type IndustryOverviewCardProps = {
  industry: SolutionIndustry;
};

export default function IndustryOverviewCard({ industry }: IndustryOverviewCardProps) {
  return (
    <Link
      href={`#${industry.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className="relative aspect-[16/10] bg-[#EEF2F6] dark:bg-slate-800"
      >
        <Image
          src={`/images/solutions/${industry.slug}-engineer.webp`}
          alt={industry.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {industry.shortTitle}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {industry.overviewSummary}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-primary/80">
          View details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
