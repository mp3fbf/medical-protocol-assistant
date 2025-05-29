const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-DEBUG-LOGIN");
if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

async function screenshot(page, name) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot: ${name}.png`);
  return filepath;
}

(async () => {
  console.log("🔍 DEBUG: Diagnóstico do problema de login\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    devtools: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // Capturar logs do console
  page.on("console", (msg) => {
    console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
  });

  // Capturar requisições de rede
  page.on("request", (request) => {
    if (request.url().includes("/api/auth")) {
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
      console.log(`   Headers:`, request.headers());
      console.log(`   PostData:`, request.postData());
    }
  });

  page.on("response", (response) => {
    if (response.url().includes("/api/auth")) {
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
    }
  });

  try {
    // 1. Verificar se o servidor está rodando
    console.log("1️⃣ Verificando servidor...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await screenshot(page, "01-home-page");
    console.log("✅ Servidor está rodando\n");

    // 2. Navegar para login
    console.log("2️⃣ Navegando para /login...");
    await page.goto("http://localhost:3000/login", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(2000);
    await screenshot(page, "02-login-page");

    // 3. Verificar elementos do formulário
    console.log("3️⃣ Verificando elementos do formulário...");
    const emailInput = await page
      .locator('input[type="email"], input[name="email"], input#email')
      .first();
    const passwordInput = await page
      .locator('input[type="password"], input[name="password"], input#password')
      .first();
    const submitButton = await page
      .locator('button[type="submit"], button:has-text("Entrar")')
      .first();

    console.log("   Email input presente:", await emailInput.isVisible());
    console.log("   Password input presente:", await passwordInput.isVisible());
    console.log("   Submit button presente:", await submitButton.isVisible());

    // 4. Preencher formulário com diferentes métodos
    console.log("\n4️⃣ Preenchendo formulário...");

    // Método 1: Click e type
    await emailInput.click();
    await page.keyboard.type("admin@example.com", { delay: 100 });

    await passwordInput.click();
    await page.keyboard.type("admin123", { delay: 100 });

    await screenshot(page, "03-form-filled-method1");

    // 5. Interceptar submit do formulário
    console.log("\n5️⃣ Preparando para submit...");

    // Escutar por mudanças de URL
    const navigationPromise = page
      .waitForNavigation({
        waitUntil: "networkidle",
        timeout: 30000,
      })
      .catch((e) => {
        console.log("⚠️ Navigation timeout ou erro:", e.message);
        return null;
      });

    // 6. Clicar no botão de submit
    console.log("6️⃣ Clicando em submit...");
    await submitButton.click();
    console.log("   Click executado");

    // 7. Aguardar resposta
    console.log("\n7️⃣ Aguardando resposta...");
    const nav = await navigationPromise;

    await page.waitForTimeout(3000);
    await screenshot(page, "04-after-submit");

    // 8. Verificar estado final
    console.log("\n8️⃣ Estado final:");
    console.log("   URL atual:", page.url());
    console.log("   Título:", await page.title());

    // Verificar se há mensagens de erro
    const errorMessage = await page
      .locator('.error, [role="alert"], .text-red-500')
      .first();
    if (await errorMessage.isVisible()) {
      console.log("   ❌ Mensagem de erro:", await errorMessage.textContent());
    }

    // 9. Tentar método alternativo - Form submit direto
    if (page.url().includes("/login")) {
      console.log("\n9️⃣ Tentando submit alternativo via JavaScript...");

      await page.evaluate(() => {
        const form = document.querySelector("form");
        if (form) {
          console.log("Form encontrado, tentando submit direto");
          form.submit();
        } else {
          console.log("Nenhum form encontrado");
        }
      });

      await page.waitForTimeout(3000);
      await screenshot(page, "05-after-js-submit");
      console.log("   URL após JS submit:", page.url());
    }

    // 10. Verificar cookies/session
    console.log("\n🔟 Verificando cookies:");
    const cookies = await context.cookies();
    const authCookie = cookies.find(
      (c) => c.name.includes("session") || c.name.includes("auth"),
    );
    if (authCookie) {
      console.log("   ✅ Cookie de autenticação encontrado:", authCookie.name);
    } else {
      console.log("   ❌ Nenhum cookie de autenticação");
    }
  } catch (error) {
    console.error("\n❌ Erro durante o teste:", error);
    await screenshot(page, "ERROR-STATE");
  } finally {
    console.log("\n" + "=".repeat(70));
    console.log("📁 Screenshots salvos em:", screenshotDir);
    console.log("=".repeat(70));

    console.log("\nMantenha o browser aberto para inspeção...");
    await page.waitForTimeout(60000); // 1 minuto
    await browser.close();
  }
})();
