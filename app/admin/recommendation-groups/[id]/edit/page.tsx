import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { getRecommendationGroup, getRecommendationGroupFormOptions, listRecommendationGroups } from "@/lib/convex-admin";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { RecommendationGroupForm } from "../../../components/RecommendationGroupForm";

export default async function EditRecommendationGroupPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [group, options, groups] = await Promise.all([getRecommendationGroup(id), getRecommendationGroupFormOptions(), listRecommendationGroups()]);
  if (!group) notFound();
  const usageCount = groups.find((item) => item._id === id)?.usageCount ?? 0;
  return <DashboardLayout><div className="space-y-6"><header><p className="font-mono text-xs uppercase text-zinc-500">{group.code}</p><h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-100">编辑推荐组合</h1><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">更新后，所有引用该组合的文章会使用新的成员和顺序。</p></header><RecommendationGroupForm group={group} options={options} usageCount={usageCount} /></div></DashboardLayout>;
}
