"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { shouldBypassNextImageOptimization } from "@/lib/images";

interface ImageGalleryProps {
  images: Array<{
    url: string;
    alt?: string;
  }>;
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-4xl font-bold text-muted-foreground/20">
            {alt.charAt(0)}
          </span>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="group relative aspect-square overflow-hidden rounded-sm bg-muted">
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].alt || `${alt} - Image ${currentIndex + 1}`}
          fill
          unoptimized={shouldBypassNextImageOptimization(images[currentIndex].url)}
          className="object-cover"
        />

        {/* Navigation Arrows - Desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="tap-target absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-100 transition-opacity md:left-4 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="tap-target absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-100 transition-opacity md:right-4 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Zoom Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="tap-target absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white opacity-100 transition-opacity md:right-4 md:top-4 md:opacity-0 md:group-hover:opacity-100"
          aria-label="Zoom image"
        >
          <ZoomIn className="h-5 w-5" />
        </button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm border-2 transition-all sm:h-20 sm:w-20 ${
                index === currentIndex
                  ? "border-primary scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${alt} - Thumbnail ${index + 1}`}
                fill
                unoptimized={shouldBypassNextImageOptimization(image.url)}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:text-gray-300"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:text-gray-300"
            aria-label="Next image"
          >
            <ChevronRight className="h-10 w-10" />
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || `${alt} - Image ${currentIndex + 1}`}
              fill
              unoptimized={shouldBypassNextImageOptimization(images[currentIndex].url)}
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 text-white rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
