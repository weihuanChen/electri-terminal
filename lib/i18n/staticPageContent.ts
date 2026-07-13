export type StaticPageContentHeading = { level: number; text: string };
export type StaticPageContentList = { ordered: boolean; items: string[] };
export type StaticPageContentCta = { label: string; href?: string };

export type StaticPageContentBlock = {
  id: string;
  type: "section" | "article" | "main";
  headings: StaticPageContentHeading[];
  paragraphs: string[];
  lists: StaticPageContentList[];
  ctas: StaticPageContentCta[];
  children: StaticPageContentBlock[];
};

export type StaticPageStructuredContent = {
  schemaVersion: 1;
  pageKey: string;
  sourcePath: string;
  blocks: StaticPageContentBlock[];
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isContentBlock(value: unknown): value is StaticPageContentBlock {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const block = value as Record<string, unknown>;
  return (
    typeof block.id === "string" &&
    ["section", "article", "main"].includes(String(block.type)) &&
    Array.isArray(block.headings) &&
    block.headings.every((heading) => {
      if (!heading || typeof heading !== "object" || Array.isArray(heading)) return false;
      const item = heading as Record<string, unknown>;
      return Number.isInteger(item.level) && Number(item.level) >= 1 && Number(item.level) <= 6 && typeof item.text === "string";
    }) &&
    isStringArray(block.paragraphs) &&
    Array.isArray(block.lists) &&
    block.lists.every((list) => {
      if (!list || typeof list !== "object" || Array.isArray(list)) return false;
      const item = list as Record<string, unknown>;
      return typeof item.ordered === "boolean" && isStringArray(item.items);
    }) &&
    Array.isArray(block.ctas) &&
    block.ctas.every((cta) => {
      if (!cta || typeof cta !== "object" || Array.isArray(cta)) return false;
      const item = cta as Record<string, unknown>;
      return typeof item.label === "string" && (item.href === undefined || typeof item.href === "string");
    }) &&
    Array.isArray(block.children) &&
    block.children.every(isContentBlock)
  );
}

export function isStaticPageStructuredContent(value: unknown): value is StaticPageStructuredContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    record.schemaVersion === 1 &&
    typeof record.pageKey === "string" &&
    typeof record.sourcePath === "string" &&
    Array.isArray(record.blocks) &&
    record.blocks.every(isContentBlock)
  );
}
