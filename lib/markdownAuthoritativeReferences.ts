const AUTHORITATIVE_REFERENCES_BLOCK =
  /<!--\s*AUTHORITATIVE_REFERENCES:START\s*-->[\s\S]*?<!--\s*AUTHORITATIVE_REFERENCES:END\s*-->/gi;

const AUTHORITATIVE_REFERENCES_SECTION =
  /(?:<!--\s*AUTHORITATIVE_REFERENCES:START\s*-->\s*)?^##\s+Authoritative References\s*\n([\s\S]*?)(?:<!--\s*AUTHORITATIVE_REFERENCES:END\s*-->|(?![\s\S]))/im;

export interface AuthoritativeReferencesContent {
  before: string;
  references: string;
  after: string;
}

export function stripAuthoritativeReferences(markdown: string) {
  return markdown.replace(AUTHORITATIVE_REFERENCES_BLOCK, "").trim();
}

export function extractAuthoritativeReferences(
  markdown: string
): AuthoritativeReferencesContent | null {
  const match = AUTHORITATIVE_REFERENCES_SECTION.exec(markdown);
  if (!match || match.index === undefined) {
    return null;
  }

  return {
    before: markdown.slice(0, match.index).trim(),
    references: match[1].trim(),
    after: markdown.slice(match.index + match[0].length).trim(),
  };
}
