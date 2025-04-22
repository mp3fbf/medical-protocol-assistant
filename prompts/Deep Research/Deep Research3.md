🔍  Deep Research Request  🔍

Você é um(a) especialista em revisão de literatura clínica de alta qualidade.
Seu objetivo é retornar um **dossiê estruturado em Markdown** que sirva, sem retrabalho, para:

1.  Preencher o template de Qualidade (formato PDF/documento padrão)
2.  Alimentar a construção algorítmica na plataforma Daktus (perguntas, condicionais, breakpoints)

────────────────────────────────────────────────────────
🗂  CONTEXTO FIXO – NÃO ALTERAR
• Cenário: Pronto‑Atendimento (PA) de operadora focada em idosos (≥ 65 a predominante)
• Disparo do protocolo: sempre após o médico gravar **CID** `< CID_PRINCIPAL >` **ou** solicitar **TUSS** `< TUSS_PRINCIPAL >` (triagem de enfermagem não dispara)
• Breakpoints: **máximo 2** por protocolo, ligados a espera de exame ou segunda rodada terapêutica
• Comorbidades essenciais a considerar (devem gerar ALERTOGRAMAS automáticos):
  – Diabetes mellitus (DM) – Insuficiência Cardíaca (ICC) – Doença Renal Crônica (DRC) – Uso de anticoagulante
• Encaminhamentos devem distinguir:
  1.  **Avaliação especializada durante a permanência** (presencial no PA / hospital‑virtual / telefone)
  2.  **Encaminhamento ambulatorial** com prioridade *alta | média | baixa* (⚠ NUNCA citar prazos em dias)
• Ferramenta Daktus não aceita lógica booleana complexa; usar perguntas binárias/categóricas simples.
• Referências: guidelines internacionais ≤ 5 anos (priorizar brasileiras quando existirem; senão EUA/Europa/UK), em estilo **ABNT** + citações inline [¹] + DOI/URL.
────────────────────────────────────────────────────────

📌  SAÍDA EM 21 SEÇÕES NUMERADAS (Use exatamente estes títulos; complete objetivamente para o `<TÓPICO>`)

## 1. Ficha Técnica (versão 1.0)
*   Elaboração: __________________ CRM ___
*   Revisão: ______________________ CRM ___
*   Aprovação: _____________________ CRM ___

## 2. Definição, Visão Geral e Fisiopatologia
*   Definição clínica objetiva do `<TÓPICO>`
*   Subtipos relevantes (se houver)
*   Breve fisiopatologia (com foco em aspectos geriátricos)

## 3. Epidemiologia e Fatores de Risco
*   Incidência/prevalência (dados numéricos, Brasil quando possível)
*   Fatores de risco classificados por força de associação (ex: Forte, Moderado, Fraco)

## 4. Apresentação Clínica e Sinais de Alarme (Triagem)
*   Sintomas e Sinais Vitais mais frequentes (incluir percentuais, se disponíveis)
*   Critérios objetivos para classificação de risco (ex: Manchester) - *formato pergunta/resposta*:
    *   `Q_Triagem1 (checkbox)` PAS < 90 mmHg ‑‑→ Bandeira Vermelha
    *   `Q_Triagem2 (checkbox)` FC > 120 bpm ‑‑→ Bandeira Laranja
    *   `Q_Triagem3 (checkbox)` SatO₂ < 92% ‑‑→ Bandeira Laranja
    *   *(Listar outros relevantes para o `<TÓPICO>`)*

## 5. Critérios Diagnósticos + Diferenciais
*   Critérios diagnósticos validados (ex: Regras de decisão, Escores com cut-offs explícitos)
*   Principais diagnósticos diferenciais a considerar no PA

## 6. CIDs Incluídos
*   Listar em tabela os códigos CID-10 relacionados ao `<TÓPICO>` que devem disparar/ser cobertos pelo protocolo.
    | CID-10 | Descrição |
    |--------|-----------|
    | ...    | ...       |

## 7. Exames de Confirmação Diagnóstica
*   Exames laboratoriais e/ou de imagem indicados
*   Incluir dados de sensibilidade/especificidade dos principais exames, se disponíveis
*   Indicar TUSS associados (ex: `< TUSS_EXAME_X >`)

## 8. Conduta Terapêutica Medicamentosa
*   Listar medicações (VO / IM / EV)
*   Especificar: Dose, Via, Diluição padrão hospitalar (se EV), Intervalo, Duração do tratamento inicial no PA
*   Incluir `< PLACEHOLDER_MEDICAMENTO >` para doses/nomes específicos se necessário

## 9. Conduta Terapêutica Não Medicamentosa
*   Medidas de suporte (ex: O₂, monitorização, posição)
*   Orientações para alta/domicílio (se aplicável após estabilização no PA)

## 10. Conduta Terapêutica Invasiva / Procedimental
*   Listar procedimentos (ex: drenagem, cardioversão, etc.)
*   Critérios objetivos para indicação de cada procedimento

## 11. Breakpoints Sugeridos (Máx. 2)
*   **BP1**: [Evento clínico ou laboratorial que gera pausa no fluxo - ex: Aguardando resultado de `< TUSS_EXAME_X >`]
    *   Critérios de retomada do protocolo após BP1: [Resultados específicos ou tempo]
*   **BP2** (se aplicável): [Segundo evento que gera pausa - ex: Aguardando reavaliação após 2ª dose de `< PLACEHOLDER_MEDICAMENTO >`]
    *   Critérios de retomada do protocolo após BP2: [Melhora clínica ou laboratorial específica]

## 12. Critérios de Internação Hospitalar
*   Regras claras e objetivas que diferenciem necessidade de Leito de Internação vs. Observação < 24h no PA.

## 13. Critérios de Exceção (Quando NÃO aplicar o protocolo)
*   Listar situações clínicas ou comorbidades específicas onde este protocolo *não* deve ser iniciado/seguido.

## 14. Quando o protocolo não se aplica (Conduta Alternativa)
*   Para cada critério de exceção listado acima, indicar qual a conduta recomendada (ex: acionar especialista X, seguir protocolo Y).

## 15. Fluxograma & Algoritmo Diagnóstico‑Terapêutico
*   Desenvolver um pseudo-código passo-a-passo.
*   Usar perguntas binárias ou de múltipla escolha com tags `[[Qx]]`. Indicar tipo `(radio)`, `(checkbox)`, `(num)`, `(calc)`.
*   Conectar perguntas a condutas `[[CONDy]]` ou breakpoints `[[BPz]]`.
    *   *Exemplo:* `[[Q4]] Escore de Wells ≥ 2? (radio)`
        *   Se SIM → `[[COND10]] Solicitar USG Doppler < TUSS_USG_DOPPLER >` (Ativar `[[BP1]]`)
        *   Se NÃO → Avançar para `[[Q5]]`

## 16. Tela de Conduta Final (Resumo para Prescrição/Evolução)
*   Listar os possíveis outputs do protocolo em formato claro para o médico. Usar tabelas para medicações e exames.
    *   **Exames Solicitados:**
        | Exame | TUSS | Condicionalidade |
        |-------|------|-----------------|
        | Hemograma | `<TUSS_HEMOGRAMA>` | `[[COND02]]` ativada |
        | ...   | ...  | ...             |
    *   **Medicações Prescritas:**
        | Medicamento | Dose | Via | Diluição | Frequência | Condicionalidade |
        |-------------|------|-----|----------|------------|-----------------|
        | Enoxaparina | 1 mg/kg | SC | — | 12/12h | `[[COND12]]` e Peso > 40kg |
        | ...         | ...  | ... | ...      | ...        | ...             |
    *   **Encaminhamentos:** (Listar conforme outputs da seção 17)
    *   **Mensagens/Alertas:** (Listar conforme outputs das seções 18 e outras)

## 17. Gestão de Encaminhamentos
*   Tabela detalhando os critérios para cada tipo de encaminhamento:
    | Critério Objetivo para Encaminhamento | Especialidade Alvo | Tipo (Intra-PA/HV/Tel ou Ambulatorial) | Prioridade (Alta/Média/Baixa ou —) | Condicionalidade no Algoritmo |
    |---------------------------------------|--------------------|---------------------------------------|------------------------------------|-------------------------------|
    | Sinais de choque refratário           | Intensivista       | Intra-PA                              | —                                  | `[[COND15]]` ativada          |
    | Suspeita de Neoplasia incidental      | Oncologia          | Ambulatorial                          | Média                              | `[[COND21]]` ativada          |
    | ...                                   | ...                | ...                                   | ...                                | ...                           |

## 18. Segurança – Populações Especiais
*   Detalhar ajustes/alertas específicos para as comorbidades chave:
    *   **DM**: Ajustes de dose (ex: metformina em contraste), medicações a evitar, monitoramento glicêmico.
    *   **ICC**: Medicações a evitar (ex: AINEs), cuidado com volume, monitoramento específico.
    *   **DRC**: Ajustes de dose baseados em ClCr (usar placeholder `< ClCr_Paciente >`), contraste nefrotóxico, medicações a evitar.
    *   **Anticoagulados**: Evitar via IM, risco de sangramento com procedimentos, interações medicamentosas.

## 19. Impacto Operacional Esperado (se evidência disponível)
*   Citar dados da literatura (se existentes) sobre o impacto do uso de protocolos semelhantes para o `<TÓPICO>` em:
    *   Redução de tempo de permanência no PA
    *   Taxas de internação evitáveis
    *   Adesão a boas práticas / Redução de erros
    *   Outros desfechos relevantes

## 20. KPIs Rastreados no Daktus (Sugestões)
*   Sugerir indicadores para monitorar a performance e adesão ao protocolo na plataforma.
    | Indicador Chave                 | Numerador                                    | Denominador                                | Origem do Dado (Campo ID Daktus) |
    |---------------------------------|----------------------------------------------|--------------------------------------------|---------------------------------|
    | % Protocolos Concluídos         | Nº execuções com status `UD_Ended`           | Nº execuções com status `UD_Started`       | `daktus_execution_status`       |
    | % Adesão ao Protocolo           | Nº atendimentos (CID/TUSS) com P. disparado | Nº total atendimentos com CID/TUSS elegível | `daktus_trigger`, Registros EHR |
    | Tempo Médio de Execução         | Soma(tempo `UD_Ended` - `UD_Started`)        | Nº execuções com status `UD_Ended`         | `daktus_timestamps`             |
    | % Adesão a Exame Chave          | Nº P. com `[[COND_EXAME_X]]` e Exame pedido | Nº P. onde `[[COND_EXAME_X]]` foi ativada | `daktus_fields`, Registros EHR  |
    | % Uso de Terapia Recomendada    | Nº P. com `[[COND_TERAPIA_Y]]` e Tx usada  | Nº P. onde `[[COND_TERAPIA_Y]]` foi ativada| `daktus_fields`, Registros EHR  |
    | Taxa de Internação Pós-Protocolo | Nº P. com `[[COND_INTERNAR]]` internados   | Nº P. onde `[[COND_INTERNAR]]` foi ativada | `daktus_fields`, Registros EHR  |

## 21. Referências
*   Listar todas as fontes consultadas em formato **ABNT**.
*   Incluir DOI ou URL para cada referência.
*   Garantir que todas as citações inline `[¹], [²], ...` no texto correspondam a esta lista.

────────────────────────────────────────────────────────
⚙️  FORMATAÇÃO TÉCNICA OBRIGATÓRIA
*   Usar listas, tabelas Markdown puras, e blocos de código (` `) sempre que tornar a informação mais objetiva e clara.
*   Critérios devem ser sempre NUMÉRICOS e OBJETIVOS ("FC > 120", "Wells ≥ 2", "PAS < 90"). Evitar termos subjetivos ("avaliar se necessário", "considerar exame").
*   Usar **placeholders paramétricos** no formato `< NOME_PLACEHOLDER >` para valores que podem variar (CIDs, TUSS, nomes de medicações específicas, etc.).
*   Cada pergunta no algoritmo (Seção 15) deve indicar o tipo de campo Daktus no final: `(radio)`, `(checkbox)`, `(num)`, `(calc)`, `(date)`, `(text)`.
*   Manter quebra de linha dupla (um espaço em branco) entre seções principais (##).
*   Não incluir qualquer cor, card, ou elemento visual específico: apenas texto estruturado em Markdown.
────────────────────────────────────────────────────────

➤  Tema a pesquisar: **<TÓPICO>** 