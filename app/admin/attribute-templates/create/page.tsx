import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { AttributeTemplateForm } from "../../components/AttributeTemplateForm";

export default async function CreateAttributeTemplatePage() {
  await requireAdmin();
  const { categories } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">新建属性模板</h1>
          <p className="text-zinc-600 dark:text-zinc-400">为分类建立参数模板、筛选字段和前台规格定义。</p>
        </div>
        <AttributeTemplateForm categories={categories} />
      </div>
    </DashboardLayout>
  );
}
