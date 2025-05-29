const { chromium } = require("@playwright/test");

(async () => {
  console.log("🔍 DEBUG DETALHADO DO LOGIN\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    devtools: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. INTERCEPTAR TODAS AS REQUISIÇÕES
  page.on("request", (request) => {
    if (request.url().includes("auth") || request.method() === "POST") {
      console.log(`\n📤 REQUEST: ${request.method()} ${request.url()}`);
      console.log("Headers:", JSON.stringify(request.headers(), null, 2));
      console.log("PostData:", request.postData());
    }
  });

  page.on("response", (response) => {
    if (
      response.url().includes("auth") ||
      response.request().method() === "POST"
    ) {
      console.log(`\n📥 RESPONSE: ${response.status()} ${response.url()}`);
      response
        .text()
        .then((text) => {
          console.log("Body:", text.substring(0, 500));
        })
        .catch(() => {});
    }
  });

  // 2. CAPTURAR CONSOLE DO BROWSER
  page.on("console", (msg) => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });

  page.on("pageerror", (error) => {
    console.log(`[PAGE ERROR]`, error);
  });

  try {
    // 3. IR PARA LOGIN
    console.log("1️⃣ Navegando para /login...");
    await page.goto("http://localhost:3000/login");
    await page.waitForTimeout(3000);

    // 4. VERIFICAR FORM ACTION
    console.log("\n2️⃣ Analisando formulário...");
    const formInfo = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) {
        return {
          action: form.action,
          method: form.method,
          elements: Array.from(form.elements).map((el) => ({
            type: el.type,
            name: el.name,
            id: el.id,
            value: el.value,
          })),
        };
      }
      return null;
    });
    console.log("Form info:", JSON.stringify(formInfo, null, 2));

    // 5. VERIFICAR SE HÁ CSRF TOKEN
    const csrfToken = await page.evaluate(() => {
      const csrfInput = document.querySelector('input[name="csrfToken"]');
      return csrfInput ? csrfInput.value : null;
    });
    console.log("\nCSRF Token:", csrfToken);

    // 6. PREENCHER FORMULÁRIO
    console.log("\n3️⃣ Preenchendo formulário...");
    await page.fill('input[name="email"]', "dev-mock@example.com");
    await page.fill('input[name="password"]', "password");

    // 7. INTERCEPTAR SUBMIT
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) {
        form.addEventListener("submit", (e) => {
          console.log("FORM SUBMIT INTERCEPTED");
          console.log("Form data:", new FormData(form));
        });
      }
    });

    // 8. CLICAR SUBMIT E AGUARDAR
    console.log("\n4️⃣ Submetendo formulário...");

    const navigationPromise = page
      .waitForNavigation({
        waitUntil: "networkidle",
        timeout: 30000,
      })
      .catch((e) => {
        console.log("Navigation error:", e.message);
        return null;
      });

    await page.click('button[type="submit"]');

    await navigationPromise;

    // 9. VERIFICAR RESULTADO
    console.log("\n5️⃣ Verificando resultado...");
    console.log("URL atual:", page.url());
    console.log("Cookies:", await context.cookies());

    // 10. VERIFICAR SE ESTÁ AUTENTICADO
    const sessionCheck = await page.evaluate(async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        return data;
      } catch (e) {
        return { error: e.message };
      }
    });
    console.log("\nSession check:", JSON.stringify(sessionCheck, null, 2));
  } catch (error) {
    console.error("\n❌ Erro:", error);
  } finally {
    console.log("\nBrowser permanece aberto para inspeção...");
    await page.waitForTimeout(60000);
    await browser.close();
  }
})();
