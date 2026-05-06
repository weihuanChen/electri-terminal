"use client";

import Link from "next/link";
import { BadgeCheck, Check, Database, Search, SquareArrowOutUpRight } from "lucide-react";

import type { ULListedCardData } from "@/app/quality-certifications/data";

interface ULListedCardProps {
  listing: ULListedCardData;
}

export default function ULListedCard({ listing }: ULListedCardProps) {
  return (
    <article className="overflow-hidden rounded-[3px] border border-slate-200 bg-[#FFFFFF] text-[#0F172A] shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[0.42fr_0.58fr]">
        <div className="border-b border-slate-200 bg-[#F8FAFC] p-6 lg:border-b-0 lg:border-r">
          <div className="flex h-full min-h-[280px] flex-col justify-between rounded-sm border border-slate-200 bg-white p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                UL Registry Record
              </p>
              <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-sm border border-slate-200 bg-[#F8FAFC] text-[#1E293B]">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-bold tracking-[-0.01em] text-[#0F172A]">
                {listing.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#475569]">
                File No.: {listing.fileNo}
              </p>
            </div>

            <div className="mt-6 rounded-sm border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <Search className="mt-0.5 h-4 w-4 flex-none text-blue-700" />
                <p className="text-sm leading-6 text-[#475569]">
                  Verify this file number in the official UL Product iQ database.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col px-6 py-6 md:px-7 md:py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
            Listing Summary
          </p>

          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-slate-200 bg-[#F8FAFC] text-[#1E293B]">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-bold tracking-[-0.01em] text-[#0F172A]">
                {listing.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" />
                Selected models UL listed
              </div>
            </div>
          </div>

          <ul className="mt-6 space-y-3 text-sm leading-6 text-[#475569]">
            <li>
              <span className="font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                File No.:
              </span>{" "}
              <span className="font-semibold text-[#0F172A]">{listing.fileNo}</span>
            </li>
            <li>
              <span className="font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                Product Category:
              </span>{" "}
              <span className="font-semibold text-[#0F172A]">{listing.productCategory}</span>
            </li>
            <li>
              <span className="font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                Markets:
              </span>{" "}
              <span className="font-semibold text-[#0F172A]">{listing.markets}</span>
            </li>
          </ul>

          <ul className="mt-6 space-y-3">
            {listing.highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#475569]">
                <Check className="mt-1 h-4 w-4 flex-none text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-sm border border-slate-200 bg-[#F8FAFC] px-4 py-3">
            <p className="text-sm leading-6 text-[#475569]">{listing.supportText}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {listing.actions.map((action) =>
              action.external ? (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn ${
                    action.variant === "secondary" ? "btn-secondary" : "btn-primary"
                  } w-full justify-center sm:w-auto`}
                >
                  {action.label}
                  <SquareArrowOutUpRight className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`btn ${
                    action.variant === "secondary" ? "btn-secondary" : "btn-primary"
                  } w-full justify-center sm:w-auto`}
                >
                  {action.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
