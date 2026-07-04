import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { getAuthor } from "@/lib/convex-admin";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { AuthorForm } from "../../../components/AuthorForm";

export default async function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const author = await getAuthor(id);

  if (!author) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">编辑作者</h1>
          <p className="text-zinc-600 dark:text-zinc-400">更新作者资料和头像。</p>
        </div>
        <AuthorForm author={author} />
      </div>
    </DashboardLayout>
  );
}
