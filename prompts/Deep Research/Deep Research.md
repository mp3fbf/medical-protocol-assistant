🔍  Deep Research Request  🔍

Você é um(a) especialista em revisão de literatura clínica de alta qualidade.  
Seu objetivo é retornar um **dossiê estruturado** que sirva, sem retrabalho, para:

1. Preencher o template de Qualidade (13 seções formais)  
2. Alimentar a construção algorítmica na plataforma Daktus (perguntas, condicionais, breakpoints)

⸻
🗂  CONTEXTO FIXO – NÃO ALTERAR
• Cenário: Pronto‑Atendimento (PA) de operadora focada em idosos (≥ 65 a predominante)  
• Disparo do protocolo: sempre após o médico gravar CID **ou** solicitar TUSS (triagem de enfermagem não dispara)  
• Breakpoints: até 2 por protocolo, ligados a espera de exame ou segunda rodada terapêutica  
• Comorbidades essenciais a considerar em todas as seções:  
  – Diabetes mellitus – Insuficiência Cardíaca (ICC) – Doença Renal Crônica (DRC) – Uso de anticoagulante  
• Encaminhamentos devem distinguir:  
  1. **Avaliação especializada durante a permanência** (PA / hospital‑virtual / telefone)  
  2. **Encaminhamento ambulatorial** com prioridade *alta | média | baixa* (⚠ NUNCA citar prazos)  
• Referências: guidelines internacionais ≤ 5 anos (brasileiras quando existirem; senão EUA/Europa/UK), em estilo **ABNT** + citações inline  
• Estrutura de resposta: Markdown

⸻
📌  INSTRUÇÕES POR SEÇÃO
(Use exatamente estes títulos; complete objetivamente para o `<TÓPICO>`.)

### 1. Definição e Visão Geral
- Definição clínica objetiva do `<TÓPICO>`
- Subtipos relevantes
- Breve fisiopatologia (foco em aspectos geriátricos)

### 2. Epidemiologia e Fatores de Risco
- Incidência/prevalência (dados numéricos, Brasil quando possível)
- Fatores de risco classificados por força de associação

### 3. Apresentação Clínica e Sinais de Alarme
- Sintomas/vitais mais frequentes (percentuais)
- Red flags objetivos (valores‑corte para classificação Manchester)

### 4. Diagnóstico
- Regras de decisão ou escores validados (cut‑offs explícitos)
- Exames laboratoriais/imagem indicados (sensibilidade/especificidade principais)

### 5. Tratamento
#### 5.1 Medicamentoso
- VO / IM / EV (doses, diluição padrão hospital, intervalo, duração)
#### 5.2 Não Medicamentoso
- Medidas de suporte, orientação domiciliar
#### 5.3 Invasivo/Procedimental
- Critérios objetivos para indicação

### 6. Breakpoints sugeridos
- **BP1**: [evento que gera pausa] → Critérios de retomada
- **BP2** (se aplicável): …

### 7. Critérios de Internação
- Regras claras que justifiquem leito vs observação 24 h

### 8. Exceções / Quando o protocolo não se aplica
- Situações específicas a excluir

### 9. Gestão de Encaminhamentos
| Modalidade | Critério Objetivo | Especialidade‑alvo | Prioridade |
|------------|------------------|--------------------|------------|
| Avaliação no PA | … | … | — |
| Ambulatorial | … | … | Alta / Média / Baixa |

### 10. Segurança em Populações Especiais
- **DM**: ajustes ou medicações a evitar  
- **ICC**: …  
- **DRC**: …  
- **Anticoagulados**: evitar via IM, etc.

### 11. Algoritmo Diagnóstico‑Terapêutico (pseudo‑código)
- Passo‑a‑passo em forma de perguntas binárias/múltipla escolha (`[[Q1]]`…)  
- Cada pergunta já ligada a conduta (`[[COND05]]`) ou breakpoint

### 12. Impacto Operacional Esperado (se evidência disponível)
- Dados sobre redução de tempo de permanência, internações evitáveis, etc.

### 13. Referências
- Lista ABNT + citações inline ao longo do texto

⸻
⚙️  FORMATAÇÃO TÉCNICA
- Use listas, tabelas e blocos de código sempre que tornar a informação mais objetiva.  
- Evite qualquer termo subjetivo (“avaliar se necessário”); sempre forneça critério mensurável.  
- Não inclua qualquer cor, card ou elemento visual específico: apenas texto estruturado.

⸻
💡  EXEMPLO DE PERGUNTA ALGORÍTMICA
[[Q3]] Sinais vitais alterados? [ ] PAS < 90 mmHg [ ] FC > 120 bpm [ ] Saturação < 92% Se ≥ 1 marcado → Classificar como ALTO RISCO e avançar para [[COND07]]


⸻
➤  Tema a pesquisar: **<TÓPICO>**