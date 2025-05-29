const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-ISOLATION-PROOF");
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
  console.log("🎯 PROVA COMPLETA: LOGIN + ISOLAMENTO DE SEÇÕES\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // 1. LOGIN VIA API (método que funciona)
    console.log("1️⃣ Fazendo login via API...");

    // Obter CSRF
    await page.goto("http://localhost:3000/api/auth/csrf");
    const csrfData = await page.evaluate(() => {
      const pre = document.querySelector("pre");
      return pre ? JSON.parse(pre.textContent) : null;
    });

    // Login via API
    const loginResponse = await page.request.post(
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

    if (loginResponse.status() !== 200) {
      throw new Error("Login falhou");
    }

    console.log("✅ Login bem-sucedido!\n");

    // 2. Navegar para dashboard
    await page.goto("http://localhost:3000/dashboard");
    await page.waitForTimeout(2000);
    await screenshot(page, "01-dashboard-after-login");

    // 3. Ir para protocolos
    console.log("2️⃣ Navegando para protocolos...");
    await page.goto("http://localhost:3000/protocols");
    await page.waitForTimeout(2000);
    await screenshot(page, "02-protocols-list");

    // 4. Abrir um protocolo
    const protocolLinks = await page.locator('a[href^="/protocols/"]').all();

    if (protocolLinks.length === 0) {
      console.log("Nenhum protocolo encontrado. Criando novo...");
      await page.click(
        'a[href="/protocols/new"], button:has-text("Novo Protocolo")',
      );
      await page.waitForTimeout(2000);

      // Preencher form básico
      await page.fill('input[name="title"]', "Protocolo Teste Isolamento");
      await page.fill(
        'textarea[name="description"]',
        "Teste automatizado de isolamento de seções",
      );
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    } else {
      console.log(
        `Encontrados ${protocolLinks.length} protocolos. Abrindo o primeiro...`,
      );
      await protocolLinks[0].click();
      await page.waitForTimeout(3000);
    }

    await screenshot(page, "03-protocol-editor-opened");

    // 5. TESTAR ISOLAMENTO DE SEÇÕES
    console.log("\n3️⃣ TESTANDO ISOLAMENTO DE SEÇÕES...\n");

    // Encontrar navegação de seções
    const sectionNavItems = await page
      .locator(
        'nav button:visible, nav a:visible, [role="navigation"] button:visible',
      )
      .all();
    console.log(`   Encontradas ${sectionNavItems.length} seções na navegação`);

    if (sectionNavItems.length >= 2) {
      // Clicar na primeira seção
      console.log("   📍 Clicando na primeira seção...");
      await sectionNavItems[0].click();
      await page.waitForTimeout(1500);
      await screenshot(page, "04-section1-selected");

      // Encontrar campo editável
      const editableFields = await page
        .locator('input[type="text"]:visible, textarea:visible')
        .all();
      console.log(`   Encontrados ${editableFields.length} campos editáveis`);

      if (editableFields.length > 0) {
        const field = editableFields[0];
        const originalValue = await field.inputValue();
        console.log(`   📝 Valor original do campo: "${originalValue}"`);

        // Editar campo
        await field.clear();
        await field.fill("TESTE-VAZAMENTO-SEÇÕES-ISOLADAS");
        await page.waitForTimeout(500);
        await screenshot(page, "05-field-edited");
        console.log(
          '   ✏️ Campo editado para: "TESTE-VAZAMENTO-SEÇÕES-ISOLADAS"',
        );

        // Mudar para segunda seção SEM SALVAR
        console.log("\n   🔄 Mudando para Seção 2 (SEM SALVAR)...");
        await sectionNavItems[1].click();
        await page.waitForTimeout(2000);
        await screenshot(page, "06-section2-selected");

        // Voltar para primeira seção
        console.log("   🔙 Voltando para Seção 1...");
        await sectionNavItems[0].click();
        await page.waitForTimeout(2000);
        await screenshot(page, "07-back-to-section1");

        // Verificar valor atual
        const currentValue = await field.inputValue();

        console.log("\n   📊 RESULTADO DO TESTE:");
        console.log(`      Valor original: "${originalValue}"`);
        console.log(`      Valor atual: "${currentValue}"`);

        if (currentValue === "TESTE-VAZAMENTO-SEÇÕES-ISOLADAS") {
          console.log("\n   ❌❌❌ FALHA: CONTEÚDO VAZOU ENTRE SEÇÕES!");
          await screenshot(page, "08-FALHA-conteudo-vazou");
        } else if (currentValue === originalValue) {
          console.log("\n   ✅✅✅ SUCESSO: SEÇÕES ESTÃO ISOLADAS!");
          console.log("   As edições NÃO vazaram quando trocou de seção!");
          await screenshot(page, "08-SUCESSO-secoes-isoladas");
        } else {
          console.log(
            "\n   ⚠️ INESPERADO: Valor diferente do original e do editado",
          );
          await screenshot(page, "08-resultado-inesperado");
        }

        // Testar salvamento
        console.log('\n4️⃣ Testando salvamento com botão "Aplicar"...');
        await field.clear();
        await field.fill("VALOR-PERMANENTE-SALVO");
        await screenshot(page, "09-editing-to-save");

        const applyButton = await page
          .locator('button:has-text("Aplicar"), button:has-text("Salvar")')
          .first();
        if (await applyButton.isVisible()) {
          await applyButton.click();
          console.log("   ✅ Clicou em Aplicar/Salvar");
          await page.waitForTimeout(2000);

          // Testar persistência
          await sectionNavItems[1].click();
          await page.waitForTimeout(1000);
          await sectionNavItems[0].click();
          await page.waitForTimeout(1000);

          const savedValue = await field.inputValue();
          if (savedValue === "VALOR-PERMANENTE-SALVO") {
            console.log("   ✅ Salvamento persistiu corretamente!");
            await screenshot(page, "10-save-persisted");
          } else {
            console.log("   ❌ Salvamento não persistiu");
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
    console.log("✅ TESTE COMPLETO!");
    console.log("📁 Screenshots salvos em:");
    console.log(screenshotDir);
    console.log("=".repeat(70));

    console.log("\nBrowser permanece aberto por 30 segundos...");
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();
