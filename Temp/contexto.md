## Contexto Consolidado (v2) – Projeto “Protocolos Algoritmizáveis” (Prevent Senior / DCT)

### 1. Escopo & Objetivo

| Item                   | Descrição                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Departamento-owner** | DCT – Desenvolvimento Clínico Tecnológico                                                                                       |
| **Plataforma**         | **Daktus / Medflow** – suporte à decisão médica                                                                                 |
| **Fase piloto**        | **Pronto-Atendimento (PA)** → depois ambulatório & hospital                                                                     |
| **Metas**              | Segurança, redução de variabilidade, rastreio de adesão & desfecho, otimização de fluxo e estoque, classificação de prioridades |

---

### 2. Fluxo atual no PA (gatilho do protocolo)

1. **Chegada → Tótem**
2. **Triagem de Enfermagem (≤ 5 min)** – Manchester
3. **Fila Médica (≤ 45 min, 90 % dos casos)**
4. **Disparo**: ao salvar **CID** ou pedir **TUSS** no prontuário
5. Protocolo quando disparado por CID roda **antes** de exame físico/notas adicionais, quando disparado por TUSS, após exame físico. Foco inicial em protocolos disparados por CID, disparos por TUSS são exceção (basicamente ressonâncias no momento)

> *Somente médicos* disparam nesta fase; triagem poderá disparar em releases futuros.

---

### 3. Regras para construir o protocolo

| Tema                          | Diretriz                                                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Breakpoints**               | 1 (preferencial) – máx. 2 → pausa real (aguardo exame ou 2ª dose)                                                                                                                 |
| **Tipos de pergunta**         | radio, checkbox, numérico, data, texto livre (nota)                                                                                                                               |
| **Lógica Daktus**             | **Aceita expressões complexas** como **(A E B) OU C**• Operadores **E / OU**; parênteses definem precedência.• Também suporta variáveis *calc* (ex.: contagem de checkboxes ≥ N). |
| **Tela sem scroll**           | \~8 widgets por passo em monitor 1080p; rótulos curtos                                                                                                                            |
| **Comorbidades-core**         | DM · ICC · DRC · uso de anticoagulante – perguntar quase sempre                                                                                                                   |
| **Via de medicação**          | Priorizar VO → SC → IM → EV (idoso = acesso venoso difícil)                                                                                                                       |
| **Hidratação EV**             | Só se desidratação comprovada; diluição padrão                                                                                                                                    |
| **Padronização farmacêutica** | Reduzir SKUs (estoque enxuto; Pareto 80/20)                                                                                                                                       |
| **Encaminhamentos**           | Distinguir **intra-permanência** × **ambulatorial**• Prioridade **Alta / Média / Baixa** com critério objetivo• Modalidades especialistas: presencial, Hospital Virtual, telefone |
| **Alternativas à internação** | ① Home-care / transição domiciliar quando seguro② Observação **até 24 h no próprio PA** para monitorização curta                                                                  |
| **Revisão de protocolo**      | Anual ou “on demand” por evidência/falha                                                                                                                                          |
| **Governança**                | Especialista → Infecto / Farmácia / RX / Chefia PA → **Você (DCT)** → Qualidade final → Daktus (implementação) → homologação espelho                                              |

---

### 4. Indicadores-chave (KPIs)

| KPI                                           | Fórmula (Daktus)                        |
| --------------------------------------------- | --------------------------------------- |
| % de **atendimentos com protocolo disparado** | Execuções / total PA                    |
| % de **protocolos concluídos**                | UD\_Ended / UD\_Started                 |
| **Adesão por médico**                         | Concluídos\_Médico / Disparados\_Médico |
| **Adesão por protocolo**                      | Concluídos\_Prot / Disparados\_Prot     |

---

### 5. Design de Conteúdo Clínico

*Base: Template Qualidade (13 seções) + Guia Daktus*

1. **Triagem** continua no documento Qualidade mesmo sem gatilho técnico.
2. **Algoritmo** em pseudo-código com tags `[[Q]]`, `[[CALC]]`, `[[COND]]`.
3. **Tela de Conduta Final**: tabela de **Exames / Medicações / Encaminhamentos / Mensagens** com condicionais.
4. **Populações especiais** (DM, ICC, DRC, anticoag.): alertas + ajustes de dose.
5. **Encaminhamento ambulatorial**: nunca citar prazos absolutos; usar prioridade ALTA/MÉDIA/BAIXA via critério.
6. **Referências**: diretrizes ≤ 5 anos, formato ABNT + cit. inline.

---

### 6. Tecnologia & Limitações

| Recurso                   | Status                                                       |
| ------------------------- | ------------------------------------------------------------ |
| **Lógica booleana**       | Suporta **E/OU** + parênteses de precedência                 |
| **Variáveis calculadas**  | Sim (contagem, soma ponderada)                               |
| **Widgets disponíveis**   | radio, checkbox, num, texto, slider, calc                    |
| **Biblioteca de escalas** | Nenhuma nativa → incluí-las no protocolo (Wells, HEART etc.) |

---

### 7. Estratégia de Desenvolvimento

1. **Deep Research 2.0** gera dossiê Markdown completo (Qualidade + Daktus).
2. Especialistas revisam itens clínicos, breakpoints e prioridades.
3. Blueprint importado pela equipe Daktus → construção da árvore.
4. DCT e Qualidade homologam versão espelho.
5. Go-Live no PA; dashboards com KPIs rodando.

---

### 8. Políticas clínicas específicas

- **Internação evitável**:\
  • Preferir **concessão de serviços domiciliares pontuais/transição** domiciliar OU **observação ≤ 24 h no PA** se seguro.
- **Anti-IM em anticoagulados**: perguntar sempre e bloquear conduta IM automático.
- **Prioridade de estoque**: reduzir fármacos redundantes (ex.: 2 AINEs padronizados em vez de 10).
- **Tempo de permanência**: evitar hidratação EV desnecessária, ciclos repetidos de medicação e múltiplos exames sem impacto decisório.

---
