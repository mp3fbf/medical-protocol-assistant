import { test, expect } from "@playwright/test";

test.describe("Protocol Editor - Section Isolation Fix", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a protocol editor page
    // Using a mock protocol ID that should exist in test data
    await page.goto("/protocols/clz1234567890abcdefghijk");
    await page.waitForLoadState("networkidle");
  });

  test("sections should not bleed content when switching without saving", async ({
    page,
  }) => {
    console.log("🔍 Testing Section Content Isolation...");

    // Wait for editor to load
    await expect(page.locator("text=Seção 1")).toBeVisible();

    // Step 1: Edit Section 1
    console.log("📝 Editing Section 1...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);

    // Get initial value of protocol code
    const codeInput = page.locator("input#codigoProtocolo");
    const initialCode = await codeInput.inputValue();
    console.log("Initial code:", initialCode);

    // Edit the protocol code
    await codeInput.clear();
    await codeInput.fill("TEST-ISOLATION-S1");

    // Verify the input shows our new value
    await expect(codeInput).toHaveValue("TEST-ISOLATION-S1");

    // Step 2: Switch to Section 2 WITHOUT saving
    console.log("📝 Switching to Section 2 (without saving)...");
    await page.click("text=Seção 2");
    await page.waitForTimeout(500);

    // Verify we're on Section 2
    await expect(page.locator("text=Ficha Técnica")).toBeVisible();

    // Step 3: Switch back to Section 1
    console.log("🔍 Switching back to Section 1...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);

    // Check if the unsaved edit persisted (it should NOT)
    const currentCode = await codeInput.inputValue();
    console.log("Current code after switching:", currentCode);

    // The fix should prevent the unsaved edit from persisting
    expect(currentCode).not.toBe("TEST-ISOLATION-S1");
    expect(currentCode).toBe(initialCode);

    console.log(
      "✅ Section 1 content properly isolated - no bleeding detected",
    );
  });

  test("saved content should persist when switching sections", async ({
    page,
  }) => {
    console.log("📝 Testing Save Functionality...");

    // Edit Section 1
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);

    const codeInput = page.locator("input#codigoProtocolo");
    await codeInput.clear();
    await codeInput.fill("SAVED-TEST-CODE");

    // Save the changes locally using "Aplicar" button
    const applyButton = page.locator('button:has-text("Aplicar")');
    await expect(applyButton).toBeVisible();
    await applyButton.click();
    await page.waitForTimeout(1000);

    // Switch to another section
    await page.click("text=Seção 2");
    await page.waitForTimeout(500);

    // Switch back to Section 1
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);

    // Verify saved content persisted
    await expect(codeInput).toHaveValue("SAVED-TEST-CODE");
    console.log("✅ Saved content persisted correctly");
  });

  test("multiple sections can be edited independently", async ({ page }) => {
    console.log("📝 Testing Multiple Section Edits...");

    // Edit Section 3
    await page.click("text=Seção 3");
    await page.waitForTimeout(500);

    const section3Content = page.locator("textarea#sectionContent");
    const initialSection3 = await section3Content.inputValue();
    await section3Content.clear();
    await section3Content.fill("Section 3 Test Content");

    // Edit Section 5
    await page.click("text=Seção 5");
    await page.waitForTimeout(500);

    const section5Content = page.locator("textarea#sectionContent");
    const initialSection5 = await section5Content.inputValue();
    await section5Content.clear();
    await section5Content.fill("Section 5 Test Content");

    // Go back to Section 3 - should show original content (not edited)
    await page.click("text=Seção 3");
    await page.waitForTimeout(500);

    const currentSection3 = await section3Content.inputValue();
    expect(currentSection3).toBe(initialSection3);
    expect(currentSection3).not.toBe("Section 3 Test Content");

    // Go back to Section 5 - should show original content (not edited)
    await page.click("text=Seção 5");
    await page.waitForTimeout(500);

    const currentSection5 = await section5Content.inputValue();
    expect(currentSection5).toBe(initialSection5);
    expect(currentSection5).not.toBe("Section 5 Test Content");

    console.log("✅ Multiple sections properly isolated");
  });
});
