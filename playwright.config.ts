import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Read from default ".env.local" file.
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const AUTH_FILE = "playwright/.auth/user.json";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",

  /* MAXIMUM TIMEOUTS FOR O3 TESTING */
  timeout: 604800000, // 7 days per test
  expect: {
    timeout: 86400000, // 24 hours for expectations
  },
  globalTimeout: 604800000, // 7 days for all tests

  /* Global setup script to run before all tests (for login) */
  globalSetup: require.resolve("./tests/e2e/global.setup.ts"),

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Use saved authentication state for all tests */
    storageState: AUTH_FILE,

    /* MAXIMUM TIMEOUTS FOR O3 TESTING */
    actionTimeout: 86400000, // 24 hours for actions
    navigationTimeout: 86400000, // 24 hours for navigation
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_FILE, // Ensure each project uses the auth state
      },
      dependencies: ["setup"], // Depends on the global setup for authentication
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },

    // Project for authentication setup, does not run tests but runs globalSetup
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "pnpm dev",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 120 seconds
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // Ensure NEXTAUTH_URL is explicitly passed to the webServer's environment
      // This is important if your app running via `pnpm dev` relies on it internally
      // even if Playwright's baseURL is also set.
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    },
  },
});
