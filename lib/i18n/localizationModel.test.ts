import { describe, expect, it } from "vitest";

import {
  LOCALIZATION_STATUSES,
  LOCALIZATION_STATUS_TRANSITIONS,
  TRANSLATION_METHODS,
  canTransitionLocalizationStatus,
  isLocalizationStatus,
  isTranslationMethod,
} from "./localizationModel";

describe("localization workflow", () => {
  it.each(LOCALIZATION_STATUSES)("recognizes status %s", (status) => {
    expect(isLocalizationStatus(status)).toBe(true);
  });

  it.each(TRANSLATION_METHODS)("recognizes method %s", (method) => {
    expect(isTranslationMethod(method)).toBe(true);
  });

  it("rejects unknown status and method values", () => {
    expect(isLocalizationStatus("ready")).toBe(false);
    expect(isTranslationMethod("automatic")).toBe(false);
  });

  it("accepts every declared transition", () => {
    for (const [current, nextStatuses] of Object.entries(
      LOCALIZATION_STATUS_TRANSITIONS
    )) {
      for (const next of nextStatuses) {
        expect(
          canTransitionLocalizationStatus(
            current as keyof typeof LOCALIZATION_STATUS_TRANSITIONS,
            next
          )
        ).toBe(true);
      }
    }
  });

  it.each([
    ["missing", "published"],
    ["draft", "published"],
    ["machine_ready", "published"],
    ["review_required", "published"],
    ["published", "draft"],
    ["published", "approved"],
    ["stale", "published"],
  ] as const)("rejects unsafe transition %s -> %s", (current, next) => {
    expect(canTransitionLocalizationStatus(current, next)).toBe(false);
  });
});
