// Script para criar um protocolo de teste diretamente via API
const fetch = require("node-fetch");

async function createTestProtocol() {
  console.log("🔧 Criando protocolo de teste...\n");

  try {
    // Primeiro fazer login para obter cookies
    console.log("1️⃣ Fazendo login...");
    const loginResponse = await fetch("http://localhost:3000/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "dev-mock@example.com",
        password: "password",
      }),
    });

    console.log("Login response:", loginResponse.status);

    // Criar protocolo via tRPC
    console.log("\n2️⃣ Criando protocolo...");
    const protocolResponse = await fetch(
      "http://localhost:3000/api/trpc/protocol.create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          json: {
            title: "Protocolo de Teste - Isolamento de Seções",
            specialty: "Emergência",
            complexity: "alta",
            estimatedDuration: 30,
          },
        }),
      },
    );

    const result = await protocolResponse.json();
    console.log("Protocolo criado:", result);

    if (result.result?.data?.json) {
      console.log("\n✅ Protocolo criado com sucesso!");
      console.log("ID:", result.result.data.json.id);
      console.log(
        "URL:",
        `http://localhost:3000/protocols/${result.result.data.json.id}`,
      );
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

createTestProtocol();
