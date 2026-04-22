import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData, getArticle } from "@/lib/convex-admin";
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
  const article = await getArticle(id);
  const { categories, families, products } = await loadAdminData();

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
        />
      </div>
    </DashboardLayout>
  );
}
