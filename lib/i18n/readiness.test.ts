import { describe, expect, it } from "vitest";
import { buildLocaleReadinessReport, type ReadinessSource } from "./readiness";

const sources: ReadinessSource[] = [
  { entityType: "staticPage", sourceId: "home", label: "Homepage", pageClass: "L1", requiredForRelease: true },
  { entityType: "product", sourceId: "p1", label: "Product", pageClass: "L2", requiredForRelease: true },
  { entityType: "article", sourceId: "a1", label: "Article", pageClass: "L3", requiredForRelease: false },
];

describe("locale readiness", () => {
  it("blocks missing and stale required pages but ignores missing L3", () => {
    const report = buildLocaleReadinessReport({
      locale: "ru",
      sources,
      localizations: [{ entityType: "product", sourceId: "p1", locale: "ru", status: "stale" }],
    });
    expect(report.ready).toBe(false);
    expect(report.required.coveragePercent).toBe(0);
    expect(report.blockers.map((item) => item.code)).toEqual([
      "missing_required_translation",
      "required_translation_stale",
    ]);
  });

  it("passes only when required pages are published without blockers", () => {
    const report = buildLocaleReadinessReport({
      locale: "ru",
      sources,
      localizations: sources.slice(0, 2).map((source) => ({
        entityType: source.entityType,
        sourceId: source.sourceId,
        locale: "ru",
        status: "published" as const,
      })),
    });
    expect(report.ready).toBe(true);
    expect(report.required).toEqual({ total: 2, published: 2, coveragePercent: 100 });
  });

  it("blocks unresolved blocker validation issues", () => {
    const report = buildLocaleReadinessReport({
      locale: "ru",
      sources: [sources[0]],
      localizations: [{
        entityType: "staticPage",
        sourceId: "home",
        locale: "ru",
        status: "published",
        validationIssues: [{ severity: "blocker" }],
      }],
    });
    expect(report.blockers[0].code).toBe("unresolved_validation_blocker");
  });
});
