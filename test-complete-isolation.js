const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

// Configuração
const screenshotDir = path.join(__dirname, "test-screenshots-FINAL");
const BASE_URL = "http://localhost:3000";

// Limpar e criar pasta de screenshots
if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

// Função para screenshots com timestamp
async function screenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${name}_${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 ${filename}`);
  return filepath;
}

// Função para capturar logs do console
function setupConsoleCapture(page, logs) {
  page.on("console", (msg) => {
    const text = msg.text();
    if (
      text.includes("[TextEditorPane]") ||
      text.includes("[SectionEditor]") ||
      text.includes("DEBUG")
    ) {
      logs.push(`[${msg.type()}] ${text}`);
      console.log(`🖥️ Console: ${text}`);
    }
  });
}

(async () => {
  console.log("🚀 TESTE COMPLETO DE ISOLAMENTO DE SEÇÕES\n");
  console.log("=".repeat(70) + "\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
    args: ["--window-size=1920,1080"],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();
  const consoleLogs = [];
  setupConsoleCapture(page, consoleLogs);

  let testResult = {
    success: false,
    steps: [],
    error: null,
  };

  try {
    // ========== PASSO 1: VERIFICAR SERVIDOR ==========
    console.log("📌 PASSO 1: Verificando servidor...");
    try {
      await page.goto(BASE_URL, { timeout: 5000 });
      testResult.steps.push({
        step: 1,
        status: "OK",
        description: "Servidor acessível",
      });
      console.log("✅ Servidor rodando\n");
    } catch (e) {
      throw new Error("Servidor não está rodando. Execute: pnpm dev");
    }

    // ========== PASSO 2: LOGIN ==========
    console.log("📌 PASSO 2: Fazendo login...");

    // Navegar para login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    await screenshot(page, "01-login-page");

    // Aguardar campos
    await page.waitForSelector('input#email, input[name="email"]', {
      state: "visible",
    });

    // Preencher formulário
    await page.fill('input#email, input[name="email"]', "dev-mock@example.com");
    await page.fill('input#password, input[name="password"]', "password");
    await screenshot(page, "02-login-filled");

    // Submeter
    await page.click('button[type="submit"]');
    console.log("⏳ Aguardando login...");

    // Aguardar mudança de página
    await page.waitForTimeout(3000);
    const afterLoginUrl = page.url();

    if (afterLoginUrl.includes("/login")) {
      // Tentar com outras credenciais
      console.log("❌ Primeira tentativa falhou. Tentando admin...");
      await page.fill('input#email, input[name="email"]', "admin@example.com");
      await page.fill('input#password, input[name="password"]', "admin123");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    await screenshot(page, "03-after-login");
    testResult.steps.push({
      step: 2,
      status: "OK",
      description: "Login realizado",
    });
    console.log("✅ Login OK\n");

    // ========== PASSO 3: NAVEGAR PARA PROTOCOLOS ==========
    console.log("📌 PASSO 3: Navegando para protocolos...");

    // Tentar via menu
    const menuLink = page.locator('a:has-text("Protocolos")').first();
    if (await menuLink.isVisible({ timeout: 3000 })) {
      await menuLink.click();
    } else {
      await page.goto(`${BASE_URL}/protocols`);
    }

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await screenshot(page, "04-protocols-list");

    // ========== PASSO 4: ABRIR OU CRIAR PROTOCOLO ==========
    console.log("📌 PASSO 4: Abrindo protocolo...");

    // Procurar protocolo existente
    const protocolCards = page.locator(
      '.cursor-pointer, [data-testid="protocol-card"], article',
    );
    const count = await protocolCards.count();

    if (count > 0) {
      console.log(`Encontrados ${count} protocolos. Abrindo o primeiro...`);
      await protocolCards.first().click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
    } else {
      console.log("Nenhum protocolo encontrado. Criando novo...");
      const newButton = page
        .locator('button:has-text("Novo Protocolo")')
        .first();
      if (await newButton.isVisible()) {
        await newButton.click();
        await page.waitForTimeout(2000);
        // Preencher formulário de criação se necessário
        const titleInput = page.locator('input[name="title"]').first();
        if (await titleInput.isVisible()) {
          await titleInput.fill("Protocolo de Teste");
          await page.click('button[type="submit"]');
          await page.waitForTimeout(3000);
        }
      }
    }

    await screenshot(page, "05-protocol-editor");

    // Verificar se estamos no editor
    const currentUrl = page.url();
    if (!currentUrl.includes("/protocols/")) {
      throw new Error("Não foi possível abrir o editor de protocolo");
    }

    testResult.steps.push({
      step: 4,
      status: "OK",
      description: "Editor aberto",
    });
    console.log("✅ Editor carregado\n");

    // ========== PASSO 5: TESTE DE ISOLAMENTO ==========
    console.log("📌 PASSO 5: INICIANDO TESTE DE ISOLAMENTO...\n");
    console.log("=".repeat(70));

    // Aguardar navegação de seções
    await page.waitForSelector("text=Seção 1", { timeout: 10000 });

    // TESTE 1: Editar sem salvar
    console.log("\n🔴 TESTE 1: Editar e trocar de seção SEM salvar\n");

    // Clicar na Seção 1
    await page.click("text=Seção 1");
    await page.waitForTimeout(1500);
    await screenshot(page, "06-section1-selected");

    // Localizar campo de código
    const codeInput = page.locator("input#codigoProtocolo").first();
    await codeInput.waitFor({ state: "visible" });

    // Capturar valor original
    const originalValue = await codeInput.inputValue();
    console.log(`📝 Valor original: "${originalValue}"`);
    testResult.originalValue = originalValue;

    // Editar campo
    await codeInput.clear();
    await codeInput.fill("TESTE-VAZAMENTO-123");
    await page.waitForTimeout(500);
    await screenshot(page, "07-field-edited");
    console.log('✏️ Campo editado para: "TESTE-VAZAMENTO-123"');

    // Mudar para Seção 2 SEM salvar
    console.log("\n🔄 Mudando para Seção 2 (SEM clicar em Aplicar)...");
    await page.click("text=Seção 2");
    await page.waitForTimeout(1500);
    await screenshot(page, "08-section2-selected");

    // Voltar para Seção 1
    console.log("🔄 Voltando para Seção 1...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(1500);
    await screenshot(page, "09-back-to-section1");

    // Verificar valor atual
    const currentValue = await codeInput.inputValue();
    console.log(`\n📊 Valor após voltar: "${currentValue}"`);

    if (currentValue === "TESTE-VAZAMENTO-123") {
      console.log("\n❌❌❌ FALHA: EDIÇÃO VAZOU ENTRE SEÇÕES!");
      testResult.test1 = "FAILED";
      await screenshot(page, "10-FAILED-content-leaked");
    } else if (currentValue === originalValue) {
      console.log("\n✅✅✅ SUCESSO: EDIÇÃO FOI DESCARTADA!");
      testResult.test1 = "PASSED";
      await screenshot(page, "10-SUCCESS-content-isolated");
    }

    // TESTE 2: Salvar com Aplicar
    console.log("\n" + "=".repeat(70));
    console.log('\n🔵 TESTE 2: Salvar com "Aplicar"\n');

    await codeInput.clear();
    await codeInput.fill("CODIGO-SALVO-123");
    await screenshot(page, "11-editing-to-save");

    // Clicar em Aplicar
    const applyButton = page.locator('button:has-text("Aplicar")').first();
    await applyButton.click();
    await page.waitForTimeout(1000);
    await screenshot(page, "12-after-apply");
    console.log("✅ Clicou em Aplicar");

    // Testar persistência
    await page.click("text=Seção 2");
    await page.waitForTimeout(500);
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);

    const savedValue = await codeInput.inputValue();
    if (savedValue === "CODIGO-SALVO-123") {
      console.log("✅ Salvamento funcionou corretamente!");
      testResult.test2 = "PASSED";
      await screenshot(page, "13-save-persisted");
    } else {
      console.log("❌ Salvamento não funcionou!");
      testResult.test2 = "FAILED";
    }

    testResult.success = true;
  } catch (error) {
    console.error("\n❌ ERRO NO TESTE:", error.message);
    testResult.error = error.message;
    await screenshot(page, "ERROR-" + Date.now());
  } finally {
    // ========== RELATÓRIO FINAL ==========
    console.log("\n" + "=".repeat(70));
    console.log("📊 RELATÓRIO FINAL");
    console.log("=".repeat(70));

    console.log("\n📁 Screenshots salvos em:", screenshotDir);
    console.log(
      `📸 Total de screenshots: ${fs.readdirSync(screenshotDir).length}`,
    );

    console.log("\n🧪 Resultados dos Testes:");
    console.log(
      `- Teste 1 (Isolamento): ${testResult.test1 || "NÃO EXECUTADO"}`,
    );
    console.log(
      `- Teste 2 (Salvamento): ${testResult.test2 || "NÃO EXECUTADO"}`,
    );

    if (consoleLogs.length > 0) {
      console.log("\n📋 Logs do Console Capturados:");
      consoleLogs.forEach((log) => console.log(log));
    }

    // Salvar relatório
    const reportPath = path.join(screenshotDir, "RELATORIO.txt");
    fs.writeFileSync(reportPath, JSON.stringify(testResult, null, 2));
    console.log("\n📄 Relatório salvo em:", reportPath);

    console.log("\n" + "=".repeat(70));
    console.log("Navegador permanecerá aberto por 15 segundos...");
    await page.waitForTimeout(15000);
    await browser.close();
  }
})();
