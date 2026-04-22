import { requireAdmin } from "@/lib/admin-auth";
import { actionAdmin, loadAdminData, getArticle } from "@/lib/convex-admin";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { ArticleForm } from "../../../components/ArticleForm";
import { notFound } from "next/navigation";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [article, adminData, r2Data] = await Promise.all([
    getArticle(id),
    loadAdminData(),
    actionAdmin<{
      items: Array<{
        key: string;
        size?: number;
        lastModified?: string;
      }>;
    }>("actions/r2:listBucketObjects", {
      pageSize: 500,
      maxItems: 5000,
    }).catch(() => ({ items: [] })),
  ]);
  const { categories, families, products, assets } = adminData;

  if (!article) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">编辑文章</h1>
          <p className="text-zinc-600 dark:text-zinc-400">修改文章信息</p>
        </div>
        <ArticleForm
          article={article}
          categories={categories}
          families={families}
          products={products}
          assets={assets}
          r2Items={r2Data.items}
        />
      </div>
    </DashboardLayout>
  );
}
