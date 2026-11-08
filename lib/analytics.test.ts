import { describe, expect, it } from "vitest";
import { getPageType, isQuoteLink } from "./analytics";

describe("quote entry classification", () => {
  const pageUrl = "https://electriterminal.com/products/copper-lug";

  it.each([
    "/contact#request-quote",
    "/contact?source=blog&article=terminal-guide#request-quote",
    "/ru/contact#request-quote",
    "/contact/#request-quote",
    "/rfq?source=legacy",
    "#inquiry-form",
    "/ru/products/copper-lug#inquiry-form",
  ])("recognizes %s as a quote entry", (href) => {
    expect(isQuoteLink(href, pageUrl)).toBe(true);
  });

  it.each([
    "/contact",
    "/contact#business-hours",
    "/products#request-quote",
    "/products/copper-lug",
    "https://another-site.example/contact#request-quote",
    "https://another-site.example/products/lug#inquiry-form",
    "mailto:sales@electriterminal.com",
    "https://wa.me/123456",
    "http://[invalid",
  ])("does not count %s as a quote entry", (href) => {
    expect(isQuoteLink(href, pageUrl)).toBe(false);
  });

  it("classifies localized source pages consistently", () => {
    expect(getPageType("/ru/products/copper-lug")).toBe("product");
    expect(getPageType("/ru/contact")).toBe("contact");
    expect(getPageType("/ru")).toBe("home");
  });
});
