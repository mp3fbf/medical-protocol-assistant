/**
 * Example of using clinical flowchart generation
 */

import type { ClinicalFlowchart } from "@/types/flowchart-clinical";
import type { ProtocolFullContent } from "@/types/protocol";

// Example protocol content
const exampleProtocolContent: ProtocolFullContent = {
  "1": {
    sectionNumber: 1,
    title: "Ficha Técnica",
    content: "Protocolo de Dor Torácica Aguda",
  },
  "3": {
    sectionNumber: 3,
    title: "Quadro Clínico",
    content:
      "Dor torácica de início súbito, podendo irradiar para membros superiores, mandíbula ou dorso. Sintomas associados incluem dispneia, náuseas, sudorese fria.",
  },
  "5": {
    sectionNumber: 5,
    title: "Avaliação Inicial",
    content:
      "Avaliar sinais vitais, realizar ECG em 10 minutos, classificar risco baseado em critérios de gravidade.",
  },
  "6": {
    sectionNumber: 6,
    title: "Diagnóstico",
    content:
      "ECG 12 derivações, troponina, radiografia de tórax, ecocardiograma se disponível.",
  },
  "7": {
    sectionNumber: 7,
    title: "Tratamento",
    content:
      "AAS 300mg VO, morfina 2-4mg IV se dor intensa, nitroglicerina SL se PA > 90mmHg, oxigênio se SatO2 < 94%.",
  },
};

// Example of a generated clinical flowchart
export const exampleClinicalFlowchart: ClinicalFlowchart = {
  nodes: [
    {
      id: "node-1",
      type: "custom",
      position: { x: 0, y: 0 },
      data: {
        label: "Avaliação Inicial",
        condicao: "SEMPRE",
        descricao:
          "Triagem e coleta de dados iniciais do paciente com dor torácica",
        condicional: "visivel",
        questions: [
          {
            id: "Q1",
            uid: "dor_toracia_presente",
            titulo: "Paciente apresenta dor torácica?",
            descricao: "Avaliar presença de dor torácica aguda",
            condicional: "visivel",
            expressao: "",
            select: "F",
            options: [
              {
                id: "opt1",
                label: "Sim",
                preselected: false,
                exclusive: false,
              },
              {
                id: "opt2",
                label: "Não",
                preselected: false,
                exclusive: false,
              },
            ],
          },
          {
            id: "Q2",
            uid: "tempo_inicio",
            titulo: "Há quanto tempo iniciou a dor?",
            descricao: "Tempo de início dos sintomas",
            condicional: "visivel",
            expressao: "Q1 == 'opt1'",
            select: "F",
            options: [
              {
                id: "opt1",
                label: "< 30 minutos",
                preselected: false,
                exclusive: false,
              },
              {
                id: "opt2",
                label: "30min - 6h",
                preselected: false,
                exclusive: false,
              },
              {
                id: "opt3",
                label: "> 6 horas",
                preselected: false,
                exclusive: false,
              },
            ],
          },
          {
            id: "Q3",
            uid: "sintomas_associados",
            titulo: "Sintomas associados",
            descricao: "Marque todos os sintomas presentes",
            condicional: "visivel",
            expressao: "Q1 == 'opt1'",
            select: "E",
            options: [
              {
                id: "opt1",
                label: "Dispneia",
                preselected: false,
                exclusive: false,
              },
              {
                id: "opt2",
                label: "Náuseas",
                preselected: false,
                exclusive: false,
              },
              {
                id: "opt3",
                label: "Sudorese",
                preselected: false,
                exclusive: false,
              },
              {
                id: "opt4",
                label: "Síncope",
                preselected: false,
                exclusive: false,
              },
            ],
          },
        ],
      },
    },
    {
      id: "node-2",
      type: "summary",
      position: { x: 0, y: 200 },
      data: {
        label: "Classificação de Risco",
        condicao: "Q1 == 'opt1'",
        descricao:
          "Paciente classificado como ALTA PRIORIDADE - Possível Síndrome Coronariana Aguda",
        condicional: "visivel",
      },
    },
    {
      id: "node-3",
      type: "conduct",
      position: { x: 0, y: 400 },
      data: {
        label: "Conduta Inicial",
        condicao: "Q1 == 'opt1'",
        descricao: "Protocolo de atendimento para dor torácica aguda",
        condicional: "visivel",
        conduta: "conclusao",
        condutaDataNode: {
          orientacao: [
            {
              id: "O1",
              nome: "Monitorização",
              descricao: "Monitorização contínua",
              condicional: "visivel",
              condicao: "SEMPRE",
              conteudo:
                "<p>• Instalar monitorização cardíaca contínua<br/>• Oximetria de pulso<br/>• Verificar PA a cada 5 minutos<br/>• Manter acesso venoso calibroso</p>",
            },
          ],
          exame: [
            {
              id: "E1",
              nome: "ECG 12 derivações",
              descricao: "Eletrocardiograma completo",
              condicional: "visivel",
              condicao: "SEMPRE",
              condicionalExame: "hospitalar",
              codigo: "40.01.01.07",
              cid: "I20",
              indicacao: "Avaliar isquemia miocárdica",
              alerta: "Realizar em até 10 minutos da chegada",
              material: "Aparelho de ECG",
            },
            {
              id: "E2",
              nome: "Troponina",
              descricao: "Marcador de necrose miocárdica",
              condicional: "visivel",
              condicao: "SEMPRE",
              condicionalExame: "hospitalar",
              codigo: "40.30.16.30",
              cid: "I21",
              indicacao: "Diagnóstico de infarto",
              alerta: "Repetir em 3-6h se inicial negativa",
              material: "Tubo com gel separador",
            },
          ],
          medicamento: [
            {
              id: "M1",
              nome: "Ácido Acetilsalicílico",
              descricao: "Antiagregante plaquetário",
              condicional: "visivel",
              condicao: "SEMPRE",
              condicionalMedicamento: "intra-hospitalar",
              quantidade: 1,
              codigo: "B01AC06",
              nomeMed: "AAS",
              posologia:
                "<p><strong>Dose:</strong> 300mg<br/><strong>Via:</strong> Oral<br/><strong>Frequência:</strong> Dose única<br/><strong>Observação:</strong> Mastigar o comprimido</p>",
              mensagemMedico: "Contraindicado se alergia ou sangramento ativo",
              via: "VO",
            },
            {
              id: "M2",
              nome: "Morfina",
              descricao: "Analgésico opioide",
              condicional: "visivel",
              condicao: "dor_intensa == true",
              condicionalMedicamento: "intra-hospitalar",
              quantidade: 1,
              codigo: "N02AA01",
              nomeMed: "Sulfato de Morfina",
              posologia:
                "<p><strong>Dose:</strong> 2-4mg<br/><strong>Via:</strong> Intravenosa<br/><strong>Frequência:</strong> Cada 5-15min se necessário<br/><strong>Dose máxima:</strong> 15mg</p>",
              mensagemMedico: "Monitorar frequência respiratória",
              via: "IV",
            },
          ],
          encaminhamento: [],
          mensagem: [
            {
              id: "MSG1",
              nome: "Alerta Médico",
              descricao: "Notificação importante",
              condicional: "visivel",
              condicao: "Q2 == 'opt1'",
              conteudo:
                "<p style='color: red; font-weight: bold;'>⚠️ ATENÇÃO: Paciente com dor torácica de início < 30 minutos. Considerar ativação do protocolo de cateterismo de emergência.</p>",
              observacao: "Comunicar cardiologista de plantão imediatamente",
            },
          ],
        },
      },
    },
  ],
  edges: [
    {
      id: "edge-1",
      source: "node-1",
      target: "node-2",
      data: {
        rule: "Q1 == 'opt1'",
      },
    },
    {
      id: "edge-2",
      source: "node-2",
      target: "node-3",
      data: {
        rule: "SEMPRE",
      },
    },
  ],
};

// Example function to generate clinical flowchart
export async function generateClinicalFlowchartExample() {
  // This would typically call the tRPC endpoint
  const response = await fetch("/api/trpc/flowchart.generateClinical", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      protocolId: "example-id",
      condition: "Dor Torácica Aguda",
      content: exampleProtocolContent,
      includeLayout: true,
    }),
  });

  const result = await response.json();
  return result.flowchart as ClinicalFlowchart;
}
