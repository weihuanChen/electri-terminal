import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { FamilyForm } from "../../components/FamilyForm";

export default async function CreateFamilyPage() {
  await requireAdmin();
  const { categories, families, articles, assets } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">新建产品系列</h1>
          <p className="text-zinc-600 dark:text-zinc-400">创建新产品系列</p>
        </div>
        <FamilyForm
          categories={categories}
          families={families}
          articles={articles}
          assets={assets}
        />
      </div>
    </DashboardLayout>
  );
}
