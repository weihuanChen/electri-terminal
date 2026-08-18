import { requireAdmin } from "@/lib/admin-auth";
import { getCategory, getCategoryFormOptions } from "@/lib/convex-admin";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { CategoryForm } from "../../../components/CategoryForm";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [category, formOptions] = await Promise.all([
    getCategory(id),
    getCategoryFormOptions(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">编辑分类</h1>
          <p className="text-zinc-600 dark:text-zinc-400">修改分类信息</p>
        </div>

        <CategoryForm
          category={category}
          categories={formOptions.categories}
          families={formOptions.families}
        />
      </div>
    </DashboardLayout>
  );
}
