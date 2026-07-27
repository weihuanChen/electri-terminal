import { describe, expect, it } from "vitest";
import {
  DEFAULT_PUBLIC_CONTACT_SETTINGS,
  normalizePublicContactSettings,
} from "./contactConfig";

describe("normalizePublicContactSettings", () => {
  it("keeps WeChat disabled for legacy settings without a WeChat field", () => {
    const settings = normalizePublicContactSettings({
      email: { enabled: true, value: "sales@example.com" },
    });

    expect(settings.wechat).toEqual(DEFAULT_PUBLIC_CONTACT_SETTINGS.wechat);
  });

  it("normalizes a configured WeChat contact", () => {
    const settings = normalizePublicContactSettings({
      wechat: { enabled: true, value: "  electri-sales  " },
    });

    expect(settings.wechat).toEqual({
      enabled: true,
      value: "electri-sales",
    });
  });
});
