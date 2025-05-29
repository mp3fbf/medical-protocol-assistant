const { chromium } = require("playwright");

async function debugProtocolEditor() {
  const browser = await chromium.launch({
    headless: false,
    devtools: true, // Open dev tools automatically
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") {
      console.log("🔴 BROWSER ERROR:", text);
    } else if (type === "log" && text.includes("[")) {
      console.log("🔍 BROWSER LOG:", text);
    }
  });

  try {
    console.log("🚀 Starting debug session...");
    console.log("📍 Navigating to localhost:3001...");

    await page.goto("http://localhost:3001", { waitUntil: "networkidle" });

    // Take initial screenshot
    await page.screenshot({ path: "debug-1-homepage.png" });
    console.log("📸 Screenshot saved: debug-1-homepage.png");

    await page.waitForTimeout(2000);

    console.log("📍 Current URL:", page.url());
    const title = await page.title();
    console.log("📄 Page title:", title);

    // Check if we're redirected to login
    if (page.url().includes("login") || page.url().includes("auth")) {
      console.log(
        "🔐 Detected auth redirect. Trying to access protocols directly...",
      );
      await page.goto("http://localhost:3001/protocols/new", {
        waitUntil: "networkidle",
      });
      await page.screenshot({ path: "debug-2-direct-protocols.png" });
    } else {
      console.log("🏠 On home page, trying to navigate to protocols...");

      // Look for navigation links
      const navLinks = await page.locator("nav a, header a").allTextContents();
      console.log("🧭 Found navigation links:", navLinks);

      // Try to click protocols link
      const protocolsLink = page
        .locator('a:has-text("Protocolos"), a:has-text("Protocols")')
        .first();
      if (await protocolsLink.isVisible({ timeout: 3000 })) {
        console.log("🔗 Found protocols link, clicking...");
        await protocolsLink.click();
        await page.waitForTimeout(1000);
      } else {
        console.log("🔗 No protocols link found, navigating directly...");
        await page.goto("http://localhost:3001/protocols", {
          waitUntil: "networkidle",
        });
      }
    }

    await page.screenshot({ path: "debug-3-protocols-page.png" });
    console.log("📸 Screenshot saved: debug-3-protocols-page.png");

    await page.waitForTimeout(2000);
    console.log("📍 Current URL after protocols navigation:", page.url());

    // Check page content
    const bodyText = await page.locator("body").textContent();
    const hasProtocolContent =
      bodyText.includes("protocol") ||
      bodyText.includes("Protocol") ||
      bodyText.includes("Protocolo");
    const hasLoginContent =
      bodyText.includes("login") ||
      bodyText.includes("Login") ||
      bodyText.includes("Entre");

    console.log(
      "📄 Page contains protocol content:",
      hasProtocolContent ? "✅" : "❌",
    );
    console.log(
      "📄 Page contains login content:",
      hasLoginContent ? "✅" : "❌",
    );

    if (hasLoginContent) {
      console.log("🔐 Still on login page. Cannot proceed with editor test.");
      console.log(
        "💡 You may need to set up authentication or disable auth for testing.",
      );
      console.log("⏸️ Keeping browser open for manual inspection...");
      await page.waitForTimeout(30000);
      return;
    }

    // Look for ways to access the editor
    const newProtocolBtn = page
      .locator(
        'button:has-text("Novo"), a:has-text("Novo"), button:has-text("Create"), a:has-text("Create")',
      )
      .first();
    const existingProtocol = page
      .locator('[data-testid="protocol-card"], .protocol-card, .protocol-item')
      .first();

    if (await existingProtocol.isVisible({ timeout: 3000 })) {
      console.log("📋 Found existing protocol, clicking to edit...");
      await existingProtocol.click();
    } else if (await newProtocolBtn.isVisible({ timeout: 3000 })) {
      console.log("➕ Found new protocol button, clicking...");
      await newProtocolBtn.click();
    } else {
      console.log(
        "🔗 No protocol buttons found, trying direct navigation to editor...",
      );
      await page.goto("http://localhost:3001/protocols/new", {
        waitUntil: "networkidle",
      });
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: "debug-4-editor-page.png" });
    console.log("📸 Screenshot saved: debug-4-editor-page.png");

    console.log("📍 Editor URL:", page.url());

    // Look for section navigation
    const sectionSelectors = [
      'nav li:has-text("1")',
      'button:has-text("1")',
      '[data-section="1"]',
      "text=1. Metadados",
      "text=Metadados",
      ".section-nav button:first-child",
      ".sidebar li:first-child",
    ];

    let section1Found = false;
    for (const selector of sectionSelectors) {
      const section1 = page.locator(selector).first();
      if (await section1.isVisible({ timeout: 2000 })) {
        console.log(`🎯 Found Section 1 with selector: ${selector}`);
        await section1.click();
        section1Found = true;
        break;
      }
    }

    if (!section1Found) {
      console.log("❌ Could not find Section 1 navigation");
      console.log("🔍 Let me check what navigation elements exist...");

      const allButtons = await page.locator("button").allTextContents();
      console.log("🔘 All buttons on page:", allButtons.slice(0, 10)); // First 10 buttons

      const allNavItems = await page.locator("nav *").allTextContents();
      console.log("🧭 All nav items:", allNavItems.slice(0, 10));

      console.log("⏸️ Keeping browser open for manual inspection...");
      await page.waitForTimeout(30000);
      return;
    }

    await page.waitForTimeout(1000);

    // Now look for text input
    const inputSelectors = [
      "textarea",
      'input[type="text"]',
      '[contenteditable="true"]',
      ".editor textarea",
      ".section-editor textarea",
      'div[role="textbox"]',
    ];

    let textInputFound = false;
    let textInput;

    for (const selector of inputSelectors) {
      textInput = page.locator(selector).first();
      if (await textInput.isVisible({ timeout: 2000 })) {
        console.log(`📝 Found text input with selector: ${selector}`);
        textInputFound = true;
        break;
      }
    }

    if (!textInputFound) {
      console.log("❌ Could not find text input in Section 1");
      console.log("🔍 Let me check what input elements exist...");

      const allInputs = await page.locator("input, textarea").count();
      console.log("📊 Total input elements found:", allInputs);

      if (allInputs > 0) {
        for (let i = 0; i < Math.min(allInputs, 5); i++) {
          const input = page.locator("input, textarea").nth(i);
          const type = await input.getAttribute("type");
          const placeholder = await input.getAttribute("placeholder");
          const visible = await input.isVisible();
          console.log(
            `📝 Input ${i + 1}: type=${type}, placeholder=${placeholder}, visible=${visible}`,
          );
        }
      }

      console.log("⏸️ Keeping browser open for manual inspection...");
      await page.waitForTimeout(30000);
      return;
    }

    console.log("🧪 Starting the actual test...");
    console.log("✏️ Adding test content to Section 1...");

    await textInput.click();
    await textInput.fill(
      "🧪 TEST CONTENT FOR SECTION 1 - DEBUGGING SECTION SWITCHING BUG 🧪",
    );

    // Trigger any change events
    await textInput.blur();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "debug-5-section1-content.png" });
    console.log("📸 Screenshot saved: debug-5-section1-content.png");

    console.log("🔄 Now switching to Section 2...");

    // Look for Section 2
    const section2Selectors = [
      'nav li:has-text("2")',
      'button:has-text("2")',
      '[data-section="2"]',
      "text=2. Fundamentação",
      "text=Fundamentação",
      ".section-nav button:nth-child(2)",
      ".sidebar li:nth-child(2)",
    ];

    let section2Found = false;
    for (const selector of section2Selectors) {
      const section2 = page.locator(selector).first();
      if (await section2.isVisible({ timeout: 2000 })) {
        console.log(`🎯 Found Section 2 with selector: ${selector}`);
        await section2.click();
        section2Found = true;
        break;
      }
    }

    if (!section2Found) {
      console.log("❌ Could not find Section 2 navigation");
      await page.screenshot({ path: "debug-error-no-section2.png" });
      console.log("⏸️ Keeping browser open for manual inspection...");
      await page.waitForTimeout(30000);
      return;
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: "debug-6-section2.png" });
    console.log("📸 Screenshot saved: debug-6-section2.png");

    console.log("🔄 Now switching back to Section 1...");

    // Switch back to Section 1
    for (const selector of sectionSelectors) {
      const section1 = page.locator(selector).first();
      if (await section1.isVisible({ timeout: 2000 })) {
        await section1.click();
        break;
      }
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: "debug-7-back-to-section1.png" });
    console.log("📸 Screenshot saved: debug-7-back-to-section1.png");

    // Check if content is preserved
    console.log("🔍 Checking if Section 1 content was preserved...");

    let currentValue = "";
    for (const selector of inputSelectors) {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 2000 })) {
        currentValue = await input.inputValue();
        break;
      }
    }

    console.log("📄 Current Section 1 content:", currentValue);

    const testContent =
      "🧪 TEST CONTENT FOR SECTION 1 - DEBUGGING SECTION SWITCHING BUG 🧪";

    if (currentValue.includes(testContent)) {
      console.log("✅ SUCCESS: Section 1 content was preserved!");
      console.log(
        "🎉 The bug does NOT occur - content switching works correctly.",
      );
    } else {
      console.log("❌ FAILURE: Section 1 content was lost!");
      console.log(
        "🐛 The bug IS present - content gets overwritten when switching sections.",
      );
      console.log("Expected content to contain:", testContent);
      console.log("Actual content:", currentValue || "(empty)");
    }

    // Final screenshot
    await page.screenshot({ path: "debug-8-final-result.png" });
    console.log("📸 Final screenshot saved: debug-8-final-result.png");

    console.log(
      "⏸️ Keeping browser open for 30 seconds for manual inspection...",
    );
    console.log(
      "🔧 You can now manually inspect the editor state in the browser window.",
    );
    await page.waitForTimeout(30000);
  } catch (error) {
    console.error("💥 Error during debugging:", error);
    await page.screenshot({ path: "debug-error.png" });
  } finally {
    console.log("🏁 Debug session complete");
    await browser.close();
  }
}

// Run the debug function
debugProtocolEditor().catch(console.error);
