"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  FileCheck2,
  FlaskConical,
  Leaf,
  Shield,
  ShieldCheck,
  SquareArrowOutUpRight,
} from "lucide-react";

import { ImagePreview } from "@/components/shared";
import type { CertificateCardData } from "@/app/quality-certifications/data";

interface CertificateCardProps {
  certificate: CertificateCardData;
}

const certificateIconMap = {
  ce: BadgeCheck,
  rohs: Leaf,
  reach: FlaskConical,
  ul: ShieldCheck,
} satisfies Record<CertificateCardData["icon"], typeof FileCheck2>;

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const isMultiPage = certificate.images.length > 1;
  const CertificateIcon = certificateIconMap[certificate.icon];

  return (
    <article className="overflow-hidden rounded-[3px] border border-slate-200 bg-[#FFFFFF] text-[#0F172A] shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-slate-200 bg-[#F8FAFC] p-5 lg:border-b-0 lg:border-r">
          <div className={`grid gap-4 ${isMultiPage ? "md:grid-cols-2" : "grid-cols-1"}`}>
            {certificate.images.map((image, index) => (
              <figure key={image.src} className="space-y-3">
                <div className="relative h-[260px] overflow-hidden rounded-sm border border-slate-300 bg-white shadow-sm md:h-[320px]">
                  <ImagePreview
                    src={image.src}
                    alt={image.alt}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain p-3"
                    previewLabel="Expand"
                  />
                </div>
                <figcaption className="text-xs font-medium uppercase tracking-[0.12em] text-[#94A3B8]">
                  {isMultiPage ? `Page ${index + 1}` : "Report preview"}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="flex flex-col px-6 py-6 md:px-7 md:py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
            Document Summary
          </p>

          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-slate-200 bg-[#F8FAFC] text-[#1E293B]">
              <CertificateIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3
                style={{ color: "#0F172A" }}
                className="text-2xl font-bold tracking-[-0.01em]"
              >
                {certificate.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {certificate.verifiedLabel ?? "Verified preview document"}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#475569]">{certificate.subtitle}</p>

          {certificate.body?.length ? (
            <div className="mt-4 space-y-4">
              {certificate.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-[#475569]">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          <ul className="mt-6 space-y-3">
            {certificate.details.map((detail) => (
              <li
                key={`${certificate.title}-${detail.label}`}
                className="flex items-start gap-3 text-sm leading-6 text-[#475569]"
              >
                <Check className="mt-1 h-4 w-4 flex-none text-emerald-600" />
                <span>
                  <span className="font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                    {detail.label}:
                  </span>{" "}
                  <span className="font-semibold text-[#0F172A]">{detail.value}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-sm border border-slate-200 bg-[#F8FAFC] px-4 py-3">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
              <p className="text-sm leading-6 text-[#475569]">
                {certificate.note ??
                  "Displayed files are preview copies for qualification reference. Contact our team to confirm model and batch coverage before project use."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {certificate.actions.map((action) =>
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
