const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-FINAL-WORKING");
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
  console.log("🚀 TESTE FINAL FUNCIONAL\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // 1. LOGIN VIA API
    console.log("1️⃣ Fazendo login...");
    await page.goto("http://localhost:3000/api/auth/csrf");
    const csrfData = await page.evaluate(() =>
      JSON.parse(document.querySelector("pre").textContent),
    );

    await page.request.post(
      "http://localhost:3000/api/auth/callback/credentials",
      {
        form: {
          email: "dev-mock@example.com",
          password: "password",
          csrfToken: csrfData.csrfToken,
          callbackUrl: "http://localhost:3000/dashboard",
          json: true,
        },
      },
    );

    await page.goto("http://localhost:3000/dashboard");
    await page.waitForTimeout(2000);
    console.log("✅ Login OK\n");

    // 2. Criar novo protocolo para ter certeza que tem editor
    console.log("2️⃣ Criando novo protocolo...");
    await page.goto("http://localhost:3000/protocols/new");
    await page.waitForTimeout(2000);

    // Preencher form
    await page.fill(
      'input[placeholder*="Protocolo"]',
      "Teste Isolamento de Seções",
    );
    await page.fill('input[placeholder*="Bradicardia"]', "Teste automatizado");

    // Selecionar geração automática
    await page.click("text=Geração Automática com IA");

    // Clicar em gerar
    await page.click('button:has-text("Gerar Protocolo Completo")');
    console.log("⏳ Aguardando geração do protocolo...");

    // Aguardar redirecionamento para editor (pode demorar)
    await page.waitForURL("**/protocols/**", { timeout: 60000 });
    await page.waitForTimeout(5000); // Aguardar carregar completamente

    await screenshot(page, "01-protocol-editor-loaded");
    console.log("✅ Protocolo criado e editor carregado\n");

    // 3. TESTAR ISOLAMENTO
    console.log("3️⃣ TESTANDO ISOLAMENTO DE SEÇÕES...\n");

    // Procurar navegação lateral
    const sectionLinks = await page
      .locator('.section-nav-item, nav a, aside a, button[class*="section"]')
      .all();
    console.log(`Encontradas ${sectionLinks.length} seções na navegação`);

    if (sectionLinks.length >= 2) {
      // Clicar na primeira seção
      await sectionLinks[0].click();
      await page.waitForTimeout(2000);
      await screenshot(page, "02-section1-selected");

      // Encontrar campos no painel direito (text editor pane)
      const textEditorPane = page
        .locator('[class*="editor"], [class*="content"], main section')
        .last();
      const fields = await textEditorPane
        .locator("input:visible, textarea:visible")
        .all();

      console.log(`Encontrados ${fields.length} campos no editor`);

      if (fields.length > 0) {
        const field = fields[0];
        const originalValue = await field.inputValue();
        console.log(`📝 Valor original: "${originalValue}"`);

        // Editar
        await field.click();
        await field.clear();
        await field.fill("CONTEÚDO-TESTE-VAZAMENTO");
        await screenshot(page, "03-field-edited");
        console.log("✏️ Campo editado\n");

        // Mudar de seção SEM salvar
        console.log("🔄 Mudando para outra seção SEM salvar...");
        await sectionLinks[1].click();
        await page.waitForTimeout(2000);
        await screenshot(page, "04-section2-selected");

        // Voltar
        console.log("🔙 Voltando para primeira seção...");
        await sectionLinks[0].click();
        await page.waitForTimeout(2000);
        await screenshot(page, "05-back-to-section1");

        // Verificar
        const currentValue = await field.inputValue();

        console.log("\n📊 RESULTADO:");
        console.log(`   Original: "${originalValue}"`);
        console.log(`   Atual: "${currentValue}"`);

        if (currentValue === originalValue) {
          console.log("\n✅✅✅ ISOLAMENTO FUNCIONANDO!");
          console.log("Conteúdo NÃO vazou entre seções!");
          await screenshot(page, "06-SUCCESS-isolated");
        } else {
          console.log("\n❌❌❌ FALHA: CONTEÚDO VAZOU!");
          await screenshot(page, "06-FAIL-content-leaked");
        }

        // Testar Aplicar
        console.log("\n4️⃣ Testando botão Aplicar...");
        await field.clear();
        await field.fill("CONTEÚDO-SALVO");

        const applyBtn = await page
          .locator('button:has-text("Aplicar")')
          .first();
        if (await applyBtn.isVisible()) {
          await applyBtn.click();
          await page.waitForTimeout(2000);

          // Mudar e voltar
          await sectionLinks[1].click();
          await page.waitForTimeout(1000);
          await sectionLinks[0].click();
          await page.waitForTimeout(1000);

          const savedValue = await field.inputValue();
          if (savedValue === "CONTEÚDO-SALVO") {
            console.log("✅ Aplicar funcionou!");
            await screenshot(page, "07-apply-worked");
          }
        }
      } else {
        // Tentar encontrar de outra forma
        console.log("Tentando localizar campos de outra forma...");
        const anyField = await page
          .locator('input[type="text"]:visible, textarea:visible')
          .first();
        if (await anyField.isVisible()) {
          const val = await anyField.inputValue();
          console.log("Campo encontrado com valor:", val);
        }
      }
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
    await screenshot(page, "ERROR");
  } finally {
    console.log("\n📁 Screenshots em:", screenshotDir);
    console.log("\nBrowser permanece aberto...");
    await page.waitForTimeout(60000);
    await browser.close();
  }
})();
