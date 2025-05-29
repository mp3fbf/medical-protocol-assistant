const { chromium } = require("@playwright/test");

(async () => {
  console.log("🔍 VERIFICANDO HIDRATAÇÃO DO REACT\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const page = await browser.newPage();

  // Capturar erros de hidratação
  page.on("console", (msg) => {
    if (msg.text().includes("hydration") || msg.text().includes("Hydration")) {
      console.log(`⚠️ HYDRATION: ${msg.text()}`);
    }
  });

  try {
    console.log("1. Navegando para /login...");
    await page.goto("http://localhost:3000/login");

    // Aguardar React carregar completamente
    console.log("2. Aguardando React hidratar...");
    await page.waitForFunction(
      () => {
        // Verificar se o React está totalmente carregado
        const root = document.querySelector("#__next");
        return root && root._reactRootContainer;
      },
      { timeout: 10000 },
    );

    // Aguardar mais um pouco para garantir
    await page.waitForTimeout(2000);

    console.log("3. Verificando se o formulário tem event listeners...");
    const formInfo = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (!form) return { error: "Form not found" };

      // Verificar se tem listeners anexados
      const hasReactProps = Object.keys(form).some((key) =>
        key.startsWith("__react"),
      );

      // Tentar simular submit para ver o que acontece
      let submitPrevented = false;
      form.addEventListener(
        "submit",
        (e) => {
          submitPrevented = true;
        },
        { once: true },
      );

      const event = new Event("submit", { cancelable: true });
      form.dispatchEvent(event);

      return {
        hasReactProps,
        submitPrevented,
        method: form.method,
        action: form.action,
      };
    });

    console.log("Form info:", formInfo);

    console.log("\n4. Preenchendo formulário normalmente...");
    await page.fill('input[name="email"]', "dev-mock@example.com");
    await page.fill('input[name="password"]', "password");

    console.log("5. Tentando submit via Enter (como usuário faria)...");
    await page.press('input[name="password"]', "Enter");

    await page.waitForTimeout(3000);

    console.log("\nRESULTADO:");
    console.log("URL:", page.url());

    if (page.url().includes("password=")) {
      console.log("\n❌ PROBLEMA CONFIRMADO: Form está enviando como GET!");
      console.log(
        "Isso indica que o JavaScript/React não está interceptando o submit.\n",
      );

      console.log("Possíveis causas:");
      console.log("1. React ainda não hidratou quando o teste executa");
      console.log("2. Playwright está executando rápido demais");
      console.log("3. Algum erro JavaScript está impedindo o handler\n");

      // Tentar aguardar mais e fazer novamente
      console.log("6. Tentando novamente com mais delay...");
      await page.goto("http://localhost:3000/login");
      await page.waitForTimeout(5000); // Aguardar MUITO

      await page.fill('input[name="email"]', "dev-mock@example.com");
      await page.fill('input[name="password"]', "password");

      // Aguardar antes de clicar
      await page.waitForTimeout(2000);

      await page.click('button:has-text("Entrar")');

      await page.waitForTimeout(3000);
      console.log("Nova URL:", page.url());
    }
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    console.log("\nBrowser permanece aberto...");
    // Manter aberto
    await new Promise(() => {});
  }
})();
