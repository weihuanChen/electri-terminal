import { expect, test } from "@playwright/test";

test.describe("isolated Convex localization fixtures", () => {
  test.skip(
    process.env.E2E_CONVEX_LOCAL !== "1",
    "Runs only against the isolated local Convex backend."
  );

  test("renders a published structured Russian homepage", async ({ page }) => {
    const response = await page.goto("/ru");
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page).toHaveTitle("Тестовая главная страница | Electri Terminal");
    await expect(
      page.getByRole("heading", { level: 1, name: "Надежные промышленные соединения" })
    ).toBeVisible();
    await expect(page.getByText("Русский текст главной страницы.")).toBeVisible();
    await expect(page.locator("#hero").getByRole("link", { name: "Связаться с нами" })).toHaveAttribute(
      "href",
      "/ru/contact#request-quote"
    );
    const header = page.getByRole("banner");
    const footer = page.getByRole("contentinfo");
    await expect(header.locator('a[href="/ru"]')).toBeVisible();
    await expect(header.locator('a[href^="/ru/contact"]')).toHaveCount(0);
    await expect(header.locator('a[href="/ru/manufacturing"]')).toHaveCount(0);
    await expect(header.locator('a[href="/ru/search"]')).toHaveCount(0);
    await expect(footer.locator('a[href^="/ru/contact"]')).toHaveCount(0);
    await expect(footer.locator('a[href="/ru/resources"]')).toHaveCount(0);
    await expect(footer.locator('a[href="/ru/privacy-policy"]')).toHaveCount(0);
  });

  test("renders a published Russian product from deterministic fixtures", async ({
    page,
  }) => {
    const response = await page.goto("/ru/products/e2e-published-terminal");

    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(
      page.getByRole("heading", { name: "Опубликованная тестовая клемма" })
    ).toBeVisible();
    await expect(
      page.getByText("Русское описание тестовой клеммы.").first()
    ).toBeVisible();
    await expect(page.getByText("Описание изделия", { exact: true })).toBeVisible();
    await expect(page.getByText("Обзор изделия", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Запросить коммерческое предложение" }).first()
    ).toBeVisible();
  });

  test("keeps an untranslated Russian fixture product unavailable", async ({ page }) => {
    const english = await page.goto(
      "/products/e2e-missing-translation-terminal"
    );
    expect(english?.status()).toBe(200);

    const russian = await page.goto(
      "/ru/products/e2e-missing-translation-terminal"
    );
    expect(russian?.status()).toBe(404);
  });
});
