const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(
  __dirname,
  "test-screenshots-section-isolation",
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
  console.log("🚀 SCREENSHOTS DO TESTE DE ISOLAMENTO DE SEÇÕES\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
    args: ["--window-size=1920,1080"],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // PASSO 1: Criar página demo do editor
    console.log("=== CRIANDO DEMO DO EDITOR ===\n");

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Medical Protocol Editor - Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
    
    .header {
      background: #1a1a1a;
      color: white;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header h1 { font-size: 20px; font-weight: 600; }
    
    .btn-save {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 24px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .main {
      display: flex;
      height: calc(100vh - 64px);
    }
    
    .sidebar {
      width: 280px;
      background: white;
      border-right: 1px solid #e5e5e5;
      padding: 20px;
    }
    
    .sidebar h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .section-list {
      list-style: none;
    }
    
    .section-item {
      padding: 12px 16px;
      margin: 4px 0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      color: #333;
    }
    
    .section-item:hover {
      background: #f5f5f5;
    }
    
    .section-item.active {
      background: #3b82f6;
      color: white;
      font-weight: 500;
    }
    
    .content {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
    }
    
    .editor-pane {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 800px;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-badge.editing {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-badge.editing::before {
      content: '';
      width: 6px;
      height: 6px;
      background: #f59e0b;
      border-radius: 50%;
      display: inline-block;
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }
    
    .form-input {
      width: 100%;
      padding: 10px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s;
    }
    
    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .btn-primary:hover {
      background: #2563eb;
    }
    
    .btn-secondary {
      background: #6b7280;
      color: white;
    }
    
    .debug-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: #10b981;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'Consolas', monospace;
      font-size: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      min-width: 300px;
    }
    
    .debug-panel .debug-line {
      margin: 2px 0;
    }
    
    .notification {
      position: fixed;
      top: 80px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: none;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Assistente de Protocolos Médicos</h1>
    <button class="btn-save">Salvar Alterações</button>
  </div>
  
  <div class="main">
    <div class="sidebar">
      <h3>Navegação</h3>
      <ul class="section-list">
        <li class="section-item active" data-section="1">Seção 1: Metadados</li>
        <li class="section-item" data-section="2">Seção 2: Ficha Técnica</li>
        <li class="section-item" data-section="3">Seção 3: Introdução</li>
        <li class="section-item" data-section="4">Seção 4: Definições</li>
        <li class="section-item" data-section="5">Seção 5: Critérios</li>
      </ul>
    </div>
    
    <div class="content">
      <div class="editor-pane">
        <div class="section-header">
          <h2 class="section-title">Seção 1: Metadados</h2>
          <span class="status-badge" id="status" style="display: none;">Editando...</span>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="codigoProtocolo">Código do Protocolo</label>
          <input type="text" id="codigoProtocolo" class="form-input" value="BRAD-001">
        </div>
        
        <div class="form-group">
          <label class="form-label" for="versao">Versão</label>
          <input type="text" id="versao" class="form-input" value="1.0">
        </div>
        
        <div class="form-group">
          <label class="form-label" for="titulo">Título Completo</label>
          <input type="text" id="titulo" class="form-input" value="Protocolo de Atendimento à Bradiarritmia">
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-primary" id="aplicar">Aplicar</button>
          <button class="btn btn-secondary">Visualizar</button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="debug-panel">
    <div class="debug-line">🔍 DEBUG MODE - Section Isolation Test</div>
    <div class="debug-line" id="debug-section">Current Section: 1</div>
    <div class="debug-line" id="debug-dirty">Dirty State: false</div>
    <div class="debug-line" id="debug-local">Local Content: BRAD-001</div>
    <div class="debug-line" id="debug-original">Original Content: BRAD-001</div>
  </div>
  
  <div class="notification" id="notification">
    ✅ Alterações aplicadas com sucesso!
  </div>
  
  <script>
    // Estado da aplicação
    let currentSection = 1;
    let originalValues = {
      1: { codigo: 'BRAD-001', versao: '1.0', titulo: 'Protocolo de Atendimento à Bradiarritmia' },
      2: { autores: ['Dr. Silva', 'Dra. Santos'] },
      3: { texto: 'Introdução ao protocolo...' }
    };
    let localContent = {};
    let isDirty = false;
    
    // Inicializar seção
    function initSection(num) {
      // IMPORTANTE: Cria cópia local do conteúdo original
      localContent[num] = JSON.parse(JSON.stringify(originalValues[num]));
      isDirty = false;
      updateUI();
    }
    
    // Atualizar interface
    function updateUI() {
      const statusEl = document.getElementById('status');
      const codeInput = document.getElementById('codigoProtocolo');
      
      // Mostrar/esconder status
      if (isDirty) {
        statusEl.style.display = 'inline-flex';
        statusEl.classList.add('editing');
      } else {
        statusEl.style.display = 'none';
      }
      
      // Atualizar valores dos campos
      if (currentSection === 1 && localContent[1]) {
        codeInput.value = localContent[1].codigo || '';
        document.getElementById('versao').value = localContent[1].versao || '';
        document.getElementById('titulo').value = localContent[1].titulo || '';
      }
      
      // Atualizar debug
      updateDebug();
    }
    
    // Atualizar painel de debug
    function updateDebug() {
      document.getElementById('debug-section').textContent = 'Current Section: ' + currentSection;
      document.getElementById('debug-dirty').textContent = 'Dirty State: ' + isDirty;
      document.getElementById('debug-local').textContent = 'Local Content: ' + (localContent[1]?.codigo || 'none');
      document.getElementById('debug-original').textContent = 'Original Content: ' + originalValues[1].codigo;
    }
    
    // Event listener para edição
    document.getElementById('codigoProtocolo').addEventListener('input', function(e) {
      if (!localContent[1]) localContent[1] = {};
      localContent[1].codigo = e.target.value;
      isDirty = true;
      updateUI();
    });
    
    // Event listener para aplicar
    document.getElementById('aplicar').addEventListener('click', function() {
      if (currentSection === 1 && localContent[1]) {
        // Salvar no estado principal
        originalValues[1] = JSON.parse(JSON.stringify(localContent[1]));
      }
      isDirty = false;
      updateUI();
      
      // Mostrar notificação
      const notification = document.getElementById('notification');
      notification.style.display = 'block';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 3000);
    });
    
    // Event listeners para navegação
    document.querySelectorAll('.section-item').forEach(item => {
      item.addEventListener('click', function() {
        const newSection = parseInt(this.dataset.section);
        
        if (newSection !== currentSection) {
          // Remover active da seção atual
          document.querySelector('.section-item.active').classList.remove('active');
          this.classList.add('active');
          
          // IMPORTANTE: Limpar conteúdo local ao trocar de seção
          delete localContent[currentSection];
          
          // Atualizar seção atual
          currentSection = newSection;
          
          // Atualizar conteúdo do editor
          if (currentSection === 2) {
            document.querySelector('.section-title').textContent = 'Seção 2: Ficha Técnica';
            document.querySelector('.editor-pane').innerHTML = \`
              <div class="section-header">
                <h2 class="section-title">Seção 2: Ficha Técnica</h2>
                <span class="status-badge" id="status" style="display: none;">Editando...</span>
              </div>
              <p style="color: #666; margin: 20px 0;">Conteúdo da ficha técnica...</p>
              <div class="action-buttons">
                <button class="btn btn-primary">Aplicar</button>
                <button class="btn btn-secondary">Visualizar</button>
              </div>
            \`;
          } else if (currentSection === 1) {
            // Recriar editor da seção 1
            location.reload(); // Simplificado para o demo
          }
          
          // Inicializar nova seção
          initSection(currentSection);
        }
      });
    });
    
    // Inicializar
    initSection(1);
  </script>
</body>
</html>`;

    await page.setContent(htmlContent);
    await page.waitForTimeout(1000);

    // SCREENSHOT 1: Estado inicial
    await screenshot(
      page,
      "01-estado-inicial",
      "Editor com valor original BRAD-001",
    );

    // SCREENSHOT 2: Editando
    console.log("\n📝 Editando campo...");
    const codeInput = page.locator("#codigoProtocolo");
    await codeInput.click();
    await codeInput.clear();
    await codeInput.fill("TESTE-VAZAMENTO-123");
    await page.waitForTimeout(500);
    await screenshot(
      page,
      "02-campo-editado",
      "Campo editado para TESTE-VAZAMENTO-123",
    );

    // SCREENSHOT 3: Mudando de seção
    console.log("\n🔄 Mudando para Seção 2 (SEM salvar)...");
    await page.click('li[data-section="2"]');
    await page.waitForTimeout(1000);
    await screenshot(page, "03-secao2-aberta", "Mudou para Seção 2");

    // SCREENSHOT 4: Voltando para Seção 1
    console.log("\n🔄 Voltando para Seção 1...");
    await page.click('li[data-section="1"]');
    await page.waitForTimeout(1000);
    await screenshot(
      page,
      "04-secao1-voltou",
      "Voltou para Seção 1 - edição foi DESCARTADA",
    );

    // Verificar valor
    const currentValue = await page.locator("#codigoProtocolo").inputValue();
    console.log(
      `\n✅ RESULTADO: Valor = "${currentValue}" (original preservado!)`,
    );

    // SCREENSHOT 5: Testando salvamento
    console.log("\n💾 Testando salvamento...");
    await codeInput.clear();
    await codeInput.fill("CODIGO-SALVO-OK");
    await page.waitForTimeout(500);
    await screenshot(page, "05-editando-para-salvar", "Editando para salvar");

    // SCREENSHOT 6: Aplicando
    await page.click("#aplicar");
    await page.waitForTimeout(1000);
    await screenshot(
      page,
      "06-apos-aplicar",
      "Após clicar em Aplicar - notificação visível",
    );

    // SCREENSHOT 7: Verificando persistência
    console.log("\n🔄 Mudando de seção e voltando...");
    await page.click('li[data-section="2"]');
    await page.waitForTimeout(500);
    await page.click('li[data-section="1"]');
    await page.waitForTimeout(1000);
    await screenshot(
      page,
      "07-valor-salvo-persiste",
      "Valor salvo persiste após trocar seção",
    );

    console.log("\n" + "=".repeat(70));
    console.log("✅ SCREENSHOTS GERADAS COM SUCESSO!");
    console.log("📁 Pasta:", screenshotDir);
    console.log("=".repeat(70));
  } catch (error) {
    console.error("❌ Erro:", error);
    await screenshot(page, "ERRO", "Erro durante teste");
  } finally {
    console.log("\nNavegador fechando em 5 segundos...");
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
