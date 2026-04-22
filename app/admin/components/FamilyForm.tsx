"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createFamilyAction,
  updateProductFamilyAction,
} from "../actions";
import { AdminImageListField } from "./ui/AdminImageListField";
import {
  normalizeVisualMediaItems,
  type VisualMediaItem,
  type VisualMediaType,
} from "@/lib/productPresentation";

interface Family {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
  brand?: string;
  summary?: string;
  content?: string;
  attributes?: Record<string, unknown>;
  highlights?: string[];
  manualHeroImage?: string;
  manualHeroImageAlt?: string;
  heroImage?: string;
  gallery?: string[];
  mediaItems?: VisualMediaItem[];
  status: "draft" | "published" | "archived";
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  pageConfig?: {
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
      noindex?: boolean;
      ogImage?: string;
    };
    content?: {
      heroIntro?: string;
      selectionReason?: string;
      overview?: {
        intro?: string;
        details?: string[];
      };
      features?: {
        intro?: string;
        items?: string[];
      };
      applications?: {
        intro?: string;
        items?: string[];
      };
      selectionGuide?:
        | {
            intro?: string;
            steps?: string[];
          }
        | string;
      technicalNotes?: string[];
      overviewText?: string;
      featuresIntro?: string;
      featuresList?: string[];
      applicationsIntro?: string;
      applicationsList?: string[];
      technicalNote?: string;
    };
    longform?: {
      markdown?: string;
    };
    conversion?: {
      ctaPrimaryLabel?: string;
      ctaPrimaryHref?: string;
      ctaSecondaryLabel?: string;
      ctaSecondaryHref?: string;
      downloadsMode?: "auto" | "manual";
      pinnedDownloadIds?: string[];
    };
    display?: {
      showOverview?: boolean;
      showFeatures?: boolean;
      showApplications?: boolean;
      showSelectionGuide?: boolean;
      showTechnicalNote?: boolean;
      showLongform?: boolean;
      showDownloads?: boolean;
      showFaq?: boolean;
      showRelatedLinks?: boolean;
      showBottomCta?: boolean;
    };
  };
}

interface Category {
  _id: string;
  name: string;
}

interface FamilySummary {
  _id: string;
  name: string;
}

interface ArticleSummary {
  _id: string;
  title: string;
  type: "blog" | "guide" | "faq" | "application";
}

interface AssetSummary {
  _id: string;
  title: string;
  type: "catalog" | "datasheet" | "certificate" | "cad" | "manual";
  language?: string;
  isPublic: boolean;
}

interface FamilyFormProps {
  family?: Family;
  categories?: Category[];
  families?: FamilySummary[];
  articles?: ArticleSummary[];
  assets?: AssetSummary[];
}

type MediaFormItem = {
  url: string;
  alt?: string;
};
type MediaFormState = Record<VisualMediaType, MediaFormItem[]>;

function getInitialMediaState(family?: Family): MediaFormState {
  const grouped: MediaFormState = {
    product: [],
    dimension: [],
    packaging: [],
    application: [],
  };
  const mediaItems = normalizeVisualMediaItems({
    mediaItems: family?.mediaItems,
    primaryUrl: family?.heroImage,
    gallery: family?.gallery,
    defaultAlt: family?.name,
  });

  for (const type of Object.keys(grouped) as VisualMediaType[]) {
    grouped[type] = mediaItems
      .filter((item) => item.type === type)
      .map((item) => ({
        url: item.url,
        alt: item.alt || "",
      }));
  }

  return grouped;
}

function mediaStateToItems(mediaState: MediaFormState) {
  const mediaItems: VisualMediaItem[] = [];

  for (const type of Object.keys(mediaState) as VisualMediaType[]) {
    const items = mediaState[type]
      .map((item) => ({
        url: item.url.trim(),
        alt: item.alt?.trim() || undefined,
      }))
      .filter((item) => item.url);

    items.forEach((item, index) => {
      mediaItems.push({
        type,
        url: item.url,
        alt: item.alt,
        sortOrder: index,
      });
    });
  }

  return mediaItems;
}

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToLines(value?: string[]) {
  return value?.join("\n") || "";
}

function getSelectionGuideIntro(
  selectionGuide?: {
    intro?: string;
    steps?: string[];
  } | string
) {
  if (!selectionGuide) return "";
  return typeof selectionGuide === "string" ? selectionGuide : selectionGuide.intro || "";
}

function getSelectionGuideSteps(
  selectionGuide?: {
    intro?: string;
    steps?: string[];
  } | string
) {
  if (!selectionGuide || typeof selectionGuide === "string") return "";
  return arrayToLines(selectionGuide.steps);
}

function faqItemsToEditorValue(
  items?: Array<{
    question: string;
    answer: string;
  }>
) {
  if (!items?.length) return "";
  return JSON.stringify(items, null, 2);
}

export function FamilyForm({
  family,
  categories = [],
  families = [],
  articles = [],
  assets = [],
}: FamilyFormProps) {
  const router = useRouter();
  const isEdit = !!family;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: family?.name || "",
    slug: family?.slug || "",
    categoryId: family?.categoryId || "",
    brand: family?.brand || "",
    summary: family?.summary || "",
    content: family?.content || "",
    attributes: family?.attributes ? JSON.stringify(family.attributes, null, 2) : "",
    highlights: family?.highlights?.join("\n") || "",
    manualHeroImage: family?.manualHeroImage || "",
    manualHeroImageAlt: family?.manualHeroImageAlt || "",
    status: family?.status || "draft",
    sortOrder: family?.sortOrder || 0,
    seoTitle: family?.seoTitle || "",
    seoDescription: family?.seoDescription || "",
    canonical: family?.canonical || "",
    pageHeroIntro: family?.pageConfig?.content?.heroIntro || "",
    pageSelectionReason: family?.pageConfig?.content?.selectionReason || "",
    pageOverviewIntro: family?.pageConfig?.content?.overview?.intro || "",
    pageOverviewDetails:
      arrayToLines(family?.pageConfig?.content?.overview?.details) ||
      arrayToLines(
        family?.pageConfig?.content?.overviewText
          ? family.pageConfig.content.overviewText.split(/\n\s*\n/).map((item) => item.trim())
          : family?.content
            ? family.content.split(/\n\s*\n/).map((item) => item.trim())
            : []
      ),
    pageFeaturesIntro:
      family?.pageConfig?.content?.features?.intro || family?.pageConfig?.content?.featuresIntro || "",
    pageFeaturesList:
      arrayToLines(family?.pageConfig?.content?.features?.items) ||
      family?.pageConfig?.content?.featuresList?.join("\n") ||
      "",
    pageApplicationsIntro:
      family?.pageConfig?.content?.applications?.intro ||
      family?.pageConfig?.content?.applicationsIntro ||
      "",
    pageApplicationsList:
      arrayToLines(family?.pageConfig?.content?.applications?.items) ||
      family?.pageConfig?.content?.applicationsList?.join("\n") ||
      "",
    pageSelectionGuideIntro: getSelectionGuideIntro(family?.pageConfig?.content?.selectionGuide),
    pageSelectionGuideSteps: getSelectionGuideSteps(family?.pageConfig?.content?.selectionGuide),
    pageTechnicalNotes:
      arrayToLines(family?.pageConfig?.content?.technicalNotes) ||
      family?.pageConfig?.content?.technicalNote ||
      "",
    pageLongformMarkdown: family?.pageConfig?.longform?.markdown || "",
    pageMetaTitle: family?.pageConfig?.seo?.metaTitle || "",
    pageMetaDescription: family?.pageConfig?.seo?.metaDescription || "",
    pageCanonicalUrl: family?.pageConfig?.seo?.canonicalUrl || "",
    pageNoindex: family?.pageConfig?.seo?.noindex || false,
    pageOgImage: family?.pageConfig?.seo?.ogImage || "",
    ctaPrimaryLabel: family?.pageConfig?.conversion?.ctaPrimaryLabel || "",
    ctaPrimaryHref: family?.pageConfig?.conversion?.ctaPrimaryHref || "",
    ctaSecondaryLabel: family?.pageConfig?.conversion?.ctaSecondaryLabel || "",
    ctaSecondaryHref: family?.pageConfig?.conversion?.ctaSecondaryHref || "",
    downloadsMode: family?.pageConfig?.conversion?.downloadsMode || "auto",
    pinnedDownloadIds: family?.pageConfig?.conversion?.pinnedDownloadIds || [],
    faqMode: family?.pageConfig?.seoBoost?.faqMode || "relation",
    embeddedFaqItems: faqItemsToEditorValue(family?.pageConfig?.seoBoost?.embeddedFaqItems),
    relatedCategoryIds: family?.pageConfig?.linking?.relatedCategoryIds || [],
    relatedFamilyIds: family?.pageConfig?.linking?.relatedFamilyIds || [],
    relatedArticleIds: family?.pageConfig?.linking?.relatedArticleIds || [],
    showOverview: family?.pageConfig?.display?.showOverview ?? true,
    showFeatures: family?.pageConfig?.display?.showFeatures ?? true,
    showApplications: family?.pageConfig?.display?.showApplications ?? true,
    showSelectionGuide: family?.pageConfig?.display?.showSelectionGuide ?? true,
    showTechnicalNote: family?.pageConfig?.display?.showTechnicalNote ?? true,
    showLongform: family?.pageConfig?.display?.showLongform ?? true,
    showDownloads: family?.pageConfig?.display?.showDownloads ?? true,
    showFaq: family?.pageConfig?.display?.showFaq ?? true,
    showRelatedLinks: family?.pageConfig?.display?.showRelatedLinks ?? true,
    showBottomCta: family?.pageConfig?.display?.showBottomCta ?? true,
  });
  const [mediaState, setMediaState] = useState<MediaFormState>(
    getInitialMediaState(family)
  );
  const publicAssets = assets.filter((asset) => asset.isPublic);

  const toggleArrayItem = (
    itemId: string,
    key: "relatedCategoryIds" | "relatedFamilyIds" | "relatedArticleIds"
  ) => {
    setFormData((current) => ({
      ...current,
      [key]: current[key].includes(itemId)
        ? current[key].filter((id) => id !== itemId)
        : [...current[key], itemId],
    }));
  };

  const togglePinnedDownload = (assetId: string) => {
    setFormData((current) => ({
      ...current,
      pinnedDownloadIds: current.pinnedDownloadIds.includes(assetId)
        ? current.pinnedDownloadIds.filter((id) => id !== assetId)
        : [...current.pinnedDownloadIds, assetId],
    }));
  };

  const movePinnedDownload = (assetId: string, direction: -1 | 1) => {
    setFormData((current) => {
      const index = current.pinnedDownloadIds.indexOf(assetId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.pinnedDownloadIds.length) {
        return current;
      }
      const nextIds = [...current.pinnedDownloadIds];
      [nextIds[index], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[index]];
      return {
        ...current,
        pinnedDownloadIds: nextIds,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      // Basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("categoryId", formData.categoryId);

      // Optional string fields
      if (formData.brand) formDataToSend.append("brand", formData.brand);
      if (formData.summary) formDataToSend.append("summary", formData.summary);
      if (formData.content) formDataToSend.append("content", formData.content);
      if (formData.attributes.trim()) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(formData.attributes);
        } catch {
          throw new Error("系列属性必须是合法 JSON 对象");
        }
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
          throw new Error("系列属性必须是 JSON 对象");
        }
        formDataToSend.append("attributes", JSON.stringify(parsed));
      }

      // Array fields
      if (formData.highlights.trim()) {
        const highlights = formData.highlights.split("\n").filter(h => h.trim());
        if (highlights.length > 0) {
          formDataToSend.append("highlights", JSON.stringify(highlights));
        }
      }
      const mediaItems = mediaStateToItems(mediaState);
      const productImageUrls = mediaItems
        .filter((item) => item.type === "product")
        .map((item) => item.url);
      formDataToSend.append("manualHeroImage", formData.manualHeroImage.trim());
      formDataToSend.append("manualHeroImageAlt", formData.manualHeroImageAlt.trim());
      formDataToSend.append("mediaItems", JSON.stringify(mediaItems));
      formDataToSend.append("heroImage", productImageUrls[0] || "");
      formDataToSend.append("gallery", JSON.stringify(productImageUrls.slice(1)));

      // Status and sort order
      formDataToSend.append("status", formData.status);
      formDataToSend.append("sortOrder", formData.sortOrder.toString());

      // SEO
      if (formData.seoTitle) formDataToSend.append("seoTitle", formData.seoTitle);
      if (formData.seoDescription) formDataToSend.append("seoDescription", formData.seoDescription);
      if (formData.canonical) formDataToSend.append("canonical", formData.canonical);

      const overviewDetails = linesToArray(formData.pageOverviewDetails);
      const featuresList = linesToArray(formData.pageFeaturesList);
      const applicationsList = linesToArray(formData.pageApplicationsList);
      const selectionGuideSteps = linesToArray(formData.pageSelectionGuideSteps);
      const technicalNotes = linesToArray(formData.pageTechnicalNotes);
      let embeddedFaqItems:
        | Array<{
            question: string;
            answer: string;
          }>
        | undefined;
      if (formData.embeddedFaqItems.trim()) {
        try {
          const parsed = JSON.parse(formData.embeddedFaqItems) as Array<{
            question: string;
            answer: string;
          }>;
          if (!Array.isArray(parsed)) {
            throw new Error("内嵌 FAQ 必须是 JSON 数组");
          }
          embeddedFaqItems = parsed.filter(
            (item) =>
              item &&
              typeof item.question === "string" &&
              item.question.trim() &&
              typeof item.answer === "string" &&
              item.answer.trim()
          );
        } catch {
          throw new Error("内嵌 FAQ 必须是合法 JSON 数组");
        }
      }
      const pageConfig = {
        seo: {
          ...(formData.pageMetaTitle ? { metaTitle: formData.pageMetaTitle } : {}),
          ...(formData.pageMetaDescription
            ? { metaDescription: formData.pageMetaDescription }
            : {}),
          ...(formData.pageCanonicalUrl ? { canonicalUrl: formData.pageCanonicalUrl } : {}),
          ...(formData.pageNoindex ? { noindex: true } : {}),
          ...(formData.pageOgImage ? { ogImage: formData.pageOgImage } : {}),
        },
        content: {
          ...(formData.pageHeroIntro ? { heroIntro: formData.pageHeroIntro } : {}),
          ...(formData.pageSelectionReason
            ? { selectionReason: formData.pageSelectionReason }
            : {}),
          ...(formData.pageOverviewIntro || overviewDetails.length > 0
            ? {
                overview: {
                  ...(formData.pageOverviewIntro ? { intro: formData.pageOverviewIntro } : {}),
                  ...(overviewDetails.length > 0 ? { details: overviewDetails } : {}),
                },
              }
            : {}),
          ...(formData.pageFeaturesIntro || featuresList.length > 0
            ? {
                features: {
                  ...(formData.pageFeaturesIntro ? { intro: formData.pageFeaturesIntro } : {}),
                  ...(featuresList.length > 0 ? { items: featuresList } : {}),
                },
              }
            : {}),
          ...(formData.pageApplicationsIntro || applicationsList.length > 0
            ? {
                applications: {
                  ...(formData.pageApplicationsIntro
                    ? { intro: formData.pageApplicationsIntro }
                    : {}),
                  ...(applicationsList.length > 0 ? { items: applicationsList } : {}),
                },
              }
            : {}),
          ...(formData.pageSelectionGuideIntro || selectionGuideSteps.length > 0
            ? {
                selectionGuide: {
                  ...(formData.pageSelectionGuideIntro
                    ? { intro: formData.pageSelectionGuideIntro }
                    : {}),
                  ...(selectionGuideSteps.length > 0 ? { steps: selectionGuideSteps } : {}),
                },
              }
            : {}),
          ...(technicalNotes.length > 0 ? { technicalNotes } : {}),
        },
        longform: {
          ...(formData.pageLongformMarkdown ? { markdown: formData.pageLongformMarkdown } : {}),
        },
        conversion: {
          ...(formData.ctaPrimaryLabel ? { ctaPrimaryLabel: formData.ctaPrimaryLabel } : {}),
          ...(formData.ctaPrimaryHref ? { ctaPrimaryHref: formData.ctaPrimaryHref } : {}),
          ...(formData.ctaSecondaryLabel
            ? { ctaSecondaryLabel: formData.ctaSecondaryLabel }
            : {}),
          ...(formData.ctaSecondaryHref ? { ctaSecondaryHref: formData.ctaSecondaryHref } : {}),
          downloadsMode: formData.downloadsMode,
          ...(formData.pinnedDownloadIds.length > 0
            ? { pinnedDownloadIds: formData.pinnedDownloadIds }
            : {}),
        },
        seoBoost: {
          faqMode: formData.faqMode,
          ...(embeddedFaqItems && embeddedFaqItems.length > 0 ? { embeddedFaqItems } : {}),
        },
        linking: {
          ...(formData.relatedCategoryIds.length > 0
            ? { relatedCategoryIds: formData.relatedCategoryIds }
            : {}),
          ...(formData.relatedFamilyIds.length > 0
            ? { relatedFamilyIds: formData.relatedFamilyIds }
            : {}),
          ...(formData.relatedArticleIds.length > 0
            ? { relatedArticleIds: formData.relatedArticleIds }
            : {}),
        },
        display: {
          showOverview: formData.showOverview,
          showFeatures: formData.showFeatures,
          showApplications: formData.showApplications,
          showSelectionGuide: formData.showSelectionGuide,
          showTechnicalNote: formData.showTechnicalNote,
          showLongform: formData.showLongform,
          showDownloads: formData.showDownloads,
          showFaq: formData.showFaq,
          showRelatedLinks: formData.showRelatedLinks,
          showBottomCta: formData.showBottomCta,
        },
      };
      formDataToSend.append("pageConfig", JSON.stringify(pageConfig));

      if (isEdit && family) {
        formDataToSend.append("id", family._id);
        await updateProductFamilyAction(formDataToSend);
      } else {
        await createFamilyAction(formDataToSend);
      }

      router.push("/admin/families");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "操作失败，请重试");
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

      {/* Basic Information */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">基础信息</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              系列名称 <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：UK系列断路器"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Slug <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="family-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              所属分类 <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              品牌
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="品牌名称"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              排序
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">描述信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              摘要
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="系列摘要"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              详细内容
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="系列详细描述（支持 Markdown）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              系列级规格属性（JSON）
            </label>
            <textarea
              value={formData.attributes}
              onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
              rows={8}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 font-mono text-sm"
              placeholder={`{\n  "material": "copper",\n  "plating": "tin"\n}`}
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              系列共用规格写在这里，SKU 只需要填写与系列不同的部分。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              亮点特性（每行一个）
            </label>
            <textarea
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="亮点1&#10;亮点2&#10;亮点3"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">页面内容模型</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Hero Intro
            </label>
            <textarea
              value={formData.pageHeroIntro}
              onChange={(e) => setFormData({ ...formData, pageHeroIntro: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="用于详情页首屏摘要，优先于旧字段 summary。"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Selection Reason（分类页选型理由）
            </label>
            <textarea
              value={formData.pageSelectionReason}
              onChange={(e) => setFormData({ ...formData, pageSelectionReason: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="例如：Ideal for tight installation spaces."
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              用于分类页 series 卡片的一句话“为什么选这个系列”。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Overview Intro
            </label>
            <textarea
              value={formData.pageOverviewIntro}
              onChange={(e) => setFormData({ ...formData, pageOverviewIntro: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="Overview 首段摘要。不要与下方长文重复。"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Overview Details
            </label>
            <textarea
              value={formData.pageOverviewDetails}
              onChange={(e) => setFormData({ ...formData, pageOverviewDetails: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="每行一个段落，用于结构化 Overview。"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              SEO Longform Markdown
            </label>
            <textarea
              value={formData.pageLongformMarkdown}
              onChange={(e) => setFormData({ ...formData, pageLongformMarkdown: e.target.value })}
              rows={12}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 font-mono text-sm"
              placeholder={`## What Are Angled Blade Terminals\n\nExplain the family in depth.\n\n## Key Design Characteristics\n\n- Characteristic 1\n- Characteristic 2\n\n## Typical Applications\n\n## How to Select the Right Terminal\n\n## Installation Considerations`}
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              用于 SEO 长文主内容。不要重复 Overview、Features、Applications 已表达的信息。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Features Intro
              </label>
              <textarea
                value={formData.pageFeaturesIntro}
                onChange={(e) => setFormData({ ...formData, pageFeaturesIntro: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                placeholder="特性区导语。"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Features List
              </label>
              <textarea
                value={formData.pageFeaturesList}
                onChange={(e) => setFormData({ ...formData, pageFeaturesList: e.target.value })}
                rows={5}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                placeholder="每行一个特性。"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Applications Intro
              </label>
              <textarea
                value={formData.pageApplicationsIntro}
                onChange={(e) => setFormData({ ...formData, pageApplicationsIntro: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                placeholder="应用区导语。"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Applications List
              </label>
              <textarea
                value={formData.pageApplicationsList}
                onChange={(e) => setFormData({ ...formData, pageApplicationsList: e.target.value })}
                rows={5}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  placeholder="每行一个应用场景。"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Selection Guide Intro
                </label>
                <textarea
                  value={formData.pageSelectionGuideIntro}
                  onChange={(e) =>
                    setFormData({ ...formData, pageSelectionGuideIntro: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  placeholder="选型区导语。"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Selection Guide Steps
                </label>
                <textarea
                  value={formData.pageSelectionGuideSteps}
                  onChange={(e) =>
                    setFormData({ ...formData, pageSelectionGuideSteps: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  placeholder="每行一个选型步骤。"
                />
              </div>
            </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Technical Notes
            </label>
            <textarea
              value={formData.pageTechnicalNotes}
              onChange={(e) => setFormData({ ...formData, pageTechnicalNotes: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              placeholder="每行一条技术说明，例如安装限制、材质提示、认证边界。"
            />
          </div>
        </div>
      </div>

      {/* Visual Media */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">视觉媒体</h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          系列主图可手动指定；若留空，前台会回退到 product 类型第一张图。产品图首张仍会同步到旧字段 `heroImage` 以兼容历史数据。
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            系列主图（手动，选填）
          </label>
          <input
            type="url"
            value={formData.manualHeroImage}
            onChange={(e) =>
              setFormData({
                ...formData,
                manualHeroImage: e.target.value,
              })
            }
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            placeholder="https://example.com/family-hero.jpg"
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            不填写时将自动回退到下方 product 类型图片的第一张。
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            系列主图 Alt（选填）
          </label>
          <input
            type="text"
            value={formData.manualHeroImageAlt}
            onChange={(e) =>
              setFormData({
                ...formData,
                manualHeroImageAlt: e.target.value,
              })
            }
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            placeholder="例如：Angled blade terminals family hero image"
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            仅用于手动主图；不填写则回退到媒体 alt 或系列名称。
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {([
            ["product", "产品图"],
            ["dimension", "尺寸图"],
            ["packaging", "包装图"],
            ["application", "应用图"],
          ] as const).map(([type, label]) => (
            <div key={type}>
              <AdminImageListField
                label={label}
                values={mediaState[type]}
                onChange={(values) =>
                  setMediaState((current) => ({
                    ...current,
                    [type]: values,
                  }))
                }
                helperText={type === "product" ? "首张产品图会同步为旧字段 heroImage。" : undefined}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">状态设置</h2>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            状态
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "draft" | "published" | "archived",
              })
            }
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>
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

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">页面 SEO 与 CTA</h2>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Page Meta Title
              </label>
              <input
                type="text"
                value={formData.pageMetaTitle}
                onChange={(e) => setFormData({ ...formData, pageMetaTitle: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Page Canonical URL
              </label>
              <input
                type="url"
                value={formData.pageCanonicalUrl}
                onChange={(e) => setFormData({ ...formData, pageCanonicalUrl: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Page Meta Description
            </label>
            <textarea
              value={formData.pageMetaDescription}
              onChange={(e) => setFormData({ ...formData, pageMetaDescription: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                OG Image
              </label>
              <input
                type="url"
                value={formData.pageOgImage}
                onChange={(e) => setFormData({ ...formData, pageOgImage: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={formData.pageNoindex}
                onChange={(e) => setFormData({ ...formData, pageNoindex: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              noindex
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Primary CTA
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.ctaPrimaryLabel}
                  onChange={(e) => setFormData({ ...formData, ctaPrimaryLabel: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  placeholder="按钮文案"
                />
                <input
                  type="text"
                  value={formData.ctaPrimaryHref}
                  onChange={(e) => setFormData({ ...formData, ctaPrimaryHref: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  placeholder="/rfq"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Secondary CTA
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.ctaSecondaryLabel}
                  onChange={(e) => setFormData({ ...formData, ctaSecondaryLabel: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  placeholder="按钮文案"
                />
                <input
                  type="text"
                  value={formData.ctaSecondaryHref}
                  onChange={(e) => setFormData({ ...formData, ctaSecondaryHref: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  placeholder="/contact"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Downloads Mode
            </label>
            <select
              value={formData.downloadsMode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  downloadsMode: e.target.value as "auto" | "manual",
                })
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="auto">auto</option>
              <option value="manual">manual</option>
            </select>
          </div>

          {formData.downloadsMode === "manual" && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  选择下载资源
                </label>
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
                  {publicAssets.map((asset) => (
                    <label key={asset._id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.pinnedDownloadIds.includes(asset._id)}
                        onChange={() => togglePinnedDownload(asset._id)}
                        className="rounded border-zinc-300 dark:border-zinc-700"
                      />
                      <span>
                        {asset.title}
                        <span className="text-zinc-500"> ({asset.type}{asset.language ? `, ${asset.language}` : ""})</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  仅显示公开资源。勾选后会按下方顺序在 family 页展示。
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  已选资源顺序
                </label>
                <div className="space-y-2">
                  {formData.pinnedDownloadIds.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                      当前未选择资源。
                    </div>
                  ) : (
                    formData.pinnedDownloadIds.map((assetId, index) => {
                      const asset = publicAssets.find((item) => item._id === assetId);
                      if (!asset) return null;
                      return (
                        <div
                          key={assetId}
                          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="min-w-0 text-sm">
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                              {index + 1}. {asset.title}
                            </div>
                            <div className="text-zinc-500 dark:text-zinc-400">
                              {asset.type}{asset.language ? ` · ${asset.language}` : ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => movePinnedDownload(assetId, -1)}
                              disabled={index === 0}
                              className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
                            >
                              上移
                            </button>
                            <button
                              type="button"
                              onClick={() => movePinnedDownload(assetId, 1)}
                              disabled={index === formData.pinnedDownloadIds.length - 1}
                              className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
                            >
                              下移
                            </button>
                            <button
                              type="button"
                              onClick={() => togglePinnedDownload(assetId)}
                              className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 dark:border-rose-800 dark:text-rose-300"
                            >
                              移除
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">FAQ 与内链</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              FAQ Mode
            </label>
            <select
              value={formData.faqMode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  faqMode: e.target.value as "relation" | "embedded" | "mixed",
                })
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="relation">relation</option>
              <option value="embedded">embedded</option>
              <option value="mixed">mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Embedded FAQ Items (JSON)
            </label>
            <textarea
              value={formData.embeddedFaqItems}
              onChange={(e) => setFormData({ ...formData, embeddedFaqItems: e.target.value })}
              rows={8}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 font-mono text-sm"
              placeholder={`[\n  {\n    "question": "How do I choose this series?",\n    "answer": "Start with current, wire range, and installation constraints."\n  }\n]`}
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              当 FAQ Mode 为 `embedded` 或 `mixed` 时生效。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              关联分类
            </label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
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
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
              {families
                .filter((item) => item._id !== family?._id)
                .map((item) => (
                  <label key={item._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.relatedFamilyIds.includes(item._id)}
                      onChange={() => toggleArrayItem(item._id, "relatedFamilyIds")}
                      className="rounded border-zinc-300 dark:border-zinc-700"
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              关联文章
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
              {articles
                .filter((item) => item.type !== "faq")
                .map((item) => (
                  <label key={item._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.relatedArticleIds.includes(item._id)}
                      onChange={() => toggleArrayItem(item._id, "relatedArticleIds")}
                      className="rounded border-zinc-300 dark:border-zinc-700"
                    />
                    <span>
                      {item.title} <span className="text-zinc-500">({item.type})</span>
                    </span>
                  </label>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">显示控制</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {([
            ["showOverview", "显示 Overview"],
            ["showFeatures", "显示 Features"],
            ["showApplications", "显示 Applications"],
            ["showSelectionGuide", "显示 Selection Guide"],
            ["showTechnicalNote", "显示 Technical Note"],
            ["showLongform", "显示 SEO Longform"],
            ["showDownloads", "显示 Downloads"],
            ["showFaq", "显示 FAQ"],
            ["showRelatedLinks", "显示 Related Links"],
            ["showBottomCta", "显示 Bottom CTA"],
          ] as const).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <input
                type="checkbox"
                checked={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              {label}
            </label>
          ))}
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
          {isLoading ? "保存中..." : isEdit ? "保存更改" : "创建系列"}
        </button>
      </div>
    </form>
  );
}
