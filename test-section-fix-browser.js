// Simple browser test for section isolation
const { chromium } = require("@playwright/test");

(async () => {
  console.log("🚀 Starting browser test for section isolation...\n");

  // Launch browser
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500, // Slow down actions to see what's happening
  });

  const page = await browser.newPage();

  try {
    // Start dev server message
    console.log("⚠️  Make sure the dev server is running: pnpm dev\n");

    // Navigate to app
    console.log("📋 Navigating to login page...");
    await page.goto("http://localhost:3000/login");

    // Login
    console.log("🔐 Logging in...");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    console.log("✅ Login successful!\n");

    // Go to protocols
    console.log("📋 Navigating to protocols...");
    await page.goto("http://localhost:3000/protocols");
    await page.waitForLoadState("networkidle");

    // Click first protocol
    console.log("📝 Opening first protocol for editing...");
    const firstCard = page
      .locator('[data-testid="protocol-card"], .cursor-pointer')
      .first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");
    console.log("✅ Protocol editor opened!\n");

    // Instructions for manual testing
    console.log("🧪 MANUAL TEST INSTRUCTIONS:");
    console.log("================================");
    console.log('1. Click on "Seção 1" in the left navigation');
    console.log(
      '2. Edit the "Código do Protocolo" field (e.g., change to "TEST-123")',
    );
    console.log('3. WITHOUT clicking "Aplicar", switch to "Seção 2"');
    console.log('4. Then switch back to "Seção 1"');
    console.log("5. Check if the code field reverted to original value");
    console.log("");
    console.log("✅ EXPECTED: The code should revert (no bleeding)");
    console.log(
      '❌ BUG: If the code still shows "TEST-123", there\'s bleeding',
    );
    console.log("");
    console.log("Press Ctrl+C when done testing...\n");

    // Add debug info to console
    await page.evaluate(() => {
      console.log(
        "%c🔍 Section Isolation Debug Mode Active",
        "background: #4CAF50; color: white; padding: 5px;",
      );
      console.log(
        "Watch the console for [TextEditorPane] and [SectionEditor] logs",
      );
    });

    // Keep browser open
    await new Promise(() => {}); // Never resolves, keeps browser open
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
})();
