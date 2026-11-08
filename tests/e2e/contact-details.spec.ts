import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("renders matching factory contact details before client JavaScript runs", async ({ page }, testInfo) => {
  const response = await page.goto("/contact");
  expect(response?.status()).toBe(200);

  const details = page.locator("section a[href*='wa.me']").first();
  const footerDetails = page.locator("footer a[href*='wa.me']").first();
  await expect(details).toBeVisible();
  expect((await details.innerText()).trim()).toBe((await footerDetails.innerText()).trim());
  expect(await details.getAttribute("href")).toBe(await footerDetails.getAttribute("href"));
  await expect(page.locator("section").first()).toContainText("Wengyang Street");
  await expect(page.locator("section").first()).toContainText("Zhejiang Province");
  await expect(page.locator("footer")).toContainText("Wengyang Street");

  // Check the server-rendered markup, excluding serialized data for disabled channels.
  const html = (await response!.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  expect(html.match(/123 Industrial Avenue|Technology District|15551234567|\+1[^<]{0,10}555/)).toBeNull();
  await expect(page.locator("#phone")).toHaveAttribute(
    "placeholder", "Your phone number with country code",
  );
  await page.getByRole("heading", { name: "Direct Contact Channels" }).locator("..").screenshot({
    path: testInfo.outputPath("contact-details-no-js.png"),
  });
});
