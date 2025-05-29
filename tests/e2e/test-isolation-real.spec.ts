import { test, expect } from "@playwright/test";
import path from "path";

// Pasta para screenshots
const screenshotDir = path.join(
  __dirname,
  "../../test-screenshots-section-isolation",
);

test.describe("TESTE REAL - Isolamento de Seções", () => {
  test("Edições NÃO devem vazar entre seções", async ({ page }) => {
    console.log("🚀 INICIANDO TESTE DE ISOLAMENTO\n");

    // 1. Ir para lista de protocolos
    console.log("📋 Indo para lista de protocolos...");
    await page.goto("/protocols");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(screenshotDir, "01-lista-protocolos.png"),
      fullPage: true,
    });

    // 2. Clicar no primeiro protocolo
    console.log("📝 Abrindo primeiro protocolo...");
    const firstProtocol = page.locator(".cursor-pointer").first();
    await firstProtocol.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotDir, "02-protocolo-aberto.png"),
      fullPage: true,
    });

    // 3. Verificar se estamos no editor
    await expect(page.locator("text=Seção 1")).toBeVisible({ timeout: 10000 });
    console.log("✅ Editor carregado!\n");

    // 4. TESTE DE ISOLAMENTO
    console.log("🔴 INICIANDO TESTE DE ISOLAMENTO\n");

    // Clicar na Seção 1
    console.log("1️⃣ Clicando na Seção 1...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotDir, "03-secao1-aberta.png"),
      fullPage: true,
    });

    // Procurar campo de código
    const codeInput = page.locator("input#codigoProtocolo");
    await expect(codeInput).toBeVisible({ timeout: 5000 });

    // Capturar valor original
    const originalValue = await codeInput.inputValue();
    console.log(`   Valor original: "${originalValue}"`);

    // Editar o campo
    console.log("\n2️⃣ Editando campo...");
    await codeInput.clear();
    await codeInput.fill("TESTE-VAZAMENTO-SECAO1");
    await page.screenshot({
      path: path.join(screenshotDir, "04-secao1-editada.png"),
      fullPage: true,
    });
    console.log('   ✏️ Editado para: "TESTE-VAZAMENTO-SECAO1"');

    // Verificar que o valor foi alterado
    await expect(codeInput).toHaveValue("TESTE-VAZAMENTO-SECAO1");

    // Mudar para Seção 2 SEM SALVAR
    console.log("\n3️⃣ Mudando para Seção 2 (SEM SALVAR)...");
    await page.click("text=Seção 2");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotDir, "05-secao2-aberta.png"),
      fullPage: true,
    });

    // Verificar que estamos na Seção 2
    await expect(page.locator("text=Ficha Técnica")).toBeVisible();

    // Voltar para Seção 1
    console.log("\n4️⃣ Voltando para Seção 1...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotDir, "06-secao1-apos-voltar.png"),
      fullPage: true,
    });

    // VERIFICAR O RESULTADO
    const finalValue = await codeInput.inputValue();

    console.log("\n" + "=".repeat(60));
    console.log("📊 RESULTADO DO TESTE:");
    console.log("=".repeat(60));
    console.log(`Valor original:     "${originalValue}"`);
    console.log(`Valor editado:      "TESTE-VAZAMENTO-SECAO1"`);
    console.log(`Valor após voltar:  "${finalValue}"`);
    console.log("=".repeat(60));

    if (finalValue === "TESTE-VAZAMENTO-SECAO1") {
      console.log("\n❌❌❌ FALHA: CONTEÚDO VAZOU ENTRE SEÇÕES!");
      await page.screenshot({
        path: path.join(screenshotDir, "07-FALHA-vazamento-detectado.png"),
        fullPage: true,
      });
      throw new Error("Conteúdo vazou entre seções - BUG NÃO RESOLVIDO!");
    } else {
      console.log("\n✅✅✅ SUCESSO: SEÇÕES ESTÃO ISOLADAS!");
      await page.screenshot({
        path: path.join(screenshotDir, "07-SUCESSO-isolamento-funcionando.png"),
        fullPage: true,
      });
    }

    // TESTE ADICIONAL: Verificar que "Aplicar" funciona
    console.log('\n\n🔵 TESTE ADICIONAL: Salvamento com "Aplicar"\n');

    // Editar novamente
    await codeInput.clear();
    await codeInput.fill("CODIGO-DEVE-SALVAR");

    // Clicar em Aplicar
    console.log('5️⃣ Clicando em "Aplicar"...');
    const applyButton = page.locator('button:has-text("Aplicar")');
    await applyButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotDir, "08-apos-aplicar.png"),
      fullPage: true,
    });

    // Mudar de seção e voltar
    await page.click("text=Seção 2");
    await page.waitForTimeout(500);
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);

    // Verificar que salvou
    const savedValue = await codeInput.inputValue();
    if (savedValue === "CODIGO-DEVE-SALVAR") {
      console.log('✅ Salvamento com "Aplicar" funcionou!');
      await page.screenshot({
        path: path.join(screenshotDir, "09-salvamento-ok.png"),
        fullPage: true,
      });
    } else {
      console.log('❌ Salvamento com "Aplicar" falhou!');
      throw new Error("Salvamento não funcionou");
    }

    console.log("\n" + "=".repeat(60));
    console.log("📁 SCREENSHOTS SALVOS EM:");
    console.log(screenshotDir);
    console.log("=".repeat(60) + "\n");
  });
});
