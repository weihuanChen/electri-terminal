import { requireAdmin } from "@/lib/admin-auth";
import { actionAdmin, loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ArticleForm } from "../../components/ArticleForm";

export default async function CreateArticlePage() {
  await requireAdmin();
  const [{ categories, families, products, assets }, r2Data] = await Promise.all([
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">新建文章</h1>
          <p className="text-zinc-600 dark:text-zinc-400">创建新文章</p>
        </div>
        <ArticleForm
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
