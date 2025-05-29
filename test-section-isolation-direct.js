const { chromium } = require("@playwright/test");
const path = require("path");

const screenshotDir = path.join(
  __dirname,
  "test-screenshots-section-isolation",
);

async function takeScreenshot(page, name) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot: ${name}.png`);
  return filepath;
}

(async () => {
  console.log("🚀 TESTE DIRETO - ISOLAMENTO DE SEÇÕES\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Criar um protocolo de teste direto usando o ID conhecido dos testes
    console.log("NAVEGANDO DIRETO PARA UM PROTOCOLO DE TESTE...");

    // IDs possíveis de protocolo baseados no padrão CUID
    const testProtocolIds = [
      "clz1234567890abcdefghijk", // ID usado nos testes
      "c1234567890abcdefghijk123",
      "cly5678901234567890abcdef",
    ];

    let protocolOpened = false;

    // Tentar cada ID até encontrar um que funcione
    for (const id of testProtocolIds) {
      console.log(`Tentando protocolo ID: ${id}`);
      await page.goto(`http://localhost:3000/protocols/${id}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      // Verificar se carregou o editor (não está em página de erro ou login)
      const currentUrl = page.url();
      if (!currentUrl.includes("/login") && !currentUrl.includes("404")) {
        console.log("✅ Protocolo carregado!");
        protocolOpened = true;
        break;
      }
    }

    if (!protocolOpened) {
      // Se não conseguiu abrir nenhum, criar um novo
      console.log("Nenhum protocolo encontrado. Criando novo...");
      await page.goto("http://localhost:3000/protocols/new");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
    }

    await takeScreenshot(page, "00-protocolo-inicial");

    // Aguardar a interface carregar
    console.log("\nAguardando interface do editor carregar...");
    await page.waitForTimeout(3000);

    // Procurar por diferentes seletores de seção
    const sectionSelectors = [
      "text=Seção 1",
      'button:has-text("Seção 1")',
      'div:has-text("Seção 1"):not(:has-text("Seção 10"))',
      '[data-section="1"]',
      ".section-navigation-item:first-child",
    ];

    let sectionFound = false;
    for (const selector of sectionSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✅ Encontrou seção com seletor: ${selector}`);
          sectionFound = true;

          // TESTE DE ISOLAMENTO
          console.log("\n🔴 INICIANDO TESTE DE ISOLAMENTO...\n");

          // 1. Clicar na Seção 1
          await element.click();
          await page.waitForTimeout(1000);
          await takeScreenshot(page, "01-secao1-aberta");

          // 2. Procurar campo de código
          const codeSelectors = [
            "input#codigoProtocolo",
            'input[name="codigoProtocolo"]',
            'input[placeholder*="código"]',
            'input[placeholder*="BRAD"]',
          ];

          let codeInput = null;
          for (const codeSelector of codeSelectors) {
            const input = page.locator(codeSelector);
            if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
              codeInput = input;
              console.log(`✅ Campo de código encontrado: ${codeSelector}`);
              break;
            }
          }

          if (!codeInput) {
            console.log(
              "⚠️ Campo de código não encontrado. Tentando textarea genérica...",
            );
            codeInput = page.locator("textarea").first();
          }

          // 3. Capturar valor original
          const originalValue = await codeInput.inputValue();
          console.log(`Valor original: "${originalValue}"`);

          // 4. Editar
          await codeInput.clear();
          await codeInput.fill("TESTE-BLEEDING-S1");
          await takeScreenshot(page, "02-secao1-editada");
          console.log('✏️ Editado para: "TESTE-BLEEDING-S1"');

          // 5. Mudar para Seção 2
          console.log("\n📝 Mudando para Seção 2 (SEM SALVAR)...");
          const section2 = page.locator("text=Seção 2").first();
          await section2.click();
          await page.waitForTimeout(1000);
          await takeScreenshot(page, "03-secao2-aberta");

          // 6. Voltar para Seção 1
          console.log("\n📝 Voltando para Seção 1...");
          await element.click();
          await page.waitForTimeout(1000);
          await takeScreenshot(page, "04-secao1-apos-voltar");

          // 7. Verificar valor
          const currentValue = await codeInput.inputValue();
          console.log(`\n📊 RESULTADO:`);
          console.log(`Valor original: "${originalValue}"`);
          console.log(`Valor após voltar: "${currentValue}"`);

          if (currentValue === "TESTE-BLEEDING-S1") {
            console.log("\n❌❌❌ FALHA: CONTEÚDO VAZOU!");
            await takeScreenshot(page, "05-FALHA-bleeding-detectado");
          } else {
            console.log("\n✅✅✅ SUCESSO: SEÇÕES ISOLADAS!");
            await takeScreenshot(page, "05-SUCESSO-isolamento-ok");
          }

          break;
        }
      } catch (e) {
        // Continuar tentando outros seletores
      }
    }

    if (!sectionFound) {
      console.log("❌ Não foi possível encontrar as seções do protocolo");
      await takeScreenshot(page, "ERRO-secoes-nao-encontradas");
    }
  } catch (error) {
    console.error("❌ ERRO:", error);
    await takeScreenshot(page, "ERRO-" + Date.now());
  } finally {
    console.log("\n📁 Screenshots em:", screenshotDir);
    console.log("Navegador permanecerá aberto por 10 segundos...");
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();
