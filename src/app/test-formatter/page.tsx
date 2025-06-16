"use client";

import { parseMedicalProtocolContent } from "@/lib/utils/medical-content-parser";
import { cleanHtmlFromText } from "@/lib/utils/protocol-text-formatter";
import { useState } from "react";

const sampleContent = `3.1 Definições e Terminologia
Trombose Venosa Profunda (TVP) = formação de trombo rico em fibrina e eritrócitos no interior do sistema venoso profundo, com obstrução parcial ou total do fluxo. Sinônimos: trombose de veia profunda, deep vein thrombosis (DVT).
Diferenciação essencial: Tromboembolismo Venoso (TEV) = espectro que engloba TVP e Embolia Pulmonar (EP). Tromboflebite superficial é quadro distinto, mas compartilha fatores de risco.
Critérios diagnósticos contemporâneos (Guideline ISTH 2021): presença de (a) achados de compressibilidade ausente ou fluxo alterado em ultrassom Doppler ou (b) falha de enchimento em venografia por TC/RM ≥ 2 mm, em veia profunda tibial posterior ou proximal.
3.2 Classificação Clínica (adotar na Seção 6)
1. Topográfica:
a) Membros inferiores – distal (infrapoplítea) vs. proximal (poplítea, femoral, ilíaca).
b) Membros superiores – associada a cateter (PICCs, port-a-cath) vs. sem cateter.
c) Territórios especiais – cerebral (seio venoso), esplâncnico, renal.
2. Etiológica (provocada vs. não provocada):
• Provocada transitória maior (ex.: cirurgia de grande porte, trauma ≥ 3 pontos ISS) – risco relativo (RR) 21,2.
• Provocada transitória menor (VO, viagem aérea >8h) – RR 2,8.
• Provocada persistente (câncer ativo) – HR 6,5.
• Não provocada (idiopática) – ausência de fatores desencadeantes nos últimos 3 meses.`;

export default function TestFormatterPage() {
  const [mode, setMode] = useState<"raw" | "cleaned" | "formatted">("raw");

  const cleanedContent = cleanHtmlFromText(sampleContent);
  const formattedContent = parseMedicalProtocolContent(cleanedContent);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">
          Test Medical Content Formatter
        </h1>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode("raw")}
            className={`rounded px-4 py-2 ${mode === "raw" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Raw Content
          </button>
          <button
            onClick={() => setMode("cleaned")}
            className={`rounded px-4 py-2 ${mode === "cleaned" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Cleaned Content
          </button>
          <button
            onClick={() => setMode("formatted")}
            className={`rounded px-4 py-2 ${mode === "formatted" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Formatted Content
          </button>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          {mode === "raw" && (
            <pre className="whitespace-pre-wrap rounded bg-gray-100 p-4 font-mono text-sm">
              {sampleContent}
            </pre>
          )}

          {mode === "cleaned" && (
            <pre className="whitespace-pre-wrap rounded bg-gray-100 p-4 font-mono text-sm">
              {cleanedContent}
            </pre>
          )}

          {mode === "formatted" && (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          )}
        </div>

        <div className="mt-8 rounded bg-yellow-100 p-4">
          <h3 className="font-bold">Debug Info:</h3>
          <p>Raw length: {sampleContent.length}</p>
          <p>Cleaned length: {cleanedContent.length}</p>
          <p>Formatted HTML length: {formattedContent.length}</p>
          <p>
            Has HTML tags in formatted:{" "}
            {formattedContent.includes("<h3") ? "YES" : "NO"}
          </p>
        </div>
      </div>
    </div>
  );
}
