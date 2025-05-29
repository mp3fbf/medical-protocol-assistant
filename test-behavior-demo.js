// DEMONSTRAÇÃO DO COMPORTAMENTO ANTES E DEPOIS DA CORREÇÃO

console.log("=".repeat(70));
console.log("DEMONSTRAÇÃO: ISOLAMENTO DE SEÇÕES NO EDITOR DE PROTOCOLOS");
console.log("=".repeat(70));

// Simular estado do protocolo
const protocolData = {
  1: {
    sectionNumber: 1,
    title: "Metadados",
    content: { codigoProtocolo: "ORIG-001" },
  },
  2: {
    sectionNumber: 2,
    title: "Ficha Técnica",
    content: { autores: ["Dr. Silva"] },
  },
  3: {
    sectionNumber: 3,
    title: "Introdução",
    content: "Texto original da introdução",
  },
};

console.log("\n📋 ESTADO INICIAL DO PROTOCOLO:");
console.log("Seção 1 - Código:", protocolData["1"].content.codigoProtocolo);
console.log("Seção 2 - Autores:", protocolData["2"].content.autores);
console.log("Seção 3 - Conteúdo:", protocolData["3"].content);

console.log("\n" + "=".repeat(70));
console.log("❌ COMPORTAMENTO ANTES DA CORREÇÃO (COM BUG):");
console.log("=".repeat(70));

// Simular comportamento COM BUG
let buggyState = JSON.parse(JSON.stringify(protocolData));
let currentSection = 1;

console.log("\n1️⃣ Usuário clica na Seção 1");
console.log("   Valor mostrado:", buggyState["1"].content.codigoProtocolo);

console.log('\n2️⃣ Usuário edita o código para "TESTE-VAZAMENTO"');
// COM BUG: Atualiza direto no estado principal
buggyState["1"].content.codigoProtocolo = "TESTE-VAZAMENTO";
console.log("   Valor no campo:", buggyState["1"].content.codigoProtocolo);

console.log("\n3️⃣ Usuário muda para Seção 2 (SEM SALVAR)");
currentSection = 2;
console.log("   Agora está na Seção 2");

console.log("\n4️⃣ Usuário volta para Seção 1");
currentSection = 1;
console.log("   Valor mostrado:", buggyState["1"].content.codigoProtocolo);
console.log("   ❌ BUG: A edição não salva persistiu! Conteúdo vazou!");

console.log("\n" + "=".repeat(70));
console.log("✅ COMPORTAMENTO APÓS A CORREÇÃO (SEM BUG):");
console.log("=".repeat(70));

// Simular comportamento CORRETO
let fixedState = JSON.parse(JSON.stringify(protocolData));
let localContent = {}; // Estado local isolado por seção
currentSection = 1;

console.log("\n1️⃣ Usuário clica na Seção 1");
// Inicializa conteúdo local da seção
localContent[1] = JSON.parse(JSON.stringify(fixedState["1"].content));
console.log("   Valor mostrado:", localContent[1].codigoProtocolo);

console.log('\n2️⃣ Usuário edita o código para "TESTE-ISOLADO"');
// CORREÇÃO: Atualiza apenas o estado LOCAL
localContent[1].codigoProtocolo = "TESTE-ISOLADO";
console.log("   Valor no campo (local):", localContent[1].codigoProtocolo);
console.log(
  "   Valor no estado principal:",
  fixedState["1"].content.codigoProtocolo,
);

console.log("\n3️⃣ Usuário muda para Seção 2 (SEM SALVAR)");
// Ao mudar de seção, o conteúdo local é descartado
delete localContent[1];
currentSection = 2;
localContent[2] = JSON.parse(JSON.stringify(fixedState["2"].content));
console.log("   Agora está na Seção 2");
console.log("   Conteúdo local da Seção 1 foi descartado");

console.log("\n4️⃣ Usuário volta para Seção 1");
currentSection = 1;
// Reinicializa com o conteúdo original
localContent[1] = JSON.parse(JSON.stringify(fixedState["1"].content));
console.log("   Valor mostrado:", localContent[1].codigoProtocolo);
console.log("   ✅ CORRETO: A edição foi descartada! Seções isoladas!");

console.log("\n" + "=".repeat(70));
console.log("💾 TESTE DE SALVAMENTO:");
console.log("=".repeat(70));

console.log('\n5️⃣ Usuário edita novamente para "CODIGO-SALVO"');
localContent[1].codigoProtocolo = "CODIGO-SALVO";

console.log('\n6️⃣ Usuário clica em "Aplicar"');
// Ao aplicar, o conteúdo local é copiado para o estado principal
fixedState["1"].content = JSON.parse(JSON.stringify(localContent[1]));
console.log("   Conteúdo salvo no estado principal");

console.log("\n7️⃣ Usuário muda de seção e volta");
delete localContent[1];
currentSection = 2;
currentSection = 1;
localContent[1] = JSON.parse(JSON.stringify(fixedState["1"].content));
console.log("   Valor mostrado:", localContent[1].codigoProtocolo);
console.log("   ✅ CORRETO: Edição foi salva e persiste!");

console.log("\n" + "=".repeat(70));
console.log("📊 RESUMO DA CORREÇÃO:");
console.log("=".repeat(70));
console.log("1. Cada seção mantém um estado LOCAL isolado");
console.log('2. Edições ficam apenas no estado local até clicar "Aplicar"');
console.log("3. Ao trocar de seção sem salvar, o estado local é descartado");
console.log(
  '4. Ao clicar "Aplicar", o estado local é copiado para o principal',
);
console.log("5. Isso previne o vazamento de conteúdo entre seções");
console.log("=".repeat(70));

console.log("\n📁 ARQUIVOS MODIFICADOS:");
console.log("- src/components/protocol/editor/text-editor-pane.tsx");
console.log("- src/components/protocol/editor/section-editor.tsx");
console.log("=".repeat(70) + "\n");
