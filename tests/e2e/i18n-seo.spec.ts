import { expect, test } from "@playwright/test";

test.describe("i18n SEO surfaces", () => {
  test("emits a self-canonical English contact page", async ({ page }) => {
    const response = await page.goto("/contact");

    expect(response?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://electriterminal.com/contact"
    );
  });

  test("keeps draft Russian URLs out of the sitemap", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const xml = await response.text();

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/xml");
    expect(xml).toContain("<urlset");
    expect(xml).not.toContain("electriterminal.com/ru/");

    const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      ([, location]) => location
    );
    expect(locations.length).toBeGreaterThan(0);
    for (const location of locations) {
      const url = new URL(location);
      expect(url.search).toBe("");
      expect(url.hash).toBe("");
    }
  });

  test("blocks draft locale crawling in robots.txt", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const robots = await response.text();

    expect(response.status()).toBe(200);
    expect(robots).toContain("Disallow: /ru");
    expect(robots).toContain("Sitemap: https://electriterminal.com/sitemap.xml");
  });
});
