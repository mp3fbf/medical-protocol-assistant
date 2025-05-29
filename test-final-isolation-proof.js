const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-FINAL-PROOF");
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
  console.log("🎯 PROVA FINAL - ISOLAMENTO DE SEÇÕES COM LOGIN CORRETO\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // 1. Login com credenciais corretas
    console.log("1️⃣ Fazendo login com credenciais corretas...");
    console.log("   Email: dev-mock@example.com");
    console.log("   Senha: password\n");

    await page.goto("http://localhost:3000/login", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(2000);

    // Preencher formulário
    await page.fill('input[name="email"]', "dev-mock@example.com");
    await page.fill('input[name="password"]', "password");
    await screenshot(page, "01-login-form-filled");

    // Submit
    await page.press('input[name="password"]', "Enter");

    // Aguardar redirect para dashboard
    console.log("⏳ Aguardando login...");
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    console.log("✅ Login bem-sucedido!\n");
    await screenshot(page, "02-dashboard");

    // 2. Navegar para lista de protocolos
    console.log("2️⃣ Navegando para protocolos...");
    await page.goto("http://localhost:3000/protocols");
    await page.waitForTimeout(2000);
    await screenshot(page, "03-protocols-list");

    // 3. Criar novo protocolo ou usar existente
    const protocolCards = await page
      .locator('[data-testid="protocol-card"], .protocol-card, article')
      .all();

    if (protocolCards.length > 0) {
      console.log(
        `   Encontrados ${protocolCards.length} protocolos, usando o primeiro...\n`,
      );
      await protocolCards[0].click();
    } else {
      console.log("   Nenhum protocolo encontrado, criando novo...\n");
      await page.click(
        'a[href="/protocols/new"], button:has-text("Novo Protocolo")',
      );
      await page.waitForTimeout(2000);

      // Preencher formulário básico
      await page.fill('input[name="title"]', "Protocolo Teste Isolamento");
      await page.fill(
        'textarea[name="description"]',
        "Teste de isolamento de seções",
      );
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    await screenshot(page, "04-protocol-editor");

    // 4. TESTAR ISOLAMENTO DE SEÇÕES
    console.log("3️⃣ TESTANDO ISOLAMENTO DE SEÇÕES...\n");

    // Encontrar navegação de seções
    const sectionNavItems = await page
      .locator("nav")
      .locator('button, a, div[role="button"]')
      .all();
    console.log(`   Encontradas ${sectionNavItems.length} seções na navegação`);

    if (sectionNavItems.length >= 2) {
      // Clicar na primeira seção
      await sectionNavItems[0].click();
      await page.waitForTimeout(1000);

      // Encontrar um campo editável
      const editableField = await page
        .locator('input[type="text"]:visible, textarea:visible')
        .first();

      if (await editableField.isVisible()) {
        const originalValue = await editableField.inputValue();
        console.log(`   📝 Seção 1 - Valor original: "${originalValue}"`);

        // Editar campo
        await editableField.clear();
        await editableField.fill("TESTE-VAZAMENTO-SEÇÕES");
        await page.waitForTimeout(500);
        await screenshot(page, "05-section1-edited");
        console.log('   ✏️ Campo editado para: "TESTE-VAZAMENTO-SEÇÕES"');

        // Mudar para segunda seção SEM SALVAR
        console.log("\n   🔄 Mudando para Seção 2 (SEM SALVAR)...");
        await sectionNavItems[1].click();
        await page.waitForTimeout(1500);
        await screenshot(page, "06-section2-selected");

        // Voltar para primeira seção
        console.log("   🔙 Voltando para Seção 1...");
        await sectionNavItems[0].click();
        await page.waitForTimeout(1500);
        await screenshot(page, "07-back-to-section1");

        // Verificar valor atual
        const currentValue = await editableField.inputValue();
        console.log(`\n   📊 RESULTADO DO TESTE:`);
        console.log(`      Valor original: "${originalValue}"`);
        console.log(`      Valor atual: "${currentValue}"`);

        if (currentValue === "TESTE-VAZAMENTO-SEÇÕES") {
          console.log("\n   ❌❌❌ FALHA: CONTEÚDO VAZOU ENTRE SEÇÕES!");
          await screenshot(page, "08-FALHA-conteudo-vazou");
        } else if (currentValue === originalValue) {
          console.log("\n   ✅✅✅ SUCESSO: SEÇÕES ESTÃO ISOLADAS!");
          await screenshot(page, "08-SUCESSO-secoes-isoladas");
        } else {
          console.log(
            "\n   ⚠️ INESPERADO: Valor diferente do original e do editado",
          );
          await screenshot(page, "08-resultado-inesperado");
        }

        // Testar salvamento com "Aplicar"
        console.log("\n4️⃣ Testando salvamento permanente...");
        await editableField.clear();
        await editableField.fill("VALOR-SALVO-PERMANENTE");

        // Procurar botão Aplicar
        const applyButton = await page
          .locator(
            'button:has-text("Aplicar"), button:has-text("Salvar Seção")',
          )
          .first();
        if (await applyButton.isVisible()) {
          await applyButton.click();
          console.log("   ✅ Clicou em Aplicar");
          await page.waitForTimeout(1000);

          // Mudar de seção e voltar
          await sectionNavItems[1].click();
          await page.waitForTimeout(500);
          await sectionNavItems[0].click();
          await page.waitForTimeout(500);

          const savedValue = await editableField.inputValue();
          if (savedValue === "VALOR-SALVO-PERMANENTE") {
            console.log("   ✅ Salvamento persistiu corretamente!");
            await screenshot(page, "09-save-persisted");
          }
        }
      } else {
        console.log("   ⚠️ Nenhum campo editável encontrado na seção");
      }
    } else {
      console.log("   ⚠️ Não há seções suficientes para testar");
    }
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    await screenshot(page, "ERROR");
  } finally {
    console.log("\n" + "=".repeat(70));
    console.log("✅ TESTE FINALIZADO!");
    console.log("📁 Screenshots salvos em:");
    console.log(screenshotDir);
    console.log("=".repeat(70));

    console.log("\nBrowser permanece aberto por 30 segundos...");
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();
