"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link2, Save } from "lucide-react";
import { updateAssetRelationsAction, updateFaqRelationsAction } from "../actions";

interface NamedEntity {
  _id: string;
  name?: string;
  title?: string;
}

interface AssetRelation {
  entityType: "category" | "family" | "product";
  entityId: string;
  sortOrder: number;
}

interface AssetRecord {
  _id: string;
  title: string;
  type: string;
  isPublic: boolean;
  relations?: AssetRelation[];
}

interface FaqRecord {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  categoryIds?: string[];
  relatedCategoryIds?: string[];
  relatedFamilyIds?: string[];
  relatedProductIds?: string[];
}

interface RelationsManagerProps {
  assets: AssetRecord[];
  faqs: FaqRecord[];
  categories: NamedEntity[];
  families: NamedEntity[];
  products: NamedEntity[];
}

function CheckboxGroup({
  items,
  selectedIds,
  onToggle,
  labelKey = "name",
}: {
  items: NamedEntity[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  labelKey?: "name" | "title";
}) {
  return (
    <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
      {items.map((item) => (
        <label key={item._id} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={selectedIds.includes(item._id)}
            onChange={() => onToggle(item._id)}
          />
          <span>{item[labelKey] || item.name || item.title}</span>
        </label>
      ))}
    </div>
  );
}

function toggleId(selectedIds: string[], id: string) {
  return selectedIds.includes(id)
    ? selectedIds.filter((item) => item !== id)
    : [...selectedIds, id];
}

export function RelationsManager({
  assets,
  faqs,
  categories,
  families,
  products,
}: RelationsManagerProps) {
  const router = useRouter();
  const [assetState, setAssetState] = useState<Record<string, AssetRelation[]>>(
    Object.fromEntries(
      assets.map((asset) => [
        asset._id,
        (asset.relations || []).map((relation, index) => ({
          entityType: relation.entityType,
          entityId: relation.entityId,
          sortOrder: relation.sortOrder ?? index,
        })),
      ])
    )
  );
  const [faqState, setFaqState] = useState<
    Record<
      string,
      {
        categoryIds: string[];
        relatedCategoryIds: string[];
        relatedFamilyIds: string[];
        relatedProductIds: string[];
      }
    >
  >(
    Object.fromEntries(
      faqs.map((faq) => [
        faq._id,
        {
          categoryIds: faq.categoryIds || [],
          relatedCategoryIds: faq.relatedCategoryIds || [],
          relatedFamilyIds: faq.relatedFamilyIds || [],
          relatedProductIds: faq.relatedProductIds || [],
        },
      ])
    )
  );
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");

  const selectedIdsForAsset = (assetId: string, entityType: AssetRelation["entityType"]) =>
    (assetState[assetId] || [])
      .filter((relation) => relation.entityType === entityType)
      .map((relation) => relation.entityId);

  const toggleAssetRelation = (
    assetId: string,
    entityType: AssetRelation["entityType"],
    entityId: string
  ) => {
    setAssetState((current) => {
      const existing = current[assetId] || [];
      const filtered = existing.filter(
        (relation) => !(relation.entityType === entityType && relation.entityId === entityId)
      );
      const alreadySelected = existing.length !== filtered.length;
      const next = alreadySelected
        ? filtered
        : [...filtered, { entityType, entityId, sortOrder: filtered.length }];

      return {
        ...current,
        [assetId]: next.map((relation, index) => ({
          ...relation,
          sortOrder: index,
        })),
      };
    });
  };

  const toggleFaqRelation = (
    articleId: string,
    key: "categoryIds" | "relatedCategoryIds" | "relatedFamilyIds" | "relatedProductIds",
    entityId: string
  ) => {
    setFaqState((current) => ({
      ...current,
      [articleId]: {
        ...current[articleId],
        [key]: toggleId(current[articleId][key], entityId),
      },
    }));
  };

  const handleSaveAsset = async (assetId: string) => {
    setSavingKey(`asset:${assetId}`);
    setError("");

    try {
      const payload = new FormData();
      payload.append("assetId", assetId);
      payload.append("relations", JSON.stringify(assetState[assetId] || []));
      await updateAssetRelationsAction(payload);
      router.refresh();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "资源关联保存失败");
    } finally {
      setSavingKey("");
    }
  };

  const handleSaveFaq = async (articleId: string) => {
    setSavingKey(`faq:${articleId}`);
    setError("");

    try {
      const payload = new FormData();
      payload.append("articleId", articleId);
      payload.append("categoryIds", JSON.stringify(faqState[articleId].categoryIds));
      payload.append(
        "relatedCategoryIds",
        JSON.stringify(faqState[articleId].relatedCategoryIds)
      );
      payload.append("relatedFamilyIds", JSON.stringify(faqState[articleId].relatedFamilyIds));
      payload.append("relatedProductIds", JSON.stringify(faqState[articleId].relatedProductIds));
      await updateFaqRelationsAction(payload);
      router.refresh();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "FAQ 关联保存失败");
    } finally {
      setSavingKey("");
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">FAQ 关联</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              FAQ 文章通过分类、系列、产品关系决定前台出现在哪些页面。
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq._id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{faq.title}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        faq.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : faq.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {faq.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">slug: {faq.slug}</p>
                </div>
                <Link
                  href={`/admin/articles/${faq._id}/edit`}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <Link2 className="h-4 w-4" />
                  打开文章编辑
                </Link>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">所属分类</p>
                  <CheckboxGroup
                    items={categories}
                    selectedIds={faqState[faq._id].categoryIds}
                    onToggle={(id) => toggleFaqRelation(faq._id, "categoryIds", id)}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">关联分类</p>
                  <CheckboxGroup
                    items={categories}
                    selectedIds={faqState[faq._id].relatedCategoryIds}
                    onToggle={(id) => toggleFaqRelation(faq._id, "relatedCategoryIds", id)}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">关联系列</p>
                  <CheckboxGroup
                    items={families}
                    selectedIds={faqState[faq._id].relatedFamilyIds}
                    onToggle={(id) => toggleFaqRelation(faq._id, "relatedFamilyIds", id)}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">关联产品</p>
                  <CheckboxGroup
                    items={products}
                    selectedIds={faqState[faq._id].relatedProductIds}
                    onToggle={(id) => toggleFaqRelation(faq._id, "relatedProductIds", id)}
                    labelKey="title"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveFaq(faq._id)}
                  disabled={savingKey === `faq:${faq._id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {savingKey === `faq:${faq._id}` ? "保存中..." : "保存 FAQ 关联"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">资源关联</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            资源文件挂到分类、系列、产品后，前台会自动出现在对应下载区块。
          </p>
        </div>

        <div className="space-y-4">
          {assets.map((asset) => (
            <div key={asset._id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{asset.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {asset.type}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        asset.isPublic
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {asset.isPublic ? "public" : "private"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">挂载分类</p>
                  <CheckboxGroup
                    items={categories}
                    selectedIds={selectedIdsForAsset(asset._id, "category")}
                    onToggle={(id) => toggleAssetRelation(asset._id, "category", id)}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">挂载系列</p>
                  <CheckboxGroup
                    items={families}
                    selectedIds={selectedIdsForAsset(asset._id, "family")}
                    onToggle={(id) => toggleAssetRelation(asset._id, "family", id)}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">挂载产品</p>
                  <CheckboxGroup
                    items={products}
                    selectedIds={selectedIdsForAsset(asset._id, "product")}
                    onToggle={(id) => toggleAssetRelation(asset._id, "product", id)}
                    labelKey="title"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAsset(asset._id)}
                  disabled={savingKey === `asset:${asset._id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {savingKey === `asset:${asset._id}` ? "保存中..." : "保存资源关联"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
