const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(
  __dirname,
  "test-screenshots-section-isolation-REAL",
);

// Limpar pasta
if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

async function screenshot(page, name, description) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 ${name}.png - ${description}`);
}

(async () => {
  console.log("🚀 TESTE NA APLICAÇÃO REAL - PROTOCOLO MÉDICO\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    storageState: {
      cookies: [],
      origins: [],
    },
  });

  const page = await context.newPage();

  try {
    // 1. LOGIN REAL
    console.log("🔐 PASSO 1: LOGIN NA APLICAÇÃO REAL");
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    // Se redirecionar para login
    if (page.url().includes("/login")) {
      console.log("Redirecionado para login...");
      await screenshot(page, "01-pagina-login-real", "Página de login real");

      // Tentar fazer login com credenciais conhecidas
      try {
        // Aguardar campos carregarem
        await page.waitForSelector('input[id="email"]', { timeout: 5000 });

        // Preencher credenciais
        await page.fill('input[id="email"]', "dev-mock@example.com");
        await page.fill('input[id="password"]', "password");
        await screenshot(page, "02-login-preenchido", "Login preenchido");

        // Submeter
        await page.click('button[type="submit"]');
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(3000);

        console.log("URL após login:", page.url());
        await screenshot(page, "03-apos-login", "Após tentar login");
      } catch (e) {
        console.log("Erro no login:", e.message);
      }
    }

    // 2. IR PARA PROTOCOLOS
    console.log("\n📋 PASSO 2: NAVEGANDO PARA PROTOCOLOS");

    // Tentar via menu se existir
    const menuProtocols = page
      .locator('a:has-text("Protocolos"), nav a[href*="protocols"]')
      .first();
    if (await menuProtocols.isVisible({ timeout: 3000 })) {
      await menuProtocols.click();
      await page.waitForLoadState("networkidle");
    } else {
      // Navegar direto
      await page.goto("http://localhost:3000/protocols");
      await page.waitForLoadState("networkidle");
    }

    await page.waitForTimeout(2000);
    await screenshot(page, "04-lista-protocolos", "Lista de protocolos");

    // 3. ABRIR UM PROTOCOLO
    console.log("\n📝 PASSO 3: ABRINDO UM PROTOCOLO");

    // Procurar cards de protocolo
    const protocolCard = page
      .locator('.cursor-pointer, [role="article"], div:has(h3)')
      .first();

    if (await protocolCard.isVisible({ timeout: 5000 })) {
      await protocolCard.click();
      console.log("Clicou no protocolo");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await screenshot(
        page,
        "05-protocolo-aberto",
        "Editor de protocolo aberto",
      );
    } else {
      console.log("Não encontrou card de protocolo");
      await screenshot(page, "05-sem-protocolos", "Sem protocolos na lista");
    }

    // 4. TESTE DE ISOLAMENTO
    console.log("\n🔍 PASSO 4: TESTE DE ISOLAMENTO DE SEÇÕES");

    // Verificar se estamos no editor
    const section1 = page
      .locator(
        'text=Seção 1, button:has-text("Seção 1"), li:has-text("Seção 1")',
      )
      .first();

    if (await section1.isVisible({ timeout: 5000 })) {
      console.log("\n✅ Editor carregado! Iniciando teste...\n");

      // CLICAR NA SEÇÃO 1
      await section1.click();
      await page.waitForTimeout(1500);
      await screenshot(page, "06-secao1-selecionada", "Seção 1 selecionada");

      // PROCURAR CAMPO DE CÓDIGO
      const codeInput = page
        .locator('input#codigoProtocolo, input[name="codigoProtocolo"]')
        .first();

      if (await codeInput.isVisible({ timeout: 3000 })) {
        // CAPTURAR VALOR ORIGINAL
        const originalValue = await codeInput.inputValue();
        console.log(`📌 Valor original do código: "${originalValue}"`);

        // EDITAR O CAMPO
        console.log("\n✏️ Editando campo...");
        await codeInput.clear();
        await codeInput.fill("TESTE-VAZAMENTO-REAL");
        await page.waitForTimeout(500);
        await screenshot(
          page,
          "07-campo-editado",
          "Campo editado para TESTE-VAZAMENTO-REAL",
        );

        // MUDAR PARA SEÇÃO 2 SEM SALVAR
        console.log("\n🔄 Mudando para Seção 2 (SEM salvar)...");
        const section2 = page
          .locator(
            'text=Seção 2, button:has-text("Seção 2"), li:has-text("Seção 2")',
          )
          .first();
        await section2.click();
        await page.waitForTimeout(1500);
        await screenshot(page, "08-secao2-selecionada", "Mudou para Seção 2");

        // VOLTAR PARA SEÇÃO 1
        console.log("\n🔄 Voltando para Seção 1...");
        await section1.click();
        await page.waitForTimeout(1500);
        await screenshot(page, "09-voltou-secao1", "Voltou para Seção 1");

        // VERIFICAR VALOR ATUAL
        const currentValue = await codeInput.inputValue();
        console.log(`\n📊 RESULTADO DO TESTE:`);
        console.log(`Valor original: "${originalValue}"`);
        console.log(`Valor após voltar: "${currentValue}"`);

        if (currentValue === "TESTE-VAZAMENTO-REAL") {
          console.log("\n❌❌❌ FALHA: EDIÇÃO VAZOU!");
          await screenshot(
            page,
            "10-FALHA-edicao-vazou",
            "FALHA - Edição não foi descartada",
          );
        } else if (currentValue === originalValue) {
          console.log("\n✅✅✅ SUCESSO: SEÇÕES ISOLADAS!");
          await screenshot(
            page,
            "10-SUCESSO-secoes-isoladas",
            "SUCESSO - Edição foi descartada",
          );
        }

        // TESTE ADICIONAL: SALVAR COM APLICAR
        console.log('\n💾 Testando salvamento com "Aplicar"...');
        await codeInput.clear();
        await codeInput.fill("CODIGO-SALVO-REAL");
        await page.waitForTimeout(500);

        const applyButton = page.locator('button:has-text("Aplicar")').first();
        if (await applyButton.isVisible()) {
          await applyButton.click();
          await page.waitForTimeout(1000);
          await screenshot(page, "11-apos-aplicar", "Após clicar em Aplicar");

          // Verificar persistência
          await section2.click();
          await page.waitForTimeout(500);
          await section1.click();
          await page.waitForTimeout(500);

          const savedValue = await codeInput.inputValue();
          if (savedValue === "CODIGO-SALVO-REAL") {
            console.log("✅ Salvamento funcionou!");
            await screenshot(
              page,
              "12-salvamento-ok",
              "Salvamento persistiu corretamente",
            );
          }
        }
      } else {
        console.log("❌ Campo de código não encontrado");
        await screenshot(
          page,
          "ERRO-sem-campo-codigo",
          "Campo de código não encontrado",
        );
      }
    } else {
      console.log("❌ Editor não carregou - não encontrou navegação de seções");
      await screenshot(page, "ERRO-editor-nao-carregou", "Editor não carregou");
    }

    console.log("\n" + "=".repeat(70));
    console.log("📁 SCREENSHOTS SALVAS EM:");
    console.log(screenshotDir);
    console.log("=".repeat(70));
  } catch (error) {
    console.error("\n❌ ERRO GERAL:", error.message);
    await screenshot(page, "ERRO-GERAL", "Erro durante execução");
  } finally {
    console.log(
      "\nTeste finalizado. Browser permanece aberto por 10 segundos...",
    );
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();
