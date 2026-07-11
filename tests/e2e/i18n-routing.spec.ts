import { expect, test } from "@playwright/test";

test.describe("i18n routing safety", () => {
  test("serves the default English site", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("returns 404 and noindex for an unsupported locale", async ({ page }) => {
    const response = await page.goto("/fr/products/p0-unsupported-locale");

    expect(response?.status()).toBe(404);
    const robots = page.locator('meta[name="robots"]');
    expect(await robots.count()).toBeGreaterThan(0);
    for (const content of await robots.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("content") ?? "")
    )) {
      expect(content).toContain("noindex");
    }
  });

  test("does not expose a missing Russian product", async ({ page }) => {
    const response = await page.goto("/ru/products/p0-definitely-missing-product");

    expect(response?.status()).toBe(404);
    const robots = page.locator('meta[name="robots"]');
    expect(await robots.count()).toBeGreaterThan(0);
    for (const content of await robots.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("content") ?? "")
    )) {
      expect(content).toContain("noindex");
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test("redirects the legacy RFQ path without losing its query", async ({ request }) => {
    const response = await request.get("/rfq?source=p0-e2e", {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe(
      "/contact?source=p0-e2e#request-quote"
    );
  });
});
