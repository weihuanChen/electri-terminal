import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { Plus, Folder } from "lucide-react";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";
import { CategoryTree, CategoryTreeNode } from "../components/CategoryTree";

// 构建树形结构的辅助函数
function buildCategoryTree(categories: Doc<"categories">[]) {
  const map = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // 初始化所有节点
  categories.forEach((cat) => {
    map.set(cat._id, { ...cat, children: [] });
  });

  // 构建树形结构
  categories.forEach((cat) => {
    const node = map.get(cat._id);
    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default async function CategoriesPage() {
  await requireAdmin();
  const { categories } = await loadAdminData();
  const categoryTree = buildCategoryTree(categories);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">分类管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">管理产品分类层级结构</p>
          </div>
          <Link
            href="/admin/categories/create"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新建分类
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总分类数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{categories.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已发布</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {categories.filter((c) => c.status === "published").length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">草稿</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {categories.filter((c) => c.status === "draft").length}
            </p>
          </div>
        </div>

        {/* Category Tree */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">分类层级</h3>
          </div>

          {categoryTree.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Folder className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">暂无分类</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                点击&quot;新建分类&quot;创建第一个分类
              </p>
            </div>
          ) : (
            <CategoryTree categories={categoryTree} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
