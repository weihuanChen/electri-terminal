import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData, getProductFamily } from "@/lib/convex-admin";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { FamilyForm } from "../../../components/FamilyForm";
import { notFound } from "next/navigation";

export default async function EditFamilyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const family = await getProductFamily(id);
  const { categories, families, articles, assets } = await loadAdminData();

  if (!family) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">编辑产品系列</h1>
          <p className="text-zinc-600 dark:text-zinc-400">修改系列信息</p>
        </div>
        <FamilyForm
          family={family}
          categories={categories}
          families={families}
          articles={articles}
          assets={assets}
        />
      </div>
    </DashboardLayout>
  );
}
