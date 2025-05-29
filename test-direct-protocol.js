// Direct protocol editor test
const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  const context = await browser.newContext({
    // Mock authentication by setting session
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:3000",
          localStorage: [
            {
              name: "mock-auth",
              value: "true",
            },
          ],
        },
      ],
    },
  });

  const page = await context.newPage();

  console.log("🚀 Opening Protocol Editor Directly...\n");

  // Try to navigate directly to a protocol
  // Using the mock protocol ID from seed data
  await page.goto("http://localhost:3000/protocols/clz1234567890abcdefghijk");

  console.log("📋 Waiting for editor to load...\n");
  await page.waitForTimeout(3000);

  console.log("🧪 BROWSER IS OPEN - TEST MANUALLY:");
  console.log("====================================");
  console.log("1. If redirected to login, login with:");
  console.log("   Email: admin@example.com");
  console.log("   Password: admin123");
  console.log("");
  console.log("2. Once in the protocol editor:");
  console.log('   - Click "Seção 1" and edit "Código do Protocolo"');
  console.log('   - Switch to "Seção 2" WITHOUT saving');
  console.log('   - Switch back to "Seção 1"');
  console.log("   - Check if your edit was lost (GOOD) or persisted (BAD)");
  console.log("");
  console.log("3. Open DevTools Console (F12) to see debug logs");
  console.log("");
  console.log("Press Ctrl+C to close when done.\n");

  // Keep open
  await new Promise(() => {});
})();
