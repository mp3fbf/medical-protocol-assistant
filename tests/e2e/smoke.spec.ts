import { test, expect } from "@playwright/test";

test.describe("Basic Smoke Tests", () => {
  test.describe("Unauthenticated User", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("homepage should have the correct title and heading", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveTitle(/Medical Protocol Assistant/);
      await expect(
        page.getByRole("heading", {
          name: "Medical Protocol Development Assistant",
        }),
      ).toBeVisible();
      await expect(page.getByText("Coming Soon")).toBeVisible();
    });

    test("should redirect to login when trying to access dashboard", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/.*login\?callbackUrl=%2Fdashboard/);
      await expect(page.getByRole("heading", { name: "Acessar Plataforma" })).toBeVisible();
    });
  });

  test.describe("Authenticated User (relies on global.setup.ts)", () => {
    test("should access dashboard successfully", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
      // Use the data-testid for more robust selection
      await expect(page.getByTestId('stat-card-title-total-protocols')).toBeVisible();
      await expect(page.getByTestId('stat-card-title-total-protocols')).toHaveText("Total de Protocolos");
    });

    test("should access protocols list page successfully", async ({ page }) => {
        await page.goto("/protocols");
        await expect(page.getByRole("heading", { name: "Protocolos Médicos"})).toBeVisible();
        await expect(page.getByRole("link", { name: /Novo Protocolo/i })).toBeVisible();
    });
  });
});