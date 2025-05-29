const { chromium } = require("@playwright/test");
const path = require("path");

const screenshotDir = path.join(
  __dirname,
  "test-screenshots-section-isolation",
);

async function takeScreenshot(page, name) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${name}.png`);
  return filepath;
}

(async () => {
  console.log("🚀 TESTE REAL DE ISOLAMENTO DE SEÇÕES\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000, // Mais lento para ver o que está acontecendo
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // 1. Login
    console.log("PASSO 1: Fazendo login...");
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // Aguardar a página carregar completamente
    await takeScreenshot(page, "01-login-page");

    // Aguardar os campos de input estarem visíveis
    await page.waitForSelector('input[name="email"]', { state: "visible" });
    await page.waitForSelector('input[name="password"]', { state: "visible" });

    // Usar credenciais do usuário de desenvolvimento
    await page.fill('input[name="email"]', "dev-mock@example.com");
    await page.fill('input[name="password"]', "password");
    await takeScreenshot(page, "02-login-filled");

    await page.click('button[type="submit"]');
    // Aguardar navegação ou mudança de página
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`URL atual após login: ${currentUrl}`);
    await takeScreenshot(page, "03-after-login");

    // Se ainda estiver na página de login, pode ter havido erro
    if (currentUrl.includes("/login")) {
      console.log("⚠️ Ainda na página de login. Verificando se há erro...");
      const errorAlert = await page.locator(".alert-destructive").isVisible();
      if (errorAlert) {
        console.log("❌ Erro de login detectado");
      }
    } else {
      console.log("✅ Login realizado com sucesso\n");
    }

    // 2. Navegar para protocolos
    console.log("PASSO 2: Indo para lista de protocolos...");
    await page.goto("http://localhost:3000/protocols");
    await page.waitForLoadState("networkidle");
    await takeScreenshot(page, "04-protocols-list");

    // 3. Abrir primeiro protocolo
    console.log("PASSO 3: Abrindo primeiro protocolo...");
    const firstProtocol = page
      .locator(
        '[data-testid="protocol-card"], .cursor-pointer, div:has-text("Protocolo")',
      )
      .first();
    await firstProtocol.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await takeScreenshot(page, "05-protocol-editor-opened");

    // 4. Editar Seção 1
    console.log("\n🔴 PASSO 4: EDITANDO SEÇÃO 1...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(1000);
    await takeScreenshot(page, "06-section-1-before-edit");

    // Capturar valor original
    const codeInput = page.locator("input#codigoProtocolo");
    const originalCode = await codeInput.inputValue();
    console.log(`Código original: "${originalCode}"`);

    // Editar o código
    await codeInput.clear();
    await codeInput.fill("TESTE-BLEEDING-123");
    await page.waitForTimeout(500);
    await takeScreenshot(page, "07-section-1-edited");
    console.log('✏️ Código alterado para: "TESTE-BLEEDING-123"');

    // 5. Mudar para Seção 2 SEM SALVAR
    console.log("\n🔴 PASSO 5: MUDANDO PARA SEÇÃO 2 (SEM SALVAR)...");
    await page.click("text=Seção 2");
    await page.waitForTimeout(1000);
    await takeScreenshot(page, "08-section-2-opened");

    // 6. Voltar para Seção 1
    console.log("\n🔴 PASSO 6: VOLTANDO PARA SEÇÃO 1...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(1000);
    await takeScreenshot(page, "09-section-1-after-switch-back");

    // Verificar o valor atual
    const currentCode = await codeInput.inputValue();
    console.log(`\n📊 RESULTADO DO TESTE:`);
    console.log(`Código original: "${originalCode}"`);
    console.log(`Código após voltar: "${currentCode}"`);

    if (currentCode === "TESTE-BLEEDING-123") {
      console.log("\n❌❌❌ FALHA: O CONTEÚDO VAZOU ENTRE SEÇÕES!");
      console.log("A edição não salva persistiu quando não deveria!");
      await takeScreenshot(page, "10-FALHA-conteudo-vazou");
    } else if (currentCode === originalCode) {
      console.log("\n✅✅✅ SUCESSO: SEÇÕES ESTÃO ISOLADAS!");
      console.log("A edição não salva foi descartada corretamente!");
      await takeScreenshot(page, "10-SUCESSO-secoes-isoladas");
    } else {
      console.log("\n⚠️ RESULTADO INESPERADO");
      console.log(`Valor encontrado: "${currentCode}"`);
      await takeScreenshot(page, "10-resultado-inesperado");
    }

    // 7. Testar salvamento
    console.log("\n\nPASSO 7: Testando salvamento...");
    await codeInput.clear();
    await codeInput.fill("CODIGO-SALVO-OK");
    await takeScreenshot(page, "11-before-save");

    // Clicar em Aplicar
    const applyButton = page.locator('button:has-text("Aplicar")');
    if (await applyButton.isVisible()) {
      await applyButton.click();
      await page.waitForTimeout(1000);
      console.log("✅ Clicou em Aplicar");
    }

    // Mudar de seção e voltar
    await page.click("text=Seção 2");
    await page.waitForTimeout(500);
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);
    await takeScreenshot(page, "12-after-save-and-switch");

    const savedCode = await codeInput.inputValue();
    if (savedCode === "CODIGO-SALVO-OK") {
      console.log("✅ Salvamento funcionou corretamente!");
    } else {
      console.log("❌ Salvamento não funcionou!");
    }

    console.log(`\n\n📁 SCREENSHOTS SALVOS EM: ${screenshotDir}`);
    console.log("Verifique as imagens para confirmar o comportamento\n");
  } catch (error) {
    console.error("❌ ERRO NO TESTE:", error);
    await takeScreenshot(page, "ERRO-" + Date.now());
  } finally {
    console.log("\nTeste concluído. Fechando navegador em 5 segundos...");
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
