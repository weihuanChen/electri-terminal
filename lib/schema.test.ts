import { describe, expect, it } from "vitest";

import { makeArticleSchema } from "./schema";

describe("makeArticleSchema", () => {
  it("emits citation and quotation structured data", () => {
    const schema = makeArticleSchema({
      slug: "terminal-guide",
      title: "Terminal Guide",
      citations: [
        {
          id: "iec-1",
          title: "IEC 60352-2:2024",
          publisher: "IEC",
          url: "https://example.com/iec",
          sourceType: "standard",
          standardNumber: "IEC 60352-2",
          standardEdition: "Edition 3.0",
          publishedAt: Date.UTC(2024, 9, 30),
        },
      ],
      quotations: [
        {
          text: "Verified source text.",
          attribution: "IEC scope summary",
          citationId: "iec-1",
        },
      ],
    });

    expect(schema.citation).toEqual([
      expect.objectContaining({
        "@type": "CreativeWork",
        name: "IEC 60352-2:2024",
        url: "https://example.com/iec",
        identifier: "IEC 60352-2",
        version: "Edition 3.0",
      }),
    ]);
    expect(schema.hasPart).toEqual([
      {
        "@type": "Quotation",
        text: "Verified source text.",
        creditText: "IEC scope summary",
        isBasedOn: "https://example.com/iec",
      },
    ]);
  });

  it("omits citation fields for legacy articles", () => {
    const schema = makeArticleSchema({
      slug: "legacy-article",
      title: "Legacy Article",
    });

    expect(schema.citation).toBeUndefined();
    expect(schema.hasPart).toBeUndefined();
  });
});
