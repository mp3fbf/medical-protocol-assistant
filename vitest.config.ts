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
    // Exclude E2E tests from Vitest runs by convention, Playwright handles them
    exclude: [
      "node_modules",
      "dist",
      ".idea",
      ".git",
      ".cache",
      "tests/e2e/**",
    ],
    coverage: {
      provider: "v8", // or 'istanbul'
      reporter: ["text", "json-summary", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      // Files to include in coverage analysis
      include: ["src/**/*.{js,ts,jsx,tsx}"],
      // Files to exclude from coverage analysis
      exclude: [
        "src/types/**", // Typically, type definition files don't need coverage
        "src/app/**/layout.tsx", // Layout components often have minimal logic
        "src/app/**/page.tsx", // Page components, focus on component/E2E tests
        "src/app/api/auth/**", // Auth routes, tested via integration/E2E
        "src/components/ui/**", // Assuming UI components from shadcn are well-tested
        "**/*.{test,spec}.{js,ts,jsx,tsx}", // Test files themselves
        "src/lib/db/seed.ts", // Seed scripts
        "src/middleware.ts", // Middleware, often tested via E2E
        "**/config.{js,ts}", // Configuration files
        "src/app/globals.css",
        ".*.{js,ts}", // Config files like .eslintrc.js, etc.
        "src/assets/**", // Static assets
        "src/components/providers/**", // Provider components often have minimal logic
      ],
      // Optional: Set coverage thresholds. Uncomment and adjust as needed.
      // thresholds: {
      //   lines: 80,
      //   functions: 80,
      //   branches: 80,
      //   statements: 80,
      //   autoUpdate: true, // Update thresholds automatically in vitest.config.js
      // },
      // Clean coverage results before running tests
      clean: true,
      // Watermarks for coverage reporting in HTML/console
      watermarks: {
        statements: [50, 80],
        lines: [50, 80],
        branches: [50, 80],
        functions: [50, 80],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
