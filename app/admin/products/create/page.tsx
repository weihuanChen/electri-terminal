import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ProductForm } from "../../components/ProductForm";

export default async function CreateProductPage() {
  await requireAdmin();
  const { categories, families, attributeTemplates } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">新建产品</h1>
          <p className="text-zinc-600 dark:text-zinc-400">创建新产品 SKU</p>
        </div>
        <ProductForm
          categories={categories}
          families={families}
          attributeTemplates={attributeTemplates}
        />
      </div>
    </DashboardLayout>
  );
}
