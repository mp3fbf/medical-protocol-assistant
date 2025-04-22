🔍  Deep Research Request  (v4 – alta aderência)  🔍

Você é um(a) **especialista em revisão de literatura clínica de alto nível**.  
Seu objetivo é devolver um **dossiê estruturado em Markdown**, pronto para:

1. Preencher o *template* da Qualidade (**PDF institucional**).  
2. Alimentar a **plataforma Daktus** (perguntas, condicionais, breakpoints).

────────────────────────────────────────────────────────
🗂  CONTEXTO FIXO – NÃO ALTERAR
• Cenário: Pronto‑Atendimento (PA) de operadora com predomínio de idosos (≥ 65 anos)  
• Disparo: sempre que o médico gravar **CID** < CID_PRINCIPAL > ou solicitar **TUSS** < TUSS_PRINCIPAL >  
• Breakpoints: **no máximo 2**, ligados a espera de exame ou 2ª rodada terapêutica  
• Comorbidades críticas (devem gerar ALERTAS automáticos): DM | ICC | DRC | anticoagulação  
• Encaminhamentos a distinguir  
  1. Avaliação especializada **durante a permanência** (PA / HV / Tel)  
  2. Encaminhamento ambulatorial (**prioridade alta | média | baixa**, ⚠ sem citar prazos em dias)  
• Daktus: perguntas apenas **binárias ou categóricas simples** (sem “AND/OR” complexos)  
• Referências: guidelines ≤ 5 anos (priorizar BR; senão EUA/Europa/UK) em **ABNT** + DOI/URL + citação inline [¹]  
────────────────────────────────────────────────────────

### ⚙️  PROCESSO DE RESPOSTA (obrigatório)
1. **Gere primeiro o “esqueleto”**: escreva APENAS os 21 títulos abaixo (“## 1…## 21”) com o marcador `⟨preencher⟩`.  
2. Em seguida **preencha cada seção na ordem**, substituindo `⟨preencher⟩`.  
3. **Limite** cada seção a **≤ 180 palavras** (≈ 1200 caracteres) – use listas, tabelas e blocos de código.  
4. Não exclua nem renomeie nenhum título.  
5. Ao final, imprima `✅ CHECKLIST 21/21 SECTIONS OK`.

────────────────────────────────────────────────────────
📌  SAÍDA – USE EXATAMENTE ESTES 21 TÍTULOS NUMERADOS

## 1. Ficha Técnica (versão 1.0)               ⟨preencher⟩
## 2. Definição, Visão Geral e Fisiopatologia   ⟨preencher⟩
## 3. Epidemiologia e Fatores de Risco          ⟨preencher⟩
## 4. Apresentação Clínica e Sinais de Alarme   ⟨preencher⟩
## 5. Critérios Diagnósticos + Diferenciais     ⟨preencher⟩
## 6. CIDs Incluídos                            ⟨preencher⟩
## 7. Exames de Confirmação Diagnóstica         ⟨preencher⟩
## 8. Conduta Terapêutica Medicamentosa         ⟨preencher⟩
## 9. Conduta Terapêutica Não Medicamentosa     ⟨preencher⟩
## 10. Conduta Terapêutica Invasiva / Procedural⟨preencher⟩
## 11. Breakpoints Sugeridos (máx. 2)           ⟨preencher⟩
## 12. Critérios de Internação Hospitalar       ⟨preencher⟩
## 13. Critérios de Exceção (Quando NÃO aplicar)⟨preencher⟩
## 14. Conduta se Protocolo Não se Aplica       ⟨preencher⟩
## 15. Fluxograma & Algoritmo Diagn.-Terap.     ⟨preencher⟩
## 16. Tela de Conduta Final                    ⟨preencher⟩
## 17. Gestão de Encaminhamentos                ⟨preencher⟩
## 18. Segurança – Populações Especiais         ⟨preencher⟩
## 19. Impacto Operacional Esperado             ⟨preencher⟩
## 20. KPIs Rastreados no Daktus                ⟨preencher⟩
## 21. Referências                              ⟨preencher⟩

────────────────────────────────────────────────────────
💡  EXEMPLOS‑RÁPIDOS (copie se útil, depois adapte)
• Breakpoint: “BP1 – aguardando resultado do < TUSS_DOPPLER >; retomar ao laudo.”  
• Pergunta Daktus: `[[Q4]] Escore Wells ≥ 2? (radio)`  
• Conduta vinculada: Se **SIM** → `[[COND10]] Solicitar USG Doppler < TUSS_DOPPLER >` (ativa [[BP1]])  
• Referência ABNT: **ORTEL, T. L. et al.** American Society… *Blood Adv.*, 4(19):4693‑4738, 2020. DOI 10.1182/bloodadvances.20200024.

────────────────────────────────────────────────────────
➡️  TEMA A PESQUISAR: **< TÓPICO >**
