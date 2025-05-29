/**
 * Manual test script to verify section isolation
 * This simulates the browser behavior without Playwright
 */

const { chromium } = require("playwright");

async function testSectionIsolation() {
  console.log("🚀 Starting manual section isolation test...");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the protocol editor
    console.log("📍 Navigating to localhost:3001...");
    await page.goto("http://localhost:3001/dashboard");

    // Wait for the page to load
    await page.waitForTimeout(3000);

    // Take a screenshot of the current state
    await page.screenshot({ path: "test-screenshots/01-dashboard.png" });
    console.log("📸 Screenshot taken: dashboard");

    // Try to find protocols link
    try {
      await page.click(
        'a[href="/protocols"], button:has-text("Protocolos"), [data-testid="protocols-link"]',
      );
      console.log("✅ Clicked protocols link");
    } catch (e) {
      console.log("⚠️  Protocols link not found, trying direct navigation...");
      await page.goto("http://localhost:3001/protocols");
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: "test-screenshots/02-protocols-list.png" });
    console.log("📸 Screenshot taken: protocols list");

    // Look for any clickable protocol item
    const protocolCards = await page
      .locator('a[href*="/protocols/"], [data-testid*="protocol"]')
      .count();
    console.log(`🔍 Found ${protocolCards} protocol cards`);

    if (protocolCards > 0) {
      // Click the first protocol
      await page
        .locator('a[href*="/protocols/"], [data-testid*="protocol"]')
        .first()
        .click();
      console.log("✅ Clicked first protocol");

      await page.waitForTimeout(3000);
      await page.screenshot({
        path: "test-screenshots/03-protocol-editor.png",
      });
      console.log("📸 Screenshot taken: protocol editor");

      // Look for section navigation
      const sections = await page
        .locator(
          'button:has-text("Seção"), [data-testid*="section"], button:has-text("1"), button:has-text("2")',
        )
        .count();
      console.log(`🔍 Found ${sections} section buttons`);

      if (sections > 0) {
        console.log("🎯 TESTING SECTION ISOLATION:");

        // Test Section 1
        try {
          await page.click(
            'button:has-text("1"), [data-testid="section-1"], [data-testid="section-nav-1"]',
          );
          console.log("✅ Clicked Section 1");
          await page.waitForTimeout(1000);

          // Find input fields and add test content
          const inputs = await page
            .locator("input:visible, textarea:visible")
            .count();
          console.log(`🔍 Found ${inputs} input fields in Section 1`);

          if (inputs > 0) {
            await page
              .locator("input:visible, textarea:visible")
              .first()
              .fill("TEST-123 Section 1 Content");
            console.log("✅ Added test content to Section 1");
            await page.waitForTimeout(500);
          }

          // Test Section 2
          await page.click(
            'button:has-text("2"), [data-testid="section-2"], [data-testid="section-nav-2"]',
          );
          console.log("✅ Switched to Section 2");
          await page.waitForTimeout(1000);

          const inputs2 = await page
            .locator("input:visible, textarea:visible")
            .count();
          console.log(`🔍 Found ${inputs2} input fields in Section 2`);

          if (inputs2 > 0) {
            await page
              .locator("input:visible, textarea:visible")
              .first()
              .fill("AUTHOR-TEST Section 2 Content");
            console.log("✅ Added test content to Section 2");
            await page.waitForTimeout(500);
          }

          // CRITICAL TEST: Switch back to Section 1
          await page.click(
            'button:has-text("1"), [data-testid="section-1"], [data-testid="section-nav-1"]',
          );
          console.log("✅ Switched back to Section 1");
          await page.waitForTimeout(1000);

          // Check if Section 1 content is preserved
          const section1Value = await page
            .locator("input:visible, textarea:visible")
            .first()
            .inputValue();
          console.log(`📋 Section 1 content: "${section1Value}"`);

          if (section1Value.includes("TEST-123")) {
            console.log("🎉 SUCCESS: Section 1 content PRESERVED!");
          } else {
            console.log("❌ FAILURE: Section 1 content LOST!");
          }

          // Check Section 2 content
          await page.click(
            'button:has-text("2"), [data-testid="section-2"], [data-testid="section-nav-2"]',
          );
          await page.waitForTimeout(1000);

          const section2Value = await page
            .locator("input:visible, textarea:visible")
            .first()
            .inputValue();
          console.log(`📋 Section 2 content: "${section2Value}"`);

          if (section2Value.includes("AUTHOR-TEST")) {
            console.log("🎉 SUCCESS: Section 2 content PRESERVED!");
          } else {
            console.log("❌ FAILURE: Section 2 content LOST!");
          }

          await page.screenshot({
            path: "test-screenshots/04-final-state.png",
          });
          console.log("📸 Screenshot taken: final state");
        } catch (error) {
          console.log("❌ Error during section testing:", error.message);
          await page.screenshot({ path: "test-screenshots/error.png" });
        }
      } else {
        console.log("❌ No section navigation found");
      }
    } else {
      console.log("❌ No protocols found to test");
    }
  } catch (error) {
    console.log("❌ Test failed:", error.message);
    await page.screenshot({ path: "test-screenshots/error-main.png" });
  } finally {
    console.log("📸 All screenshots saved to test-screenshots/");
    await page.waitForTimeout(2000); // Keep browser open for 2 seconds to see final state
    await browser.close();
  }
}

// Create screenshots directory
const fs = require("fs");
if (!fs.existsSync("test-screenshots")) {
  fs.mkdirSync("test-screenshots");
}

testSectionIsolation().catch(console.error);
