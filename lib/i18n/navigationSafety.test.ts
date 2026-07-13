import { describe, expect, it } from "vitest";
import {
  auditNavigationTargets,
  buildNavigationEligibilitySnapshot,
  canExposeStaticNavigationTarget,
  getPublishedNavigationCategory,
} from "./navigationSafety";

describe("navigation safety", () => {
  const snapshot = buildNavigationEligibilitySnapshot("ru", [
    { entityType: "staticPage", sourceId: "home", locale: "ru", status: "published" },
    { entityType: "staticPage", sourceId: "contact", locale: "ru", status: "draft" },
    { entityType: "category", sourceId: "cat-1", locale: "ru", status: "published", title: "Клеммы" },
  ]);

  it("exposes only published localized targets", () => {
    expect(canExposeStaticNavigationTarget(snapshot, "home")).toBe(true);
    expect(canExposeStaticNavigationTarget(snapshot, "contact")).toBe(false);
    expect(getPublishedNavigationCategory(snapshot, "cat-1")?.title).toBe("Клеммы");
    expect(getPublishedNavigationCategory(snapshot, "cat-2")).toBeUndefined();
  });

  it("reports unsafe configured targets", () => {
    expect(auditNavigationTargets({
      snapshot,
      staticPageKeys: ["home", "contact"],
      categorySourceIds: ["cat-1", "cat-2"],
    })).toEqual([
      { code: "navigation_static_target_not_published", target: "contact" },
      { code: "navigation_category_target_not_published", target: "cat-2" },
    ]);
  });

  it("keeps default-locale navigation available", () => {
    const english = buildNavigationEligibilitySnapshot("en", []);
    expect(canExposeStaticNavigationTarget(english, "contact")).toBe(true);
    expect(getPublishedNavigationCategory(english, "anything")).toEqual({ sourceId: "anything" });
    expect(auditNavigationTargets({ snapshot: english, staticPageKeys: ["contact"], categorySourceIds: ["missing"] })).toEqual([]);
  });

  it("ignores other locales and unpublished records and reads localized field names", () => {
    const filtered = buildNavigationEligibilitySnapshot("ru", [
      { entityType: "staticPage", sourceId: "contact", locale: "en", status: "published" },
      { entityType: "category", sourceId: "draft", locale: "ru", status: "draft" },
      { entityType: "category", sourceId: "localized-name", locale: "ru", status: "published", localizedFields: { name: "Локализованное имя" } },
      { entityType: "category", sourceId: "fallback", locale: "ru", status: "published", localizedFields: { name: 42 } },
    ]);
    expect(canExposeStaticNavigationTarget(filtered, "contact")).toBe(false);
    expect(getPublishedNavigationCategory(filtered, "localized-name")?.title).toBe("Локализованное имя");
    expect(getPublishedNavigationCategory(filtered, "fallback")?.title).toBeUndefined();
  });
});
