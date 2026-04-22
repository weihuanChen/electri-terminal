import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ArticleForm } from "../../components/ArticleForm";

export default async function CreateArticlePage() {
  await requireAdmin();
  const { categories, families, products } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">新建文章</h1>
          <p className="text-zinc-600 dark:text-zinc-400">创建新文章</p>
        </div>
        <ArticleForm categories={categories} families={families} products={products} />
      </div>
    </DashboardLayout>
  );
}
