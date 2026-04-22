"use client";

import { useEffect, useId, useState } from "react";
import { useUploadFile } from "@convex-dev/r2/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { buildPublicAssetUrl } from "@/lib/images";

interface AdminImageFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  accept?: string;
  disabled?: boolean;
}

export function AdminImageField({
  label,
  value,
  onChange,
  placeholder = "支持 /images/example.jpg 或 https://example.com/image.jpg",
  helperText,
  accept = "image/*",
  disabled = false,
}: AdminImageFieldProps) {
  const inputId = useId();
  const uploadFile = useUploadFile(api.r2Assets);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const previewUrl = localPreviewUrl || value;

  const handleFileSelection = async (file?: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    const nextLocalPreviewUrl = URL.createObjectURL(file);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setLocalPreviewUrl(nextLocalPreviewUrl);
    setHasImageError(false);
    setImageInfo(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const objectKey = await uploadFile(file, {
        onProgress: (progress) => {
          if (!progress.total) return;
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });

      URL.revokeObjectURL(nextLocalPreviewUrl);
      setLocalPreviewUrl("");
      onChange(buildPublicAssetUrl(objectKey));
      toast.success("图片已上传");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "图片上传失败，请重试";
      if (nextLocalPreviewUrl) {
        URL.revokeObjectURL(nextLocalPreviewUrl);
      }
      setLocalPreviewUrl("");
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl("");
    }
    onChange("");
    setUploadProgress(0);
    setImageInfo(null);
    setHasImageError(false);
  };

  return (
    <div className="space-y-3">
      <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            {previewUrl && !hasImageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={label}
                className="h-48 w-full object-cover"
                onLoad={(event) => {
                  const target = event.currentTarget;
                  setImageInfo({
                    width: target.naturalWidth,
                    height: target.naturalHeight,
                  });
                  setHasImageError(false);
                }}
                onError={() => {
                  setHasImageError(true);
                  setImageInfo(null);
                }}
              />
            ) : (
              <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {previewUrl ? "图片加载失败" : "当前没有图片"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700">
                <span>{isUploading ? "上传中..." : "选择本地图"}</span>
                <input
                  type="file"
                  accept={accept}
                  className="hidden"
                  disabled={disabled || isUploading}
                  onChange={(event) => {
                    void handleFileSelection(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>

              <button
                type="button"
                onClick={clearImage}
                disabled={disabled || (!value && !localPreviewUrl)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                清空
              </button>
            </div>

            <input
              id={inputId}
              type="text"
              value={value}
              onChange={(event) => {
                if (localPreviewUrl) {
                  URL.revokeObjectURL(localPreviewUrl);
                  setLocalPreviewUrl("");
                }
                setHasImageError(false);
                setImageInfo(null);
                onChange(event.target.value);
              }}
              disabled={disabled}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder={placeholder}
            />

            <div className="space-y-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                支持直接粘贴 URL，也支持上传后自动回填 CDN 地址。
              </p>
              {imageInfo && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  当前尺寸: {imageInfo.width} x {imageInfo.height}
                </p>
              )}
              {helperText && <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>}
            </div>

            {isUploading && (
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all dark:bg-slate-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
