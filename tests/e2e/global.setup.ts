/**
 * Playwright Global Setup for Authentication
 *
 * This script runs once before all tests. It navigates to the login page,
 * fills in credentials for a test user, submits the form, waits for successful
 * login (e.g., navigation to dashboard), and then saves the authentication state
 * (cookies, local storage) to a file. Subsequent tests can then load this state
 * to start as an authenticated user, bypassing the login form for each test.
 */
import { chromium, type FullConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const AUTH_FILE = "playwright/.auth/user.json";
const USER_EMAIL = "dev-mock@example.com"; // Seeded user for testing
const USER_PASSWORD = "password"; // Password for the seeded user

async function globalSetup(_config: FullConfig) {
  console.log("Starting global setup: Authenticating user...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    await page.goto(`${baseURL}/login`);
    console.log(`Navigated to login page: ${page.url()}`);

    // Fill in login form
    await page.getByLabel("Email").fill(USER_EMAIL);
    console.log(`Filled email: ${USER_EMAIL}`);
    await page.getByLabel("Senha").fill(USER_PASSWORD);
    console.log("Filled password.");

    // Click login button
    await page.getByRole("button", { name: "Entrar" }).click();
    console.log("Clicked login button.");

    // Wait for navigation away from login page
    // Don't wait for specific URL as it might vary
    await page.waitForFunction(() => !window.location.href.includes("/login"), {
      timeout: 10000,
    });
    console.log(`Successfully logged in. Current URL: ${page.url()}`);

    // Save authentication state (cookies, local storage, etc.)
    await page.context().storageState({ path: AUTH_FILE });
    console.log(`Authentication state saved to ${AUTH_FILE}`);
  } catch (error) {
    console.error("Error during global setup (authentication):", error);
    // Optional: Take a screenshot on error for debugging
    // await page.screenshot({ path: 'tests/e2e/global-setup-error.png' });
    throw error; // Re-throw to fail the setup if auth fails
  } finally {
    await browser.close();
    console.log("Browser closed after global setup.");
  }
}

export default globalSetup;
