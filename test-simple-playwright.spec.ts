import { test, expect } from "@playwright/test";

test.use({
  storageState: { cookies: [], origins: [] },
  baseURL: "http://localhost:3000",
});

test("debug login issue", async ({ page }) => {
  console.log("1. Navegando para home...");
  await page.goto("/");
  await page.waitForTimeout(3000);

  console.log("2. Navegando para login...");
  await page.goto("/login");
  await page.waitForTimeout(5000); // Aguardar bastante

  // Debug: verificar se o JS carregou
  const jsState = await page.evaluate(() => {
    const form = document.querySelector("form");
    return {
      hasForm: !!form,
      method: form?.method,
      reactProps: form
        ? Object.keys(form).filter((k) => k.startsWith("__react"))
        : [],
    };
  });

  console.log("Estado do JS:", jsState);

  console.log("3. Preenchendo formulário...");
  await page.getByLabel("Email").fill("dev-mock@example.com");
  await page.getByLabel("Senha").fill("password");

  console.log("4. Clicando em Entrar...");
  await page.getByRole("button", { name: "Entrar" }).click();

  console.log("5. Aguardando resultado...");
  await page.waitForTimeout(5000);

  console.log("URL final:", page.url());

  // Se conseguiu fazer login, testar isolamento
  if (!page.url().includes("/login")) {
    console.log("✅ Login funcionou!");

    // Navegar para protocolos
    await page.goto("/protocols");
    await page.waitForTimeout(2000);

    // Procurar protocolo
    const protocolLink = page.locator('a[href^="/protocols/"]').first();
    if (await protocolLink.isVisible()) {
      await protocolLink.click();
      await page.waitForTimeout(2000);

      console.log("Testando isolamento de seções...");

      // Testar isolamento
      const sections = await page.locator("nav button, nav a").all();
      if (sections.length >= 2) {
        await sections[0].click();
        await page.waitForTimeout(1000);

        const field = page.locator("input:visible, textarea:visible").first();
        if (await field.isVisible()) {
          const original = await field.inputValue();
          await field.fill("TESTE-VAZAMENTO");

          await sections[1].click();
          await page.waitForTimeout(1000);

          await sections[0].click();
          await page.waitForTimeout(1000);

          const current = await field.inputValue();

          if (current === original) {
            console.log("✅ ISOLAMENTO FUNCIONANDO!");
          } else {
            console.log("❌ CONTEÚDO VAZOU!");
          }
        }
      }
    }
  } else {
    console.log("❌ Login falhou");
  }
});
