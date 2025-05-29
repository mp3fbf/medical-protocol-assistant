const { chromium } = require("@playwright/test");

(async () => {
  console.log("🔍 VERIFICANDO FLUXO DE ESTADO\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000,
  });

  const page = await browser.newPage();

  // Capturar TODOS os console logs
  page.on("console", (msg) => {
    const text = msg.text();
    if (
      text.includes("ProtocolEditorState") ||
      text.includes("TextEditorPane") ||
      text.includes("SectionEditor")
    ) {
      console.log(`[LOG] ${text}`);
    }
  });

  try {
    // Login
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

    console.log("\n2. INJETANDO LOGS DE DEBUG...\n");

    // Injetar código para monitorar mudanças
    await page.evaluate(() => {
      console.log("[DEBUG] Iniciando monitoramento de estado");

      // Interceptar o onChange do textarea
      const textarea = document.querySelector("textarea");
      if (textarea) {
        const originalOnChange = textarea.onchange;
        textarea.addEventListener("input", (e) => {
          console.log("[DEBUG] Textarea input event:", e.target.value);
        });
      }

      // Monitorar cliques de navegação
      document.addEventListener("click", (e) => {
        if (
          e.target.textContent &&
          e.target.textContent.includes("Ficha Técnica")
        ) {
          console.log("[DEBUG] Clicou em Ficha Técnica");
        }
        if (
          e.target.textContent &&
          e.target.textContent.includes("Identificação")
        ) {
          console.log("[DEBUG] Clicou em Identificação");
        }
      });
    });

    console.log("3. EXECUTANDO TESTE...\n");

    // Editar
    const textarea = page.locator("textarea").first();
    const original = await textarea.inputValue();
    console.log(`Original: "${original}"`);

    await textarea.fill("TESTE-DEBUG-123");
    console.log('Editado para: "TESTE-DEBUG-123"');
    await page.waitForTimeout(1000);

    // Mudar seção
    console.log("\nMudando de seção...");
    await page.getByText("Ficha Técnica").click();
    await page.waitForTimeout(3000);

    // Voltar
    console.log("Voltando...");
    await page.getByText("Identificação do Protocolo").click();
    await page.waitForTimeout(3000);

    // Verificar
    const atual = await textarea.inputValue();
    console.log(`\nAtual: "${atual}"`);

    if (atual === original) {
      console.log("✅ ISOLAMENTO OK");
    } else {
      console.log("❌ VAZAMENTO DETECTADO");
    }
  } catch (error) {
    console.error("Erro:", error.message);
  }

  console.log("\nBrowser aberto...");
  await new Promise(() => {});
})();
