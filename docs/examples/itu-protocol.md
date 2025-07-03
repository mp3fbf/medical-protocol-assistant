# Exemplo de Fluxograma Complexo: Manejo de Infecção do Trato Urinário (ITU) Complicada

Este documento descreve os elementos de um fluxograma para manejo de ITU Complicada em adultos no pronto atendimento. A visualização em Mermaid abaixo é uma representação simplificada de um fluxo possível.

## Descrição do Fluxo Geral

O manejo da ITU Complicada envolve:

1.  **Avaliação Inicial:** Suspeita clínica de ITU, identificação de sinais de alerta/gravidade.
2.  **Confirmação Diagnóstica:** Exame de urina (EAS/Urina tipo I), urocultura com antibiograma.
3.  **Definição de ITU Complicada:** Presença de fatores de risco (ex: homem, gestante, diabetes, imunossupressão, cateter urinário, anormalidade urológica, ITU de repetição, sintomas > 7 dias, sintomas sistêmicos).
4.  **Avaliação de Gravidade/Sinais de Sepse:** Presença de febre alta, calafrios, taquicardia, hipotensão, alteração do estado mental, leucocitose importante, proteína C reativa elevada. Suspeita de pielonefrite aguda.
5.  **Decisão de Tratamento Ambulatorial vs. Internação:**
    - **Ambulatorial:** Casos leves a moderados, sem sinais de sepse, boa tolerância oral, suporte domiciliar adequado.
    - **Internação:** Sinais de sepse, pielonefrite grave, intolerância oral, comorbidades descompensadas, falha terapêutica ambulatorial, gestantes com pielonefrite.
6.  **Escolha do Antimicrobiano:**
    - **Ambulatorial:** Opções orais baseadas no perfil de sensibilidade local e fatores do paciente (ex: Fluoroquinolonas, Cefalosporinas de 2ª/3ª geração, SMZ-TMP). Ajustar após resultado da urocultura.
    - **Hospitalar:** Antimicrobianos parenterais de amplo espectro (ex: Ceftriaxona, Piperacilina-Tazobactam, Carbapenêmicos em casos graves ou risco de ESBL). Ajustar após urocultura.
7.  **Tratamento Adjuvante:** Hidratação, analgésicos.
8.  **Duração do Tratamento:** Varia conforme gravidade e antimicrobiano (geralmente 7-14 dias para ITU complicada).
9.  **Reavaliação e Seguimento.**

## Exemplo de Fluxograma (Mermaid - Simplificado)

```mermaid
graph TD
    A[Suspeita de ITU em Adulto] --> B{Sintomas + Exame de Urina Sugestivo?};
    B --Não--> C[Considerar outros diagnósticos];
    B --Sim--> D{Fatores de Complicação Presentes?};
    D --Não (ITU Não Complicada)--> E[Tratar como ITU Baixa Não Complicada (Cistite)];
    D --Sim (ITU Complicada)--> F{Sinais de Alerta/Gravidade? (Febre alta, Calafrios, Dor Lombar Intensa, Vômitos, Hipotensão, Prostração)};
    F --Sim--> G{Pielonefrite Aguda ou Sepse?};
    G --Sim--> H[INTERNAÇÃO HOSPITALAR];
    H --> I[Coletar Urocultura + Hemoculturas];
    I --> J[Iniciar ATB EV Empírico de Amplo Espectro (ex: Ceftriaxona)];
    J --> K[Avaliar necessidade de exames de imagem (USG/TC)];
    J --> L[Ajustar ATB conforme cultura e antibiograma];
    L --> M[Monitorar resposta clínica e laboratorial];

    G --Não (ITU Complicada sem sinais de Sepse imediata)--> N{Capaz de tratamento oral e acompanhamento ambulatorial?};
    N --Sim--> O[TRATAMENTO AMBULATORIAL (ITU Complicada)];
    O --> P[Coletar Urocultura];
    P --> Q[Prescrever ATB Oral (ex: Ciprofloxacino, Cefalexina - considerar perfil local)];
    Q --> R[Orientar sinais de alerta para retorno];
    Q --> S[Agendar reavaliação em 48-72h];
    S --> T{Melhora Clínica?};
    T --Sim--> U[Completar tratamento. Ajustar ATB se necessário pós-cultura];
    T --Não--> H;

    N --Não (Incapaz de tto oral ou acompanhamento)--> H;

    M --> V{Melhora Clínica e Laboratorial?};
    V --Sim--> W[Considerar transição para ATB Oral];
    W --> X[Planejar alta hospitalar];
    V --Não--> Y[Reavaliar diagnóstico, ATB, investigar complicações];

    E --> Z[Fim - Cistite];
    U --> Z1[Fim - ITU Complicada Ambulatorial];
    X --> Z2[Fim - ITU Complicada Hospitalar];
    C --> Z3[Fim - Outro Diagnóstico];
    Y --> Z4[Fim - Reavaliação];

    Notas sobre o Fluxograma:

Este é um exemplo simplificado. Um fluxograma real para ITU complicada pode ter mais nós de decisão, especialmente na escolha do antibiótico empírico (baseado em fatores de risco para germes multirresistentes, alergias, etc.).
"Fatores de Complicação" incluiriam: sexo masculino, gravidez, diabetes mellitus, imunossupressão, uso recente de antibióticos, cateter urinário, anormalidade estrutural ou funcional do trato urinário, ITU recorrente.
"Sinais de Alerta/Gravidade" e "Pielonefrite Aguda ou Sepse" são pontos críticos de decisão para internação.
A escolha do antibiótico (Q e J) é uma etapa complexa que depende do perfil de sensibilidade local, histórico do paciente e gravidade.
Este exemplo visa demonstrar a estrutura de um fluxograma com múltiplos caminhos e condicionais, típico de protocolos médicos mais complexos.
```
