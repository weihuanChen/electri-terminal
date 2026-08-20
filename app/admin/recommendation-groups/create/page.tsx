import { requireAdmin } from "@/lib/admin-auth";
import { getRecommendationGroupFormOptions } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { RecommendationGroupForm } from "../../components/RecommendationGroupForm";

export default async function CreateRecommendationGroupPage() {
  await requireAdmin();
  const options = await getRecommendationGroupFormOptions();
  return <DashboardLayout><div className="space-y-6"><header><p className="font-mono text-xs uppercase text-zinc-500">Recommendation group</p><h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-100">新建推荐组合</h1><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">选择产品并确定它们在文章中的展示顺序。</p></header><RecommendationGroupForm options={options} /></div></DashboardLayout>;
}
