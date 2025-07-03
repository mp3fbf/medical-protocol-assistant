import { test, expect } from "@playwright/test";

test.describe("Homepage Basic Checks", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page before each test in this describe block.
    await page.goto("/");
  });

  test("should have the correct title", async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Medical Protocol Assistant/);
  });

  test("should display the main heading", async ({ page }) => {
    // Expect an element with the main heading text to be visible.
    await expect(
      page.getByRole("heading", {
        name: "Medical Protocol Development Assistant",
      }),
    ).toBeVisible();
  });

  test("should display 'Coming Soon' text", async ({ page }) => {
    // Expect the "Coming Soon" text to be visible.
    await expect(page.getByText("Coming Soon")).toBeVisible();
  });
});

// Example of a simple navigation test (can be expanded)
// test.describe("Login Page Navigation (Unauthenticated)", () => {
//   test("should redirect to login when trying to access dashboard unauthenticated", async ({ page }) => {
//     await page.goto("/dashboard");
//     // Expect to be redirected to the login page
//     await expect(page).toHaveURL(/.*login\?callbackUrl=%2Fdashboard/);
//     await expect(page.getByRole("heading", { name: "Acessar Plataforma" })).toBeVisible();
//   });
// });

// More E2E tests will be added for specific user flows,
// such as logging in, creating a protocol, editing sections, etc.
