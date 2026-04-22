"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadFile } from "@convex-dev/r2/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { createAssetAction, deleteAssetAction, updateAssetAction } from "../actions";
import { AdminImageField } from "./ui/AdminImageField";

type AssetType = "catalog" | "datasheet" | "certificate" | "cad" | "manual";

interface Asset {
  _id: string;
  title: string;
  type: AssetType;
  fileUrl?: string;
  objectKey?: string;
  originalFilename?: string;
  accessUrl?: string | null;
  previewImage?: string;
  language?: string;
  version?: string;
  fileSize?: number;
  mimeType?: string;
  isPublic: boolean;
  requireLeadForm: boolean;
}

interface AssetFormProps {
  asset?: Asset;
}

const assetTypeOptions: Array<{ value: AssetType; label: string }> = [
  { value: "catalog", label: "Catalog" },
  { value: "datasheet", label: "Datasheet" },
  { value: "certificate", label: "Certificate" },
  { value: "cad", label: "CAD" },
  { value: "manual", label: "Manual" },
];

export function AssetForm({ asset }: AssetFormProps) {
  const router = useRouter();
  const uploadFile = useUploadFile(api.r2Assets);
  const isEdit = Boolean(asset);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: asset?.title || "",
    type: asset?.type || ("datasheet" as AssetType),
    fileUrl: asset?.fileUrl || "",
    objectKey: asset?.objectKey || "",
    originalFilename: asset?.originalFilename || "",
    previewImage: asset?.previewImage || "",
    language: asset?.language || "en",
    version: asset?.version || "",
    fileSize: asset?.fileSize ? String(asset.fileSize) : "",
    mimeType: asset?.mimeType || "",
    isPublic: asset?.isPublic ?? true,
    requireLeadForm: asset?.requireLeadForm ?? false,
  });

  const currentUrl = asset?.accessUrl || formData.fileUrl;

  const handleFileSelection = async (file?: File | null) => {
    if (!file) return;

    setIsUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const key = await uploadFile(file, {
        onProgress: (progress) => {
          if (!progress.total) return;
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });

      setFormData((current) => ({
        ...current,
        objectKey: key,
        originalFilename: file.name,
        fileSize: String(file.size),
        mimeType: file.type || current.mimeType,
        fileUrl: "",
      }));
      toast.success("文件已上传到 R2");
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : "上传失败，请重试";
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("type", formData.type);
      if (formData.fileUrl) payload.append("fileUrl", formData.fileUrl);
      if (formData.objectKey) payload.append("objectKey", formData.objectKey);
      if (formData.originalFilename) payload.append("originalFilename", formData.originalFilename);
      if (formData.previewImage) payload.append("previewImage", formData.previewImage);
      if (formData.language) payload.append("language", formData.language);
      if (formData.version) payload.append("version", formData.version);
      if (formData.fileSize) payload.append("fileSize", formData.fileSize);
      if (formData.mimeType) payload.append("mimeType", formData.mimeType);
      if (formData.isPublic) payload.append("isPublic", "on");
      if (formData.requireLeadForm) payload.append("requireLeadForm", "on");

      if (isEdit && asset) {
        payload.append("id", asset._id);
        await updateAssetAction(payload);
        toast.success("资源已更新");
      } else {
        await createAssetAction(payload);
        toast.success("资源已创建");
      }

      router.push("/admin/assets");
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : "保存失败，请重试";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;

    setIsLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("id", asset._id);
      await deleteAssetAction(payload);
      toast.success("资源已删除");
      router.push("/admin/assets");
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : "删除失败，请重试";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">资源主数据</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              标题 <span className="text-rose-600">*</span>
            </label>
            <input
              required
              value={formData.title}
              onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：Terminal Blocks Product Catalog 2026"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              资源类型 <span className="text-rose-600">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(event) =>
                setFormData((current) => ({ ...current, type: event.target.value as AssetType }))
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              语言
            </label>
            <input
              value={formData.language}
              onChange={(event) => setFormData((current) => ({ ...current, language: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="en"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">文件上传</label>
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {formData.originalFilename || "尚未上传文件"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    上传成功后会保存 R2 object key，前台下载链接按需生成。
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                  <span>{isUploading ? "上传中..." : "选择并上传文件"}</span>
                  <input
                    type="file"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(event) => {
                      void handleFileSelection(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
              {isUploading && (
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                    <div
                      className="h-full rounded-full bg-slate-900 dark:bg-slate-800 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{uploadProgress}%</p>
                </div>
              )}
              {formData.objectKey && (
                <p className="mt-3 break-all text-xs text-zinc-500 dark:text-zinc-400">
                  Object key: {formData.objectKey}
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              外部文件 URL
            </label>
            <input
              type="text"
              value={formData.fileUrl}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  fileUrl: event.target.value,
                  objectKey: event.target.value ? "" : current.objectKey,
                }))
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="支持 /datasheets/example.pdf 或 https://example.com/file.pdf"
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              优先使用 R2 上传；这里支持站内相对路径和第三方绝对地址。
            </p>
          </div>

          <div className="md:col-span-2">
            <AdminImageField
              label="预览图"
              value={formData.previewImage}
              onChange={(value) =>
                setFormData((current) => ({ ...current, previewImage: value }))
              }
              helperText="用于下载资源卡片预览；建议上传封面图、PDF 首屏截图或 CAD 缩略图。"
              placeholder="支持 /images/preview.jpg 或 https://example.com/preview.jpg"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">版本</label>
            <input
              value={formData.version}
              onChange={(event) => setFormData((current) => ({ ...current, version: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="v2026.1"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">文件大小（字节）</label>
            <input
              type="number"
              min="0"
              value={formData.fileSize}
              onChange={(event) => setFormData((current) => ({ ...current, fileSize: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="1048576"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">MIME Type</label>
            <input
              value={formData.mimeType}
              onChange={(event) => setFormData((current) => ({ ...current, mimeType: event.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="application/pdf"
            />
          </div>

          {currentUrl && (
            <div className="md:col-span-2">
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-700 underline underline-offset-4"
              >
                预览当前文件
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">发布设置</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(event) => setFormData((current) => ({ ...current, isPublic: event.target.checked }))}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">前台可见</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.requireLeadForm}
              onChange={(event) =>
                setFormData((current) => ({ ...current, requireLeadForm: event.target.checked }))
              }
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">下载前需要留资</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="rounded-lg border border-rose-300 px-6 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              删除资源
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-slate-900 dark:bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isLoading ? "保存中..." : isEdit ? "保存更改" : "创建资源"}
          </button>
        </div>
      </div>
    </form>
  );
}
