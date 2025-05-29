const { chromium } = require("@playwright/test");

(async () => {
  console.log("🔍 VERIFICANDO ESTRUTURA DO PROTOCOLO\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const page = await browser.newPage();

  try {
    // Login
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

    // Injetar código para verificar estrutura
    const protocolInfo = await page.evaluate(() => {
      // Tentar acessar o React DevTools ou estado global
      const root = document.querySelector("#__next");

      // Log da estrutura do DOM
      console.log("[DEBUG] Verificando estrutura...");

      // Procurar por elementos que mostrem o número da seção
      const sectionTitle = document.querySelector("h3");
      const debugInfo = document.querySelector(".bg-blue-50");

      return {
        sectionTitle: sectionTitle?.textContent,
        debugInfo: debugInfo?.textContent,
        hasTextarea: !!document.querySelector("textarea"),
      };
    });

    console.log("Informações encontradas:", protocolInfo);

    // Verificar mudança de seção
    console.log("\nClicando em Ficha Técnica...");
    await page.getByText("Ficha Técnica").click();
    await page.waitForTimeout(2000);

    const section2Info = await page.evaluate(() => {
      const sectionTitle = document.querySelector("h3");
      const debugInfo = document.querySelector(".bg-blue-50");

      return {
        sectionTitle: sectionTitle?.textContent,
        debugInfo: debugInfo?.textContent,
      };
    });

    console.log("Seção 2:", section2Info);
  } catch (error) {
    console.error("Erro:", error.message);
  }

  console.log("\nBrowser aberto...");
  await new Promise(() => {});
})();
