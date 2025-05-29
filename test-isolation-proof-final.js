const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-PROVA-ISOLAMENTO");
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
  console.log("🎯 PROVA DEFINITIVA - ISOLAMENTO DE SEÇÕES\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // 1. LOGIN
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
        },
      },
    );
    console.log("✅ Login OK\n");

    // 2. Abrir protocolo
    await page.goto("http://localhost:3000/protocols");
    await page.waitForTimeout(2000);
    await page.locator('a:has-text("Ver / Editar")').first().click();
    await page.waitForTimeout(3000);
    console.log("✅ Protocolo aberto\n");

    // 3. TESTE DE ISOLAMENTO
    console.log("🧪 TESTE DE ISOLAMENTO\n");

    // Confirmar que estamos na seção 1
    const section1Link = page
      .locator("aside a, nav a")
      .filter({ hasText: "1. Identificação do Protocolo" });
    if (!(await section1Link.locator(".bg-primary-100").isVisible())) {
      await section1Link.click();
      await page.waitForTimeout(1000);
    }

    // Encontrar textarea
    const textarea = page.locator("textarea:visible").first();
    const originalValue = await textarea.inputValue();
    console.log(`📝 Valor original: "${originalValue}"`);
    await screenshot(page, "01-valor-original");

    // Editar
    await textarea.click();
    await textarea.clear();
    await textarea.fill("TESTE ISOLAMENTO - NÃO DEVE PERSISTIR");
    console.log('✏️ Editado para: "TESTE ISOLAMENTO - NÃO DEVE PERSISTIR"');
    await screenshot(page, "02-editado");

    // Mudar para seção 2
    console.log("\n🔄 Mudando para Seção 2...");
    const section2Link = page
      .locator("aside a, nav a")
      .filter({ hasText: "2. Ficha Técnica" });
    await section2Link.click();
    await page.waitForTimeout(2000);
    await screenshot(page, "03-secao2");

    // Voltar para seção 1
    console.log("🔙 Voltando para Seção 1...");
    await section1Link.click();
    await page.waitForTimeout(2000);
    await screenshot(page, "04-voltou-secao1");

    // Verificar valor
    const currentValue = await textarea.inputValue();

    console.log("\n" + "=".repeat(50));
    console.log("📊 RESULTADO:");
    console.log(`Valor original: "${originalValue}"`);
    console.log(`Valor atual: "${currentValue}"`);
    console.log("=".repeat(50) + "\n");

    if (currentValue === originalValue) {
      console.log("✅✅✅ SUCESSO: SEÇÕES ISOLADAS!");
      console.log("O conteúdo editado foi descartado ao mudar de seção.");
      await screenshot(page, "05-SUCESSO-isolamento");
    } else {
      console.log("❌❌❌ FALHA: CONTEÚDO VAZOU!");
      await screenshot(page, "05-FALHA-vazamento");
    }

    // Testar Aplicar
    console.log("\n📝 Testando botão Aplicar...");
    await textarea.clear();
    await textarea.fill("CONTEÚDO APLICADO");
    await page.locator('button:has-text("Aplicar")').click();
    await page.waitForTimeout(2000);

    await section2Link.click();
    await page.waitForTimeout(1000);
    await section1Link.click();
    await page.waitForTimeout(1000);

    if ((await textarea.inputValue()) === "CONTEÚDO APLICADO") {
      console.log("✅ Aplicar salvou corretamente!");
      await screenshot(page, "06-aplicar-ok");
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
    await screenshot(page, "ERRO");
  } finally {
    console.log("\n📁 Screenshots:", screenshotDir);
    console.log("\nBrowser aberto para verificação...");
    await page.waitForTimeout(60000);
    await browser.close();
  }
})();
