export type LlmsTxtSection =
  | "core"
  | "categories"
  | "families"
  | "products"
  | "guides"
  | "optional";

export type LlmsTxtPageKind =
  | "static"
  | "category"
  | "family"
  | "product"
  | "article";

export type LlmsTxtPageCandidate = {
  id: string;
  kind: LlmsTxtPageKind;
  section: LlmsTxtSection;
  title: string;
  description?: string;
  url: string;
  canonical?: string;
  sortOrder?: number;
  baseScore?: number;
  featured?: boolean;
  visibleInNavigation?: boolean;
  level?: number;
  contentSignalCount?: number;
  relatedCount?: number;
  updatedAt?: number;
  groupId?: string;
};

export type ScoredLlmsTxtPage = LlmsTxtPageCandidate & {
  description: string;
  score: number;
};

const SECTION_CONFIG: ReadonlyArray<{
  key: LlmsTxtSection;
  title: string;
  limit: number;
}> = [
  { key: "core", title: "Engineering & Capabilities", limit: 6 },
  { key: "categories", title: "Product Categories", limit: 8 },
  { key: "families", title: "Product Families", limit: 12 },
  { key: "products", title: "Featured Products", limit: 6 },
  { key: "guides", title: "Technical Guides", limit: 12 },
  { key: "optional", title: "Optional", limit: 6 },
];

const BASE_SCORE: Record<LlmsTxtPageKind, number> = {
  static: 30,
  category: 82,
  family: 78,
  article: 75,
  product: 65,
};

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~#>|]/g, "");
}

function truncateAtWord(value: string, maxLength = 180) {
  if (value.length <= maxLength) return value;
  const truncated = value.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 100 ? lastSpace : truncated.length).trim()}…`;
}

export function normalizeLlmsDescription(value?: string) {
  if (!value) return "";
  return truncateAtWord(collapseWhitespace(stripMarkdown(value)));
}

function fallbackDescription(candidate: LlmsTxtPageCandidate) {
  switch (candidate.kind) {
    case "category":
      return `Browse ${candidate.title} product families, specifications, and selection information.`;
    case "family":
      return `Review ${candidate.title} models, technical attributes, and available product options.`;
    case "product":
      return `View technical specifications and sourcing information for ${candidate.title}.`;
    case "article":
      return `Technical guidance and application information about ${candidate.title}.`;
    case "static":
      return `Official Electri Terminal information about ${candidate.title}.`;
  }
}

export function scoreLlmsTxtCandidate(
  candidate: LlmsTxtPageCandidate,
  now = Date.now()
) {
  let score = candidate.baseScore ?? BASE_SCORE[candidate.kind];
  const hasEditorialDescription = Boolean(normalizeLlmsDescription(candidate.description));

  if (candidate.featured) score += 15;
  if (candidate.visibleInNavigation) score += 10;
  if (candidate.kind === "category" && candidate.level === 0) score += 8;

  const contentSignals = Math.max(0, candidate.contentSignalCount ?? 0);
  score += contentSignals >= 2 ? 10 : contentSignals * 3;

  if ((candidate.relatedCount ?? 0) >= 3) score += 6;
  if (!hasEditorialDescription) score -= 15;

  if (
    candidate.updatedAt &&
    candidate.updatedAt <= now &&
    now - candidate.updatedAt <= ONE_YEAR_MS
  ) {
    score += 3;
  }

  return score;
}

function isValidPublicUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "electriterminal.com" &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function groupLimit(candidate: LlmsTxtPageCandidate) {
  if (!candidate.groupId) return Number.POSITIVE_INFINITY;
  if (candidate.kind === "family") return 3;
  if (candidate.kind === "product") return 2;
  return Number.POSITIVE_INFINITY;
}

export function selectLlmsTxtPages(
  candidates: LlmsTxtPageCandidate[],
  now = Date.now()
) {
  const seenUrls = new Set<string>();
  const validCandidates = candidates
    .filter((candidate) => {
      const url = candidate.canonical || candidate.url;
      if (!isValidPublicUrl(url) || seenUrls.has(url)) return false;
      seenUrls.add(url);
      return true;
    })
    .map<ScoredLlmsTxtPage>((candidate) => ({
      ...candidate,
      url: candidate.canonical || candidate.url,
      description:
        normalizeLlmsDescription(candidate.description) ||
        fallbackDescription(candidate),
      score: scoreLlmsTxtCandidate(candidate, now),
    }));

  return SECTION_CONFIG.flatMap(({ key, limit }) => {
    const groupCounts = new Map<string, number>();
    const selected: ScoredLlmsTxtPage[] = [];
    const sectionCandidates = validCandidates
      .filter((candidate) => candidate.section === key)
      .sort(
        (left, right) =>
          right.score - left.score ||
          (left.sortOrder ?? Number.MAX_SAFE_INTEGER) -
            (right.sortOrder ?? Number.MAX_SAFE_INTEGER) ||
          left.title.localeCompare(right.title)
      );

    for (const candidate of sectionCandidates) {
      if (selected.length >= limit) break;
      const groupId = candidate.groupId;
      const currentGroupCount = groupId ? groupCounts.get(groupId) ?? 0 : 0;
      if (currentGroupCount >= groupLimit(candidate)) continue;

      selected.push(candidate);
      if (groupId) groupCounts.set(groupId, currentGroupCount + 1);
    }

    return selected;
  });
}

function escapeLinkLabel(value: string) {
  return collapseWhitespace(value).replace(/[\[\]]/g, "");
}

export function renderLlmsTxt(pages: ScoredLlmsTxtPage[]) {
  const lines = [
    "# Electri Terminal",
    "",
    "> Electri Terminal manufactures and supplies electrical terminals, cable lugs, connectors, and related industrial wiring components.",
    "",
    "Use these curated resources for product selection, technical specifications, manufacturing capabilities, quality information, and industrial sourcing. Product availability, certifications, MOQ, and lead time must be confirmed for the specific item number.",
  ];

  for (const section of SECTION_CONFIG) {
    const sectionPages = pages.filter((page) => page.section === section.key);
    if (sectionPages.length === 0) continue;

    lines.push("", `## ${section.title}`, "");
    for (const page of sectionPages) {
      lines.push(
        `- [${escapeLinkLabel(page.title)}](${page.url}): ${page.description}`
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

export function buildLlmsTxt(
  candidates: LlmsTxtPageCandidate[],
  now = Date.now()
) {
  return renderLlmsTxt(selectLlmsTxtPages(candidates, now));
}
