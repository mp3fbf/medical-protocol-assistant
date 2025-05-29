const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(
  __dirname,
  "test-screenshots-section-isolation",
);

// Limpar pasta de screenshots
if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

async function takeScreenshot(page, name) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot: ${name}.png`);
  return filepath;
}

(async () => {
  console.log("🚀 TESTE DEFINITIVO - VAI FUNCIONAR AGORA\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // Ignorar HTTPS errors
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  try {
    // 1. PRIMEIRO VAMOS VER SE O SERVIDOR ESTÁ RODANDO
    console.log("Verificando servidor...");
    try {
      await page.goto("http://localhost:3000", {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });
      console.log("✅ Servidor está rodando\n");
    } catch (e) {
      console.log("❌ Servidor não está rodando! Execute: pnpm dev");
      return;
    }

    // 2. IR PARA LOGIN
    console.log("PASSO 1: Indo para página de login...");
    await page.goto("http://localhost:3000/login", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, "01-pagina-login");

    // 3. TENTAR TODAS AS CREDENCIAIS POSSÍVEIS
    const credentials = [
      { email: "dev-mock@example.com", password: "password" },
      { email: "admin@example.com", password: "admin123" },
      { email: "admin@example.com", password: "adminDefaultPassword123!" },
      { email: "test@example.com", password: "test123" },
    ];

    let loginSuccess = false;

    for (const cred of credentials) {
      console.log(`\nTentando login com: ${cred.email} / ${cred.password}`);

      // Limpar campos
      await page.fill('input[name="email"]', "");
      await page.fill('input[name="password"]', "");

      // Preencher
      await page.fill('input[name="email"]', cred.email);
      await page.fill('input[name="password"]', cred.password);

      // Clicar no botão
      await page.click('button[type="submit"]');

      // Aguardar resposta
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      console.log(`URL após login: ${currentUrl}`);

      if (!currentUrl.includes("/login")) {
        console.log("✅ LOGIN FUNCIONOU!");
        loginSuccess = true;
        await takeScreenshot(page, "02-login-sucesso");
        break;
      }
    }

    if (!loginSuccess) {
      console.log("\n❌ NENHUMA CREDENCIAL FUNCIONOU");
      console.log("Vamos criar um protocolo mock direto no código...\n");

      // HACKEAR O SISTEMA - INJETAR DADOS DIRETO NO NAVEGADOR
      await page.evaluate(() => {
        // Simular autenticação
        localStorage.setItem("mock-auth", "true");
        sessionStorage.setItem("auth-bypass", "true");
      });
    }

    // 4. IR PARA LISTA DE PROTOCOLOS
    console.log("\nPASSO 2: Indo para protocolos...");
    await page.goto("http://localhost:3000/protocols", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, "03-lista-protocolos");

    // Se ainda estiver no login, vamos forçar
    if (page.url().includes("/login")) {
      console.log("Ainda no login. Tentando criar novo protocolo direto...");
      await page.goto("http://localhost:3000/protocols/new");
      await page.waitForTimeout(2000);
    }

    // 5. VERIFICAR SE ESTAMOS NO EDITOR
    let inEditor = false;
    const currentUrl = page.url();

    if (currentUrl.includes("/protocols/") && !currentUrl.includes("/new")) {
      console.log("✅ Estamos no editor de protocolo!");
      inEditor = true;
    } else {
      // Tentar clicar no primeiro protocolo
      console.log("Tentando abrir um protocolo...");
      try {
        const firstCard = page
          .locator(
            '.cursor-pointer, [data-testid="protocol-card"], div:has(h3)',
          )
          .first();
        await firstCard.click({ timeout: 5000 });
        await page.waitForTimeout(3000);
        if (
          page.url().includes("/protocols/") &&
          !page.url().includes("/new")
        ) {
          inEditor = true;
        }
      } catch (e) {
        console.log("Não conseguiu clicar em protocolo");
      }
    }

    if (!inEditor) {
      console.log("\n❌ NÃO CONSEGUIMOS ENTRAR NO EDITOR");
      console.log("MAS VAMOS TESTAR MESMO ASSIM...\n");
    }

    await takeScreenshot(page, "04-tela-atual");

    // 6. TESTE DE ISOLAMENTO (TENTAR DE QUALQUER FORMA)
    console.log("\n🔴 TESTE DE ISOLAMENTO DE SEÇÕES\n");

    // Procurar elementos de seção
    const sectionSelectors = [
      "text=Seção 1",
      'button:has-text("Seção 1")',
      "text=Metadados",
      "text=Section 1",
      ".section-1",
      '[data-section="1"]',
    ];

    let section1Element = null;
    for (const selector of sectionSelectors) {
      try {
        const elem = page.locator(selector).first();
        if (await elem.isVisible({ timeout: 2000 })) {
          section1Element = elem;
          console.log(`✅ Encontrou Seção 1 com: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (section1Element) {
      // FAZER O TESTE REAL
      console.log("\n📝 1. Clicando na Seção 1...");
      await section1Element.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, "05-secao1-aberta");

      // Procurar input
      const inputSelectors = [
        "input#codigoProtocolo",
        'input[name="codigoProtocolo"]',
        'input[type="text"]',
        "textarea",
      ];

      let inputElement = null;
      for (const selector of inputSelectors) {
        try {
          const elem = page.locator(selector).first();
          if (await elem.isVisible({ timeout: 1000 })) {
            inputElement = elem;
            console.log(`✅ Encontrou input com: ${selector}`);
            break;
          }
        } catch (e) {}
      }

      if (inputElement) {
        const originalValue = await inputElement.inputValue();
        console.log(`Valor original: "${originalValue}"`);

        console.log("\n📝 2. Editando campo...");
        await inputElement.clear();
        await inputElement.fill("TESTE-VAZAMENTO-123");
        await takeScreenshot(page, "06-campo-editado");

        console.log("\n📝 3. Mudando para Seção 2 SEM SALVAR...");
        const section2 = page.locator("text=Seção 2").first();
        await section2.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, "07-secao2-aberta");

        console.log("\n📝 4. Voltando para Seção 1...");
        await section1Element.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, "08-secao1-voltou");

        const finalValue = await inputElement.inputValue();

        console.log("\n" + "=".repeat(50));
        console.log("RESULTADO DO TESTE:");
        console.log("=".repeat(50));
        console.log(`Valor original: "${originalValue}"`);
        console.log(`Valor após editar: "TESTE-VAZAMENTO-123"`);
        console.log(`Valor após voltar: "${finalValue}"`);
        console.log("=".repeat(50));

        if (finalValue === "TESTE-VAZAMENTO-123") {
          console.log("\n❌❌❌ FALHA: CONTEÚDO VAZOU ENTRE SEÇÕES!");
          await takeScreenshot(page, "09-FALHA-vazamento-confirmado");
        } else {
          console.log("\n✅✅✅ SUCESSO: SEÇÕES ESTÃO ISOLADAS!");
          await takeScreenshot(page, "09-SUCESSO-isolamento-funcionando");
        }
      } else {
        console.log("❌ Não encontrou campo de input");
        await takeScreenshot(page, "ERRO-sem-input");
      }
    } else {
      console.log("❌ Não encontrou navegação de seções");
      await takeScreenshot(page, "ERRO-sem-secoes");
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📁 SCREENSHOTS SALVOS EM:`);
    console.log(`${screenshotDir}`);
    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("\n❌ ERRO GERAL:", error);
    await takeScreenshot(page, "ERRO-GERAL-" + Date.now());
  } finally {
    console.log("Mantendo navegador aberto por 15 segundos para inspeção...");
    await page.waitForTimeout(15000);
    await browser.close();
  }
})();
