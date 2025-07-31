/**
 * Section-Specific Instructions Based on Protocol Context
 * 
 * Provides tailored instructions for each section based on the care context
 */

import { ProtocolContext } from "@/types/database";

export function getSectionContextInstructions(
  context: ProtocolContext,
  sectionNumber: number
): string | null {
  
  // Emergency Room specific instructions
  if (context === ProtocolContext.EMERGENCY_ROOM) {
    switch (sectionNumber) {
      case 1: // Identificação do Protocolo
        return `
Para PRONTO ATENDIMENTO, incluir obrigatoriamente:
- Tempo médio de aplicação: < 30 minutos
- Recursos necessários: apenas os disponíveis 24/7 no PA
- Objetivo primário: decisão rápida e segura de destino do paciente
- Nível de complexidade: adequado para plantonista geral
- NÃO incluir informações sobre follow-up ambulatorial de rotina
`;

      case 2: // Introdução e Justificativa
        return `
Para PA, focar em:
- Por que esta condição é relevante no PA (volume, gravidade)
- Riscos de não identificar/tratar adequadamente
- Impacto no tempo de permanência e fluxo do PA
- Complicações que podem ocorrer nas primeiras horas
MÁXIMO 2 parágrafos concisos
`;

      case 3: // Objetivos
        return `
Objetivos ESPECÍFICOS do PA:
1. Identificar pacientes de alto risco em < 2 minutos
2. Estabilizar e tratar complicações agudas
3. Decidir entre alta segura vs internação/observação
4. Minimizar tempo de permanência
5. Prevenir retornos evitáveis em 72h
NÃO incluir objetivos de longo prazo
`;

      case 4: // População-Alvo e Critérios
        return `
Para PA:
- Critérios de INCLUSÃO: pacientes que DEVEM seguir este protocolo
- Critérios de EXCLUSÃO: quem NÃO deve seguir (ex: pediatria, gestantes)
- Sinais de ALERTA para atenção especial
- Quando acionar especialista/sênior IMEDIATAMENTE
Formato bullet points, máximo 5 itens cada
`;

      case 5: // Avaliação Inicial
        return `
ESTRUTURA OBRIGATÓRIA para PA:

5.1 RED FLAGS - Avaliar IMEDIATAMENTE (< 2 minutos)
□ Listar 4-6 sinais de risco iminente
□ Cada um com ação imediata se presente
→ Se QUALQUER positivo: [ação específica]

5.2 YELLOW FLAGS - Avaliar em seguida (< 5 minutos)  
□ Listar 3-5 sinais de alerta
→ Se positivo: maior atenção, considerar exames

5.3 Avaliação Focada (se red flags negativos)
• Apenas dados essenciais para decisão
• Exame físico direcionado (< 5 min)
• NÃO incluir anamnese detalhada ou revisão de sistemas
`;

      case 6: // Exames Complementares
        return `
APENAS exames disponíveis 24/7 no PA:

6.1 Exames de URGÊNCIA (resultados < 1h):
□ Laboratório: hemograma, Na, K, Ur, Cr, glicemia, PCR
□ ECG (se indicado)
□ RX simples
□ Urina I (se indicado)

6.2 Quando solicitar:
• Indicações precisas e objetivas
• Evitar exames "por rotina"

6.3 O que NÃO solicitar no PA:
✗ Listar exames inadequados para PA
✗ Explicar brevemente por quê

PROIBIDO mencionar: TC/RM eletivas, endoscopias, exames especializados
`;

      case 7: // Tratamento
        return `
ORGANIZAR em 3 blocos:

7.1 CONDUTAS IMEDIATAS NO PA
Escolher conforme gravidade:
□ Medicação/procedimento - Aplicar AGORA
  • Dose, via, velocidade específicas
  • Contraindicações relevantes
  
7.2 PRESCRIÇÃO DE ALTA (para casa)
□ Medicações VO simples (máx 3-4)
□ Dose e tempo de uso claros
□ Disponíveis em farmácia comum
□ Orientações práticas

7.3 O QUE NÃO FAZER NO PA
✗ Listar medicamentos/condutas inadequados
✗ Explicar riscos se relevante

Preferir: casa > VO > IM/SC > IV bolus > IV lento
`;

      case 8: // Monitorização e Seguimento
        return `
Para PA - MONITORIZAÇÃO IMEDIATA:

8.1 Durante permanência no PA:
• Sinais vitais: frequência e parâmetros de alarme
• Sintomas: o que reavaliar e quando
• Tempo de observação mínimo

8.2 Critérios de RESPOSTA ao tratamento:
□ Melhora: sinais objetivos
□ Falha: quando mudar conduta

8.3 Se ALTA do PA:
• Sinais de alerta para retorno (linguagem leiga)
• Quando procurar PA novamente
• NÃO agendar retornos ambulatoriais de rotina
`;

      case 9: // Critérios de Internação e Alta
        return `
FORMATO CHECKLIST OBRIGATÓRIO:

9.1 ALTA SEGURA - TODOS devem estar ✓
□ [Critério objetivo 1]
□ [Critério objetivo 2] 
□ [Critério objetivo 3]
□ [Critério objetivo 4]
□ Orientado sobre sinais de alerta
→ CONDUTA: Liberar com receita e orientações

9.2 INTERNAR/OBSERVAR - Se QUALQUER ✓
□ [Red flag presente]
□ [Falha de resposta ao tratamento]
□ [Critério social/risco]
□ [Impossibilidade de tratamento ambulatorial]
→ CONDUTA: Internar em [enfermaria/UTI]

9.3 OBSERVAÇÃO 6-12h - Casos intermediários
□ [Situações específicas]
→ REAVALIAR com critérios objetivos

NÃO usar texto corrido. APENAS checklists.
`;

      case 10: // Complicações e Manejo
        return `
APENAS complicações AGUDAS no PA:

10.1 Complicações nas primeiras horas:
• [Complicação]: Como identificar → O que fazer
• Máximo 3-4 mais relevantes

10.2 Deterioração durante observação:
• Sinais de piora
• Quando escalar cuidado

10.3 Iatrogenias comuns no PA:
• Medicação: reações esperadas
• Procedimento: complicações imediatas

NÃO incluir complicações tardias ou crônicas
`;

      case 11: // Considerações Especiais
        return `
POPULAÇÕES ESPECIAIS no PA:

• Idosos (> 65a): ajustes específicos
• Comorbidades descompensadas: cuidados extras
• Uso de anticoagulantes: quando relevante
• Insuficiência renal/hepática: ajuste de doses

MÁXIMO 4 situações mais relevantes
Foco em mudanças práticas de conduta
`;

      case 12: // Mensagens-Chave
        return `
5 PONTOS ESSENCIAIS para PA:

1. RED FLAG mais importante: [qual] → [ação]
2. Exame essencial: [qual] → [quando fazer]
3. Tratamento de primeira linha: [qual] → [como]
4. Principal critério de internação: [qual]
5. Orientação de alta mais importante: [qual]

Formato ULTRA conciso, memorável
`;

      case 13: // Apêndices e Recursos
        return `
RECURSOS PRÁTICOS para PA:

• Tabela de doses para PA (medicações disponíveis)
• Checklist de alta impressível
• Algoritmo visual simplificado (se aplicável)
• Telefones úteis (especialidades de retaguarda)

NÃO incluir:
- Referências bibliográficas extensas
- Protocolos institucionais complexos
- Guidelines completos
`;
    }
  }

  // Ambulatory specific instructions
  if (context === ProtocolContext.AMBULATORY) {
    switch (sectionNumber) {
      case 1:
        return `
Para AMBULATÓRIO, incluir:
- Número esperado de consultas até estabilização
- Tempo médio de tratamento completo
- Recursos diagnósticos especializados necessários
- Equipe multidisciplinar envolvida
- Integração com atenção primária
`;

      case 5:
        return `
Para AMBULATÓRIO - Avaliação completa:

5.1 Anamnese Detalhada
• História atual completa
• Antecedentes relevantes
• História familiar quando pertinente
• Revisão de sistemas
• Medicações em uso

5.2 Exame Físico Completo
• Geral e específico
• Manobras especializadas
• Escalas validadas quando aplicável

5.3 Avaliação Funcional
• Impacto na qualidade de vida
• Limitações para atividades
• Aspectos psicossociais
`;

      case 7:
        return `
TRATAMENTO AMBULATORIAL - Abordagem escalonada:

7.1 Medidas não-farmacológicas (1ª linha)
• Mudanças de estilo de vida
• Orientações dietéticas detalhadas
• Exercícios específicos
• Tempo de tentativa: 4-12 semanas

7.2 Tratamento farmacológico
• 1ª linha: [medicamentos], dose inicial e ajustes
• 2ª linha: quando e como escalonar
• 3ª linha: opções especializadas
• Monitorização de efeitos adversos

7.3 Tratamentos especializados
• Quando encaminhar
• Procedimentos ambulatoriais
• Terapias de alto custo (critérios)
`;

      case 8:
        return `
SEGUIMENTO AMBULATORIAL estruturado:

8.1 Cronograma de consultas
• 1º retorno: 2-4 semanas
• Retornos subsequentes: periodicidade
• Consultas com equipe multi

8.2 Monitorização
• Exames de controle: quais e quando
• Metas terapêuticas mensuráveis
• Ajustes de tratamento

8.3 Adesão ao tratamento
• Estratégias para melhorar
• Identificar barreiras
• Educação continuada
`;
    }
  }

  // ICU specific instructions
  if (context === ProtocolContext.ICU) {
    switch (sectionNumber) {
      case 5:
        return `
AVALIAÇÃO NA UTI - Sistemática e contínua:

5.1 Avaliação hemodinâmica
• PAM, DC, SVR, lactato
• Responsividade a fluidos
• Necessidade de vasopressores

5.2 Avaliação respiratória
• Parâmetros ventilatórios
• Gasometria e metas
• Prontidão para desmame

5.3 Avaliação neurológica
• Sedação (RASS/SAS)
• Dor (BPS/CPOT)
• Delirium (CAM-ICU)

5.4 Outros sistemas
• Renal: balanço, função
• Hepático, hematológico
• Infeccioso: culturas, PCT
`;

      case 7:
        return `
TRATAMENTO INTENSIVO - Bundles e protocolos:

7.1 Suporte hemodinâmico
• Ressuscitação volêmica guiada
• Vasopressores: 1ª linha, escalonamento
• Inotrópicos: indicações precisas
• Metas: PAM, lactato, SvcO2

7.2 Suporte respiratório
• Estratégia ventilatória protetora
• PEEP ideal, driving pressure
• Pronação se indicado
• Protocolo de desmame

7.3 Sedação e analgesia
• Sedação mínima necessária
• Analgesia multimodal
• Despertar diário
• Prevenção de delirium

7.4 Profilaxias obrigatórias
• TVP/TEP, SUP, úlcera de pressão
`;
    }
  }

  // Return null to use default section instruction
  return null;
}