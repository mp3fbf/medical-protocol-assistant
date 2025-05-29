import { test, expect } from "@playwright/test";

test.describe("Protocol Editor Section Isolation", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the protocol editor
    await page.goto("/dashboard");

    // Login if needed (assuming test user exists)
    try {
      await page.waitForSelector('[data-testid="protocol-list"]', {
        timeout: 5000,
      });
    } catch {
      // If not authenticated, handle login
      await page.goto("/login");
      // Add login steps if needed
    }
  });

  test("should preserve section edits when switching between sections", async ({
    page,
  }) => {
    // Find and click on an existing protocol or create one
    await page.goto("/protocols");

    // Click on the first protocol in the list (or create one if none exist)
    const protocolLink = page.locator('[data-testid="protocol-card"]').first();
    if ((await protocolLink.count()) > 0) {
      await protocolLink.click();
    } else {
      // Create a new protocol
      await page.click('[data-testid="create-protocol-button"]');
      await page.fill(
        '[data-testid="protocol-title"]',
        "Test Protocol for Section Isolation",
      );
      await page.click('[data-testid="submit-button"]');
    }

    // Wait for the protocol editor to load
    await page.waitForSelector('[data-testid="protocol-editor"]', {
      timeout: 10000,
    });

    // Step 1: Edit Section 1
    await page.click('[data-testid="section-nav-1"]');
    await page.waitForSelector('[data-testid="section-editor"]');

    // Find a text input in Section 1 and add test content
    const section1Input = page.locator("input, textarea").first();
    await section1Input.clear();
    await section1Input.fill("TEST-123 added to section 1");

    // Wait for the content to be applied (look for "Aplicar" button and click it)
    const applyButton = page.locator('button:has-text("Aplicar")');
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }

    // Step 2: Switch to Section 2 and edit
    await page.click('[data-testid="section-nav-2"]');
    await page.waitForSelector('[data-testid="section-editor"]');

    const section2Input = page.locator("input, textarea").first();
    await section2Input.clear();
    await section2Input.fill("AUTHOR-TEST added to section 2");

    // Apply section 2 changes
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }

    // Step 3: Switch to Section 3 and edit
    await page.click('[data-testid="section-nav-3"]');
    await page.waitForSelector('[data-testid="section-editor"]');

    const section3Input = page.locator("textarea").first();
    await section3Input.clear();
    await section3Input.fill("CONTENT-TEST added to section 3");

    // Apply section 3 changes
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }

    // Step 4: CRITICAL TEST - Switch back to Section 1
    await page.click('[data-testid="section-nav-1"]');
    await page.waitForSelector('[data-testid="section-editor"]');

    // Verify Section 1 content is preserved
    const section1Value = await page
      .locator("input, textarea")
      .first()
      .inputValue();
    expect(section1Value).toBe("TEST-123 added to section 1");

    // Step 5: Check Section 2 is preserved
    await page.click('[data-testid="section-nav-2"]');
    await page.waitForSelector('[data-testid="section-editor"]');

    const section2Value = await page
      .locator("input, textarea")
      .first()
      .inputValue();
    expect(section2Value).toBe("AUTHOR-TEST added to section 2");

    // Step 6: Check Section 3 is preserved
    await page.click('[data-testid="section-nav-3"]');
    await page.waitForSelector('[data-testid="section-editor"]');

    const section3Value = await page.locator("textarea").first().inputValue();
    expect(section3Value).toBe("CONTENT-TEST added to section 3");

    console.log("✅ E2E Section isolation test PASSED - all edits preserved");
  });

  test("should not lose edits after saving to database", async ({ page }) => {
    await page.goto("/protocols");

    // Open a protocol
    const protocolLink = page.locator('[data-testid="protocol-card"]').first();
    await protocolLink.click();

    await page.waitForSelector('[data-testid="protocol-editor"]');

    // Edit multiple sections
    await page.click('[data-testid="section-nav-1"]');
    await page
      .locator("input, textarea")
      .first()
      .fill("Before save - Section 1");

    await page.click('[data-testid="section-nav-2"]');
    await page
      .locator("input, textarea")
      .first()
      .fill("Before save - Section 2");

    // Save to database
    await page.click('button:has-text("Salvar Alterações")');

    // Wait for save to complete
    await page.waitForSelector(':has-text("salvo")', { timeout: 10000 });

    // Verify edits are still there after save
    await page.click('[data-testid="section-nav-1"]');
    const section1After = await page
      .locator("input, textarea")
      .first()
      .inputValue();
    expect(section1After).toBe("Before save - Section 1");

    await page.click('[data-testid="section-nav-2"]');
    const section2After = await page
      .locator("input, textarea")
      .first()
      .inputValue();
    expect(section2After).toBe("Before save - Section 2");

    console.log(
      "✅ E2E Save preservation test PASSED - edits preserved after database save",
    );
  });
});
