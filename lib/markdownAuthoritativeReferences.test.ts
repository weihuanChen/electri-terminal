import { describe, expect, it } from "vitest";

import {
  extractAuthoritativeReferences,
  stripAuthoritativeReferences,
} from "./markdownAuthoritativeReferences";

const references = `<!--AUTHORITATIVE_REFERENCES:START-->
## Authoritative References

1. [Installation Guide](https://example.com/guide.pdf) — Example. Supports the ratings.

<!--AUTHORITATIVE_REFERENCES:END-->`;

describe("authoritative reference markdown", () => {
  it("extracts a marked reference section for dedicated rendering", () => {
    expect(extractAuthoritativeReferences(`Intro\n\n${references}\n\nOutro`)).toEqual({
      before: "Intro",
      references:
        "1. [Installation Guide](https://example.com/guide.pdf) — Example. Supports the ratings.",
      after: "Outro",
    });
  });

  it("recognizes a section after article content has been split at its heading", () => {
    expect(
      extractAuthoritativeReferences(
        "## Authoritative References\n\n1. [Guide](https://example.com)\n<!--AUTHORITATIVE_REFERENCES:END-->"
      )?.references
    ).toBe("1. [Guide](https://example.com)");
  });

  it("removes the marked block when structured citations are available", () => {
    expect(stripAuthoritativeReferences(`Intro\n\n${references}\n\nOutro`)).toBe(
      "Intro\n\n\n\nOutro"
    );
  });
});
