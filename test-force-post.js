const { chromium } = require("@playwright/test");

(async () => {
  console.log("🔧 FORÇANDO LOGIN COM POST\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Debug de requisições
  page.on("request", (request) => {
    if (request.url().includes("auth")) {
      console.log(`📤 ${request.method()} ${request.url()}`);
      if (request.method() === "POST") {
        console.log("POST Data:", request.postData());
      }
    }
  });

  page.on("response", async (response) => {
    if (
      response.url().includes("auth") &&
      response.request().method() === "POST"
    ) {
      console.log(`📥 ${response.status()} ${response.url()}`);
      const body = await response.text().catch(() => "");
      console.log("Response:", body.substring(0, 200));
    }
  });

  try {
    console.log("1️⃣ Navegando para login...");
    await page.goto("http://localhost:3000/login");
    await page.waitForTimeout(3000);

    // Verificar se o formulário existe e tem o handler correto
    const formCheck = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) {
        // Verificar se tem event listeners
        const hasListeners =
          form.onsubmit !== null || form.hasAttribute("onsubmit");
        return {
          exists: true,
          method: form.method,
          action: form.action,
          hasListeners,
        };
      }
      return { exists: false };
    });
    console.log("Form check:", formCheck);

    console.log("\n2️⃣ Preenchendo credenciais...");
    await page.fill('input[name="email"]', "dev-mock@example.com");
    await page.fill('input[name="password"]', "password");

    console.log("\n3️⃣ Tentando login via JavaScript direto...");

    // Executar o signIn diretamente via JavaScript
    const loginResult = await page.evaluate(async () => {
      // Importar next-auth/react diretamente no contexto da página
      const { signIn } = window.NextAuth || {};

      if (!signIn) {
        // Tentar buscar o signIn no contexto React
        const reactFiber =
          document.querySelector("#__next")._reactRootContainer?._internalRoot
            ?.current;
        console.log("React Fiber:", !!reactFiber);
        return { error: "signIn not found" };
      }

      try {
        const result = await signIn("credentials", {
          redirect: false,
          email: "dev-mock@example.com",
          password: "password",
        });
        return result;
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log("Login result:", loginResult);

    // Se não funcionou, tentar fazer POST manual
    if (loginResult.error) {
      console.log("\n4️⃣ Tentando POST manual para API...");

      const csrfResponse = await page.evaluate(async () => {
        try {
          const res = await fetch("/api/auth/csrf");
          const data = await res.json();
          return data;
        } catch (e) {
          return { error: e.message };
        }
      });
      console.log("CSRF:", csrfResponse);

      const signInResponse = await page.evaluate(async (csrf) => {
        try {
          const res = await fetch("/api/auth/callback/credentials", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              email: "dev-mock@example.com",
              password: "password",
              csrfToken: csrf.csrfToken || "",
              callbackUrl: "/dashboard",
            }),
          });

          return {
            status: res.status,
            headers: Object.fromEntries(res.headers.entries()),
            body: await res.text(),
          };
        } catch (e) {
          return { error: e.message };
        }
      }, csrfResponse);

      console.log("SignIn Response:", signInResponse);
    }

    // Verificar se logou
    await page.waitForTimeout(3000);
    console.log("\n5️⃣ Verificando estado final...");
    console.log("URL:", page.url());

    const session = await page.evaluate(async () => {
      const res = await fetch("/api/auth/session");
      return res.json();
    });
    console.log("Session:", session);
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    console.log("\nBrowser aberto por 1 minuto...");
    await page.waitForTimeout(60000);
    await browser.close();
  }
})();
