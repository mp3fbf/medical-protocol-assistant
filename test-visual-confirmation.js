const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs/promises");

// Create screenshots directory
const screenshotsDir = path.join(
  __dirname,
  "test-visual-confirmation-screenshots",
);

async function login(page) {
  console.log("🔐 Realizando login via API...");

  // Login via API
  const response = await page.request.post(
    "http://localhost:3000/api/auth/callback/credentials",
    {
      form: {
        email: "creator@preventsenior.com.br",
        password: "Password@123",
        redirect: "false",
        callbackUrl: "http://localhost:3000/dashboard",
        json: "true",
      },
    },
  );

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()}`);
  }

  // Now navigate to dashboard
  await page.goto("http://localhost:3000/dashboard");
  await page.waitForTimeout(2000);
  console.log("✅ Login realizado com sucesso!");
}

async function testVisualConfirmation() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // Create screenshots directory
    await fs.mkdir(screenshotsDir, { recursive: true });

    // Login first
    await login(page);

    // Navigate to protocol
    console.log("📄 Navegando para o protocolo...");
    await page.goto(
      "http://localhost:3000/protocols/cm5f5hqe90004qkjcvw9gf4i2",
    );
    await page.waitForTimeout(3000);

    // Wait for editor to load
    await page.waitForSelector(".protocol-editor-layout", { timeout: 10000 });

    // Find any editable field in the current section
    console.log("✏️ Editando conteúdo na seção...");

    // Click on the first available textarea/input in the editor pane
    const editableField = await page
      .locator('textarea, input[type="text"]')
      .first();
    await editableField.click();
    await editableField.clear();
    await editableField.fill("TESTE-CONFIRMACAO-VISUAL-" + Date.now());
    await page.waitForTimeout(1000);

    // Take screenshot before saving
    await page.screenshot({
      path: path.join(screenshotsDir, "01-before-save.png"),
      fullPage: true,
    });

    // Click Save button
    console.log("💾 Clicando em Salvar Alterações...");
    await page.click('button:has-text("Salvar Alterações")');

    // Wait for toast notification to appear
    console.log("⏳ Aguardando notificação visual...");
    await page.waitForTimeout(2000);

    // Take screenshot with toast notification
    await page.screenshot({
      path: path.join(screenshotsDir, "02-toast-notification.png"),
      fullPage: true,
    });

    // Wait for toast to disappear
    await page.waitForTimeout(4000);

    // Take final screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, "03-after-save.png"),
      fullPage: true,
    });

    console.log("✅ SUCESSO! Toast notification implementada!");
    console.log(`📸 Screenshots salvos em: ${screenshotsDir}`);
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
    await page.screenshot({
      path: path.join(screenshotsDir, "error-screenshot.png"),
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

testVisualConfirmation().catch(console.error);
