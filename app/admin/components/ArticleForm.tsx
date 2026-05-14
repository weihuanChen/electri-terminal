"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createArticleAction,
  updateArticleAction,
} from "../actions";
import { AdminImageField } from "./ui/AdminImageField";
import { buildPublicAssetUrl, shouldBypassNextImageOptimization } from "@/lib/images";
import { MediaAssetPickerModal } from "./MediaAssetPickerModal";

interface Article {
  _id: string;
  type: "blog" | "guide" | "faq" | "application";
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  content?: string;
  categoryIds?: string[];
  tagNames?: string[];
  relatedCategoryIds?: string[];
  relatedFamilyIds?: string[];
  relatedProductIds?: string[];
  featured?: boolean;
  status: "draft" | "published" | "archived";
  publishedAt?: number;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Family {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  title: string;
}

interface Asset {
  _id: string;
  title: string;
  type: string;
  fileUrl?: string;
  objectKey?: string;
  originalFilename?: string;
  accessUrl?: string | null;
  previewImage?: string;
  fileSize?: number;
  mimeType?: string;
  isPublic: boolean;
}

interface R2MetadataItem {
  key: string;
  size?: number;
  contentType?: string;
}

interface ArticleFormProps {
  article?: Article;
  categories?: Category[];
  families?: Family[];
  products?: Product[];
  assets?: Asset[];
  r2Items?: R2MetadataItem[];
}

type ArticleStatus = Article["status"];
type ArticleType = Article["type"];
type RelatedArrayField =
  | "categoryIds"
  | "relatedCategoryIds"
  | "relatedFamilyIds"
  | "relatedProductIds";

const SERVER_ACTION_BODY_LIMIT_BYTES = 4 * 1024 * 1024;
const CLIENT_BODY_HEADROOM_BYTES = 64 * 1024;
const MULTIPART_FIELD_OVERHEAD_BYTES = 200;

function estimateFormDataPayloadSize(formData: FormData) {
  const encoder = new TextEncoder();
  let total = 0;

  for (const [key, value] of formData.entries()) {
    total += encoder.encode(key).length + MULTIPART_FIELD_OVERHEAD_BYTES;
    if (typeof value === "string") {
      total += encoder.encode(value).length;
    }
  }

  return total;
}

function normalizeArticleSaveError(message: string) {
  const normalized = message.trim();
  const duplicateSlugMatch = normalized.match(/^Article slug already exists:\s*(.+)$/i);
  if (duplicateSlugMatch) {
    return `Slug 已存在：${duplicateSlugMatch[1]}，请修改后再保存。`;
  }

  if (normalized === "required_fields_missing") {
    return "必填字段缺失，请检查标题、Slug 和文章类型。";
  }

  if (/fetch failed/i.test(normalized)) {
    return "保存失败：后台连接异常，请稍后重试。";
  }

  return normalized || "操作失败，请重试";
}

export function ArticleForm({
  article,
  categories = [],
  families = [],
  products = [],
  assets = [],
  r2Items = [],
}: ArticleFormProps) {
  const router = useRouter();
  const isEdit = !!article;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: article?.type || "blog" as const,
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    coverImage: article?.coverImage || "",
    content: article?.content || "",
    categoryIds: article?.categoryIds || [],
    tagNames: article?.tagNames?.join("\n") || "",
    relatedCategoryIds: article?.relatedCategoryIds || [],
    relatedFamilyIds: article?.relatedFamilyIds || [],
    relatedProductIds: article?.relatedProductIds || [],
    featured: article?.featured || false,
    status: article?.status || "draft",
    publishedAt: article?.publishedAt || 0,
    seoTitle: article?.seoTitle || "",
    seoDescription: article?.seoDescription || "",
    canonical: article?.canonical || "",
  });

  const imageAssets = useMemo(() => {
    const imageUrlPattern = /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i;
    const fromAssets = assets
      .filter((asset) => asset.isPublic)
      .map((asset) => {
        const resolvedUrl = asset.objectKey
          ? buildPublicAssetUrl(asset.objectKey)
          : asset.fileUrl || asset.accessUrl || "";

        return {
          ...asset,
          resolvedUrl,
          previewUrl: asset.previewImage || resolvedUrl,
        };
      })
      .filter((asset) => {
        if (!asset.resolvedUrl) return false;
        if (asset.type === "image") return true;
        if (asset.mimeType?.startsWith("image/")) return true;
        return imageUrlPattern.test(asset.resolvedUrl);
      });

    const fromR2 = r2Items
      .map((item) => ({
        _id: `r2:${item.key}`,
        title: item.key.split("/").pop() || item.key,
        type: "image",
        objectKey: item.key,
        originalFilename: item.key.split("/").pop() || item.key,
        resolvedUrl: buildPublicAssetUrl(item.key),
        previewUrl: buildPublicAssetUrl(item.key),
        fileSize: item.size,
        mimeType: item.contentType,
      }))
      .filter((asset) => {
        if (asset.mimeType?.startsWith("image/")) return true;
        return imageUrlPattern.test(asset.resolvedUrl);
      });

    const merged = new Map<string, (typeof fromAssets)[number]>();
    for (const item of fromAssets) {
      merged.set(item.objectKey || item.resolvedUrl, item);
    }
    for (const item of fromR2) {
      const key = item.objectKey || item.resolvedUrl;
      if (!merged.has(key)) {
        merged.set(key, item);
      }
    }

    return Array.from(merged.values());
  }, [assets, r2Items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      // Basic fields
      formDataToSend.append("type", formData.type);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("slug", formData.slug);

      // Optional fields
      if (formData.excerpt) formDataToSend.append("excerpt", formData.excerpt);
      if (formData.coverImage) formDataToSend.append("coverImage", formData.coverImage);
      if (formData.content) formDataToSend.append("content", formData.content);

      // Array fields
      if (formData.categoryIds.length > 0) {
        formDataToSend.append("categoryIds", JSON.stringify(formData.categoryIds));
      }
      if (formData.tagNames.trim()) {
        const tags = formData.tagNames.split("\n").filter(t => t.trim());
        if (tags.length > 0) {
          formDataToSend.append("tagNames", JSON.stringify(tags));
        }
      }
      if (formData.relatedCategoryIds.length > 0) {
        formDataToSend.append("relatedCategoryIds", JSON.stringify(formData.relatedCategoryIds));
      }
      if (formData.relatedFamilyIds.length > 0) {
        formDataToSend.append("relatedFamilyIds", JSON.stringify(formData.relatedFamilyIds));
      }
      if (formData.relatedProductIds.length > 0) {
        formDataToSend.append("relatedProductIds", JSON.stringify(formData.relatedProductIds));
      }

      // Status
      formDataToSend.append("status", formData.status);
      formDataToSend.append("featured", formData.featured ? "true" : "false");

      // Published at
      if (formData.publishedAt > 0) {
        formDataToSend.append("publishedAt", formData.publishedAt.toString());
      }

      // SEO
      if (formData.seoTitle) formDataToSend.append("seoTitle", formData.seoTitle);
      if (formData.seoDescription) formDataToSend.append("seoDescription", formData.seoDescription);
      if (formData.canonical) formDataToSend.append("canonical", formData.canonical);

      const estimatedPayloadBytes = estimateFormDataPayloadSize(formDataToSend);
      if (estimatedPayloadBytes > SERVER_ACTION_BODY_LIMIT_BYTES - CLIENT_BODY_HEADROOM_BYTES) {
        const estimatedPayloadMb = (estimatedPayloadBytes / (1024 * 1024)).toFixed(2);
        setError(
          `当前提交内容约 ${estimatedPayloadMb} MB，接近或超过 4 MB 保存限制。请拆分正文、减少表格/Markdown 内容后再保存。`
        );
        return;
      }

      if (isEdit && article) {
        formDataToSend.append("id", article._id);
        const result = await updateArticleAction(formDataToSend);
        if (!result.ok) {
          setError(normalizeArticleSaveError(result.error));
          return;
        }
      } else {
        const result = await createArticleAction(formDataToSend);
        if (!result.ok) {
          setError(normalizeArticleSaveError(result.error));
          return;
        }
      }

      router.push("/admin/articles");
    } catch (error: unknown) {
      setError(
        normalizeArticleSaveError(error instanceof Error ? error.message : "操作失败，请重试")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayItem = (itemId: string, field: RelatedArrayField) => {
    const currentArray = formData[field];
    if (currentArray.includes(itemId)) {
      setFormData({
        ...formData,
        [field]: currentArray.filter((id) => id !== itemId),
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...currentArray, itemId],
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">基础信息</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              文章类型 <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as ArticleType })
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="blog">博客</option>
              <option value="guide">指南</option>
              <option value="faq">FAQ</option>
              <option value="application">应用案例</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              标题 <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="文章标题"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Slug <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="article-slug"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              摘要
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="文章摘要"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              状态
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as ArticleStatus })
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              <span>是否推荐文章（Featured）</span>
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">内容</h2>
        <div className="space-y-4">
          <AdminImageField
            label="封面图片"
            value={formData.coverImage}
            onChange={(value) => setFormData({ ...formData, coverImage: value })}
            helperText="用于博客列表、详情页头图和 SEO 图片。"
            placeholder="支持 /images/article-cover.jpg 或 https://example.com/article-cover.jpg"
          />

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">媒体库图片（R2）</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  点击按钮弹出媒体库，可按路径筛选并选择图片。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                媒体库图片
              </button>
            </div>

            {formData.coverImage ? (
              <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="relative h-14 w-20 flex-none overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <Image
                    src={formData.coverImage}
                    alt="Cover preview"
                    fill
                    unoptimized={shouldBypassNextImageOptimization(formData.coverImage)}
                    className="object-cover"
                  />
                </div>
                <p className="min-w-0 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {formData.coverImage}
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                当前未选择封面图，可使用 URL 输入或媒体库选择。
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              文章内容
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-mono text-xs"
              placeholder="文章内容（支持 Markdown / 表格 / Mermaid 图表 / LaTeX 公式）"
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              示例: 表格使用 GFM; 图表使用 <code className="mx-1">```mermaid</code>; 行内公式用
              <code className="mx-1">$E=mc^2$</code>，块公式用 <code className="mx-1">$$...$$</code>。
            </p>
          </div>
        </div>
      </div>

      {/* Relationships */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">关联内容</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              分类
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-zinc-300 dark:border-zinc-700 rounded-lg p-3">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(cat._id)}
                    onChange={() => toggleArrayItem(cat._id, "categoryIds")}
                    className="rounded border-zinc-300 dark:border-zinc-700"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              标签（每行一个）
            </label>
            <textarea
              value={formData.tagNames}
              onChange={(e) => setFormData({ ...formData, tagNames: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="标签1&#10;标签2&#10;标签3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              关联分类
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-zinc-300 dark:border-zinc-700 rounded-lg p-3">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.relatedCategoryIds.includes(cat._id)}
                    onChange={() => toggleArrayItem(cat._id, "relatedCategoryIds")}
                    className="rounded border-zinc-300 dark:border-zinc-700"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              关联系列
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-zinc-300 dark:border-zinc-700 rounded-lg p-3">
              {families.map((fam) => (
                <label key={fam._id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.relatedFamilyIds.includes(fam._id)}
                    onChange={() => toggleArrayItem(fam._id, "relatedFamilyIds")}
                    className="rounded border-zinc-300 dark:border-zinc-700"
                  />
                  <span>{fam.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              关联产品
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-zinc-300 dark:border-zinc-700 rounded-lg p-3">
              {products.map((prod) => (
                <label key={prod._id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.relatedProductIds.includes(prod._id)}
                    onChange={() => toggleArrayItem(prod._id, "relatedProductIds")}
                    className="rounded border-zinc-300 dark:border-zinc-700"
                  />
                  <span>{prod.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">SEO 设置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              SEO 标题
            </label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              SEO 描述
            </label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Canonical URL
            </label>
            <input
              type="url"
              value={formData.canonical}
              onChange={(e) => setFormData({ ...formData, canonical: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-slate-900 dark:bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "保存中..." : isEdit ? "保存更改" : "创建文章"}
        </button>
      </div>

      <MediaAssetPickerModal
        open={isMediaPickerOpen}
        assets={imageAssets}
        selectedUrl={formData.coverImage}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setFormData((current) => ({ ...current, coverImage: url }));
          setIsMediaPickerOpen(false);
        }}
      />
    </form>
  );
}
