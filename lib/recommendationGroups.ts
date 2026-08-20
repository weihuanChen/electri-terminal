export interface RecommendationGroupMembership<TId extends string> {
  status: "draft" | "published" | "archived";
  productIds: TId[];
}

export function resolveRecommendationProductIds<TId extends string>(
  groups: Array<RecommendationGroupMembership<TId> | null>,
  explicitProductIds: TId[] = [],
) {
  const seen = new Set<string>();
  const resolved: TId[] = [];

  const append = (productId: TId) => {
    const key = String(productId);
    if (seen.has(key)) return;
    seen.add(key);
    resolved.push(productId);
  };

  for (const group of groups) {
    if (!group || group.status !== "published") continue;
    group.productIds.forEach(append);
  }
  explicitProductIds.forEach(append);

  return resolved;
}
