const { chromium } = require("@playwright/test");

(async () => {
  console.log("🎯 TESTE COM PAUSA PARA LOGIN MANUAL\n");

  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  try {
    console.log("1. Navegando para /login...");
    await page.goto("http://localhost:3000/login");

    console.log("\n" + "=".repeat(60));
    console.log("⏸️  PAUSADO - FAÇA O LOGIN MANUALMENTE!");
    console.log("   Email: dev-mock@example.com");
    console.log("   Senha: password");
    console.log("\n   Após fazer login, volte aqui e pressione ENTER");
    console.log("=".repeat(60) + "\n");

    // Pausar para login manual
    await page.pause();

    // Após o login manual, verificar onde estamos
    console.log("\n✅ Continuando após login manual...");
    console.log("URL atual:", page.url());

    if (!page.url().includes("/login")) {
      console.log(
        "Login bem-sucedido! Agora vamos testar o isolamento de seções.\n",
      );

      // Navegar para protocolos
      await page.goto("http://localhost:3000/protocols");
      await page.waitForTimeout(2000);

      // Procurar um protocolo
      const hasProtocol =
        (await page.locator('a[href^="/protocols/"]').count()) > 0;

      if (hasProtocol) {
        console.log("Abrindo primeiro protocolo...");
        await page.locator('a[href^="/protocols/"]').first().click();
        await page.waitForTimeout(3000);

        // TESTAR ISOLAMENTO
        console.log("\n🧪 TESTANDO ISOLAMENTO DE SEÇÕES...\n");

        const sections = await page.locator("nav button, nav a").all();
        if (sections.length >= 2) {
          await sections[0].click();
          await page.waitForTimeout(1000);

          const field = await page
            .locator("input:visible, textarea:visible")
            .first();
          if (await field.isVisible()) {
            const original = await field.inputValue();
            console.log(`Valor original: "${original}"`);

            await field.clear();
            await field.fill("TESTE-VAZAMENTO-APÓS-LOGIN-MANUAL");
            console.log("Campo editado");

            await sections[1].click();
            console.log("Mudou de seção");
            await page.waitForTimeout(1000);

            await sections[0].click();
            console.log("Voltou para seção original");
            await page.waitForTimeout(1000);

            const current = await field.inputValue();

            if (current === original) {
              console.log("\n✅✅✅ ISOLAMENTO FUNCIONANDO!");
              console.log("Edições NÃO vazaram entre seções.");
            } else {
              console.log("\n❌❌❌ PROBLEMA: CONTEÚDO VAZOU!");
              console.log(`Esperado: "${original}"`);
              console.log(`Atual: "${current}"`);
            }
          }
        }
      } else {
        console.log("Nenhum protocolo encontrado");
      }
    }
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    console.log("\nTeste finalizado. Browser permanece aberto.");
    await new Promise(() => {});
  }
})();
