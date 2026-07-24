import { describe, expect, it } from "vitest";

import {
  makeCitationId,
  parseArticleCitations,
  parseArticleQuotations,
  renderCitationMarkers,
} from "./articleCitations";

describe("article citation parsing", () => {
  it("normalizes valid citations and linked quotations", () => {
    const citations = parseArticleCitations([
      {
        id: " IEC-1 ",
        title: " IEC 60352-2 ",
        publisher: " IEC ",
        url: "https://example.com/source",
        sourceType: "standard",
        standardEdition: "2024",
      },
    ]);
    const quotations = parseArticleQuotations(
      [
        {
          text: " Verified source text. ",
          attribution: " IEC scope summary ",
          citationId: " IEC-1 ",
        },
      ],
      citations
    );

    expect(citations).toEqual([
      {
        id: "iec-1",
        title: "IEC 60352-2",
        publisher: "IEC",
        url: "https://example.com/source",
        sourceType: "standard",
        standardEdition: "2024",
      },
    ]);
    expect(quotations).toEqual([
      {
        text: "Verified source text.",
        attribution: "IEC scope summary",
        citationId: "iec-1",
      },
    ]);
  });

  it("rejects duplicate IDs and unsupported URL schemes", () => {
    expect(() =>
      parseArticleCitations([
        {
          id: "source-1",
          title: "First",
          publisher: "Publisher",
          url: "https://example.com/one",
          sourceType: "webpage",
        },
        {
          id: "source-1",
          title: "Second",
          publisher: "Publisher",
          url: "https://example.com/two",
          sourceType: "webpage",
        },
      ])
    ).toThrow(/duplicated/i);

    expect(() =>
      parseArticleCitations([
        {
          id: "source-1",
          title: "Unsafe",
          publisher: "Publisher",
          url: "javascript:alert(1)",
          sourceType: "webpage",
        },
      ])
    ).toThrow(/http or https/i);
  });

  it("rejects quotations that point to a missing citation", () => {
    expect(() =>
      parseArticleQuotations(
        [
          {
            text: "Quoted text",
            attribution: "Author",
            citationId: "missing-source",
          },
        ],
        []
      )
    ).toThrow(/missing citation/i);
  });

  it("generates the next unused source ID", () => {
    expect(makeCitationId(["source-1", "source-3"])).toBe("source-4");
    expect(makeCitationId(["source-1", "source-2", "source-4"])).toBe("source-5");
  });

  it("renders stable inline citation markers as reference links", () => {
    const citations = parseArticleCitations([
      {
        id: "iec-1",
        title: "IEC source",
        publisher: "IEC",
        url: "https://example.com/iec",
        sourceType: "standard",
      },
      {
        id: "ul-1",
        title: "UL source",
        publisher: "UL",
        url: "https://example.com/ul",
        sourceType: "regulator",
      },
    ]);

    expect(
      renderCitationMarkers(
        "Claim one [[cite:iec-1]]. Claim two [[cite:UL-1]].",
        citations
      )
    ).toBe(
      "Claim one [1](#reference-iec-1). Claim two [2](#reference-ul-1)."
    );
    expect(renderCitationMarkers("[[cite:missing]]", citations)).toBe(
      "[[cite:missing]]"
    );
  });
});
