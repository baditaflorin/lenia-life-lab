import { expect, test } from "@playwright/test";

test("loads the lab and starts a creature", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Lenia Life Lab" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Star on GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/lenia-life-lab"
  );
  await expect(page.getByRole("link", { name: "Support via PayPal" })).toHaveAttribute(
    "href",
    "https://www.paypal.com/paypalme/florinbadita"
  );

  await page.getByTestId("awaken").click();
  await expect(page.locator("#wasm-state")).toHaveText("ready");
  await expect(page.locator("#engine-mode")).not.toHaveText("idle");
  await expect(page.locator("#viewport canvas")).toBeVisible();

  await page.getByTestId("mutate").click();
  await expect(page.locator("#status")).toHaveText("Mutated");
});
