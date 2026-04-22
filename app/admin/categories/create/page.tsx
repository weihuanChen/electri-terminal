import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { CategoryForm } from "../../components/CategoryForm";

export default async function CreateCategoryPage() {
  await requireAdmin();
  const { categories, families } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">创建分类</h1>
          <p className="text-zinc-600 dark:text-zinc-400">添加新的产品分类</p>
        </div>

        <CategoryForm categories={categories} families={families} />
      </div>
    </DashboardLayout>
  );
}
