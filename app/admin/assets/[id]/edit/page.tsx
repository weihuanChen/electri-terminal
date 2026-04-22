import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAsset } from "@/lib/convex-admin";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { AssetForm } from "../../../components/AssetForm";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const asset = await getAsset(id);

  if (!asset) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">编辑资源</h1>
          <p className="text-zinc-600 dark:text-zinc-400">更新资源主数据，关联关系仍在 Relations 页面维护。</p>
        </div>
        <AssetForm asset={asset} />
      </div>
    </DashboardLayout>
  );
}
