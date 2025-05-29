const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-FINAL-ISOLATION");
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
  console.log("🚀 TESTE FINAL - ISOLAMENTO DE SEÇÕES COM LOGIN FUNCIONANDO\n");

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
    console.log("1️⃣ Fazendo login via API...");
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
    console.log("✅ Login concluído\n");

    // 2. Navegar para protocolos
    await page.goto("http://localhost:3000/protocols");
    await page.waitForTimeout(3000);
    await screenshot(page, "01-lista-protocolos");

    // 3. Abrir primeiro protocolo
    const protocolLink = await page
      .locator('a[href^="/protocols/"]:has-text("Ver / Editar")')
      .first();
    await protocolLink.click();
    await page.waitForTimeout(3000);
    await screenshot(page, "02-editor-protocolo");

    console.log("2️⃣ Protocolo aberto no editor\n");

    // 4. TESTAR ISOLAMENTO
    console.log("3️⃣ INICIANDO TESTE DE ISOLAMENTO DE SEÇÕES...\n");

    // Identificar textarea do conteúdo da seção
    const contentTextarea = await page
      .locator(
        'textarea[placeholder*="Digite o conteúdo"], textarea:has-text("Digite o conteúdo")',
      )
      .first();

    // Se não encontrou pelo placeholder, tentar pelo valor
    let textarea = contentTextarea;
    if (!(await textarea.isVisible())) {
      textarea = await page
        .locator("textarea")
        .filter({ hasText: "Digite o conteúdo desta seção" })
        .first();
    }

    // Se ainda não encontrou, pegar qualquer textarea visível
    if (!(await textarea.isVisible())) {
      textarea = await page.locator("textarea:visible").first();
    }

    if (await textarea.isVisible()) {
      // Capturar valor original
      const originalValue = await textarea.inputValue();
      console.log(`📝 Valor original da Seção 1: "${originalValue}"`);

      // Editar conteúdo
      await textarea.click();
      await textarea.clear();
      await textarea.fill(
        "TESTE DE VAZAMENTO - ESTE TEXTO NÃO DEVE APARECER EM OUTRAS SEÇÕES",
      );
      await page.waitForTimeout(1000);
      await screenshot(page, "03-secao1-editada");
      console.log("✏️ Seção 1 editada com texto de teste\n");

      // Mudar para outra seção SEM SALVAR
      console.log("4️⃣ Mudando para Seção 2 (SEM SALVAR)...");
      const section2 = await page
        .locator("nav a, aside a")
        .filter({ hasText: /Ficha Técnica|Definição|Epidemiologia/ })
        .first();
      await section2.click();
      await page.waitForTimeout(2000);
      await screenshot(page, "04-secao2-selecionada");

      // Voltar para Seção 1
      console.log("5️⃣ Voltando para Seção 1...");
      const section1 = await page
        .locator("nav a, aside a")
        .filter({ hasText: "Identificação do Protocolo" })
        .first();
      await section1.click();
      await page.waitForTimeout(2000);
      await screenshot(page, "05-voltou-secao1");

      // Verificar se o conteúdo voltou ao original
      const currentValue = await textarea.inputValue();

      console.log("\n🏁 RESULTADO DO TESTE:");
      console.log("━".repeat(50));
      console.log(`Valor original: "${originalValue}"`);
      console.log(`Valor atual: "${currentValue}"`);
      console.log("━".repeat(50));

      if (currentValue === originalValue) {
        console.log("\n✅✅✅ SUCESSO: ISOLAMENTO FUNCIONANDO!");
        console.log("O conteúdo editado NÃO vazou entre as seções!");
        console.log(
          "As alterações foram descartadas ao mudar de seção sem salvar.",
        );
        await screenshot(page, "06-SUCESSO-isolamento-funcionando");
      } else if (currentValue.includes("TESTE DE VAZAMENTO")) {
        console.log("\n❌❌❌ FALHA: CONTEÚDO VAZOU!");
        console.log("O texto editado persistiu incorretamente!");
        await screenshot(page, "06-FALHA-conteudo-vazou");
      } else {
        console.log("\n⚠️ Resultado inesperado");
      }

      // 6. Testar botão Aplicar
      console.log('\n6️⃣ Testando funcionalidade do botão "Aplicar"...');
      await textarea.clear();
      await textarea.fill("CONTEÚDO PERMANENTE - DEVE PERSISTIR APÓS APLICAR");

      const applyButton = await page
        .locator('button:has-text("Aplicar")')
        .first();
      if (await applyButton.isVisible()) {
        await applyButton.click();
        console.log("✅ Clicou em Aplicar");
        await page.waitForTimeout(2000);

        // Mudar de seção e voltar
        await section2.click();
        await page.waitForTimeout(1000);
        await section1.click();
        await page.waitForTimeout(1000);

        const savedValue = await textarea.inputValue();
        if (savedValue.includes("CONTEÚDO PERMANENTE")) {
          console.log("✅ Botão Aplicar funcionou corretamente!");
          await screenshot(page, "07-aplicar-funcionou");
        } else {
          console.log("❌ Aplicar não salvou o conteúdo");
        }
      }
    } else {
      console.log("❌ Não foi possível encontrar o campo de texto da seção");
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
    await screenshot(page, "ERRO");
  } finally {
    console.log("\n" + "=".repeat(70));
    console.log("📁 Todos os screenshots salvos em:");
    console.log(screenshotDir);
    console.log("=".repeat(70));

    console.log("\nMantenha o browser aberto para verificação...");
    await page.waitForTimeout(60000);
    await browser.close();
  }
})();
