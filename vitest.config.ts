import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // Suitable for API and utility function tests
    include: [
      "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "tests/integration/**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],
    // Optionally, you can also be explicit with exclude if preferred:
    // exclude: [
    //   'node_modules',
    //   'dist',
    //   '.idea',
    //   '.git',
    //   '.cache',
    //   'tests/e2e/**', // Exclude E2E tests from Vitest runs
    // ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
