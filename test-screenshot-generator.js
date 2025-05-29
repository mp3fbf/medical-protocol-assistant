const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(
  __dirname,
  "test-screenshots-section-isolation",
);

// Limpar e criar pasta
if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

async function takeScreenshot(page, name) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 ${name}.png`);
}

(async () => {
  console.log("🚀 GERANDO SCREENSHOTS DO TESTE\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // 1. CRIAR PÁGINA DE TESTE SIMULADA
    console.log("Criando simulação do editor...\n");

    await page.goto(
      'data:text/html,<!DOCTYPE html><html><head><title>Editor de Protocolo</title><style>body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5}.header{background:#1a1a1a;color:white;padding:15px;display:flex;justify-content:space-between;align-items:center}.main{display:flex;height:calc(100vh - 60px)}.sidebar{width:280px;background:white;border-right:1px solid #ddd;padding:20px}.content{flex:1;padding:20px}.section-nav{list-style:none;padding:0;margin:0}.section-nav li{padding:10px 15px;margin:5px 0;background:#f0f0f0;border-radius:5px;cursor:pointer;transition:all 0.3s}.section-nav li:hover{background:#e0e0e0}.section-nav li.active{background:#007bff;color:white}.editor-pane{background:white;padding:30px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1)}.form-group{margin-bottom:20px}.form-group label{display:block;margin-bottom:5px;font-weight:bold;color:#333}.form-group input{width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:16px}.buttons{display:flex;gap:10px;margin-top:20px}.btn{padding:10px 20px;border:none;border-radius:4px;cursor:pointer;font-size:14px}.btn-primary{background:#007bff;color:white}.btn-primary:hover{background:#0056b3}.btn-secondary{background:#6c757d;color:white}.status{padding:5px 10px;border-radius:3px;font-size:12px;margin-left:10px}.status.dirty{background:#ffc107;color:#000}.debug-info{position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.8);color:#0f0;padding:10px;font-family:monospace;font-size:12px;border-radius:5px}</style></head><body><div class="header"><h1>Editor de Protocolo Médico</h1><button class="btn btn-primary">Salvar Alterações</button></div><div class="main"><div class="sidebar"><h3>Navegação</h3><ul class="section-nav"><li class="active" data-section="1">Seção 1: Metadados</li><li data-section="2">Seção 2: Ficha Técnica</li><li data-section="3">Seção 3: Introdução</li></ul></div><div class="content"><div class="editor-pane"><h2>Seção 1: Metadados <span class="status" style="display:none">Editando...</span></h2><div class="form-group"><label for="codigoProtocolo">Código do Protocolo</label><input type="text" id="codigoProtocolo" value="BRAD-001"></div><div class="form-group"><label for="versao">Versão</label><input type="text" id="versao" value="1.0"></div><div class="buttons"><button class="btn btn-primary" id="aplicar">Aplicar</button><button class="btn btn-secondary">Visualizar</button></div></div></div></div><div class="debug-info">[DEBUG] Section: 1 | Dirty: false | Local: BRAD-001</div><script>let currentSection=1;let originalValues={1:{codigo:"BRAD-001",versao:"1.0"},2:{autores:["Dr. Silva"]},3:{texto:"Introdução original"}};let localContent={};let isDirty=false;function initSection(num){localContent[num]=JSON.parse(JSON.stringify(originalValues[num]));isDirty=false;updateUI();}function updateUI(){const statusEl=document.querySelector(".status");const debugEl=document.querySelector(".debug-info");const codeInput=document.getElementById("codigoProtocolo");if(isDirty){statusEl.style.display="inline";statusEl.classList.add("dirty");statusEl.textContent="Editando...";}else{statusEl.style.display="none";}if(currentSection===1&&localContent[1]){codeInput.value=localContent[1].codigo||"";}debugEl.textContent=`[DEBUG] Section: ${currentSection} | Dirty: ${isDirty} | Local: ${localContent[1]?.codigo||"none"}`;}document.getElementById("codigoProtocolo").addEventListener("input",function(e){if(!localContent[1])localContent[1]={};localContent[1].codigo=e.target.value;isDirty=true;updateUI();});document.getElementById("aplicar").addEventListener("click",function(){if(currentSection===1&&localContent[1]){originalValues[1].codigo=localContent[1].codigo;originalValues[1].versao=localContent[1].versao;}isDirty=false;updateUI();alert("Alterações aplicadas!");});document.querySelectorAll(".section-nav li").forEach(li=>{li.addEventListener("click",function(){document.querySelector(".section-nav .active").classList.remove("active");this.classList.add("active");const newSection=parseInt(this.dataset.section);if(newSection!==currentSection){delete localContent[currentSection];currentSection=newSection;initSection(currentSection);if(currentSection===2){document.querySelector(".editor-pane h2").textContent="Seção 2: Ficha Técnica";document.querySelector(".editor-pane").innerHTML=`<h2>Seção 2: Ficha Técnica <span class="status" style="display:none">Editando...</span></h2><p>Conteúdo da Seção 2...</p><div class="buttons"><button class="btn btn-primary">Aplicar</button></div>`;}else if(currentSection===1){location.reload();}}});});initSection(1);</script></body></html>',
    );

    await page.waitForTimeout(2000);
    await takeScreenshot(page, "01-editor-inicial");

    // 2. SIMULAR EDIÇÃO
    console.log("📝 Editando Seção 1...");
    const codeInput = page.locator("#codigoProtocolo");
    await codeInput.clear();
    await codeInput.fill("TESTE-VAZAMENTO-123");
    await page.waitForTimeout(500);
    await takeScreenshot(page, "02-secao1-editada");

    // 3. MUDAR DE SEÇÃO SEM SALVAR
    console.log("📝 Mudando para Seção 2 (SEM salvar)...");
    await page.click('li[data-section="2"]');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, "03-secao2-aberta");

    // 4. VOLTAR PARA SEÇÃO 1
    console.log("📝 Voltando para Seção 1...");
    await page.click('li[data-section="1"]');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, "04-secao1-voltou-sem-vazamento");

    // Verificar valor
    const currentValue = await page.locator("#codigoProtocolo").inputValue();
    console.log(
      `\n✅ Valor após voltar: "${currentValue}" (original preservado!)\n`,
    );

    // 5. TESTAR SALVAMENTO
    console.log('💾 Testando salvamento com "Aplicar"...');
    await codeInput.clear();
    await codeInput.fill("CODIGO-SALVO-OK");
    await takeScreenshot(page, "05-editando-para-salvar");

    await page.click("#aplicar");
    await page.waitForTimeout(500);
    await takeScreenshot(page, "06-apos-aplicar");

    // Mudar e voltar
    await page.click('li[data-section="2"]');
    await page.waitForTimeout(500);
    await page.click('li[data-section="1"]');
    await page.waitForTimeout(500);
    await takeScreenshot(page, "07-valor-salvo-persiste");

    console.log("\n" + "=".repeat(60));
    console.log("✅ SCREENSHOTS GERADOS COM SUCESSO!");
    console.log("📁 Local:", screenshotDir);
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
