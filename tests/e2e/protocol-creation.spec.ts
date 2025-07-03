import { test, expect, Page } from "@playwright/test";
// import { randomBytes } from "crypto"; // Not used directly, titles use Date.now()

// Helper function to log in - assuming global setup handles actual login and state saving
async function ensureLoggedIn(page: Page) {
  // Check if already on a protected route or if session is valid.
  // For simplicity, we'll just navigate to dashboard and assume global auth state is applied.
  await page.goto("/dashboard");
  // A quick check to see if dashboard is loaded, indicating logged-in state
  await expect(page.getByRole('heading', { name: /Dashboard/i})).toBeVisible({timeout: 15000});
  console.log("[E2E Test] Confirmed on dashboard (logged in).");
}


test.describe("Protocol Creation Flow (Authenticated)", () => {
  const generateUniqueTitle = (base: string) => `${base} ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    // global.setup.ts should handle login and save state.
    // Tests use storageState to start authenticated.
    // This navigation confirms we can reach a protected route.
    await ensureLoggedIn(page);
  });

  test("should navigate to the 'New Protocol' page from dashboard", async ({ page }) => {
    await page.getByRole('link', { name: /Novo Protocolo/i }).click();
    await page.waitForURL("**/protocols/new", { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Iniciar Novo Protocolo Médico/i })).toBeVisible({ timeout: 15000 });
    console.log("[E2E Test] 'should navigate to New Protocol page' test finished.");
  });

  test("should create a new protocol and navigate to its editor page", async ({ page }) => {
    const protocolTitle = generateUniqueTitle("E2E Test Protocol");
    const protocolCondition = "E2E Test Condition";
    console.log(`[E2E Test] Creating protocol with title: ${protocolTitle}`);

    await page.goto("/protocols/new");
    await expect(page.getByRole('heading', { name: /Iniciar Novo Protocolo Médico/i })).toBeVisible({ timeout: 15000 });

    await page.fill('input[id="title"]', protocolTitle);
    await page.fill('input[id="condition"]', protocolCondition);
    await page.getByRole('button', { name: "Iniciar Criação do Protocolo" }).click();

    await expect(page.getByRole('button', { name: /Criando.../i })).toBeHidden({ timeout: 20000 });
    
    console.log("[E2E Test] Waiting for URL to change to specific protocol editor page after creation...");
    await page.waitForURL(/\/protocols\/c[a-z0-9]{24,25}/, { timeout: 25000 }); // Regex for CUID (typically 25 chars, 'c' + 24)
    const newUrl = page.url();
    console.log(`[E2E Test] Navigated to editor page URL: ${newUrl}`);
    const protocolIdFromUrl = newUrl.split("/").pop();
    expect(protocolIdFromUrl).not.toBe("new");
    expect(protocolIdFromUrl).toMatch(/^c[a-z0-9]{24,25}$/);

    console.log(`[E2E Test] Waiting for network idle on editor page: ${newUrl}`);
    await page.waitForLoadState('networkidle', { timeout: 25000 });

    // Wait for the H2 that will contain the protocol title.
    await expect(page.locator(`.protocol-editor-layout h2:has-text("${protocolTitle}")`)).toBeVisible({ timeout: 30000 });


    console.log(`[E2E Test] Looking for editor heading with title: ${protocolTitle}`);
    // Ensure regex is for exact match of the title, case-insensitive
    const editorPageTitleHeading = page.getByRole("heading", { name: new RegExp(`^${protocolTitle}$`, "i"), level: 2 });
    await expect(editorPageTitleHeading).toBeVisible({ timeout: 30000 }); 

    console.log("[E2E Test] Looking for section list item '1. Identificação do Protocolo'");
    // Target within the specific navigation list for robustness
    const sectionNavigationList = page.locator('nav.section-navigation-list');
    await expect(sectionNavigationList.getByText("1. Identificação do Protocolo", { exact: false })).toBeVisible({ timeout: 20000 });
    console.log("[E2E Test] 'should create a new protocol' test finished.");
  });


  test("should navigate to an existing protocol's editor page", async ({ page, context }) => {
    const tempProtocolTitle = generateUniqueTitle("Navigable Protocol");
    const tempProtocolCondition = "Navigation Test Condition";
    console.log(`[E2E Test] Creating temporary protocol for navigation: ${tempProtocolTitle}`);

    const tempPage = await context.newPage(); // Use new page to avoid interference
    await tempPage.goto("/protocols/new");
    await tempPage.fill('input[id="title"]', tempProtocolTitle);
    await tempPage.fill('input[id="condition"]', tempProtocolCondition);
    await tempPage.getByRole('button', { name: "Iniciar Criação do Protocolo" }).click();
    
    await expect(tempPage.getByRole('button', { name: /Criando.../i })).toBeHidden({ timeout: 15000 });
    console.log("[E2E Test] Waiting for URL (after temp protocol creation)...");
    await tempPage.waitForURL(/\/protocols\/c[a-z0-9]{24,25}/, { timeout: 20000 });
    const tempProtocolUrl = tempPage.url();
    console.log(`[E2E Test] Navigated to temp protocol editor: ${tempProtocolUrl}`);
    const tempProtocolId = tempProtocolUrl.split("/").pop();
    expect(tempProtocolId).not.toBe("new");
    expect(tempProtocolId).toMatch(/^c[a-z0-9]{24,25}$/);
    await tempPage.close(); 

    await page.goto("/protocols"); // Main test page goes to protocol list
    await expect(page.getByRole('heading', { name: /Protocolos Médicos/i })).toBeVisible({timeout: 15000});
    await page.waitForLoadState('networkidle', {timeout: 15000}); // Wait for list to potentially load

    console.log(`[E2E Test] Looking for link to protocol: ${tempProtocolTitle} with ID ${tempProtocolId}`);
    const protocolCardLink = page.locator(`a[href="/protocols/${tempProtocolId}"]`); 
    await expect(protocolCardLink).toBeVisible({ timeout: 20000 }); // Increased timeout for card to appear
    await protocolCardLink.click();

    console.log(`[E2E Test] Waiting for navigation to existing protocol: /protocols/${tempProtocolId}`);
    await page.waitForURL(new RegExp(`/protocols/${tempProtocolId}`), { timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // Wait for the H2 that will contain the protocol title.
    await expect(page.locator(`.protocol-editor-layout h2:has-text("${tempProtocolTitle.trim()}")`)).toBeVisible({ timeout: 30000 });

    console.log(`[E2E Test] Looking for heading (nav existing): ${tempProtocolTitle}`);
    const editorHeading = page.getByRole("heading", { name: new RegExp(`^${tempProtocolTitle.trim()}$`, "i"), level: 2 });
    await expect(editorHeading).toBeVisible({ timeout: 30000 }); 

    console.log("[E2E Test] Looking for section list item '1. Identificação do Protocolo' (nav existing)");
    const sectionNavigationListExisting = page.locator('nav.section-navigation-list'); 
    await expect(sectionNavigationListExisting.getByText("1. Identificação do Protocolo", { exact: false })).toBeVisible({timeout: 20000});
    console.log("[E2E Test] 'should navigate to existing protocol' test finished.");
  });
});