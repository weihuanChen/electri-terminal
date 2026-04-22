"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { createPortal } from "react-dom";
import { shouldBypassNextImageOptimization } from "@/lib/images";

interface ImagePreviewProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  unoptimized?: boolean;
  className?: string;
  previewLabel?: string;
}

export default function ImagePreview({
  src,
  alt,
  sizes,
  priority = false,
  loading,
  unoptimized,
  className = "object-cover",
  previewLabel = "Preview",
}: ImagePreviewProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const shouldUnoptimize =
    unoptimized !== undefined ? unoptimized : shouldBypassNextImageOptimization(src);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading ?? "lazy"}
        unoptimized={shouldUnoptimize}
        className={className}
      />

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Preview image: ${alt}`}
        className="group absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/60"
      >
        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-sm border border-white/45 bg-black/50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Search className="h-3.5 w-3.5" />
          {previewLabel}
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`Image preview: ${alt}`}
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close preview"
              className="tap-target absolute right-4 top-4 rounded-sm border border-white/30 bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="relative h-full max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-sm border border-white/20 bg-black"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="100vw"
                priority
                unoptimized={shouldUnoptimize}
                className="object-contain"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
