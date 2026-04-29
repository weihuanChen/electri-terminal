"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Smartphone, X } from "lucide-react";
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
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-2 sm:p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`Image preview: ${alt}`}
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close preview"
              className="tap-target absolute right-3 top-3 z-10 rounded-sm border border-white/30 bg-black/50 p-2 text-white hover:bg-black/70 sm:right-4 sm:top-4"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="relative h-full w-full overflow-hidden rounded-sm border border-white/20 bg-black md:max-h-[88vh] md:max-w-6xl"
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

              <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 rounded-sm border border-white/25 bg-black/55 px-2.5 py-1.5 text-center text-[11px] font-medium text-white/90 md:hidden">
                <Smartphone className="h-3.5 w-3.5" />
                Rotate to landscape for detailed diagrams
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
