import { requireAdmin } from "@/lib/admin-auth";
import { DashboardLayout } from "../../components/DashboardLayout";
import { AuthorForm } from "../../components/AuthorForm";

export default async function CreateAuthorPage() {
  await requireAdmin();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">新建作者</h1>
          <p className="text-zinc-600 dark:text-zinc-400">创建文章作者资料。</p>
        </div>
        <AuthorForm />
      </div>
    </DashboardLayout>
  );
}
