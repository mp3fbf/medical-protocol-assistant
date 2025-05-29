const { chromium } = require("@playwright/test");

(async () => {
  console.log("🎯 REPLICANDO EXATAMENTE O QUE VOCÊ FAZ MANUALMENTE\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000, // BEM LENTO para ver cada passo
  });

  const page = await browser.newPage();

  console.log(
    "Por favor, observe se o teste está fazendo EXATAMENTE o que você faz:\n",
  );

  try {
    // 1. Abrir navegador e ir para localhost:3000/login
    console.log("1. Abrindo http://localhost:3000/login");
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");
    console.log("   ✓ Página carregada\n");

    // 2. Clicar no campo de email
    console.log("2. Clicando no campo de email");
    await page.click('input[name="email"]');
    console.log("   ✓ Campo de email focado\n");

    // 3. Digitar email
    console.log("3. Digitando: dev-mock@example.com");
    await page.type('input[name="email"]', "dev-mock@example.com");
    console.log("   ✓ Email digitado\n");

    // 4. Clicar no campo de senha (TAB ou click?)
    console.log("4. Clicando no campo de senha");
    await page.click('input[name="password"]');
    console.log("   ✓ Campo de senha focado\n");

    // 5. Digitar senha
    console.log("5. Digitando senha: password");
    await page.type('input[name="password"]', "password");
    console.log("   ✓ Senha digitada\n");

    // 6. Clicar no botão Entrar
    console.log('6. Clicando no botão "Entrar"');

    // Vamos tentar diferentes seletores para o botão
    const button = await page.locator('button:has-text("Entrar")').first();

    console.log("   Botão encontrado?", await button.isVisible());
    console.log("   Texto do botão:", await button.textContent());

    await button.click();
    console.log("   ✓ Botão clicado\n");

    // 7. Aguardar resultado
    console.log("7. Aguardando resultado...");
    await page.waitForTimeout(5000);

    console.log("\nRESULTADO:");
    console.log("URL atual:", page.url());

    // Se ainda estiver no login, algo deu errado
    if (page.url().includes("/login")) {
      console.log("\n❌ Ainda está na página de login");

      // Verificar se há mensagem de erro
      const errorElement = await page
        .locator('.text-red-500, [role="alert"], .alert')
        .first();
      if (await errorElement.isVisible()) {
        console.log("Mensagem de erro:", await errorElement.textContent());
      }

      // Verificar console do browser
      console.log("\nÚltimas mensagens do console do browser:");
    } else {
      console.log("\n✅ Login bem-sucedido! Redirecionado para:", page.url());
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    console.log("\n\nO teste fez EXATAMENTE o que você faz manualmente?");
    console.log("Se não, me diga qual passo foi diferente.\n");

    console.log("Browser permanece aberto...");
    await browser.page(); // Mantém aberto
  }
})();
