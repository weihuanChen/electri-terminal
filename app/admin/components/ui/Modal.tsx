"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-zinc-900 rounded-xl shadow-xl transition-all`}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:text-zinc-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className={title ? "px-6 py-4" : "p-6"}>{children}</div>
        </div>
      </div>
    </div>
  );
}
