import type { LucideIcon } from "lucide-react";
import { ImagePreview } from "@/components/shared";

interface ManufacturingSectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
}

interface ProcessStepCardProps {
  step: string;
  title: string;
  description: string;
  controlPoint: string;
  imageSrc: string;
  imageAlt: string;
}

interface ProductionImageCardProps {
  title: string;
  caption: string;
  imageSrc: string;
  imageAlt: string;
}

interface CapabilityCardProps {
  title: string;
  description: string;
  detail?: string;
  icon: LucideIcon;
}

export function ManufacturingSectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  titleClassName = "",
  descriptionClassName = "",
}: ManufacturingSectionHeadingProps) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
      <h2 className={`text-3xl font-semibold leading-tight text-slate-950 md:text-4xl ${titleClassName}`}>
        {title}
      </h2>
      <p className={`mt-4 text-base leading-7 text-slate-700 md:text-lg ${descriptionClassName}`}>
        {description}
      </p>
    </div>
  );
}

export function ProcessStepCard({
  step,
  title,
  description,
  controlPoint,
  imageSrc,
  imageAlt,
}: ProcessStepCardProps) {
  return (
    <article className="card overflow-hidden">
      <div className="relative h-44 w-full border-b border-border bg-slate-200">
        <ImagePreview
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw"
          unoptimized
          className="object-cover"
        />
        <span className="absolute left-4 top-4 rounded-sm bg-slate-900/85 px-2.5 py-1 text-xs font-semibold tracking-[0.12em] text-white">
          STEP {step}
        </span>
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-6 text-secondary">{description}</p>
        <p className="border-l-2 border-primary/70 pl-3 text-xs font-medium uppercase tracking-[0.08em] text-slate-700">
          Control Point: {controlPoint}
        </p>
      </div>
    </article>
  );
}

export function ProductionImageCard({ title, caption, imageSrc, imageAlt }: ProductionImageCardProps) {
  return (
    <article className="group card overflow-hidden">
      <div className="relative h-56 w-full bg-slate-200">
        <ImagePreview
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-2 p-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-6 text-secondary">{caption}</p>
      </div>
    </article>
  );
}

export function CapabilityCard({ title, description, detail, icon: Icon }: CapabilityCardProps) {
  return (
    <article className="card p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-sm border border-slate-300 bg-slate-100 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-secondary">{description}</p>
      {detail ? (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
          {detail}
        </p>
      ) : null}
    </article>
  );
}
