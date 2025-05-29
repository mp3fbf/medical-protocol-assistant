const { chromium } = require("playwright");

async function testSectionBleedingReal() {
  console.log("🚀 TESTING REAL BROWSER SECTION BLEEDING...");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000, // Slow down for visibility
  });

  const page = await browser.newPage();

  try {
    // Go to the homepage
    await page.goto("http://localhost:3001");
    console.log("✅ Navigated to homepage");

    // Click login
    await page.click('a[href="/login"]');
    await page.waitForURL("**/login");
    console.log("✅ Navigated to login page");

    // Fill login form - using the test credentials
    await page.fill('input[type="email"]', "admin@test.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForTimeout(3000);
    console.log("✅ Login submitted, waiting for redirect...");

    // Try to navigate to protocols page
    await page.goto("http://localhost:3001/protocols");
    await page.waitForTimeout(2000);
    console.log("✅ Navigated to protocols page");

    // Look for any protocol links
    const protocolLinks = await page
      .locator('a[href*="/protocols/"][href*="c"]')
      .count();
    console.log(`🔍 Found ${protocolLinks} protocol links`);

    if (protocolLinks > 0) {
      // Click on the first protocol
      await page.locator('a[href*="/protocols/"][href*="c"]').first().click();
      await page.waitForTimeout(3000);
      console.log("✅ Clicked on first protocol");

      // Take screenshot
      await page.screenshot({ path: "protocol-editor.png", fullPage: true });
      console.log("📸 Screenshot saved: protocol-editor.png");

      // CRITICAL TEST: Look for section navigation
      const sectionButtons = await page
        .locator(
          'button:has-text("1"), button:has-text("2"), button:has-text("3")',
        )
        .count();
      console.log(`🔍 Found ${sectionButtons} section navigation buttons`);

      if (sectionButtons >= 2) {
        console.log("🧪 STARTING SECTION BLEEDING TEST...");

        // TEST 1: Go to Section 1
        await page.click('button:has-text("1")');
        await page.waitForTimeout(1000);
        console.log("✅ Clicked Section 1");

        // Find input fields and add content
        const inputs = await page
          .locator("input:visible, textarea:visible")
          .count();
        console.log(`🔍 Found ${inputs} input fields in Section 1`);

        if (inputs > 0) {
          const testContent1 = "BLEEDING-TEST-SECTION-1-" + Date.now();
          await page.locator("input:visible, textarea:visible").first().clear();
          await page
            .locator("input:visible, textarea:visible")
            .first()
            .fill(testContent1);
          console.log(`✅ Added content to Section 1: ${testContent1}`);

          // Wait for content to be processed
          await page.waitForTimeout(1000);

          // TEST 2: Switch to Section 2
          await page.click('button:has-text("2")');
          await page.waitForTimeout(1000);
          console.log("✅ Switched to Section 2");

          // Add content to Section 2
          const inputs2 = await page
            .locator("input:visible, textarea:visible")
            .count();
          console.log(`🔍 Found ${inputs2} input fields in Section 2`);

          if (inputs2 > 0) {
            const testContent2 = "BLEEDING-TEST-SECTION-2-" + Date.now();
            await page
              .locator("input:visible, textarea:visible")
              .first()
              .clear();
            await page
              .locator("input:visible, textarea:visible")
              .first()
              .fill(testContent2);
            console.log(`✅ Added content to Section 2: ${testContent2}`);

            await page.waitForTimeout(1000);

            // CRITICAL TEST: Switch back to Section 1
            await page.click('button:has-text("1")');
            await page.waitForTimeout(1000);
            console.log("✅ Switched back to Section 1");

            // Check if Section 1 content is preserved
            const section1Value = await page
              .locator("input:visible, textarea:visible")
              .first()
              .inputValue();
            console.log(
              `📋 Section 1 content after switch: "${section1Value}"`,
            );

            if (section1Value.includes("BLEEDING-TEST-SECTION-1")) {
              console.log("🎉 SUCCESS: Section 1 content PRESERVED!");
            } else {
              console.log(
                "❌ FAILURE: Section 1 content LOST! Content bleeding detected!",
              );
              console.log(`Expected: containing "BLEEDING-TEST-SECTION-1"`);
              console.log(`Got: "${section1Value}"`);
            }

            // Check Section 2 content
            await page.click('button:has-text("2")');
            await page.waitForTimeout(1000);

            const section2Value = await page
              .locator("input:visible, textarea:visible")
              .first()
              .inputValue();
            console.log(
              `📋 Section 2 content after switch: "${section2Value}"`,
            );

            if (section2Value.includes("BLEEDING-TEST-SECTION-2")) {
              console.log("🎉 SUCCESS: Section 2 content PRESERVED!");
            } else {
              console.log(
                "❌ FAILURE: Section 2 content LOST! Content bleeding detected!",
              );
              console.log(`Expected: containing "BLEEDING-TEST-SECTION-2"`);
              console.log(`Got: "${section2Value}"`);
            }

            // Final screenshot
            await page.screenshot({
              path: "section-test-result.png",
              fullPage: true,
            });
            console.log("📸 Final screenshot saved: section-test-result.png");

            // Test results
            const section1Preserved = section1Value.includes(
              "BLEEDING-TEST-SECTION-1",
            );
            const section2Preserved = section2Value.includes(
              "BLEEDING-TEST-SECTION-2",
            );

            if (section1Preserved && section2Preserved) {
              console.log(
                "🎉🎉🎉 SECTION BLEEDING FIX CONFIRMED - ALL TESTS PASSED! 🎉🎉🎉",
              );
            } else {
              console.log(
                "❌❌❌ SECTION BLEEDING STILL EXISTS - FIX FAILED! ❌❌❌",
              );
            }

            return {
              success: section1Preserved && section2Preserved,
              section1Preserved,
              section2Preserved,
              section1Content: section1Value,
              section2Content: section2Value,
            };
          }
        }
      } else {
        console.log(
          "❌ No section navigation found - cannot test section bleeding",
        );
      }
    } else {
      console.log("❌ No protocols found - cannot test section bleeding");
    }
  } catch (error) {
    console.log("❌ Test failed with error:", error.message);
    await page.screenshot({ path: "error-screenshot.png" });
  } finally {
    await page.waitForTimeout(5000); // Keep browser open to see results
    await browser.close();
  }
}

testSectionBleedingReal().catch(console.error);
