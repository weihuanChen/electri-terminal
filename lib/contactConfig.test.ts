import { describe, expect, it } from "vitest";
import { normalizeContactSettings } from "../convex/lib/siteSettings";
import {
  DEFAULT_PUBLIC_CONTACT_SETTINGS,
  normalizePublicContactSettings,
} from "./contactConfig";

describe("normalizePublicContactSettings", () => {
  it("does not invent contact details when settings are missing", () => {
    const settings = normalizePublicContactSettings();

    expect(settings.whatsapp).toEqual({ enabled: false, value: "", href: undefined });
    expect(settings.phone).toEqual({ enabled: false, value: "" });
    expect(settings.address).toEqual({ enabled: false, lines: [] });
    expect(normalizeContactSettings()).toEqual(settings);
  });

  it("preserves configured factory details instead of substituting defaults", () => {
    const settings = normalizePublicContactSettings({
      whatsapp: {
        enabled: true,
        value: " +86 180 2479 0490 ",
        href: " https://wa.me/message/XDYARVW7EE3EO1 ",
      },
      address: {
        enabled: true,
        lines: [" Wengyang Street ", "Yueqing City", "Zhejiang Province", "China"],
      },
    });

    expect(settings.whatsapp.value).toBe("+86 180 2479 0490");
    expect(settings.whatsapp.href).toBe("https://wa.me/message/XDYARVW7EE3EO1");
    expect(settings.address.lines).toEqual([
      "Wengyang Street", "Yueqing City", "Zhejiang Province", "China",
    ]);
  });

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
