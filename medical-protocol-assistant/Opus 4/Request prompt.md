```request
# Medical Protocol Development Assistant
## Version
v0.4 – 26/5/25

## Project Description
Ferramenta web para criação assistida por IA de protocolos médicos padronizados, gerando documentação estruturada (Word/ABNT com 13 seções) e fluxogramas visuais complexos para pronto-atendimentos da rede Sancta Maggiore/Prevent Senior. IA gera protocolo completo com formato perfeito; ajustes clínicos feitos por humanos.

## Target Audience
- Primary: Criadores de protocolos (médicos coordenadores, setor de qualidade)
- Secondary: Validadores (chefes de especialidade) - via Jira existente

## Success Criteria
- Primary metric: Protocolos com 100% das seções completas e critérios objetivos definidos
- Secondary / qualitative: Tempo de criação <2 dias, consistência texto-fluxograma >95%

## Constraints
- [x] Budget ceiling: Sem restrições
- [x] Target devices / browsers: Desktop moderno, até 10 usuários simultâneos
- [x] Regulatory / compliance notes: Sem dados de pacientes
- [x] Non‑functional: PT-BR, imagens vetoriais, 20-30 protocolos/mês

## Desired Features
### AI Research & Analysis
- [x] Pesquisa via DeepResearch (fontes públicas)
    - [x] PubMed, SciELO, diretrizes abertas
    - [x] Extração de critérios diagnósticos objetivos
    - [x] Identificação de considerações geriátricas
- [x] Conversão de guidelines narrativas em lógica algorítmica
- [x] Geração de critérios binários/categóricos para decisões

### Protocol Creation - Text (Word/ABNT)
- [x] Geração automática das 13 seções obrigatórias
    - [x] Todas as seções completas e formatadas
    - [x] Critérios objetivos (sem ambiguidades)
    - [x] Dosagens específicas com vias e frequências
    - [x] Limiares numéricos para decisões
- [x] Compatibilidade total com template da qualidade
- [x] Opção de geração seção por seção para refinamento

### Protocol Creation - Visual (Flowchart)
- [x] Fluxogramas complexos formato Daktus
    - [x] Todos os caminhos do texto representados
    - [x] Tabelas de medicamentos integradas
    - [x] Condicionais com critérios explícitos
    - [x] Sem perguntas vagas ou loops infinitos
- [x] Exportação vetorial de alta qualidade
- [x] Visualização com zoom para detalhes

### Quality Assurance
- [x] Validação 100% formato vs. especificações
- [x] Cross-check completo texto ↔ fluxograma
- [x] Verificação contra CSV medicamentos
- [x] Relatório de qualquer incompletude ou ambiguidade

### Workflow Management
- [x] Modo automático: IA gera protocolo completo
- [x] Modo assistido: seção por seção se necessário
- [x] Templates dos protocolos existentes
- [x] Exportação para anexar no Jira

## Design Requests
- [x] Interface profissional PT-BR
    - [x] Editor lado a lado com sincronização
    - [x] Indicadores de completude por seção
    - [x] Alertas para critérios ambíguos
- [x] Foco em conformidade estrutural
    - [x] Checklists de validação visíveis

## Acceptance Checklist
- [x] Description final
- [x] Success criteria agreed
- [x] Constraints frozen
- [x] Feature list locked
- [x] Design requests locked

## Other Notes
- CRÍTICO: Formato perfeito é mais importante que precisão clínica inicial
- Sem seções faltantes, critérios vagos ou protocolos incompletos
- Validação e ajuste clínico feito posteriormente por especialistas
- Exemplos: bradiarritmia (17pg), ITU (fluxograma complexo c/ condicionais)

## Changelog
- v0.4: FINAL - Definido foco em formato perfeito, pesquisa via DeepResearch, todos os 3 pilares críticos
- v0.3: Adicionado volume e exemplos de protocolos
- v0.2: Simplificado escopo removendo integrações
- v0.1: Initial request structure
```
