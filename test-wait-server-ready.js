const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(__dirname, "test-screenshots-WAIT-SERVER");
if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

async function screenshot(page, name) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot: ${name}.png`);
  return filepath;
}

async function waitForServerReady(page, maxAttempts = 30) {
  console.log("⏳ Aguardando servidor estar completamente pronto...");

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await page.goto("http://localhost:3000/login", {
        waitUntil: "networkidle",
        timeout: 10000,
      });

      // Verificar se não há erros 404 de chunks JS
      const failed = page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll("script"));
        return scripts.some((s) => s.src && !s.src.includes("data:"));
      });

      if (response && response.ok() && (await failed)) {
        console.log("✅ Servidor pronto!");
        return true;
      }
    } catch (e) {
      console.log(`   Tentativa ${i + 1}/${maxAttempts}: ${e.message}`);
    }

    await page.waitForTimeout(2000);
  }

  return false;
}

(async () => {
  console.log("🚀 TESTE COM ESPERA PELO SERVIDOR\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // Ignorar erros de recursos para não poluir o console
  page.on("pageerror", () => {});

  try {
    // 1. Aguardar servidor estar pronto
    const serverReady = await waitForServerReady(page);
    if (!serverReady) {
      throw new Error("Servidor não ficou pronto a tempo");
    }

    // 2. Recarregar a página para garantir que tudo está carregado
    console.log("\n📄 Recarregando página de login...");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await screenshot(page, "01-login-ready");

    // 3. Preencher formulário
    console.log("\n📝 Preenchendo formulário...");

    // Usar seletores mais específicos
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await screenshot(page, "02-form-filled");

    // 4. Submit via Enter (mais confiável que click)
    console.log("\n⏎ Submetendo formulário via Enter...");
    await page.press('input[name="password"]', "Enter");

    // 5. Aguardar navegação ou erro
    console.log("\n⏳ Aguardando resposta...");

    try {
      await page.waitForURL("**/dashboard", { timeout: 10000 });
      console.log("✅ Login bem-sucedido! Redirecionado para dashboard");
      await screenshot(page, "03-dashboard");

      // AGORA TESTAR O PROTOCOLO EDITOR
      console.log("\n🎯 NAVEGANDO PARA UM PROTOCOLO...");

      // Verificar se há protocolos na lista
      const protocolLinks = await page.locator('a[href^="/protocols/"]').all();
      if (protocolLinks.length > 0) {
        console.log(`   Encontrados ${protocolLinks.length} protocolos`);
        await protocolLinks[0].click();
        await page.waitForTimeout(3000);
        await screenshot(page, "04-protocol-editor");

        // TESTAR ISOLAMENTO DE SEÇÕES
        console.log("\n🧪 TESTANDO ISOLAMENTO DE SEÇÕES...");

        // Encontrar campo editável na seção atual
        const firstInput = await page
          .locator('input[type="text"], textarea')
          .first();
        if (await firstInput.isVisible()) {
          const originalValue = await firstInput.inputValue();
          console.log(`   Valor original: "${originalValue}"`);

          // Editar
          await firstInput.clear();
          await firstInput.fill("TESTE-ISOLAMENTO-REAL");
          await screenshot(page, "05-section-edited");

          // Mudar de seção
          const sectionNav = await page
            .locator("nav")
            .locator("button, a")
            .nth(1);
          if (await sectionNav.isVisible()) {
            await sectionNav.click();
            await page.waitForTimeout(1000);
            await screenshot(page, "06-section-changed");

            // Voltar para seção original
            const firstSectionNav = await page
              .locator("nav")
              .locator("button, a")
              .first();
            await firstSectionNav.click();
            await page.waitForTimeout(1000);

            // Verificar se o valor voltou ao original
            const currentValue = await firstInput.inputValue();
            console.log(`   Valor após trocar seção: "${currentValue}"`);

            if (currentValue === originalValue) {
              console.log("   ✅ ISOLAMENTO FUNCIONANDO!");
              await screenshot(page, "07-isolation-success");
            } else {
              console.log("   ❌ VAZAMENTO DETECTADO!");
              await screenshot(page, "07-isolation-fail");
            }
          }
        }
      } else {
        console.log("   Nenhum protocolo encontrado, criando novo...");
        await page.goto("http://localhost:3000/protocols/new");
        await page.waitForTimeout(2000);
        await screenshot(page, "04-new-protocol");
      }
    } catch (e) {
      console.log("⚠️ Login não redirecionou para dashboard");
      await screenshot(page, "03-login-failed");

      // Verificar mensagem de erro
      const errorMsg = await page
        .locator('.text-red-500, [role="alert"]')
        .textContent()
        .catch(() => null);
      if (errorMsg) {
        console.log("   Erro:", errorMsg);
      }
    }
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    await screenshot(page, "ERROR");
  } finally {
    console.log("\n" + "=".repeat(70));
    console.log("📁 Screenshots em:", screenshotDir);
    console.log("=".repeat(70));

    console.log("\nBrowser aberto por 30 segundos...");
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();
