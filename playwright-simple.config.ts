import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "test-simple-playwright.spec.ts",
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: "list",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on",
    screenshot: "on",
    video: "on",
    headless: false,
    slowMo: 1000,
  },

  // SEM global setup
  // SEM webServer (assumindo que já está rodando)
});
