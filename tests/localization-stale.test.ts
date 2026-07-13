import { describe, expect, it } from "vitest";
import {
  getChangedTranslatableFieldKeys,
  hashLocalizationSourceValue,
} from "@/convex/lib/localizationStale";

describe("localization source hashing", () => {
  it("is stable across object key order", () => {
    expect(hashLocalizationSourceValue({ title: "A", nested: { b: 2, a: 1 } })).toBe(
      hashLocalizationSourceValue({ nested: { a: 1, b: 2 }, title: "A" })
    );
  });

  it("changes when translatable content changes", () => {
    expect(hashLocalizationSourceValue({ summary: "Before" })).not.toBe(
      hashLocalizationSourceValue({ summary: "After" })
    );
  });

  it("ignores operational fields and unchanged source values", () => {
    expect(getChangedTranslatableFieldKeys({
      current: { title: "Same", summary: "Before", sortOrder: 1 },
      updates: { title: "Same", summary: "After", sortOrder: 2 },
      translatableFieldKeys: ["title", "summary"],
    })).toEqual(["summary"]);
  });
});
