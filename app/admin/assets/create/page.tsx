import { requireAdmin } from "@/lib/admin-auth";
import { DashboardLayout } from "../../components/DashboardLayout";
import { AssetForm } from "../../components/AssetForm";

export default async function CreateAssetPage() {
  await requireAdmin();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">新建资源</h1>
          <p className="text-zinc-600 dark:text-zinc-400">创建资源主数据，再通过 Relations 绑定分类/系列/产品。</p>
        </div>
        <AssetForm />
      </div>
    </DashboardLayout>
  );
}
