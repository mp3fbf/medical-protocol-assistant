// Debug do problema de autenticação
const { chromium } = require("@playwright/test");

(async () => {
  console.log("🔍 DEBUG DE AUTENTICAÇÃO\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    devtools: true, // Abrir DevTools
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Capturar logs do console
  page.on("console", (msg) => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  // Capturar requests
  page.on("request", (request) => {
    if (request.url().includes("/api/auth")) {
      console.log(`[Request] ${request.method()} ${request.url()}`);
      console.log("[Request Headers]", request.headers());
    }
  });

  // Capturar responses
  page.on("response", (response) => {
    if (response.url().includes("/api/auth")) {
      console.log(`[Response] ${response.status()} ${response.url()}`);
    }
  });

  try {
    // 1. Ir para login
    console.log("1️⃣ Navegando para login...");
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");

    // 2. Verificar se os campos existem
    console.log("\n2️⃣ Verificando campos do formulário...");

    const emailField = await page.$("input#email");
    const passwordField = await page.$("input#password");
    const submitButton = await page.$('button[type="submit"]');

    console.log("Campo email encontrado:", !!emailField);
    console.log("Campo password encontrado:", !!passwordField);
    console.log("Botão submit encontrado:", !!submitButton);

    // 3. Verificar atributos do formulário
    const form = await page.$("form");
    if (form) {
      const method = await form.getAttribute("method");
      const action = await form.getAttribute("action");
      console.log("\nFormulário:");
      console.log("- method:", method || "não definido");
      console.log("- action:", action || "não definido");
    }

    // 4. Tentar preencher e submeter
    console.log("\n3️⃣ Preenchendo formulário...");
    await page.fill("input#email", "dev-mock@example.com");
    await page.fill("input#password", "password");

    console.log("\n4️⃣ Submetendo formulário...");

    // Aguardar network para capturar requests
    const [response] = await Promise.all([
      page
        .waitForResponse((resp) => resp.url().includes("/api/auth"), {
          timeout: 10000,
        })
        .catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    if (response) {
      console.log("\n📡 Resposta da API:");
      console.log("Status:", response.status());
      const text = await response.text();
      console.log("Body:", text.substring(0, 200));
    }

    // 5. Aguardar e verificar resultado
    await page.waitForTimeout(3000);

    console.log("\n5️⃣ Estado após submissão:");
    console.log("URL atual:", page.url());

    // Verificar se há mensagem de erro
    const errorAlert = await page.$('.alert-destructive, [role="alert"]');
    if (errorAlert) {
      const errorText = await errorAlert.textContent();
      console.log("Mensagem de erro:", errorText);
    }

    console.log("\n📌 INSTRUÇÕES:");
    console.log("1. Verifique o DevTools Network para ver as requests");
    console.log("2. Verifique o Console para erros JavaScript");
    console.log(
      "3. Verifique se o servidor está mostrando logs de autenticação",
    );
    console.log("\nMantenha o navegador aberto para investigar...");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  // Manter aberto
  await new Promise(() => {});
})();
