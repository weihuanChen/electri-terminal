export const ARTICLE_CITATION_SOURCE_TYPES = [
  "standard",
  "paper",
  "regulator",
  "datasheet",
  "internal-test",
  "webpage",
] as const;

export type ArticleCitationSourceType =
  (typeof ARTICLE_CITATION_SOURCE_TYPES)[number];

export type ArticleCitation = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: ArticleCitationSourceType;
  publishedAt?: number;
  accessedAt?: number;
  standardNumber?: string;
  standardEdition?: string;
  locator?: string;
};

export type ArticleQuotation = {
  text: string;
  attribution: string;
  citationId: string;
};

const CITATION_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const MAX_CITATIONS = 50;
const MAX_QUOTATIONS = 30;

function asRecord(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(
  record: Record<string, unknown>,
  key: string,
  label: string,
  maxLength: number
) {
  const value = typeof record[key] === "string" ? record[key].trim() : "";
  if (!value) throw new Error(`${label} is required.`);
  if (value.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }
  return value;
}

function optionalString(
  record: Record<string, unknown>,
  key: string,
  label: string,
  maxLength: number
) {
  const raw = record[key];
  if (raw === undefined || raw === null || raw === "") return undefined;
  if (typeof raw !== "string") throw new Error(`${label} must be text.`);
  const value = raw.trim();
  if (!value) return undefined;
  if (value.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }
  return value;
}

function optionalTimestamp(
  record: Record<string, unknown>,
  key: string,
  label: string
) {
  const raw = record[key];
  if (raw === undefined || raw === null || raw === "") return undefined;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
    throw new Error(`${label} must be a valid timestamp.`);
  }
  return raw;
}

function validateHttpUrl(value: string, label: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${label} must use http or https.`);
  }
  return parsed.toString();
}

export function parseArticleCitations(value: unknown): ArticleCitation[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error("Citations must be an array.");
  if (value.length > MAX_CITATIONS) {
    throw new Error(`An article can contain at most ${MAX_CITATIONS} citations.`);
  }

  const seenIds = new Set<string>();
  return value.map((item, index) => {
    const record = asRecord(item, `Citation ${index + 1}`);
    const id = requiredString(record, "id", `Citation ${index + 1} ID`, 80).toLowerCase();
    if (!CITATION_ID_PATTERN.test(id)) {
      throw new Error(
        `Citation ${index + 1} ID may contain lowercase letters, numbers, hyphens, and underscores.`
      );
    }
    if (seenIds.has(id)) throw new Error(`Citation ID "${id}" is duplicated.`);
    seenIds.add(id);

    const sourceType = requiredString(
      record,
      "sourceType",
      `Citation ${index + 1} source type`,
      40
    );
    if (
      !ARTICLE_CITATION_SOURCE_TYPES.includes(
        sourceType as ArticleCitationSourceType
      )
    ) {
      throw new Error(`Citation ${index + 1} has an unsupported source type.`);
    }

    const rawUrl = requiredString(record, "url", `Citation ${index + 1} URL`, 2048);
    return {
      id,
      title: requiredString(record, "title", `Citation ${index + 1} title`, 300),
      publisher: requiredString(
        record,
        "publisher",
        `Citation ${index + 1} publisher`,
        200
      ),
      url: validateHttpUrl(rawUrl, `Citation ${index + 1} URL`),
      sourceType: sourceType as ArticleCitationSourceType,
      publishedAt: optionalTimestamp(
        record,
        "publishedAt",
        `Citation ${index + 1} publication date`
      ),
      accessedAt: optionalTimestamp(
        record,
        "accessedAt",
        `Citation ${index + 1} access date`
      ),
      standardNumber: optionalString(
        record,
        "standardNumber",
        `Citation ${index + 1} standard number`,
        120
      ),
      standardEdition: optionalString(
        record,
        "standardEdition",
        `Citation ${index + 1} standard edition`,
        120
      ),
      locator: optionalString(
        record,
        "locator",
        `Citation ${index + 1} locator`,
        160
      ),
    };
  });
}

export function parseArticleQuotations(
  value: unknown,
  citations: ArticleCitation[]
): ArticleQuotation[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error("Quotations must be an array.");
  if (value.length > MAX_QUOTATIONS) {
    throw new Error(`An article can contain at most ${MAX_QUOTATIONS} quotations.`);
  }

  const citationIds = new Set(citations.map((citation) => citation.id));
  return value.map((item, index) => {
    const record = asRecord(item, `Quotation ${index + 1}`);
    const citationId = requiredString(
      record,
      "citationId",
      `Quotation ${index + 1} citation`,
      80
    ).toLowerCase();
    if (!citationIds.has(citationId)) {
      throw new Error(
        `Quotation ${index + 1} references missing citation "${citationId}".`
      );
    }

    return {
      text: requiredString(record, "text", `Quotation ${index + 1} text`, 1000),
      attribution: requiredString(
        record,
        "attribution",
        `Quotation ${index + 1} attribution`,
        240
      ),
      citationId,
    };
  });
}

export function makeCitationId(existingIds: string[]) {
  const used = new Set(existingIds);
  let index = existingIds.length + 1;
  while (used.has(`source-${index}`)) index += 1;
  return `source-${index}`;
}

export function renderCitationMarkers(
  content: string,
  citations: ArticleCitation[]
) {
  const citationNumberById = new Map(
    citations.map((citation, index) => [citation.id.toLowerCase(), index + 1])
  );

  return content.replace(
    /\[\[cite:([a-z0-9][a-z0-9_-]*)\]\]/gi,
    (marker, rawId: string) => {
      const id = rawId.toLowerCase();
      const citationNumber = citationNumberById.get(id);
      return citationNumber
        ? `[${citationNumber}](#reference-${id})`
        : marker;
    }
  );
}
