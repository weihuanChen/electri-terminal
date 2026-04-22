import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData, getProductAdminDetail } from "@/lib/convex-admin";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { ProductDetailSections } from "../../../components/ProductDetailSections";
import { ProductForm } from "../../../components/ProductForm";
import { ProductVariantsManager } from "../../../components/ProductVariantsManager";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const detail = await getProductAdminDetail(id);
  const { categories, families, attributeTemplates } = await loadAdminData();

  if (!detail) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/products/${detail.product._id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回详情
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">编辑产品</h1>
            <p className="text-zinc-600 dark:text-zinc-400">修改产品信息，并核对当前 schema 与 variants</p>
          </div>
        </div>

        <ProductDetailSections detail={detail} mode="edit" />

        <ProductForm
          product={detail.product}
          categories={categories}
          families={families}
          attributeTemplates={attributeTemplates}
        />

        <ProductVariantsManager
          productId={detail.product._id}
          templateFields={detail.templateFields}
          inheritedAttributes={{
            ...(detail.family?.attributes || {}),
            ...(detail.product.attributes || {}),
          }}
          variants={detail.variants}
        />
      </div>
    </DashboardLayout>
  );
}
