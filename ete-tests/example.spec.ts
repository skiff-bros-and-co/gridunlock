import { test } from "@playwright/test";

test("Take a screenshot", async ({ page }) => {
  await page.goto("/");

  await page.screenshot();
});
