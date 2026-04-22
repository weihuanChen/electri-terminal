"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  updateCategoryAction,
} from "../actions";
import { AdminImageField } from "./ui/AdminImageField";

type CategoryTypesOverviewItem = {
  name: string;
  description?: string;
  link?: string;
};

type CategoryFeaturedFamilyItem = {
  familyId?: string;
  name: string;
  description?: string;
  image?: string;
  link: string;
};

type CategoryEmbeddedFaqItem = {
  question: string;
  answer: string;
};

type CategoryPageConfig = {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    noindex?: boolean;
    ogImage?: string;
  };
  content?: {
    summary?: string;
    heroIntro?: string;
    overview?: {
      intro?: string;
      keyPoints?: string[];
    };
    typesOverview?: CategoryTypesOverviewItem[];
    applications?: {
      intro?: string;
      items?: string[];
    };
    selectionGuide?: {
      intro?: string;
      steps?: string[];
    };
    featuredFamilies?: CategoryFeaturedFamilyItem[];
  };
  seoBoost?: {
    faqMode?: "relation" | "embedded" | "mixed";
    embeddedFaqItems?: CategoryEmbeddedFaqItem[];
  };
  display?: {
    collapsedFilterGroupKeys?: string[];
  };
};

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  icon?: string;
  sortOrder: number;
  status: "draft" | "published" | "archived";
  templateKey?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  isVisibleInNav: boolean;
  path?: string;
  level?: number;
  pageConfig?: CategoryPageConfig;
}

interface FamilyOption {
  _id: string;
  name: string;
  slug: string;
  summary?: string;
  heroImage?: string;
  sortOrder: number;
  status: "draft" | "published" | "archived";
}

interface CategoryFormProps {
  category?: Category;
  categories?: Category[];
  families?: FamilyOption[];
}

function arrayToLines(items?: string[]) {
  return items?.length ? items.join("\n") : "";
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function jsonToEditorValue(value: unknown) {
  if (!value) return "";
  return JSON.stringify(value, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveFamilySlugFromLink(link?: string) {
  if (!link?.trim()) return undefined;
  const match = link.match(/\/families\/([^/?#]+)/);
  return match?.[1];
}

export function CategoryForm({ category, categories = [], families = [] }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = !!category;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const availableFamilies = [...families].sort(
    (left, right) =>
      (left.status === "published" ? -1 : 1) - (right.status === "published" ? -1 : 1) ||
      left.sortOrder - right.sortOrder ||
      left.name.localeCompare(right.name)
  );
  const familyById = new Map(families.map((family) => [family._id, family]));
  const familyBySlug = new Map(families.map((family) => [family.slug, family]));
  const initialFeaturedFamilyIds = Array.from(
    new Set(
      (category?.pageConfig?.content?.featuredFamilies || [])
        .map((item) => {
          if (item.familyId && familyById.has(item.familyId)) {
            return item.familyId;
          }
          const slug = resolveFamilySlugFromLink(item.link);
          return slug ? familyBySlug.get(slug)?._id : undefined;
        })
        .filter((id): id is string => Boolean(id))
    )
  );

  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    parentId: category?.parentId || "",
    description: category?.description || "",
    shortDescription: category?.shortDescription || "",
    image: category?.image || "",
    icon: category?.icon || "",
    sortOrder: category?.sortOrder || 0,
    status: category?.status || "draft",
    templateKey: category?.templateKey || "",
    seoTitle: category?.seoTitle || "",
    seoDescription: category?.seoDescription || "",
    canonical: category?.canonical || "",
    isVisibleInNav: category?.isVisibleInNav !== undefined ? category.isVisibleInNav : true,
    pageSummary: category?.pageConfig?.content?.summary || "",
    pageHeroIntro: category?.pageConfig?.content?.heroIntro || "",
    pageOverviewIntro: category?.pageConfig?.content?.overview?.intro || "",
    pageOverviewKeyPoints: arrayToLines(category?.pageConfig?.content?.overview?.keyPoints),
    pageTypesOverviewJson: jsonToEditorValue(category?.pageConfig?.content?.typesOverview),
    pageApplicationsIntro: category?.pageConfig?.content?.applications?.intro || "",
    pageApplicationsItems: arrayToLines(category?.pageConfig?.content?.applications?.items),
    pageSelectionGuideIntro: category?.pageConfig?.content?.selectionGuide?.intro || "",
    pageSelectionGuideSteps: arrayToLines(category?.pageConfig?.content?.selectionGuide?.steps),
    pageCollapsedFilterGroupKeys: arrayToLines(
      category?.pageConfig?.display?.collapsedFilterGroupKeys
    ),
    pageFeaturedFamilyIds: initialFeaturedFamilyIds,
    pageEmbeddedFaqItemsJson: jsonToEditorValue(category?.pageConfig?.seoBoost?.embeddedFaqItems),
    pageMetaTitle: category?.pageConfig?.seo?.metaTitle || "",
    pageMetaDescription: category?.pageConfig?.seo?.metaDescription || "",
    pageCanonicalUrl: category?.pageConfig?.seo?.canonicalUrl || "",
    pageNoindex: category?.pageConfig?.seo?.noindex || false,
    pageOgImage: category?.pageConfig?.seo?.ogImage || "",
  });

  const parseJsonArray = <T,>(raw: string, fieldName: string): T[] | undefined => {
    if (!raw.trim()) return undefined;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        throw new Error(`${fieldName} 必须是 JSON 数组`);
      }
      return parsed as T[];
    } catch (cause) {
      throw new Error(
        cause instanceof Error && cause.message
          ? `${fieldName} 格式错误：${cause.message}`
          : `${fieldName} 格式错误`
      );
    }
  };

  const parseTypesOverview = (raw: string) => {
    const items = parseJsonArray<unknown>(raw, "Types Overview");
    if (!items) return undefined;
    return items.map((item, index) => {
      if (!isRecord(item) || typeof item.name !== "string" || !item.name.trim()) {
        throw new Error(
          `Types Overview 第 ${index + 1} 项必须包含 name（字符串）`
        );
      }

      return {
        name: item.name.trim(),
        ...(typeof item.description === "string" && item.description.trim()
          ? { description: item.description.trim() }
          : {}),
        ...(typeof item.link === "string" && item.link.trim()
          ? { link: item.link.trim() }
          : {}),
      } satisfies CategoryTypesOverviewItem;
    });
  };

  const parseEmbeddedFaqItems = (raw: string) => {
    const items = parseJsonArray<unknown>(raw, "Embedded FAQ");
    if (!items) return undefined;
    return items.map((item, index) => {
      if (!isRecord(item)) {
        throw new Error(
          `Embedded FAQ 第 ${index + 1} 项必须是对象，示例：{"question":"...","answer":"..."}`
        );
      }
      if (typeof item.question !== "string" || !item.question.trim()) {
        throw new Error(`Embedded FAQ 第 ${index + 1} 项缺少 question`);
      }
      if (typeof item.answer !== "string" || !item.answer.trim()) {
        throw new Error(`Embedded FAQ 第 ${index + 1} 项缺少 answer`);
      }

      return {
        question: item.question.trim(),
        answer: item.answer.trim(),
      } satisfies CategoryEmbeddedFaqItem;
    });
  };

  const toggleFeaturedFamily = (familyId: string) => {
    setFormData((current) => ({
      ...current,
      pageFeaturedFamilyIds: current.pageFeaturedFamilyIds.includes(familyId)
        ? current.pageFeaturedFamilyIds.filter((item) => item !== familyId)
        : [...current.pageFeaturedFamilyIds, familyId],
    }));
  };

  const buildPageConfig = () => {
    const overviewKeyPoints = parseLines(formData.pageOverviewKeyPoints);
    const applicationsItems = parseLines(formData.pageApplicationsItems);
    const selectionGuideSteps = parseLines(formData.pageSelectionGuideSteps);
    const collapsedFilterGroupKeys = parseLines(formData.pageCollapsedFilterGroupKeys);

    const typesOverview = parseTypesOverview(formData.pageTypesOverviewJson);
    const featuredFamilies = formData.pageFeaturedFamilyIds
      .map((familyId) => familyById.get(familyId))
      .filter((family): family is FamilyOption => Boolean(family))
      .map((family) => ({
        familyId: family._id,
        name: family.name,
        link: `/families/${family.slug}`,
        ...(family.summary?.trim() ? { description: family.summary.trim() } : {}),
        ...(family.heroImage?.trim() ? { image: family.heroImage.trim() } : {}),
      }));
    const embeddedFaqItems = parseEmbeddedFaqItems(formData.pageEmbeddedFaqItemsJson);

    const content = {
      ...(formData.pageSummary.trim() ? { summary: formData.pageSummary.trim() } : {}),
      ...(formData.pageHeroIntro.trim() ? { heroIntro: formData.pageHeroIntro.trim() } : {}),
      ...((formData.pageOverviewIntro.trim() || overviewKeyPoints.length > 0)
        ? {
            overview: {
              ...(formData.pageOverviewIntro.trim()
                ? { intro: formData.pageOverviewIntro.trim() }
                : {}),
              ...(overviewKeyPoints.length > 0 ? { keyPoints: overviewKeyPoints } : {}),
            },
          }
        : {}),
      ...(typesOverview?.length ? { typesOverview } : {}),
      ...((formData.pageApplicationsIntro.trim() || applicationsItems.length > 0)
        ? {
            applications: {
              ...(formData.pageApplicationsIntro.trim()
                ? { intro: formData.pageApplicationsIntro.trim() }
                : {}),
              ...(applicationsItems.length > 0 ? { items: applicationsItems } : {}),
            },
          }
        : {}),
      ...((formData.pageSelectionGuideIntro.trim() || selectionGuideSteps.length > 0)
        ? {
            selectionGuide: {
              ...(formData.pageSelectionGuideIntro.trim()
                ? { intro: formData.pageSelectionGuideIntro.trim() }
                : {}),
              ...(selectionGuideSteps.length > 0 ? { steps: selectionGuideSteps } : {}),
            },
          }
        : {}),
      ...(featuredFamilies?.length ? { featuredFamilies } : {}),
    };

    const seo = {
      ...(formData.pageMetaTitle.trim() ? { metaTitle: formData.pageMetaTitle.trim() } : {}),
      ...(formData.pageMetaDescription.trim()
        ? { metaDescription: formData.pageMetaDescription.trim() }
        : {}),
      ...(formData.pageCanonicalUrl.trim()
        ? { canonicalUrl: formData.pageCanonicalUrl.trim() }
        : {}),
      ...(formData.pageNoindex ? { noindex: true } : {}),
      ...(formData.pageOgImage.trim() ? { ogImage: formData.pageOgImage.trim() } : {}),
    };

    const seoBoost = {
      ...(embeddedFaqItems?.length ? { faqMode: "mixed" as const, embeddedFaqItems } : {}),
    };

    const display = {
      ...(collapsedFilterGroupKeys.length > 0
        ? { collapsedFilterGroupKeys }
        : {}),
    };

    const pageConfig = {
      ...(Object.keys(seo).length > 0 ? { seo } : {}),
      ...(Object.keys(content).length > 0 ? { content } : {}),
      ...(Object.keys(seoBoost).length > 0 ? { seoBoost } : {}),
      ...(Object.keys(display).length > 0 ? { display } : {}),
    };

    return Object.keys(pageConfig).length > 0 ? pageConfig : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const pageConfig = buildPageConfig();
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "parentId" && !value) return;
        if (key.startsWith("page")) return;
        formDataToSend.append(key, value.toString());
      });
      if (pageConfig) {
        formDataToSend.append("pageConfig", JSON.stringify(pageConfig));
      } else if (category?.pageConfig) {
        formDataToSend.append("pageConfig", "{}");
      }

      if (isEdit && category) {
        formDataToSend.append("id", category._id);
        await updateCategoryAction(formDataToSend);
      } else {
        await createCategoryAction(formDataToSend);
      }

      router.push("/admin/categories");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "操作失败，请重试");
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
              名称 <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="例如：Terminal Blocks"
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
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="例如：terminal-blocks"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              父级分类
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="">无（顶级分类）</option>
              {categories
                .filter((c) => c._id !== category?._id) // 不能选择自己作为父级
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.path}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              排序
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              状态
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Category["status"],
                })
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isVisibleInNav}
                onChange={(e) => setFormData({ ...formData, isVisibleInNav: e.target.checked })}
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                在导航中显示
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">描述信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              简短描述
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="简短的分类描述"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              详细描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="详细的分类描述"
            />
          </div>
        </div>
      </div>

      {/* SubCategory Page Content */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          SubCategory 页面内容
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          以下字段会写入 `pageConfig`，用于分类级 SEO 页面内容。
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Summary（关键词锚点）
            </label>
            <textarea
              value={formData.pageSummary}
              onChange={(e) => setFormData({ ...formData, pageSummary: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="例如：Insulated ring terminals and copper ring terminals..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Hero Intro
            </label>
            <textarea
              value={formData.pageHeroIntro}
              onChange={(e) => setFormData({ ...formData, pageHeroIntro: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="分类级介绍文案，延续首页语气。"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Overview Intro
            </label>
            <textarea
              value={formData.pageOverviewIntro}
              onChange={(e) => setFormData({ ...formData, pageOverviewIntro: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="说明该 subCategory 是什么、为什么存在、与相邻类型区别。"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Overview Key Points（每行一条）
            </label>
            <textarea
              value={formData.pageOverviewKeyPoints}
              onChange={(e) => setFormData({ ...formData, pageOverviewKeyPoints: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder={"闭环结构可减少振动滑脱\n绝缘与非绝缘版本适配不同工况"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Types Overview（JSON 数组）
            </label>
            <textarea
              value={formData.pageTypesOverviewJson}
              onChange={(e) => setFormData({ ...formData, pageTypesOverviewJson: e.target.value })}
              rows={8}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder={`[\n  {\n    "name": "PVC Insulated",\n    "description": "Standard insulation for general wiring",\n    "link": "/categories/ring-terminals?p=PVC"\n  }\n]`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Applications Intro
            </label>
            <textarea
              value={formData.pageApplicationsIntro}
              onChange={(e) => setFormData({ ...formData, pageApplicationsIntro: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="应用场景导语。"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Applications Items（每行一条）
            </label>
            <textarea
              value={formData.pageApplicationsItems}
              onChange={(e) => setFormData({ ...formData, pageApplicationsItems: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder={"Control panel wiring\nAutomotive harness grounding"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Selection Guide Intro
            </label>
            <textarea
              value={formData.pageSelectionGuideIntro}
              onChange={(e) => setFormData({ ...formData, pageSelectionGuideIntro: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="选型导语。"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Selection Guide Steps（每行一条）
            </label>
            <textarea
              value={formData.pageSelectionGuideSteps}
              onChange={(e) => setFormData({ ...formData, pageSelectionGuideSteps: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder={"Match wire gauge\nConfirm stud hole size\nCheck insulation requirement"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              默认折叠筛选器（每行一项）
            </label>
            <textarea
              value={formData.pageCollapsedFilterGroupKeys}
              onChange={(e) =>
                setFormData({ ...formData, pageCollapsedFilterGroupKeys: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder={"pcs\nt"}
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              支持填 filter group 的 id 或 label；用于前台默认折叠，降低视觉压力。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Featured Families（勾选）
            </label>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
              {availableFamilies.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">暂无可选 family。</p>
              ) : (
                availableFamilies.map((family) => (
                  <label key={family._id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.pageFeaturedFamilyIds.includes(family._id)}
                      onChange={() => toggleFeaturedFamily(family._id)}
                      className="mt-1 rounded border-zinc-300 dark:border-zinc-700"
                    />
                    <span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {family.name}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {" "}
                        ({family.slug} · {family.status})
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              已选 {formData.pageFeaturedFamilyIds.length} 项，保存时会自动生成 `name/link/description/image`。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Embedded FAQ（JSON 数组）
            </label>
            <textarea
              value={formData.pageEmbeddedFaqItemsJson}
              onChange={(e) => setFormData({ ...formData, pageEmbeddedFaqItemsJson: e.target.value })}
              rows={6}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder={`[\n  {\n    "question": "What is the difference between PVC and nylon insulation?",\n    "answer": "Nylon usually provides better abrasion and heat resistance."\n  }\n]`}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Page Meta Title
              </label>
              <input
                type="text"
                value={formData.pageMetaTitle}
                onChange={(e) => setFormData({ ...formData, pageMetaTitle: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="SubCategory 页面 SEO 标题"
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
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="https://..."
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
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="SubCategory 页面 SEO 描述"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Page OG Image
              </label>
              <input
                type="url"
                value={formData.pageOgImage}
                onChange={(e) => setFormData({ ...formData, pageOgImage: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  checked={formData.pageNoindex}
                  onChange={(e) => setFormData({ ...formData, pageNoindex: e.target.checked })}
                  className="rounded border-zinc-300 dark:border-zinc-700"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Page Noindex
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">图片</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              图标 URL
            </label>
            <input
              type="url"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div className="md:col-span-2">
            <AdminImageField
              label="分类图片"
              value={formData.image}
              onChange={(value) => setFormData({ ...formData, image: value })}
              helperText="用于分类卡片、分类页头图等展示位。"
              placeholder="支持 /images/category.jpg 或 https://example.com/category.jpg"
            />
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
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="页面标题"
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
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="页面描述"
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
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="https://..."
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
          {isLoading ? "保存中..." : isEdit ? "保存更改" : "创建分类"}
        </button>
      </div>
    </form>
  );
}
