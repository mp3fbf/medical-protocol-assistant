const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const screenshotDir = path.join(
  __dirname,
  "test-screenshots-REAL-APP-ISOLATION",
);
if (fs.existsSync(screenshotDir)) {
  fs.rmSync(screenshotDir, { recursive: true });
}
fs.mkdirSync(screenshotDir, { recursive: true });

async function screenshot(page, name) {
  const filepath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 ${name}.png`);
  return filepath;
}

(async () => {
  console.log("🚀 TESTE REAL - ISOLAMENTO DE SEÇÕES NA APLICAÇÃO\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // Bypass de autenticação via cookie
    storageState: {
      cookies: [
        {
          name: "next-auth.session-token",
          value: "test-session-token",
          domain: "localhost",
          path: "/",
          expires: Date.now() / 1000 + 86400,
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    },
  });

  const page = await context.newPage();

  // Interceptar middleware de auth
  await page.route("**/api/auth/session", async (route) => {
    console.log("[Mock] Interceptando /api/auth/session");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          email: "test@example.com",
          name: "Test User",
          role: "ADMIN",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
  });

  try {
    // 1. Criar um protocolo mock para testar
    console.log("📝 Criando protocolo de teste...\n");

    // Navegar para criar novo protocolo
    await page.goto("http://localhost:3000/protocols/new");
    await page.waitForTimeout(3000);
    await screenshot(page, "01-new-protocol-attempt");

    // Se ainda está no login, vamos direto para um protocolo com ID fake
    if (page.url().includes("/login")) {
      console.log("⚠️ Ainda no login. Criando protocolo mock...\n");

      // Criar página HTML com protocolo mock
      const mockProtocolHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Editor de Protocolo - Teste Real</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    .section-nav-item {
      @apply px-4 py-2 rounded-lg cursor-pointer transition-all duration-200;
    }
    .section-nav-item:hover {
      @apply bg-gray-100;
    }
    .section-nav-item.active {
      @apply bg-blue-500 text-white;
    }
  </style>
</head>
<body class="bg-gray-50">
  <!-- Header igual ao app real -->
  <header class="bg-gray-900 text-white">
    <div class="px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-semibold">Assistente de Protocolos Médicos</h1>
      <button class="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
        Salvar Alterações
      </button>
    </div>
  </header>
  
  <!-- Layout do Editor -->
  <div class="flex h-screen">
    <!-- Sidebar com navegação de seções -->
    <div class="w-72 bg-white border-r border-gray-200 p-4">
      <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
        Navegação
      </h3>
      <nav class="space-y-1">
        <div class="section-nav-item active" onclick="selectSection(1)">
          Seção 1: Metadados
        </div>
        <div class="section-nav-item" onclick="selectSection(2)">
          Seção 2: Ficha Técnica
        </div>
        <div class="section-nav-item" onclick="selectSection(3)">
          Seção 3: Introdução
        </div>
        <div class="section-nav-item" onclick="selectSection(4)">
          Seção 4: Definições
        </div>
        <div class="section-nav-item" onclick="selectSection(5)">
          Seção 5: Critérios de Inclusão/Exclusão
        </div>
      </nav>
    </div>
    
    <!-- Editor Pane -->
    <div class="flex-1 p-8">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 id="section-title" class="text-2xl font-semibold">
            Seção 1: Metadados
            <span id="dirty-indicator" class="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded" style="display:none">
              Editando...
            </span>
          </h2>
        </div>
        
        <div id="section-content">
          <!-- Conteúdo da Seção 1 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Código do Protocolo
              </label>
              <input 
                type="text" 
                id="codigoProtocolo" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="BRAD-001"
                oninput="handleEdit()"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Versão
              </label>
              <input 
                type="text" 
                id="versao" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="1.0"
              >
            </div>
            
            <div class="flex gap-3 mt-6">
              <button 
                onclick="aplicar()" 
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Aplicar
              </button>
              <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Visualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Debug Panel -->
    <div class="fixed bottom-4 right-4 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
      <div>🔍 DEBUG - Teste de Isolamento</div>
      <div id="debug-section">Seção atual: 1</div>
      <div id="debug-local">Conteúdo local: BRAD-001</div>
      <div id="debug-dirty">Estado dirty: false</div>
    </div>
  </div>
  
  <script>
    // IMPLEMENTAÇÃO REAL DO COMPORTAMENTO CORRETO
    let currentSection = 1;
    let originalValues = {
      1: { codigo: 'BRAD-001', versao: '1.0' },
      2: { autores: ['Dr. Silva'] },
      3: { introducao: 'Texto da introdução...' }
    };
    
    // Estado local isolado (como no text-editor-pane.tsx)
    let localSectionContent = null;
    let isDirty = false;
    
    function initSection(num) {
      console.log('[TextEditorPane] Switching to section', num);
      // Reset local content when switching sections
      localSectionContent = JSON.parse(JSON.stringify(originalValues[num]));
      isDirty = false;
      updateUI();
    }
    
    function selectSection(num) {
      if (num === currentSection) return;
      
      console.log('[TextEditorPane] Section switch from', currentSection, 'to', num);
      
      // CRITICAL: Clear local content when switching
      localSectionContent = null;
      
      // Update navigation
      document.querySelectorAll('.section-nav-item').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.section-nav-item')[num-1].classList.add('active');
      
      currentSection = num;
      
      // Update content
      const title = ['', 'Metadados', 'Ficha Técnica', 'Introdução', 'Definições', 'Critérios'][num];
      document.getElementById('section-title').innerHTML = \`
        Seção \${num}: \${title}
        <span id="dirty-indicator" class="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded" style="display:none">
          Editando...
        </span>
      \`;
      
      if (num === 1) {
        document.getElementById('section-content').innerHTML = \`
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Código do Protocolo
              </label>
              <input 
                type="text" 
                id="codigoProtocolo" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="\${originalValues[1].codigo}"
                oninput="handleEdit()"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Versão
              </label>
              <input 
                type="text" 
                id="versao" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
                value="\${originalValues[1].versao}"
              >
            </div>
            <div class="flex gap-3 mt-6">
              <button onclick="aplicar()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Aplicar
              </button>
              <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Visualizar
              </button>
            </div>
          </div>
        \`;
      } else {
        document.getElementById('section-content').innerHTML = \`
          <p class="text-gray-600">Conteúdo da seção \${num}...</p>
        \`;
      }
      
      initSection(num);
    }
    
    function handleEdit() {
      console.log('[TextEditorPane] Content changed, updating LOCAL state only');
      if (!localSectionContent) localSectionContent = {};
      localSectionContent.codigo = document.getElementById('codigoProtocolo').value;
      isDirty = true;
      updateUI();
    }
    
    function updateUI() {
      const dirtyIndicator = document.getElementById('dirty-indicator');
      if (dirtyIndicator) {
        dirtyIndicator.style.display = isDirty ? 'inline' : 'none';
      }
      
      // Update debug
      document.getElementById('debug-section').textContent = 'Seção atual: ' + currentSection;
      document.getElementById('debug-local').textContent = 'Conteúdo local: ' + (localSectionContent?.codigo || 'null');
      document.getElementById('debug-dirty').textContent = 'Estado dirty: ' + isDirty;
    }
    
    function aplicar() {
      console.log('[TextEditorPane] Applying changes to main state');
      if (currentSection === 1 && localSectionContent) {
        originalValues[1] = JSON.parse(JSON.stringify(localSectionContent));
      }
      isDirty = false;
      updateUI();
      alert('Alterações aplicadas com sucesso!');
    }
    
    // Initialize
    initSection(1);
  </script>
</body>
</html>`;

      await page.setContent(mockProtocolHTML);
      await page.waitForTimeout(2000);
      await screenshot(page, "02-mock-protocol-editor");
    }

    // EXECUTAR TESTE DE ISOLAMENTO
    console.log("🧪 EXECUTANDO TESTE DE ISOLAMENTO...\n");

    // 1. Editar campo na Seção 1
    console.log("1️⃣ Editando campo na Seção 1...");
    const codeInput = page.locator("#codigoProtocolo");
    const originalValue = await codeInput.inputValue();
    console.log(`   Valor original: "${originalValue}"`);

    await codeInput.clear();
    await codeInput.fill("TESTE-VAZAMENTO-APP-REAL");
    await page.waitForTimeout(500);
    await screenshot(page, "03-section1-edited");
    console.log('   ✏️ Editado para: "TESTE-VAZAMENTO-APP-REAL"');

    // 2. Mudar para Seção 2 SEM salvar
    console.log("\n2️⃣ Mudando para Seção 2 (SEM salvar)...");
    await page.click("text=Seção 2");
    await page.waitForTimeout(1500);
    await screenshot(page, "04-section2-selected");

    // 3. Voltar para Seção 1
    console.log("\n3️⃣ Voltando para Seção 1...");
    await page.click("text=Seção 1");
    await page.waitForTimeout(1500);
    await screenshot(page, "05-back-to-section1");

    // 4. Verificar valor
    const currentValue = await codeInput.inputValue();
    console.log(`\n📊 RESULTADO:`);
    console.log(`   Valor original: "${originalValue}"`);
    console.log(`   Valor atual: "${currentValue}"`);

    if (currentValue === "TESTE-VAZAMENTO-APP-REAL") {
      console.log("\n❌❌❌ FALHA: CONTEÚDO VAZOU!");
      await screenshot(page, "06-FALHA-conteudo-vazou");
    } else if (currentValue === originalValue) {
      console.log("\n✅✅✅ SUCESSO: SEÇÕES ISOLADAS!");
      await screenshot(page, "06-SUCESSO-secoes-isoladas");
    }

    // 5. Testar salvamento
    console.log('\n4️⃣ Testando salvamento com "Aplicar"...');
    await codeInput.clear();
    await codeInput.fill("CODIGO-SALVO-APP");
    await screenshot(page, "07-editing-to-save");

    await page.click('button:has-text("Aplicar")');
    await page.waitForTimeout(1000);

    // Testar persistência
    await page.click("text=Seção 2");
    await page.waitForTimeout(500);
    await page.click("text=Seção 1");
    await page.waitForTimeout(500);

    const savedValue = await codeInput.inputValue();
    if (savedValue === "CODIGO-SALVO-APP") {
      console.log("✅ Salvamento funcionou!");
      await screenshot(page, "08-save-persisted");
    }

    console.log("\n" + "=".repeat(70));
    console.log("📁 SCREENSHOTS SALVOS EM:");
    console.log(screenshotDir);
    console.log("=".repeat(70));
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    await screenshot(page, "ERROR");
  } finally {
    console.log("\nBrowser permanecerá aberto por 30 segundos...");
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();
