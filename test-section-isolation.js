// Test script to verify section isolation fix
// Run with: node test-section-isolation.js

const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("📋 Starting Section Isolation Test...\n");

    // Navigate to login page
    await page.goto("http://localhost:3000/login");
    console.log("✅ Navigated to login page");

    // Login
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard");
    console.log("✅ Logged in successfully\n");

    // Navigate to protocols page
    await page.goto("http://localhost:3000/protocols");
    await page.waitForLoadState("networkidle");
    console.log("✅ Navigated to protocols page");

    // Click on the first protocol card to edit
    const firstProtocolCard = page.locator(".protocol-card").first();
    await firstProtocolCard.click();
    await page.waitForLoadState("networkidle");
    console.log("✅ Opened protocol editor\n");

    // Test editing different sections
    console.log("🔍 Testing Section Isolation...\n");

    // Edit Section 1
    console.log("📝 Editing Section 1 (Metadados)...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(1000);

    // Edit the protocol code field
    const codeInput = page.locator("input#codigoProtocolo");
    await codeInput.clear();
    await codeInput.fill("TEST-SECTION-1-EDIT");
    console.log("   - Changed protocol code to: TEST-SECTION-1-EDIT");

    // Switch to Section 2 WITHOUT saving
    console.log("\n📝 Switching to Section 2 (WITHOUT saving Section 1)...");
    await page.click("text=Seção 2");
    await page.waitForTimeout(1000);

    // Add an author in Section 2
    await page.click("text=Adicionar Autor");
    const newAuthorInput = page
      .locator('input[placeholder="Nome completo do autor"]')
      .last();
    await newAuthorInput.fill("Test Author Section 2");
    console.log("   - Added author: Test Author Section 2");

    // Switch to Section 3
    console.log("\n📝 Switching to Section 3...");
    await page.click("text=Seção 3");
    await page.waitForTimeout(1000);

    // Edit content in Section 3
    const section3Content = page.locator("textarea#sectionContent");
    await section3Content.clear();
    await section3Content.fill("This is test content for Section 3 only");
    console.log(
      '   - Changed content to: "This is test content for Section 3 only"',
    );

    // Now go back to Section 1 to check if content was preserved
    console.log("\n🔍 Checking Section 1 content...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(1000);

    const section1Code = await page
      .locator("input#codigoProtocolo")
      .inputValue();
    console.log("   - Protocol code in Section 1:", section1Code);

    if (section1Code === "TEST-SECTION-1-EDIT") {
      console.log(
        "   ❌ FAIL: Section 1 still has unsaved edit (bleeding detected!)",
      );
    } else {
      console.log("   ✅ PASS: Section 1 content is isolated (no bleeding)");
    }

    // Check Section 2
    console.log("\n🔍 Checking Section 2 content...");
    await page.click("text=Seção 2");
    await page.waitForTimeout(1000);

    const authorInputs = await page
      .locator('input[placeholder="Nome completo do autor"]')
      .count();
    const lastAuthorValue = await page
      .locator('input[placeholder="Nome completo do autor"]')
      .last()
      .inputValue();
    console.log("   - Last author in Section 2:", lastAuthorValue);

    if (lastAuthorValue === "Test Author Section 2") {
      console.log(
        "   ❌ FAIL: Section 2 still has unsaved edit (bleeding detected!)",
      );
    } else {
      console.log("   ✅ PASS: Section 2 content is isolated (no bleeding)");
    }

    // Check Section 3
    console.log("\n🔍 Checking Section 3 content...");
    await page.click("text=Seção 3");
    await page.waitForTimeout(1000);

    const section3Value = await page
      .locator("textarea#sectionContent")
      .inputValue();
    console.log(
      "   - Content in Section 3:",
      section3Value.substring(0, 50) + "...",
    );

    if (section3Value === "This is test content for Section 3 only") {
      console.log(
        "   ❌ FAIL: Section 3 still has unsaved edit (bleeding detected!)",
      );
    } else {
      console.log("   ✅ PASS: Section 3 content is isolated (no bleeding)");
    }

    // Test saving changes
    console.log("\n📝 Testing Save Functionality...");

    // Edit and save Section 1
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);
    await page.locator("input#codigoProtocolo").fill("SAVED-CODE-1");

    // Click the "Aplicar" button to save locally
    await page.click('button:has-text("Aplicar")');
    await page.waitForTimeout(1000);
    console.log("   - Saved Section 1 with code: SAVED-CODE-1");

    // Switch to another section and back
    await page.click("text=Seção 2");
    await page.waitForTimeout(500);
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);

    const savedCode = await page.locator("input#codigoProtocolo").inputValue();
    if (savedCode === "SAVED-CODE-1") {
      console.log("   ✅ PASS: Section 1 content persisted after save");
    } else {
      console.log("   ❌ FAIL: Section 1 content not persisted");
    }

    console.log("\n✅ Section Isolation Test Complete!\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Keep browser open for manual inspection
    console.log(
      "Browser will remain open for manual inspection. Press Ctrl+C to exit.",
    );
  }
})();
