import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { Plus, Edit2, Eye, Package, Search, X } from "lucide-react";
import Link from "next/link";

interface ProductsPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

function normalizeSearchValue(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireAdmin();
  const { products, categories, families } = await loadAdminData();
  const params = (await searchParams) ?? {};
  const keyword = params.q?.trim() ?? "";
  const normalizedKeyword = normalizeSearchValue(keyword);

  // 创建映射以便显示
  const categoryMap = new Map(categories.map((c) => [c._id, c.name]));
  const familyMap = new Map(families.map((f) => [f._id, f.name]));
  const filteredProducts = normalizedKeyword
    ? products.filter((product) => {
        const categoryName = categoryMap.get(product.categoryId) ?? "";
        const familyName = familyMap.get(product.familyId) ?? "";
        const haystack = [
          product.skuCode,
          product.model,
          product.title,
          product.slug,
          product.status,
          categoryName,
          familyName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedKeyword);
      })
    : products;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">产品管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">管理产品 SKU 信息</p>
          </div>
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新建产品
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总产品数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{products.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已发布</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {products.filter((p) => p.status === "published").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">特色产品</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {products.filter((p) => p.isFeatured).length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">草稿</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {products.filter((p) => p.status === "draft").length}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <form className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative w-full max-w-2xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={keyword}
                  placeholder="搜索 SKU、型号、产品名、Slug、分类或系列"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                查询
              </button>
              {keyword ? (
                <Link
                  href="/admin/products"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                  清空
                </Link>
              ) : null}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {keyword
                ? `当前显示 ${filteredProducts.length} / ${products.length} 条结果`
                : `当前共 ${products.length} 条产品记录`}
            </p>
          </form>
        </div>

        {/* Products Table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">产品列表</h3>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {keyword ? "没有匹配的产品" : "暂无产品"}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {keyword ? `请尝试更换关键词“${keyword}”后重新查询` : '点击"新建产品"创建第一个产品'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      型号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      产品名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      系列
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      状态
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="hover:underline"
                        >
                          {product.skuCode}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {product.model}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                        >
                          {product.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {categoryMap.get(product.categoryId) || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {familyMap.get(product.familyId) || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          product.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : product.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-200 transition-colors"
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-200 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
