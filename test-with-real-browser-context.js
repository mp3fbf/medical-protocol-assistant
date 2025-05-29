const { chromium } = require("@playwright/test");

(async () => {
  console.log("🌐 TESTE COM CONTEXTO DE BROWSER REAL\n");

  const browser = await chromium.launch({
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    // Simular browser real
    bypassCSP: true,
    javaScriptEnabled: true,
    offline: false,
    permissions: [],
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  });

  const page = await context.newPage();

  try {
    // Primeiro, limpar cache e cookies
    console.log("1. Limpando cache...");
    await context.clearCookies();

    // Navegar primeiro para home para inicializar Next.js
    console.log("2. Inicializando aplicação...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Agora navegar para login
    console.log("3. Navegando para login...");
    await page.goto("http://localhost:3000/login", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(5000); // Aguardar bastante

    // Verificar se o JS carregou
    const jsLoaded = await page.evaluate(() => {
      const form = document.querySelector("form");
      return {
        hasForm: !!form,
        method: form?.method,
        reactAttached: form
          ? Object.keys(form).some((k) => k.startsWith("__react"))
          : false,
      };
    });

    console.log("Estado do JS:", jsLoaded);

    if (!jsLoaded.reactAttached) {
      console.log("\n⚠️ React ainda não está anexado. Recarregando página...");
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(5000);
    }

    console.log("\n4. Preenchendo formulário (como humano)...");

    // Simular comportamento humano
    await page.mouse.move(500, 300);
    await page.waitForTimeout(500);

    const emailInput = page.locator('input[name="email"]');
    await emailInput.click();
    await page.waitForTimeout(300);

    // Digitar devagar
    for (const char of "dev-mock@example.com") {
      await page.keyboard.type(char);
      await page.waitForTimeout(50 + Math.random() * 100);
    }

    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);

    for (const char of "password") {
      await page.keyboard.type(char);
      await page.waitForTimeout(50 + Math.random() * 100);
    }

    console.log("5. Submetendo formulário...");
    await page.waitForTimeout(1000);

    // Tentar Enter ao invés de clicar
    await page.keyboard.press("Enter");

    console.log("6. Aguardando resposta...");

    try {
      await page.waitForURL((url) => !url.includes("/login"), {
        timeout: 15000,
      });
      console.log("\n✅ LOGIN FUNCIONOU!");
      console.log("URL:", page.url());
    } catch {
      console.log("\n❌ Login não funcionou");
      console.log("URL:", page.url());

      // Última tentativa - clicar no botão
      console.log("\n7. Tentando clicar no botão...");
      const button = page.locator('button:has-text("Entrar")');
      await button.click();
      await page.waitForTimeout(5000);
      console.log("URL após click:", page.url());
    }
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    console.log("\nBrowser aberto...");
    await new Promise(() => {});
  }
})();
