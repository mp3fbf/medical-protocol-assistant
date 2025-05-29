const { chromium } = require("@playwright/test");

(async () => {
  console.log("📋 CAPTURANDO TODOS OS LOGS\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const page = await browser.newPage();

  // CAPTURAR TUDO
  const logs = [];

  page.on("console", (msg) => {
    const logEntry = `[${msg.type()}] ${msg.text()}`;
    logs.push(logEntry);
    console.log(`CONSOLE: ${logEntry}`);
  });

  page.on("pageerror", (error) => {
    logs.push(`[ERROR] ${error.message}`);
    console.log(`PAGE ERROR: ${error.message}`);
  });

  page.on("requestfailed", (request) => {
    logs.push(`[FAILED] ${request.url()}`);
    console.log(`REQUEST FAILED: ${request.url()}`);
  });

  try {
    console.log("=== NAVEGANDO PARA LOGIN ===\n");
    await page.goto("http://localhost:3000/login", {
      waitUntil: "domcontentloaded",
    });

    // Aguardar um pouco para capturar logs iniciais
    await page.waitForTimeout(3000);

    console.log("\n=== VERIFICANDO ESTADO DO FORMULÁRIO ===\n");

    const formState = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (!form) return null;

      // Debug do formulário
      console.log("[LOGIN PAGE DEBUG] Form found:", form);
      console.log("[LOGIN PAGE DEBUG] Form method:", form.method);
      console.log("[LOGIN PAGE DEBUG] Form action:", form.action);

      // Verificar se tem onSubmit
      const hasOnSubmit = form.onsubmit !== null;
      const reactKeys = Object.keys(form).filter((k) =>
        k.startsWith("__react"),
      );

      console.log("[LOGIN PAGE DEBUG] Has onsubmit handler:", hasOnSubmit);
      console.log("[LOGIN PAGE DEBUG] React keys on form:", reactKeys);

      // Verificar se signIn está disponível
      const hasSignIn =
        typeof window.signIn !== "undefined" ||
        (window.NextAuth && typeof window.NextAuth.signIn !== "undefined");

      console.log("[LOGIN PAGE DEBUG] signIn available:", hasSignIn);

      return {
        method: form.method,
        action: form.action,
        hasOnSubmit,
        reactKeys: reactKeys.length,
        hasSignIn,
      };
    });

    console.log("Form State:", JSON.stringify(formState, null, 2));

    console.log("\n=== PREENCHENDO FORMULÁRIO ===\n");

    await page.fill('input[name="email"]', "dev-mock@example.com");
    await page.fill('input[name="password"]', "password");

    console.log("\n=== TENTANDO LOGIN ===\n");

    // Adicionar listener para capturar o que acontece no submit
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) {
        form.addEventListener(
          "submit",
          (e) => {
            console.log(
              "[FORM SUBMIT EVENT] Default prevented?",
              e.defaultPrevented,
            );
            console.log("[FORM SUBMIT EVENT] Event type:", e.type);
          },
          true,
        ); // Use capture phase
      }
    });

    // Clicar no botão
    await page.click('button[type="submit"]');

    // Aguardar para capturar logs do submit
    await page.waitForTimeout(5000);

    console.log("\n=== RESULTADO ===\n");
    console.log("URL:", page.url());

    // Verificar se ainda tem os console.log do código
    console.log("\n=== TODOS OS LOGS CAPTURADOS ===\n");
    logs.forEach((log) => console.log(log));

    // Procurar especificamente pelos logs do login
    const loginLogs = logs.filter(
      (log) =>
        log.includes("LOGIN PAGE DEBUG") ||
        log.includes("AUTH DEBUG") ||
        log.includes("signIn"),
    );

    console.log("\n=== LOGS ESPECÍFICOS DO LOGIN ===\n");
    if (loginLogs.length === 0) {
      console.log("⚠️ NENHUM LOG DO LOGIN FOI CAPTURADO!");
      console.log(
        "Isso pode indicar que o código JavaScript não está sendo executado.",
      );
    } else {
      loginLogs.forEach((log) => console.log(log));
    }
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    console.log("\nBrowser permanece aberto...");
    await new Promise(() => {});
  }
})();
