const { test, expect } = require("@playwright/test");

const { archivedProduct, smokeRoutes } = require("./support/routes");

test.describe("Lorimer storefront smoke coverage", () => {
  for (const route of smokeRoutes) {
    test(`renders ${route.path}`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page.getByRole("heading", { level: 1 })).toContainText(route.heading);
    });
  }

  test("archived product exposes inquiry state instead of checkout", async ({ page }) => {
    await page.goto(`/product/${archivedProduct.slug}`);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(archivedProduct.title);
    await expect(page.getByText(archivedProduct.statusLabel)).toBeVisible();
    await expect(page.getByRole("link", { name: "Archive inquiry" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Add to cart" })).toHaveCount(0);
  });
});
