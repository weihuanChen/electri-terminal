import { expect, test, type Page } from "@playwright/test";

async function gaEvents(page: Page, eventName: string) {
  return page.evaluate((name) => (window.dataLayer ?? [])
    .map((entry) => Array.from(entry as ArrayLike<unknown>))
    .filter((entry) => entry[0] === "event" && entry[1] === name)
    .map((entry) => entry[2] as Record<string, unknown>), eventName);
}

test.beforeEach(async ({ page }) => {
  // Exercise the real event handlers without sending test traffic to GA4.
  await page.route("https://www.googletagmanager.com/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }));
  await page.route("**/g/collect**", (route) => route.abort());
});

test("tracks header, hero and footer quote links with distinct placements", async ({ page }) => {
  for (const [selector, placement] of [
    ["header a[href*='#request-quote']", "header"],
    [".hero-shell a[href*='#request-quote'] svg", "hero"],
    ["footer a[href*='#request-quote']", "footer"],
  ]) {
    await page.goto("/");
    await page.locator(selector).first().click();
    await expect(page).toHaveURL(/\/contact#request-quote$/);
    await expect.poll(() => gaEvents(page, "rfq_click")).toHaveLength(1);
    expect((await gaEvents(page, "rfq_click"))[0]).toMatchObject({
      placement, page_path: "/", page_type: "home", send_to: "G-F5M3QMLTL1",
    });
  }
});

test("tracks the mobile header quote link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("header a[href*='#request-quote']").filter({ visible: true }).first().click();
  await expect.poll(() => gaEvents(page, "rfq_click")).toHaveLength(1);
  expect((await gaEvents(page, "rfq_click"))[0]).toMatchObject({ placement: "header" });
});

test("counts a mode switch once and emits submission only after API success", async ({ page }) => {
  let acceptSubmission = false;
  await page.route("**/api/inquiries", (route) => route.fulfill({
    status: acceptSubmission ? 200 : 500,
    contentType: "application/json",
    body: JSON.stringify(acceptSubmission ? { success: true } : { error: "Test rejection" }),
  }));
  await page.goto("/contact");
  await page.getByRole("button", { name: "Request a Quote", exact: true }).click();
  await expect.poll(() => gaEvents(page, "rfq_click")).toHaveLength(1);
  expect((await gaEvents(page, "rfq_click"))[0]).toMatchObject({ placement: "contact_mode_switch" });

  await page.locator("#name").fill("Analytics test");
  await page.locator("#email").fill("analytics-test@example.com");
  await page.locator("#company").fill("Test company");
  await page.locator("#country").fill("Test country");
  await page.getByPlaceholder("e.g., custom copper lug per drawing, RNB5.5-8").fill("TEST-LUG");
  await page.getByRole("button", { name: "Submit Quote Request", exact: true }).click();
  await expect(page.getByText("Test rejection", { exact: true })).toBeVisible();
  expect(await gaEvents(page, "rfq_submit")).toHaveLength(0);

  acceptSubmission = true;
  await page.getByRole("button", { name: "Submit Quote Request", exact: true }).click();
  await expect.poll(() => gaEvents(page, "rfq_submit")).toHaveLength(1);
  const [event] = await gaEvents(page, "rfq_submit");
  expect(event).toMatchObject({ inquiry_type: "rfq", page_path: "/contact", page_type: "contact" });
  expect(JSON.stringify(event)).not.toContain("analytics-test@example.com");
});
