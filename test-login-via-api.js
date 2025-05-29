const { chromium } = require("@playwright/test");

(async () => {
  console.log("🎯 TENTATIVA: LOGIN VIA API\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Primeiro, obter CSRF token
    console.log("1. Obtendo CSRF token...");
    await page.goto("http://localhost:3000/api/auth/csrf");
    const csrfData = await page.evaluate(() => {
      const pre = document.querySelector("pre");
      return pre ? JSON.parse(pre.textContent) : null;
    });
    console.log("CSRF:", csrfData);

    if (!csrfData || !csrfData.csrfToken) {
      throw new Error("Não conseguiu obter CSRF token");
    }

    // 2. Fazer login via API
    console.log("\n2. Fazendo POST para API de login...");
    const loginResponse = await page.request.post(
      "http://localhost:3000/api/auth/callback/credentials",
      {
        form: {
          email: "dev-mock@example.com",
          password: "password",
          csrfToken: csrfData.csrfToken,
          callbackUrl: "http://localhost:3000/dashboard",
          json: true,
        },
      },
    );

    console.log("Status:", loginResponse.status());
    console.log("Headers:", loginResponse.headers());

    // 3. Verificar cookies
    const cookies = await context.cookies();
    console.log("\n3. Cookies após login:");
    cookies.forEach((c) =>
      console.log(`  ${c.name}: ${c.value.substring(0, 20)}...`),
    );

    // 4. Navegar para dashboard
    console.log("\n4. Navegando para dashboard...");
    await page.goto("http://localhost:3000/dashboard");
    await page.waitForTimeout(3000);

    console.log("URL atual:", page.url());

    if (!page.url().includes("/login")) {
      console.log("\n✅✅✅ LOGIN FUNCIONOU VIA API!");

      // AGORA TESTAR ISOLAMENTO
      console.log("\n5. Navegando para protocolos...");
      await page.goto("http://localhost:3000/protocols");
      await page.waitForTimeout(2000);

      const protocolLink = await page.locator('a[href^="/protocols/"]').first();
      if (await protocolLink.isVisible()) {
        console.log("6. Abrindo protocolo...");
        await protocolLink.click();
        await page.waitForTimeout(3000);

        console.log("\n🧪 TESTANDO ISOLAMENTO DE SEÇÕES...\n");

        const sections = await page
          .locator('nav button, nav a, div[role="button"]')
          .all();
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
            await field.fill("TESTE-VAZAMENTO-LOGIN-API");
            console.log("Campo editado");

            await sections[1].click();
            console.log("Mudou de seção");
            await page.waitForTimeout(1500);

            await sections[0].click();
            console.log("Voltou para seção original");
            await page.waitForTimeout(1500);

            const current = await field.inputValue();

            if (current === original) {
              console.log("\n✅✅✅ ISOLAMENTO FUNCIONANDO!");
            } else {
              console.log("\n❌❌❌ CONTEÚDO VAZOU!");
            }
          }
        }
      }
    } else {
      console.log("\n❌ Login via API falhou - ainda na página de login");
    }
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
  } finally {
    console.log("\nBrowser permanece aberto...");
    await new Promise(() => {});
  }
})();
