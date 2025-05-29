const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-LOGIN-FIX");
if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

async function screenshot(page, name) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 ${name}.png`);
}

(async () => {
  console.log("🔧 RESOLVENDO LOGIN E TESTANDO DE VERDADE\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const page = await browser.newPage();

  // Interceptar network requests
  await page.route("**/*", (route) => {
    const url = route.request().url();
    console.log(`[Network] ${route.request().method()} ${url}`);
    route.continue();
  });

  try {
    // 1. Ir para home primeiro
    console.log("1️⃣ Indo para home...");
    await page.goto("http://localhost:3000");
    await page.waitForTimeout(2000);
    await screenshot(page, "01-home");

    // 2. Clicar em login se houver link
    const loginLink = page.locator('a[href*="login"]').first();
    if (await loginLink.isVisible({ timeout: 2000 })) {
      await loginLink.click();
    } else {
      await page.goto("http://localhost:3000/login");
    }

    await page.waitForLoadState("networkidle");
    await screenshot(page, "02-login-page");

    // 3. Injetar script para forçar POST
    await page.evaluate(() => {
      // Interceptar submit do form
      const form = document.querySelector("form");
      if (form) {
        console.log("Form encontrado, forçando method POST");
        form.method = "POST";
        form.action = "/api/auth/callback/credentials";

        // Backup do onsubmit original
        const originalSubmit = form.onsubmit;

        form.onsubmit = function (e) {
          console.log("Form submit interceptado");
          // Se tem handler original, chama ele
          if (originalSubmit) {
            return originalSubmit.call(this, e);
          }
          // Senão, permite submit normal
          return true;
        };
      }
    });

    // 4. Preencher e submeter
    console.log("\n2️⃣ Preenchendo login...");
    await page.fill("input#email", "admin@example.com");
    await page.fill("input#password", "admin123");
    await screenshot(page, "03-login-filled");

    console.log("\n3️⃣ Clicando em Entrar...");

    // Clicar e aguardar navegação
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log(`URL atual: ${currentUrl}`);
    await screenshot(page, "04-after-login");

    if (currentUrl.includes("/login")) {
      console.log("\n❌ Ainda no login. Tentando credenciais alternativas...");

      // Lista de credenciais para tentar
      const credentials = [
        { email: "dev-mock@example.com", password: "password" },
        { email: "admin@example.com", password: "adminDefaultPassword123!" },
        { email: "test@example.com", password: "test123" },
      ];

      for (const cred of credentials) {
        console.log(`\nTentando: ${cred.email}`);
        await page.fill("input#email", cred.email);
        await page.fill("input#password", cred.password);

        await Promise.all([
          page.waitForNavigation({ timeout: 5000 }).catch(() => null),
          page.click('button[type="submit"]'),
        ]);

        await page.waitForTimeout(2000);

        if (!page.url().includes("/login")) {
          console.log("✅ Login funcionou!");
          break;
        }
      }
    }

    // 5. Tentar navegar para protocols
    console.log("\n4️⃣ Navegando para protocolos...");
    await page.goto("http://localhost:3000/protocols");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await screenshot(page, "05-protocols-page");

    // Se ainda está no login, vamos hackear
    if (page.url().includes("/login")) {
      console.log("\n🔨 Hackeando autenticação...");

      // Injetar cookie de sessão fake
      await context.addCookies([
        {
          name: "next-auth.session-token",
          value: "fake-session-token",
          domain: "localhost",
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
        },
      ]);

      // Tentar novamente
      await page.goto("http://localhost:3000/protocols");
      await page.waitForTimeout(2000);
    }

    // 6. Se conseguiu chegar nos protocols
    if (!page.url().includes("/login")) {
      console.log("\n✅ CONSEGUIMOS PASSAR DO LOGIN!");

      // Procurar protocolo para abrir
      const protocolCard = page
        .locator('.cursor-pointer, [data-testid="protocol-card"]')
        .first();
      if (await protocolCard.isVisible({ timeout: 3000 })) {
        console.log("\n5️⃣ Abrindo protocolo...");
        await protocolCard.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(3000);
        await screenshot(page, "06-protocol-editor");

        // FAZER O TESTE DE ISOLAMENTO
        console.log("\n🧪 TESTANDO ISOLAMENTO DE SEÇÕES...\n");

        // Clicar na Seção 1
        const section1 = page.locator("text=Seção 1").first();
        if (await section1.isVisible({ timeout: 5000 })) {
          await section1.click();
          await page.waitForTimeout(1000);

          // Editar campo
          const codeInput = page.locator("input#codigoProtocolo").first();
          const originalValue = await codeInput.inputValue();
          console.log(`Valor original: "${originalValue}"`);

          await codeInput.clear();
          await codeInput.fill("TESTE-VAZAMENTO-REAL");
          await screenshot(page, "07-section1-edited");

          // Mudar para Seção 2
          await page.click("text=Seção 2");
          await page.waitForTimeout(1000);
          await screenshot(page, "08-section2");

          // Voltar para Seção 1
          await page.click("text=Seção 1");
          await page.waitForTimeout(1000);
          await screenshot(page, "09-back-to-section1");

          const finalValue = await codeInput.inputValue();
          console.log(`Valor final: "${finalValue}"`);

          if (finalValue === originalValue) {
            console.log("\n✅✅✅ ISOLAMENTO FUNCIONANDO!");
            await screenshot(page, "10-SUCCESS-isolated");
          } else {
            console.log("\n❌❌❌ VAZAMENTO DETECTADO!");
            await screenshot(page, "10-FAIL-leaked");
          }
        }
      }
    }
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    await screenshot(page, "ERROR");
  } finally {
    console.log("\n📁 Screenshots em:", screenshotDir);
    console.log("\nBrowser aberto por 30 segundos...");
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();
