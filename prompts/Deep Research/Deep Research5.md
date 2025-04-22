🔍 Deep Research Request  (v5 – COMPLETUDE) 🔍

👉 OBJETIVO  
Elaborar um **dossiê em Markdown** que:

1. Preencha integralmente o template de Qualidade.  
2. Alimente, sem retrabalho, a lógica da plataforma Daktus.

────────────────────────────────────────────────────────
🗂 CONTEXTO FIXO – NÃO ALTERAR
• Cenário: Pronto‑Atendimento (PA) com predominância de pacientes ≥ 65 anos.  
• Gatilho: CID < CID_PRINCIPAL> OU TUSS < TUSS_PRINCIPAL>.  
• Breakpoints: máx. 2 (aguardo de exame ou 2ª terapia).  
• Comorbidades críticas (geram ALERTA): DM | ICC | DRC | Anticoagulação.  
• Encaminhamentos devem diferenciar  
  1. Avaliação especializada DURANTE a permanência (PA / HV / Tel).  
  2. Encaminhamento ambulatorial com prioridade alta | média | baixa (⚠ nunca citar prazos).  
• Perguntas Daktus: apenas binárias ou categóricas simples.  
• Referências: guidelines ≤ 5 anos (ou mais antigas se seminal), em **ABNT** + DOI/URL + citação inline [¹].  
────────────────────────────────────────────────────────

📌 SAÍDA → **21 SEÇÕES NUMERADAS EXATAMENTE COMO ABAIXO**  
Preencha cada uma com riqueza de detalhes (estatísticas, doses, fluxogramas, tabelas).  
👉 **Sem limite de palavras**; mire ≥ 70 linhas por seção.  
👉 Se o texto se aproximar do limite de tokens, **continue automaticamente** em PART 2, PART 3… até concluir as 21 seções.

## 1. Ficha Técnica (versão 1.0)
## 2. Definição, Visão Geral e Fisiopatologia
## 3. Epidemiologia e Fatores de Risco
## 4. Apresentação Clínica e Sinais de Alarme
## 5. Critérios Diagnósticos + Diferenciais
## 6. CIDs Incluídos
## 7. Exames de Confirmação Diagnóstica
## 8. Conduta Terapêutica Medicamentosa
## 9. Conduta Terapêutica Não Medicamentosa
## 10. Conduta Invasiva / Procedimental
## 11. Breakpoints Sugeridos (máx. 2)
## 12. Critérios de Internação Hospitalar
## 13. Critérios de Exceção (Quando NÃO aplicar)
## 14. Conduta se Protocolo Não se Aplica
## 15. Fluxograma & Algoritmo Diagn.-Terap.
## 16. Tela de Conduta Final
## 17. Gestão de Encaminhamentos
## 18. Segurança – Populações Especiais
## 19. Impacto Operacional Esperado
## 20. KPIs Rastreados no Daktus
## 21. Referências

⚙️ DIRETRIZES DE CONTEÚDO (resumo)  
• Usar listas/tabelas onde densidade de dados for útil (doses, class‑evidência, sens./esp.).  
• Critérios SEMPRE numéricos (PAS < 90 mmHg, Wells ≥ 2…).  
• Algoritmo em pseudo‑código com tags [[Qx]], [[CONDy]], [[BPz]].  
• Breakpoints descritos + critérios de retomada.  
• No final de cada mensagem parcial, escrever:  
  --- CONTINUE AUTOM. ---  
  se ainda faltar seção.

➡️ TEMA A PESQUISAR: **<TÓPICO>** 