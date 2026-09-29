import type { Doc } from "../_generated/dataModel";

export type RelatedSeriesLabel = "Single Crimp" | "Heat Shrink" | "Nylon" | "Non Insulated";

export const RELATED_SERIES_RULES: Array<{
  label: RelatedSeriesLabel;
  priority: number;
  keywords: string[];
  excludeKeywords?: string[];
  preferredSlugs?: string[];
}> = [
  {
    label: "Single Crimp",
    priority: 100,
    keywords: ["single crimp", "single crimp ring", "vinyl insulated ring", "vinyl insulated terminals", "insulated ring terminals"],
    excludeKeywords: ["double crimp", "heat shrink", "nylon", "non insulated"],
    preferredSlugs: ["single-crimp-ring-terminals", "vinyl-insulated-ring-terminals", "insulated-ring-terminals"],
  },
  {
    label: "Heat Shrink",
    priority: 80,
    keywords: ["heat shrink", "heat shrink ring"],
    preferredSlugs: ["heat-shrink-ring-terminals"],
  },
  {
    label: "Nylon",
    priority: 70,
    keywords: ["nylon", "nylon ring", "nylon insulated"],
    preferredSlugs: ["nylon-ring-terminals", "nylon-insulated-ring-terminals"],
  },
  {
    label: "Non Insulated",
    priority: 60,
    keywords: ["non insulated", "non insulated ring", "standard ring terminals", "ring terminals standard type"],
    excludeKeywords: ["heat shrink", "nylon"],
    preferredSlugs: ["standard-ring-terminals", "non-insulated-ring-terminals"],
  },
];

function normalizeSeriesText(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function getFamilySearchText(family: Pick<Doc<"productFamilies">, "name" | "slug" | "summary" | "content" | "attributes">) {
  return normalizeSeriesText([
    family.name, family.slug, family.summary, family.content,
    JSON.stringify(family.attributes ?? {}),
  ].filter(Boolean).join(" "));
}

export function getRelatedSeriesRule(family: Pick<Doc<"productFamilies">, "name" | "slug" | "summary" | "content" | "attributes">) {
  const searchText = getFamilySearchText(family);
  return RELATED_SERIES_RULES.find((rule) =>
    !(rule.excludeKeywords ?? []).some((keyword) => searchText.includes(normalizeSeriesText(keyword))) &&
    rule.keywords.some((keyword) => searchText.includes(normalizeSeriesText(keyword)))
  );
}
