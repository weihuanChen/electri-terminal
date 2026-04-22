"use client";

import { useId, useState } from "react";
import { useUploadFile } from "@convex-dev/r2/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { buildPublicAssetUrl } from "@/lib/images";

interface AdminImageListFieldProps {
  label: string;
  values: Array<{
    url: string;
    alt?: string;
  }>;
  onChange: (
    values: Array<{
      url: string;
      alt?: string;
    }>
  ) => void;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
}

export function AdminImageListField({
  label,
  values,
  onChange,
  placeholder = "https://example.com/image.jpg",
  helperText,
  disabled = false,
}: AdminImageListFieldProps) {
  const inputId = useId();
  const uploadFile = useUploadFile(api.r2Assets);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [imageMeta, setImageMeta] = useState<Record<string, { width: number; height: number }>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const updateItem = (
    index: number,
    patch: {
      url?: string;
      alt?: string;
    }
  ) => {
    onChange(
      values.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    );
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, itemIndex) => itemIndex !== index));
  };

  const appendItem = (
    value: {
      url: string;
      alt?: string;
    } = { url: "", alt: "" }
  ) => {
    onChange([...values, value]);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= values.length) {
      return;
    }

    const nextValues = [...values];
    [nextValues[index], nextValues[nextIndex]] = [nextValues[nextIndex], nextValues[index]];
    onChange(nextValues);
  };

  const moveItemToIndex = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= values.length) {
      return;
    }

    const nextValues = [...values];
    const [moved] = nextValues.splice(fromIndex, 1);
    nextValues.splice(toIndex, 0, moved);
    onChange(nextValues);
  };

  const handleFileSelection = async (files: FileList | null) => {
    if (!files?.length) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      toast.error("请选择图片文件");
      return;
    }

    if (imageFiles.length !== files.length) {
      toast.error("已忽略非图片文件");
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedItems: Array<{ url: string; alt?: string }> = [];
      let completed = 0;

      for (const file of imageFiles) {
        const objectKey = await uploadFile(file, {
          onProgress: (progress) => {
            if (!progress.total) return;
            const percent = progress.loaded / progress.total;
            const overall = ((completed + percent) / imageFiles.length) * 100;
            setUploadProgress(Math.round(overall));
          },
        });

        uploadedItems.push({
          url: buildPublicAssetUrl(objectKey),
          alt: file.name.replace(/\.[^.]+$/, ""),
        });
        completed += 1;
        setUploadProgress(Math.round((completed / imageFiles.length) * 100));
      }

      onChange([...values, ...uploadedItems]);
      toast.success(`已上传 ${uploadedItems.length} 张图片`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "图片上传失败，请重试";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700">
            <span>{isUploading ? "上传中..." : "上传图片"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={disabled || isUploading}
              onChange={(event) => {
                void handleFileSelection(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => appendItem()}
            disabled={disabled}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            添加 URL
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {values.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            当前没有图片。可以上传本地图，也可以手动添加 URL。
          </div>
        ) : (
          values.map((value, index) => (
            <div
              key={`${label}-${index}-${value.url}`}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4"
              draggable={!disabled}
              onDragStart={() => setDraggingIndex(index)}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (draggingIndex === null) return;
                moveItemToIndex(draggingIndex, index);
                setDraggingIndex(null);
              }}
              onDragEnd={() => setDraggingIndex(null)}
            >
              <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  {value.url ? (
                    imageErrors[value.url] ? (
                      <div className="flex h-36 items-center justify-center px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        图片加载失败
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={value.url}
                        alt={value.alt || `${label} ${index + 1}`}
                        className="h-36 w-full object-cover"
                        onLoad={(event) => {
                          const target = event.currentTarget;
                          setImageMeta((current) => ({
                            ...current,
                            [value.url]: {
                              width: target.naturalWidth,
                              height: target.naturalHeight,
                            },
                          }));
                          setImageErrors((current) => ({
                            ...current,
                            [value.url]: false,
                          }));
                        }}
                        onError={() => {
                          setImageErrors((current) => ({
                            ...current,
                            [value.url]: true,
                          }));
                        }}
                      />
                    )
                  ) : (
                    <div className="flex h-36 items-center justify-center px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      未设置图片
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      第 {index + 1} 张
                    </span>
                    <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      拖拽排序
                    </span>
                    {index === 0 && (
                      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        主图
                      </span>
                    )}
                  </div>

                  <input
                    id={index === 0 ? inputId : undefined}
                    type="text"
                    value={value.url}
                    onChange={(event) => updateItem(index, { url: event.target.value })}
                    disabled={disabled}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder={placeholder}
                  />

                  <input
                    type="text"
                    value={value.alt || ""}
                    onChange={(event) => updateItem(index, { alt: event.target.value })}
                    disabled={disabled}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                    placeholder="Alt 文本，用于前台可访问性和 SEO"
                  />

                  {imageMeta[value.url] && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      当前尺寸: {imageMeta[value.url].width} x {imageMeta[value.url].height}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => moveItem(index, -1)}
                      disabled={disabled || index === 0}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      上移
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 1)}
                      disabled={disabled || index === values.length - 1}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      下移
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={disabled}
                      className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          支持本地上传和手动 URL。顺序会直接影响前台展示顺序。
        </p>
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
  );
}
