import { requireAdmin } from "@/lib/admin-auth";
import {
  AdminAssetWithRelations,
  AdminFaqWithRelations,
  loadAdminData,
  queryAdmin,
} from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { RelationsManager } from "../components/RelationsManager";

export default async function RelationsPage() {
  await requireAdmin();

  const [{ categories, families, products }, assets, faqs] = await Promise.all([
    loadAdminData(),
    queryAdmin<AdminAssetWithRelations[]>("queries/modules/relations:listAssetsWithRelations"),
    queryAdmin<AdminFaqWithRelations[]>("queries/modules/relations:listFaqArticlesWithRelations"),
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">FAQ / 资源关联管理</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            在这里统一管理 FAQ 和资源文件挂载到分类、系列、产品的关系。
          </p>
        </div>
        <RelationsManager
          assets={assets}
          faqs={faqs}
          categories={categories}
          families={families}
          products={products}
        />
      </div>
    </DashboardLayout>
  );
}
