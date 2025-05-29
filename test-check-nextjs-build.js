const { chromium } = require("@playwright/test");

(async () => {
  console.log("🔍 VERIFICANDO BUILD DO NEXT.JS\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const page = await browser.newPage();

  try {
    // 1. Verificar se a home page carrega JS corretamente
    console.log("1. Testando home page (/)...");
    await page.goto("http://localhost:3000");
    await page.waitForTimeout(2000);

    const homePageJS = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script"));
      return scripts
        .filter((s) => s.src && !s.src.includes("data:"))
        .map((s) => ({
          src: s.src,
          loaded: !s.src.includes("404"),
        }));
    });

    console.log("Scripts na home:", homePageJS.length);
    const failedHome = homePageJS.filter((s) => !s.loaded);
    if (failedHome.length > 0) {
      console.log("❌ Scripts que falharam na home:", failedHome);
    } else {
      console.log("✅ Todos os scripts carregaram na home");
    }

    // 2. Verificar a página de login
    console.log("\n2. Testando página de login (/login)...");
    await page.goto("http://localhost:3000/login");
    await page.waitForTimeout(2000);

    const loginPageJS = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script"));
      return scripts
        .filter((s) => s.src && !s.src.includes("data:"))
        .map((s) => ({
          src: s.src,
          loaded: !s.src.includes("404"),
        }));
    });

    console.log("Scripts no login:", loginPageJS.length);
    const failedLogin = loginPageJS.filter((s) => !s.loaded);
    if (failedLogin.length > 0) {
      console.log("❌ Scripts que falharam no login:", failedLogin);
    }

    // 3. Tentar acessar o JS diretamente
    console.log("\n3. Verificando acesso direto aos chunks JS...");
    const jsUrl = "http://localhost:3000/_next/static/chunks/app/login/page.js";

    const response = await page
      .goto(jsUrl, { waitUntil: "domcontentloaded" })
      .catch((e) => null);
    if (response) {
      console.log(`Status do ${jsUrl}:`, response.status());
      if (response.status() === 404) {
        console.log("❌ O arquivo JS não existe ou não está sendo servido");
      }
    }

    // 4. Verificar se é problema de timing
    console.log("\n4. Aguardando mais tempo e tentando novamente...");
    await page.goto("http://localhost:3000/login");

    // Aguardar MUITO tempo
    console.log("Aguardando 10 segundos...");
    await page.waitForTimeout(10000);

    const afterWaitState = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (!form) return { error: "No form" };

      return {
        method: form.method,
        hasOnSubmit: form.onsubmit !== null,
        reactKeys: Object.keys(form).filter((k) => k.startsWith("__react"))
          .length,
      };
    });

    console.log("Estado após aguardar:", afterWaitState);

    // 5. Verificar se funciona com navegação client-side
    console.log("\n5. Testando navegação client-side...");
    await page.goto("http://localhost:3000");
    await page.waitForTimeout(2000);

    // Clicar em algum link para /login se existir
    const loginLink = await page.$('a[href="/login"]');
    if (loginLink) {
      console.log("Navegando via link...");
      await loginLink.click();
      await page.waitForTimeout(3000);

      const clientNavState = await page.evaluate(() => {
        const form = document.querySelector("form");
        if (!form) return { error: "No form" };

        return {
          url: window.location.href,
          method: form.method,
          hasOnSubmit: form.onsubmit !== null,
        };
      });

      console.log("Estado após navegação client-side:", clientNavState);
    }
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    console.log("\nBrowser permanece aberto...");
    await new Promise(() => {});
  }
})();
