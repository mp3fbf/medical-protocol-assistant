import { test, expect } from "@playwright/test";

// const AUTH_FILE = "playwright/.auth/user.json"; // Not needed if using global config

test.describe("Authentication Flows", () => {
  test.describe("Unauthenticated User", () => {
    test.use({ storageState: { cookies: [], origins: [] } }); 

    test("should display the login page correctly", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByRole("heading", { name: "Acessar Plataforma" })).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Senha")).toBeVisible();
      await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    });

    test("should fail login with invalid credentials", async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel("Email").fill("wrong@example.com");
      await page.getByLabel("Senha").fill("wrongpassword");
      await page.getByRole("button", { name: "Entrar" }).click();

      // Expect an error message to be displayed on the login page
      // Option 1: Target the AlertDescription specifically
      // await expect(page.locator('[role="alert"] div[class*="AlertDescription"]').getByText(/Credenciais inválidas/i)).toBeVisible();
      // Option 2: Target a more general text within the alert
      await expect(page.getByRole('alert').filter({ hasText: /Credenciais inválidas|Erro de Login/i })).toBeVisible();
      
      expect(page.url()).toContain("/login"); 
    });
  });

  test.describe("Authenticated User (relies on global.setup.ts)", () => {
    test("should be able to logout", async ({ page, context }) => {
      await page.goto("/dashboard");
      await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

      const logoutButton = page.getByRole("button", { name: /Sair|Logout/i });
      await expect(logoutButton).toBeVisible();
      await logoutButton.click();

      await page.waitForURL("**/login");
      await expect(page.getByRole("heading", { name: "Acessar Plataforma" })).toBeVisible();
      
      await context.clearCookies();
      
      await page.goto("/dashboard");
      await page.waitForURL("**/login?callbackUrl=%2Fdashboard"); 
    });
  });
});