"use client";

import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  variant = "danger",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    info: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  const iconColors = {
    danger: "text-rose-600 bg-rose-50",
    warning: "text-amber-600 bg-amber-50",
    info: "text-blue-600 bg-blue-50",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-2 ${iconColors[variant]}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{description}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${variantStyles[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
