const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-SIMPLE-LOGIN");
if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

async function screenshot(page, name) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 ${name}.png`);
  return filepath;
}

(async () => {
  console.log("🔐 TESTE SIMPLES DE LOGIN\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000, // Mais lento para garantir carregamento
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // 1. Ir para home primeiro para garantir que app está carregado
    console.log("1️⃣ Carregando aplicação...");
    await page.goto("http://localhost:3000");
    await page.waitForTimeout(3000); // Aguardar app inicializar

    // 2. Ir para login
    console.log("2️⃣ Navegando para login...");
    await page.goto("http://localhost:3000/login");
    await page.waitForTimeout(3000); // Aguardar página carregar completamente
    await screenshot(page, "01-login-page");

    // 3. Aguardar formulário estar pronto
    console.log("3️⃣ Aguardando formulário...");
    await page.waitForSelector('input[name="email"]', { state: "visible" });
    await page.waitForSelector('input[name="password"]', { state: "visible" });
    await page.waitForSelector('button[type="submit"]', { state: "visible" });

    // 4. Preencher com mais calma
    console.log("4️⃣ Preenchendo credenciais...");
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await emailInput.click();
    await emailInput.clear();
    await page.keyboard.type("dev-mock@example.com", { delay: 200 });

    await passwordInput.click();
    await passwordInput.clear();
    await page.keyboard.type("password", { delay: 200 });

    await screenshot(page, "02-credentials-filled");

    // 5. Aguardar um pouco antes de submeter
    console.log("5️⃣ Preparando submit...");
    await page.waitForTimeout(2000);

    // 6. Clicar no botão de submit
    const submitButton = page.locator('button[type="submit"]');
    console.log("6️⃣ Clicando em Entrar...");
    await submitButton.click();

    // 7. Aguardar resultado
    console.log("7️⃣ Aguardando resposta...\n");

    // Tentar múltiplas possibilidades
    const result = await Promise.race([
      page
        .waitForURL("**/dashboard", { timeout: 20000 })
        .then(() => "dashboard"),
      page
        .waitForURL("**/protocols", { timeout: 20000 })
        .then(() => "protocols"),
      page
        .waitForSelector('.error, [role="alert"], .text-red-500', {
          timeout: 20000,
        })
        .then(() => "error"),
      page.waitForTimeout(20000).then(() => "timeout"),
    ]);

    await screenshot(page, "03-after-login");

    if (result === "dashboard" || result === "protocols") {
      console.log("✅✅✅ LOGIN BEM-SUCEDIDO!");
      console.log("URL atual:", page.url());

      // AGORA TESTAR ISOLAMENTO
      console.log("\n🧪 TESTANDO ISOLAMENTO DE SEÇÕES...\n");

      // Navegar para protocolos
      if (result === "dashboard") {
        await page.goto("http://localhost:3000/protocols");
        await page.waitForTimeout(2000);
      }

      // Procurar um protocolo ou criar novo
      const hasProtocols =
        (await page.locator('a[href^="/protocols/"]').count()) > 0;

      if (hasProtocols) {
        console.log("Abrindo primeiro protocolo...");
        await page.locator('a[href^="/protocols/"]').first().click();
      } else {
        console.log("Criando novo protocolo...");
        await page.goto("http://localhost:3000/protocols/new");
      }

      await page.waitForTimeout(3000);
      await screenshot(page, "04-protocol-editor");

      // Procurar navegação de seções
      const navItems = await page
        .locator('nav button, nav a, [role="navigation"] button')
        .all();

      if (navItems.length >= 2) {
        // Clicar na primeira seção
        await navItems[0].click();
        await page.waitForTimeout(1000);

        // Encontrar campo editável
        const field = await page
          .locator("input:visible, textarea:visible")
          .first();

        if (await field.isVisible()) {
          const originalValue = await field.inputValue();
          console.log(`Valor original: "${originalValue}"`);

          // Editar
          await field.clear();
          await field.fill("TESTE-VAZAMENTO");
          await screenshot(page, "05-edited");

          // Mudar seção
          console.log("Mudando de seção SEM salvar...");
          await navItems[1].click();
          await page.waitForTimeout(1500);

          // Voltar
          console.log("Voltando para seção original...");
          await navItems[0].click();
          await page.waitForTimeout(1500);

          // Verificar
          const currentValue = await field.inputValue();

          if (currentValue === originalValue) {
            console.log("\n✅✅✅ ISOLAMENTO FUNCIONANDO!");
            console.log("As edições NÃO vazaram entre seções!");
            await screenshot(page, "06-isolation-success");
          } else {
            console.log("\n❌❌❌ PROBLEMA: CONTEÚDO VAZOU!");
            await screenshot(page, "06-isolation-fail");
          }
        }
      }
    } else if (result === "error") {
      console.log("❌ Login falhou - erro exibido");
      const errorText = await page
        .locator('.error, [role="alert"], .text-red-500')
        .first()
        .textContent();
      console.log("Erro:", errorText);
    } else {
      console.log("⏱️ Timeout - login não completou");
      console.log("URL atual:", page.url());
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
    await screenshot(page, "ERROR");
  } finally {
    console.log("\n" + "=".repeat(60));
    console.log("Screenshots em:", screenshotDir);
    console.log("=".repeat(60));

    console.log("\nBrowser aberto por 30 segundos...");
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();
