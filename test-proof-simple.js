const { chromium } = require("@playwright/test");

(async () => {
  console.log("🎯 PROVA SIMPLES E DIRETA\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500,
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

    // Abrir protocolo
    await page.goto("http://localhost:3000/protocols");
    await page.waitForTimeout(2000);
    await page.getByText("Ver / Editar").first().click();
    await page.waitForTimeout(3000);

    console.log("2. Protocolo aberto\n");

    // TESTE
    console.log("3. TESTE DE ISOLAMENTO:\n");

    // Pegar textarea
    const textarea = page.locator("textarea").first();
    const original = await textarea.inputValue();
    console.log(`Valor original: "${original}"`);

    // Editar
    await textarea.fill("TESTE-VAZAMENTO-123");
    console.log('Editado para: "TESTE-VAZAMENTO-123"');

    // Clicar em outra seção (usar texto visível)
    console.log("\nMudando de seção...");
    await page.getByText("Ficha Técnica").click();
    await page.waitForTimeout(2000);

    // Voltar
    console.log("Voltando...");
    await page.getByText("Identificação do Protocolo").click();
    await page.waitForTimeout(2000);

    // Verificar
    const atual = await textarea.inputValue();

    console.log("\n" + "=".repeat(40));
    if (atual === original) {
      console.log("✅ SUCESSO: ISOLAMENTO FUNCIONANDO!");
    } else {
      console.log("❌ FALHA: CONTEÚDO VAZOU!");
    }
    console.log("=".repeat(40));
  } catch (error) {
    console.error("Erro:", error.message);
  }

  console.log("\nTeste concluído. Browser permanece aberto.");
  await new Promise(() => {});
})();
