🔍  Deep Research Request  🔍

Você é um(a) especialista em revisão de literatura clínica de alta qualidade.  
Seu objetivo é entregar um **dossiê Markdown** que:

1. Preencha diretamente os 13 itens do *Template de Qualidade* (PDF em anexo)  
2. Seja 100 % algoritmizável na plataforma Daktus, sem retrabalho

────────────────────────────────────────────────────────
🗂  CONTEXTO FIXO – NÃO ALTERAR
• Cenário: Pronto‑Atendimento de operadora focada em idosos (≥ 65 a predominante)  
• Disparo do protocolo: após o médico gravar **CID** < CID_PRINCIPAL > ou **TUSS** < TUSS_PRINCIPAL > (triagem de enfermagem não dispara)  
• Breakpoints: **máx. 2**, sempre ligados à espera de exame ou 2.ª rodada terapêutica  
• Comorbidades que devem gerar ALERTOGRAMAS automáticos:  
  – Diabetes mellitus – Insuficiência Cardíaca (ICC) – Doença Renal Crônica (DRC) – Uso de anticoagulante  
• Encaminhamentos devem distinguir:  
  ① **Avaliação especialista durante permanência** (presencial / HV / tel) ② **Encaminhamento ambulatorial** *(alta | média | baixa)* – ⚠ NUNCA indicar prazo em dias
• Ferramenta não aceita lógica booleana complexa; usar perguntas binárias/categóricas
• Referências: guidelines ≤ 5 anos (Brasil > EUA > Europa/UK) em **ABNT**, citadas inline [¹]
────────────────────────────────────────────────────────

📌  SAÍDA EM 15 SEÇÕES NUMERADAS (copie os títulos abaixo)

## 0. Ficha Técnica (versão 1.0)
Elaboração: __________________ CRM ___
Revisão: ______________________ CRM ___
Aprovação: _____________________ CRM ___


## 1. Definição e Visão Geral
## 2. Orientações para Triagem (Manchester)  
*Perguntas radio/checkbox com limiares vitais ‑ ex.:*  
`Q2.1 (checkbox)` PAS < 90 mmHg ‑‑→ Bandeira Vermelha  

## 3. Critérios Diagnósticos + Diferenciais  
## 4. CIDs incluídos (listar em tabela)  
## 5. Exames de Confirmação Diagnóstica  
## 6. Conduta Terapêutica Medicamentosa  
## 7. Conduta Terapêutica Não Medic.  
## 8. Conduta Terapêutica Invasiva / Procedimental  
## 9. Protocolo de Internação (critérios objetivos)  
## 10. Critérios de Exceção (quando NÃO aplicar)  
## 11. Quando o protocolo não se aplica (conduta)  
## 12. **Fluxograma & Algoritmo Diagnóstico‑Terapêutico**
*Pseudo‑código com tags* `[[Q1]]`, `[[COND07]]` (indicar tipo de campo)  
> Ex.: `[[Q4]] Escore de Wells ≥ 2? (radio)`  
>  ‑ Se SIM → `[[COND10]] Solicitar USG Doppler` (Breakpoint 1)

## 13. **Tela de Conduta Final**  
Listar **Exames, Medicações, Encaminhamentos, Mensagens** no formato:  
Medicamento | Dose | Via | Diluição | Condicional Enoxaparina | 1 mg/kg SC 12/12h | SC | — | [ ] TVP confirmada em [[Q8]]

## 14. Gestão de Encaminhamentos  
Tabela `| Critério Objetivo | Especialidade | Tipo (intra/amb) | Prioridade |`

## 15. **KPIs Rastreados no Daktus**  
| Indicador | Numerador / Denominador | Origem dado (campo ID) | | % protocolos concluídos | execuções UD_Ended / UD_Started | daktus_execution | | % adesão por médico | ... | | % atendimentos com protocolo disparado | ... | | % adesão por protocolo | ... |

## 16. Segurança – Populações Especiais  
Subseções **DM**, **ICC**, **DRC**, **Anticoagulados** com ajustes de dose/alertas.

## 17. Referências (ABNT + DOI/URL)  
────────────────────────────────────────────────────────

⚙️  FORMATAÇÃO
• Cada pergunta marque tipo no final: `(radio)`, `(checkbox)`, `(num)`, `(calc)`  
• Use **placeholders paramétricos**: `< CID_PRINCIPAL >`, `< TUSS_USG_DOPPLER >`  
• Critérios sempre NUMÉRICOS (“FC > 120”, “Wells ≥ 2”).  
• Quebra de linha dupla entre seções; tabelas Markdown puras.  
• Não incluir cards, cores ou elementos visuais além de texto estruturado.

────────────────────────────────────────────────────────
➤  Tema: **<TÓPICO>**
