🔍  Deep Research Request  (v7 – ULTRA COMPLETO)  🔍  

🎯 OBJETIVO  
Gerar um **dossiê clínico em Markdown** que:  
1. Preencha integralmente o *Template Qualidade* (13 seções formais).  
2. Alimente 100 % da lógica Daktus (perguntas, condicionais, breakpoints, KPIs).  
3. Alcance **≥ 1 600 linhas totais** (média ≥ 80 linhas/ seção).  

────────────────────────────────────────────────────────  
🗂 CONTEXTO FIXO – NÃO ALTERAR  
• Cenário: Pronto‑Atendimento (predomínio ≥ 65 anos).  
• Gatilho: CID < CID_PRINCIPAL> **OU** TUSS < TUSS_PRINCIPAL>.  
• Breakpoints: máx. 2 (aguardo de exame **ou** 2ª rodada terapêutica).  
• Comorbidades‑ALERTA: DM | ICC | DRC | anticoagulantes.  
• Referências: guidelines ≤ 5 anos (ou seminais); estilo **ABNT** + DOI/URL + citação inline [¹].  

────────────────────────────────────────────────────────  
📌 SAÍDA – **21 SEÇÕES NUMERADAS EXATAS**  
→ **Sem limite de tokens**. Cada seção **≥ 80 linhas**.  
→ Quando o limite de tokens da mensagem for atingido, **continue AUTOMATICAMENTE** na próxima mensagem, iniciando pelo cabeçalho:  
`--- CONTINUE AUTOM. (PART n) ---`  
Repita até concluir as 21 seções.

## 1. Ficha Técnica (versão 1.0)  
## 2. Definição, Visão Geral e Fisiopatologia  
## 3. Epidemiologia e Fatores de Risco  
## 4. Apresentação Clínica e Sinais de Alarme  
## 5. Critérios Diagnósticos + Diferenciais  
## 6. CIDs Incluídos  
## 7. Exames de Confirmação Diagnóstica (sens/esp + TUSS)  
## 8. Tratamento Medicamentoso (VO/IM/EV, doses, diluição, ajuste renal)  
## 9. Tratamento Não Medicamentoso  
## 10. Conduta Invasiva / Procedimental  
## 11. Breakpoints Sugeridos (máx. 2) – critérios de retomada  
## 12. Critérios de Internação Hospitalar x Observação < 24 h  
## 13. Critérios de Exceção (Quando NÃO aplicar)  
## 14. Conduta se Protocolo Não se Aplica (alternativas)  
## 15. Fluxograma & Algoritmo Diagn.–Terap. (pseudo‑código)  
## 16. Tela de Conduta Final (Exames | Medicações | Encaminhamentos | Mensagens)  
## 17. Gestão de Encaminhamentos  
| Modalidade | Critério Objetivo | Especialidade | Prioridade | Condicional |  
|------------|------------------|--------------|-----------|-------------|  
## 18. Segurança – Populações Especiais (DM, ICC, DRC, Anticoagulados)  
## 19. Impacto Operacional Esperado  
## 20. KPIs Rastreados no Daktus  
## 21. Referências  

⚙️ DIRETRIZES DE CONTEÚDO  
• **Perguntas** sempre em formato categórico: `(radio)`, `(checkbox)`, `(num)`, `(calc)`.  
• Usar **tags** `[[Qx]]`, `[[CONDy]]`, `[[BPz]]` em algoritmo e tela de conduta.  
• Critérios **objetivos & numéricos** (ex.: PAS < 90 mmHg; Wells ≥ 2).  
• Agrupar perguntas por bloco lógico (Triagem ▶︎ Anamnese ▶︎ Exame ▶︎ Exames ▶︎ Conduta).  
• *NUNCA* citar prazos (dias) em encaminhamentos ambulatoriais.  
• Quebra de linha dupla entre seções; tabelas Markdown puras; sem cor ou cards.  

➡️ **TEMA**: **Herpes Zoster**  