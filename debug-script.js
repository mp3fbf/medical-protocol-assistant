const { chromium } = require("playwright");

async function debugProtocolEditor() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on("console", (msg) => {
    console.log("BROWSER:", msg.text());
  });

  try {
    // Navigate to the application
    console.log("Navigating to localhost:3001...");
    await page.goto("http://localhost:3001", { waitUntil: "networkidle" });

    // Try to navigate to dashboard first
    console.log("Looking for dashboard or protocols link...");

    // Wait a bit for the page to load
    await page.waitForTimeout(2000);

    // Try to click on protocols or dashboard link
    const protocolsLink = page.locator('a[href*="protocols"]').first();
    if (await protocolsLink.isVisible()) {
      console.log("Found protocols link, clicking...");
      await protocolsLink.click();
      await page.waitForTimeout(1000);
    } else {
      console.log("No protocols link found, trying to navigate directly...");
      await page.goto("http://localhost:3001/protocols");
    }

    // Look for any existing protocol to edit
    console.log("Looking for existing protocols...");
    const protocolCard = page.locator('[data-testid="protocol-card"]').first();

    if (await protocolCard.isVisible()) {
      console.log("Found existing protocol, clicking to edit...");
      await protocolCard.click();
    } else {
      console.log("No existing protocols found, trying to create new one...");
      // Try to find "new protocol" button
      const newProtocolBtn = page
        .locator('button:has-text("Novo Protocolo")')
        .first();
      if (await newProtocolBtn.isVisible()) {
        await newProtocolBtn.click();
      } else {
        // Navigate directly to new protocol page
        await page.goto("http://localhost:3001/protocols/new");
      }
    }

    // Wait for protocol editor to load
    await page.waitForTimeout(3000);

    console.log("Current URL:", page.url());

    // Look for Section 1 in the navigation
    console.log("Looking for Section 1 navigation...");
    const section1Nav = page.locator("text=1. Metadados").first();

    if (await section1Nav.isVisible()) {
      console.log("Found Section 1, clicking...");
      await section1Nav.click();
      await page.waitForTimeout(1000);

      // Look for text input in Section 1
      const textInput = page.locator('textarea, input[type="text"]').first();
      if (await textInput.isVisible()) {
        console.log("Found text input in Section 1, adding text...");
        await textInput.click();
        await textInput.fill("Test content for Section 1 - DEBUGGING");

        console.log("Added text to Section 1, now switching to Section 2...");

        // Click on Section 2
        const section2Nav = page.locator("text=2. Fundamentação").first();
        if (await section2Nav.isVisible()) {
          await section2Nav.click();
          await page.waitForTimeout(1000);

          console.log(
            "Switched to Section 2, now switching back to Section 1...",
          );

          // Switch back to Section 1
          await section1Nav.click();
          await page.waitForTimeout(1000);

          // Check if the content is still there
          const updatedInput = page
            .locator('textarea, input[type="text"]')
            .first();
          const currentValue = await updatedInput.inputValue();

          console.log("Section 1 content after switching back:", currentValue);

          if (currentValue.includes("Test content for Section 1 - DEBUGGING")) {
            console.log("✅ SUCCESS: Section 1 content was preserved!");
          } else {
            console.log("❌ FAILURE: Section 1 content was lost!");
            console.log(
              "Expected to contain: Test content for Section 1 - DEBUGGING",
            );
            console.log("Actual value:", currentValue);
          }
        } else {
          console.log("Could not find Section 2 navigation");
        }
      } else {
        console.log("Could not find text input in Section 1");
      }
    } else {
      console.log("Could not find Section 1 navigation");
    }

    // Keep the browser open for manual inspection
    console.log("Keeping browser open for manual inspection...");
    await page.waitForTimeout(10000);
  } catch (error) {
    console.error("Error during debugging:", error);
  } finally {
    await browser.close();
  }
}

debugProtocolEditor().catch(console.error);
