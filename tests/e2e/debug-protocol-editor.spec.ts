import { test, expect } from "@playwright/test";

test("Debug protocol editor section switching bug", async ({ page }) => {
  // Enable console logging
  page.on("console", (msg) => {
    console.log("BROWSER CONSOLE:", msg.text());
  });

  // Navigate to the application (using port 3001 where dev server is running)
  console.log("Navigating to localhost:3001...");
  await page.goto("http://localhost:3001");

  // Wait for initial load
  await page.waitForTimeout(2000);

  // Try to navigate to protocols page
  console.log("Navigating to protocols page...");
  try {
    // Look for protocols link
    const protocolsLink = page.locator('a[href*="protocols"]').first();
    if (await protocolsLink.isVisible({ timeout: 5000 })) {
      await protocolsLink.click();
    } else {
      // Navigate directly
      await page.goto("http://localhost:3001/protocols");
    }
  } catch (e) {
    await page.goto("http://localhost:3001/protocols");
  }

  await page.waitForTimeout(2000);

  // Try to find existing protocol or create new one
  console.log("Looking for protocols...");
  let protocolExists = false;

  try {
    const protocolCard = page.locator('[data-testid="protocol-card"]').first();
    if (await protocolCard.isVisible({ timeout: 3000 })) {
      console.log("Found existing protocol, clicking...");
      await protocolCard.click();
      protocolExists = true;
    }
  } catch (e) {
    console.log("No existing protocol found");
  }

  if (!protocolExists) {
    console.log("Creating new protocol...");
    try {
      const newProtocolBtn = page
        .locator('button:has-text("Novo"), a:has-text("Novo")')
        .first();
      if (await newProtocolBtn.isVisible({ timeout: 3000 })) {
        await newProtocolBtn.click();
      } else {
        await page.goto("http://localhost:3001/protocols/new");
      }
    } catch (e) {
      await page.goto("http://localhost:3001/protocols/new");
    }
  }

  // Wait for editor to load
  await page.waitForTimeout(3000);
  console.log("Current URL:", page.url());

  // Look for Section 1 navigation (try multiple selectors)
  console.log("Looking for Section 1...");
  let section1Found = false;
  const section1Selectors = [
    "text=1. Metadados",
    "text=Metadados",
    '[data-section="1"]',
    'li:has-text("1")',
    'button:has-text("1")',
    ".section-nav button:first-child",
  ];

  for (const selector of section1Selectors) {
    try {
      const section1 = page.locator(selector).first();
      if (await section1.isVisible({ timeout: 2000 })) {
        console.log(`Found Section 1 with selector: ${selector}`);
        await section1.click();
        section1Found = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!section1Found) {
    console.log("Could not find Section 1 navigation");
    await page.screenshot({ path: "debug-no-section1.png" });
    return;
  }

  await page.waitForTimeout(1000);

  // Look for text input area
  console.log("Looking for text input in Section 1...");
  const inputSelectors = [
    "textarea",
    'input[type="text"]',
    '[contenteditable="true"]',
    ".editor textarea",
    ".section-editor textarea",
  ];

  let textInputFound = false;
  for (const selector of inputSelectors) {
    try {
      const textInput = page.locator(selector).first();
      if (await textInput.isVisible({ timeout: 2000 })) {
        console.log(`Found text input with selector: ${selector}`);
        console.log("Adding test content to Section 1...");

        await textInput.click();
        await textInput.fill("TEST CONTENT FOR SECTION 1 - DEBUG BUG");

        // Trigger any change events
        await textInput.blur();
        await page.waitForTimeout(500);

        textInputFound = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!textInputFound) {
    console.log("Could not find text input in Section 1");
    await page.screenshot({ path: "debug-no-input.png" });
    return;
  }

  console.log("Content added to Section 1, now switching to Section 2...");

  // Look for Section 2
  const section2Selectors = [
    "text=2. Fundamentação",
    "text=Fundamentação",
    '[data-section="2"]',
    'li:has-text("2")',
    'button:has-text("2")',
    ".section-nav button:nth-child(2)",
  ];

  let section2Found = false;
  for (const selector of section2Selectors) {
    try {
      const section2 = page.locator(selector).first();
      if (await section2.isVisible({ timeout: 2000 })) {
        console.log(`Found Section 2 with selector: ${selector}`);
        await section2.click();
        section2Found = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!section2Found) {
    console.log("Could not find Section 2 navigation");
    await page.screenshot({ path: "debug-no-section2.png" });
    return;
  }

  await page.waitForTimeout(1000);
  console.log("Switched to Section 2, now switching back to Section 1...");

  // Switch back to Section 1
  for (const selector of section1Selectors) {
    try {
      const section1 = page.locator(selector).first();
      if (await section1.isVisible({ timeout: 2000 })) {
        await section1.click();
        break;
      }
    } catch (e) {
      continue;
    }
  }

  await page.waitForTimeout(1000);

  // Check if content is preserved
  console.log("Back in Section 1, checking if content was preserved...");

  for (const selector of inputSelectors) {
    try {
      const textInput = page.locator(selector).first();
      if (await textInput.isVisible({ timeout: 2000 })) {
        const currentValue = await textInput.inputValue();
        console.log("Current Section 1 content:", currentValue);

        if (currentValue.includes("TEST CONTENT FOR SECTION 1 - DEBUG BUG")) {
          console.log("✅ SUCCESS: Section 1 content was preserved!");
        } else {
          console.log("❌ FAILURE: Section 1 content was lost!");
          console.log("Expected: TEST CONTENT FOR SECTION 1 - DEBUG BUG");
          console.log("Actual:", currentValue);
        }

        await page.screenshot({ path: "debug-final-state.png" });
        break;
      }
    } catch (e) {
      continue;
    }
  }

  // Keep page open for manual inspection
  await page.waitForTimeout(5000);
});
