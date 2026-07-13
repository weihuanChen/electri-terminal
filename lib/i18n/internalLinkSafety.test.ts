import { describe, expect, it } from "vitest";

import { auditLocalizedInternalLinks } from "./internalLinkSafety";

const sources = [
  { entityType: "category" as const, sourceId: "cat-1", slug: "terminal-blocks" },
  { entityType: "product" as const, sourceId: "product-1", slug: "test-product" },
];

describe("localized internal-link safety gate", () => {
  it("accepts published static and entity targets in CTA and Markdown fields", () => {
    const issues = auditLocalizedInternalLinks({
      locale: "ru",
      sources,
      records: [
        { entityType: "staticPage", sourceId: "home", locale: "ru", status: "published", localizedFields: {
          content: { blocks: [{ ctas: [{ href: "/contact#quote" }] }] },
          body: "[Категория](/ru/categories/klemmy)",
        } },
        { entityType: "staticPage", sourceId: "contact", locale: "ru", status: "published" },
        { entityType: "category", sourceId: "cat-1", locale: "ru", status: "published", localizedSlug: "klemmy" },
      ],
    });
    expect(issues).toEqual([]);
  });

  it("blocks unpublished, unknown, and wrong-locale targets with field locations", () => {
    const issues = auditLocalizedInternalLinks({
      locale: "ru",
      sources,
      records: [{
        entityType: "staticPage",
        sourceId: "home",
        locale: "ru",
        status: "published",
        localizedFields: {
          content: { blocks: [{ ctas: [{ href: "/contact" }, { href: "/products/test-product" }] }] },
          body: "[Broken](/unknown) <a href=\"/en/contact\">English</a>",
        },
      }, { entityType: "product", sourceId: "product-1", locale: "ru", status: "draft" }],
    });
    expect(issues.map((issue) => issue.code).sort()).toEqual([
      "internal_link_locale_mismatch",
      "internal_link_target_not_found",
      "internal_link_target_not_published",
      "internal_link_target_not_published",
    ]);
    expect(issues.every((issue) => issue.fieldPath.startsWith("localizedFields."))).toBe(true);
  });

  it("ignores anchors, contact protocols, external links, drafts, and default locale", () => {
    const records = [{
      entityType: "staticPage" as const,
      sourceId: "home",
      locale: "ru",
      status: "draft",
      localizedFields: { links: [{ href: "#section" }, { href: "mailto:a@example.com" }, { href: "https://example.com/x" }] },
    }];
    expect(auditLocalizedInternalLinks({ locale: "ru", sources, records })).toEqual([]);
    expect(auditLocalizedInternalLinks({ locale: "en", sources, records })).toEqual([]);
  });

  it("requires the blog hub for paginated blog links", () => {
    const base = { entityType: "staticPage" as const, sourceId: "home", locale: "ru", status: "published", localizedFields: { href: "/blog/page/2" } };
    expect(auditLocalizedInternalLinks({ locale: "ru", sources, records: [base] })).toHaveLength(1);
    expect(auditLocalizedInternalLinks({ locale: "ru", sources, records: [base, { ...base, sourceId: "blog", localizedFields: undefined }] })).toEqual([]);
  });
});
