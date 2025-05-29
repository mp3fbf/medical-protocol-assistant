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
  console.log("🚀 TESTE FINAL COM SCREENSHOTS\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000,
  });

  const page = await browser.newPage();

  try {
    // LOGIN
    console.log("1. Login...");
    await page.goto("http://localhost:3000/api/auth/csrf");
    const csrf = await page.evaluate(() =>
      JSON.parse(document.querySelector("pre").textContent),
    );

    await page.request.post(
      "http://localhost:3000/api/auth/callback/credentials",
      {
        form: {
          email: "dev-mock@example.com",
          password: "password",
          csrfToken: csrf.csrfToken,
        },
      },
    );

    // ABRIR PROTOCOLO
    await page.goto("http://localhost:3000/protocols");
    await page.waitForTimeout(2000);
    await page.getByText("Ver / Editar").first().click();
    await page.waitForTimeout(3000);

    // TESTE
    console.log("\n2. TESTANDO ISOLAMENTO:\n");

    const textarea = page.locator("textarea").first();
    const valorOriginal = await textarea.inputValue();
    console.log(`Valor original: "${valorOriginal}"`);
    await screenshot(page, "01-valor-original");

    // EDITAR
    await textarea.click();
    await textarea.clear();
    await textarea.fill("TESTE-VAZAMENTO-FINAL-123");
    await page.waitForTimeout(1000);
    console.log('Editado para: "TESTE-VAZAMENTO-FINAL-123"');
    await screenshot(page, "02-campo-editado");

    // MUDAR DE SEÇÃO
    console.log("\nMudando para Ficha Técnica...");
    await page.getByText("Ficha Técnica").click();
    await page.waitForTimeout(3000);
    await screenshot(page, "03-secao-ficha-tecnica");

    // VOLTAR
    console.log("Voltando para Identificação...");
    await page.getByText("Identificação do Protocolo").click();
    await page.waitForTimeout(3000);
    await screenshot(page, "04-voltou-identificacao");

    // VERIFICAR
    const valorAtual = await textarea.inputValue();
    console.log(`\nValor após voltar: "${valorAtual}"`);

    if (valorAtual === valorOriginal) {
      console.log("\n✅ ISOLAMENTO FUNCIONANDO!");
      await screenshot(page, "05-SUCESSO-isolamento-ok");
    } else {
      console.log("\n❌ VAZAMENTO DETECTADO!");
      await screenshot(page, "05-FALHA-vazamento");
    }
  } catch (error) {
    console.error("Erro:", error.message);
    await screenshot(page, "ERRO");
  }

  console.log("\n📁 Screenshots salvos em:");
  console.log(screenshotDir);

  await page.waitForTimeout(5000);
  await browser.close();
})();
