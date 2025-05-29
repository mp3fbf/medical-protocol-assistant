const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(
  __dirname,
  "test-screenshots-ISOLATION-EXISTING",
);
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
  console.log("🎯 TESTE DE ISOLAMENTO EM PROTOCOLO EXISTENTE\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // 1. LOGIN VIA API
    console.log("1️⃣ Login via API...");
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
          callbackUrl: "http://localhost:3000/protocols",
        },
      },
    );

    console.log("✅ Login OK\n");

    // 2. Ir direto para lista de protocolos
    console.log("2️⃣ Navegando para protocolos...");
    await page.goto("http://localhost:3000/protocols");
    await page.waitForTimeout(3000);
    await screenshot(page, "01-protocols-list");

    // 3. Clicar no primeiro protocolo da lista
    const firstProtocol = await page
      .locator('a[href^="/protocols/"]:not([href$="/new"])')
      .first();

    if (await firstProtocol.isVisible()) {
      const protocolText = await firstProtocol.textContent();
      console.log(`Abrindo protocolo: ${protocolText}`);
      await firstProtocol.click();

      // Aguardar carregar editor
      await page.waitForTimeout(5000);
      await screenshot(page, "02-protocol-editor");

      // 4. TESTAR ISOLAMENTO
      console.log("\n3️⃣ TESTANDO ISOLAMENTO DE SEÇÕES...\n");

      // Procurar navegação de seções (sidebar esquerda)
      const sectionItems = await page
        .locator('aside nav a, aside button, nav[role="navigation"] a')
        .all();
      console.log(`Encontradas ${sectionItems.length} seções`);

      if (sectionItems.length >= 2) {
        // Clicar na primeira seção
        await sectionItems[0].click();
        await page.waitForTimeout(2000);
        await screenshot(page, "03-section1");

        // Procurar campos editáveis no conteúdo principal
        // O editor está no painel direito
        const editorPane = await page
          .locator('main, [role="main"], .flex-1')
          .last();
        let field = await editorPane
          .locator('input[type="text"]:visible, textarea:visible')
          .first();

        // Se não encontrou, tentar seletores mais genéricos
        if (!(await field.isVisible())) {
          console.log("Tentando outros seletores...");
          field = await page
            .locator('input:not([type="hidden"]):visible, textarea:visible')
            .first();
        }

        if (await field.isVisible()) {
          const originalValue = await field.inputValue();
          console.log(`📝 Campo encontrado com valor: "${originalValue}"`);

          // Editar campo
          await field.click();
          await field.clear();
          await field.fill("TESTE-ISOLAMENTO-PROTOCOLO-EXISTENTE");
          await page.waitForTimeout(500);
          await screenshot(page, "04-edited");
          console.log("✏️ Campo editado");

          // Mudar de seção SEM salvar
          console.log("\n🔄 Mudando para seção 2 (SEM salvar)...");
          await sectionItems[1].click();
          await page.waitForTimeout(2000);
          await screenshot(page, "05-section2");

          // Voltar para seção 1
          console.log("🔙 Voltando para seção 1...");
          await sectionItems[0].click();
          await page.waitForTimeout(2000);
          await screenshot(page, "06-back-section1");

          // Verificar valor
          const currentValue = await field.inputValue();

          console.log("\n📊 RESULTADO DO TESTE:");
          console.log(`   Valor original: "${originalValue}"`);
          console.log(`   Valor atual: "${currentValue}"`);

          if (currentValue === originalValue) {
            console.log("\n✅✅✅ SUCESSO: SEÇÕES ISOLADAS!");
            console.log("O conteúdo editado NÃO vazou para outras seções!");
            await screenshot(page, "07-SUCCESS-isolated");
          } else if (currentValue === "TESTE-ISOLAMENTO-PROTOCOLO-EXISTENTE") {
            console.log("\n❌❌❌ FALHA: CONTEÚDO VAZOU!");
            console.log("O conteúdo editado persistiu incorretamente!");
            await screenshot(page, "07-FAIL-leaked");
          }

          // Testar botão Aplicar
          console.log("\n4️⃣ Testando botão Aplicar...");
          await field.clear();
          await field.fill("VALOR-APLICADO-PERMANENTE");

          const applyButton = await page
            .locator(
              'button:has-text("Aplicar"), button:has-text("Salvar Seção")',
            )
            .first();
          if (await applyButton.isVisible()) {
            await applyButton.click();
            console.log("Clicou em Aplicar");
            await page.waitForTimeout(2000);

            // Mudar e voltar
            await sectionItems[1].click();
            await page.waitForTimeout(1000);
            await sectionItems[0].click();
            await page.waitForTimeout(1000);

            const savedValue = await field.inputValue();
            if (savedValue === "VALOR-APLICADO-PERMANENTE") {
              console.log("✅ Aplicar salvou corretamente!");
              await screenshot(page, "08-apply-saved");
            }
          } else {
            console.log("Botão Aplicar não encontrado");
          }
        } else {
          console.log("❌ Nenhum campo editável encontrado");

          // Debug: mostrar o que está visível
          const visibleElements = await page
            .locator("*:visible")
            .evaluateAll((els) =>
              els.slice(0, 10).map((el) => ({
                tag: el.tagName,
                class: el.className,
                text: el.textContent?.substring(0, 50),
              })),
            );
          console.log("Elementos visíveis:", visibleElements);
        }
      } else {
        console.log("❌ Não há seções suficientes para testar");
      }
    } else {
      console.log("❌ Nenhum protocolo encontrado na lista");
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
    await screenshot(page, "ERROR");
  } finally {
    console.log("\n" + "=".repeat(70));
    console.log("📁 Screenshots em:", screenshotDir);
    console.log("=".repeat(70));

    console.log("\nBrowser permanece aberto por 30s...");
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();
