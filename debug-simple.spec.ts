import { test, expect, chromium } from "@playwright/test";

test("Manual debug without auth", async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on("console", (msg) => {
    console.log("BROWSER CONSOLE:", msg.text());
  });

  try {
    // Navigate to the application
    console.log("Navigating to localhost:3001...");
    await page.goto("http://localhost:3001", { waitUntil: "networkidle" });

    // Take screenshot of home page
    await page.screenshot({ path: "debug-homepage.png" });

    // Wait for page to load and then navigate to protocols
    await page.waitForTimeout(2000);

    // Try to navigate to protocols directly
    console.log("Navigating to protocols page...");
    await page.goto("http://localhost:3001/protocols", {
      waitUntil: "networkidle",
    });
    await page.screenshot({ path: "debug-protocols-page.png" });

    // Look for any protocol or create new button
    await page.waitForTimeout(2000);

    // Check if we can access the page or if there's an auth redirect
    const currentUrl = page.url();
    console.log("Current URL after protocols navigation:", currentUrl);

    if (currentUrl.includes("login") || currentUrl.includes("auth")) {
      console.log(
        "Redirected to login, attempting to navigate to new protocol directly...",
      );
      await page.goto("http://localhost:3001/protocols/new", {
        waitUntil: "networkidle",
      });
      await page.screenshot({ path: "debug-new-protocol.png" });
    }

    // Check current page content
    const pageTitle = await page.title();
    console.log("Page title:", pageTitle);

    const bodyText = await page.locator("body").textContent();
    console.log(
      "Page contains protocols?",
      bodyText?.includes("protocol") ? "YES" : "NO",
    );
    console.log(
      "Page contains login?",
      bodyText?.includes("login") || bodyText?.includes("Login") ? "YES" : "NO",
    );

    // Look for any section navigation
    const sectionElements = await page
      .locator("text=/[Ss]eção|[Ss]ection/")
      .count();
    console.log("Found section elements:", sectionElements);

    if (sectionElements > 0) {
      console.log("Found section navigation, attempting to test the bug...");

      // Look for Section 1 navigation
      const section1 = page.locator("text=/1.*[Mm]etadados/").first();
      if (await section1.isVisible({ timeout: 5000 })) {
        console.log("Found Section 1, clicking...");
        await section1.click();
        await page.waitForTimeout(1000);

        // Look for text input
        const textInput = page.locator('textarea, input[type="text"]').first();
        if (await textInput.isVisible({ timeout: 3000 })) {
          console.log("Found text input, adding content...");
          await textInput.fill("TEST CONTENT - DEBUGGING SECTION SWITCHING");
          await page.waitForTimeout(500);

          // Look for Section 2
          const section2 = page.locator("text=/2.*[Ff]undamentação/").first();
          if (await section2.isVisible({ timeout: 3000 })) {
            console.log("Found Section 2, switching...");
            await section2.click();
            await page.waitForTimeout(1000);

            // Switch back to Section 1
            console.log("Switching back to Section 1...");
            await section1.click();
            await page.waitForTimeout(1000);

            // Check content
            const updatedContent = await textInput.inputValue();
            console.log("Content after switching back:", updatedContent);

            if (
              updatedContent.includes(
                "TEST CONTENT - DEBUGGING SECTION SWITCHING",
              )
            ) {
              console.log("✅ SUCCESS: Content preserved!");
            } else {
              console.log("❌ FAILURE: Content lost!");
            }
          }
        }
      }
    }

    // Keep browser open for manual inspection
    console.log("Keeping browser open for 30 seconds for manual inspection...");
    await page.waitForTimeout(30000);
  } finally {
    await browser.close();
  }
});
