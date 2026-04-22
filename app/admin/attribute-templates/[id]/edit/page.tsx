import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAttributeTemplate, loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { AttributeTemplateForm } from "../../../components/AttributeTemplateForm";

export default async function EditAttributeTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [template, { categories }] = await Promise.all([
    getAttributeTemplate(id),
    loadAdminData(),
  ]);

  if (!template) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">编辑属性模板</h1>
          <p className="text-zinc-600 dark:text-zinc-400">修改字段定义后，前台分类筛选和规格展示会同步更新。</p>
        </div>
        <AttributeTemplateForm template={template} categories={categories} />
      </div>
    </DashboardLayout>
  );
}
