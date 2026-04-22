import Link from "next/link";
import { ArrowLeft, Edit2 } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductAdminDetail } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ProductDetailSections } from "../../components/ProductDetailSections";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const detail = await getProductAdminDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">产品详情</h1>
            <p className="text-zinc-600 dark:text-zinc-400">查看 product 主记录、schema 与关联 variants</p>
          </div>
          <Link
            href={`/admin/products/${detail.product._id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            编辑产品
          </Link>
        </div>

        <ProductDetailSections detail={detail} mode="view" />
      </div>
    </DashboardLayout>
  );
}
