const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-FIXED");
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
  console.log("🚀 TESTE DA CORREÇÃO DO ISOLAMENTO\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500,
  });

  const page = await browser.newPage();

  try {
    // LOGIN
    console.log("1. Fazendo login...");
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

    // Abrir protocolo
    await page.goto("http://localhost:3000/protocols");
    await page.waitForTimeout(2000);
    await page.getByText("Ver / Editar").first().click();
    await page.waitForTimeout(3000);
    await screenshot(page, "01-protocolo-aberto");

    console.log("✅ Protocolo aberto\n");

    // TESTE DE ISOLAMENTO
    console.log("2. TESTANDO ISOLAMENTO APÓS CORREÇÃO:\n");

    // Pegar textarea e valor original
    const textarea = page.locator("textarea").first();
    const valorOriginal = await textarea.inputValue();
    console.log(`📝 Valor original da Seção 1: "${valorOriginal}"`);
    await screenshot(page, "02-valor-original");

    // Editar
    await textarea.click();
    await textarea.clear();
    await textarea.fill("TESTE-ISOLAMENTO-CORRIGIDO-123");
    console.log('✏️ Editado para: "TESTE-ISOLAMENTO-CORRIGIDO-123"');
    await screenshot(page, "03-editado");

    // Verificar console logs
    console.log("\n⏳ Aguardando logs do console...");
    page.on("console", (msg) => {
      if (msg.text().includes("[TextEditorPane]")) {
        console.log(`[CONSOLE] ${msg.text()}`);
      }
    });

    // Mudar de seção
    console.log("\n🔄 Mudando para Seção 2 (SEM clicar em Aplicar)...");
    await page.getByText("Ficha Técnica").click();
    await page.waitForTimeout(2000);
    await screenshot(page, "04-secao2");

    // Voltar para Seção 1
    console.log("🔙 Voltando para Seção 1...");
    await page.getByText("Identificação do Protocolo").click();
    await page.waitForTimeout(2000);
    await screenshot(page, "05-voltou-secao1");

    // Verificar valor atual
    const valorAtual = await textarea.inputValue();

    console.log("\n" + "=".repeat(50));
    console.log("📊 RESULTADO APÓS CORREÇÃO:");
    console.log(`Valor original: "${valorOriginal}"`);
    console.log(`Valor atual: "${valorAtual}"`);
    console.log("=".repeat(50) + "\n");

    if (valorAtual === valorOriginal) {
      console.log("✅✅✅ SUCESSO: CORREÇÃO FUNCIONOU!");
      console.log("O conteúdo NÃO vazou entre seções!");
      await screenshot(page, "06-SUCESSO-correcao-funcionou");
    } else {
      console.log("❌❌❌ FALHA: Correção não funcionou");
      console.log("O conteúdo ainda está vazando!");
      await screenshot(page, "06-FALHA-ainda-vazando");
    }

    // Testar botão Aplicar
    console.log("\n3. Testando botão Aplicar...");
    await textarea.clear();
    await textarea.fill("TESTE-APLICAR");
    await page.getByRole("button", { name: "Aplicar" }).click();
    await page.waitForTimeout(2000);

    // Mudar e voltar
    await page.getByText("Ficha Técnica").click();
    await page.waitForTimeout(1000);
    await page.getByText("Identificação do Protocolo").click();
    await page.waitForTimeout(1000);

    const valorAposAplicar = await textarea.inputValue();
    if (valorAposAplicar === "TESTE-APLICAR") {
      console.log("✅ Botão Aplicar salvou corretamente!");
      await screenshot(page, "07-aplicar-funcionou");
    } else {
      console.log("❌ Botão Aplicar não funcionou");
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
    await screenshot(page, "ERRO");
  } finally {
    console.log("\n📁 Screenshots:", screenshotDir);
    console.log("\nBrowser permanece aberto por 30s...");
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();
