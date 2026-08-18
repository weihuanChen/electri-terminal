import { describe, expect, it } from "vitest";

import {
  formatPromptLabRunTime,
  formatPromptLabTokenCount,
} from "@/lib/promptLabFormatters";

describe("Prompt Lab formatters", () => {
  it("formats run times in a fixed timezone", () => {
    expect(formatPromptLabRunTime(Date.UTC(2026, 0, 2, 3, 4))).toBe(
      "Jan 02, 03:04",
    );
    expect(formatPromptLabRunTime()).toBe("—");
  });

  it("formats token counts with a fixed locale", () => {
    expect(formatPromptLabTokenCount(1_234_567)).toBe("1,234,567");
  });
});
