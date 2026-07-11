import { expect, test } from "@playwright/test";

test.describe("isolated Convex localization fixtures", () => {
  test.skip(
    process.env.E2E_CONVEX_LOCAL !== "1",
    "Runs only against the isolated local Convex backend."
  );

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
    await expect(page.getByText("Информация о продукте", { exact: true })).toBeVisible();
    await expect(page.getByText("Обзор продукта", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Запросить предложение" }).first()
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
