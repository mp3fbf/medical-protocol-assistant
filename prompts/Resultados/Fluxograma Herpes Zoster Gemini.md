```mermaid
graph TD
    A[Início: Paciente com suspeita de HZ] --> B{Erupção/Dor Dermatomal?};
    B -- Não --> C[Considerar Outros Diagnósticos. Fim.];
    B -- Sim --> D[Passo 1: Avaliação Inicial];
    D --> Q2[Caracterizar Erupção];
    D --> Q3[Caracterizar Dor/Sintomas];
    D --> Q5[Idade?];
    D --> Q6{Imunocomprometido?};
    D --> Q7[Escala de Dor?];
    D --> Q8[Localização?];
    D --> Q9[Sinais de Alarme?];

    Q9 --> E{Diagnóstico Provável/Possível?};
    E -- Não --> C;
    E -- Sim --> F[Passo 2: Estratificação];

    F --> R1{Indicação Antiviral?};
    F --> R2{Indicação Internação?};
    F --> R3{Avaliação Especializada Urgente?};

    R2 -- Sim --> G[Internação Hospitalar];
    R2 -- Não --> H[Manejo Ambulatorial/PS];

    G --> I[Iniciar Condutas Intra-Hospitalares];
    H --> J[Iniciar Condutas Ambulatoriais/PS];

    subgraph "Condutas Baseadas em Condicionais [Passo 3]"
        K(Terapia Antiviral Oral)
        L(Terapia Antiviral IV)
        M(Manejo Dor Leve)
        N(Manejo Dor Moderada)
        O(Manejo Dor Grave)
        P(Corticosteroide Sistêmico?)
        Q(Cuidados Tópicos/Gerais)
        R(Condutas para HZO)
        S(Condutas para Ramsay Hunt)
        T(Condutas para Complicações SNC/Disseminado)
        U(Condutas para Sobreinfecção)
        V(Encaminhamentos Ambulatoriais)
        W(Orientações/Prevenção)
    end

    I --> L;
    I --> O;
    I --> P;
    I --> Q;
    I --> R;
    I --> S;
    I --> T;
    I --> U;

    J --> K;
    J -- Dor Leve --> M;
    J -- Dor Moderada --> N;
    J -- Dor Grave --> O;
    J --> P;
    J --> Q;
    J --> R;
    J --> S;

    G --> X[Alta Hospitalar];
    H --> X;
    X --> V;
    X --> W;
    W --> Y[Fim do Protocolo];

    %% Condicionais (Exemplos)
    R1 -- Indicada --> K;
    R2 -- Indicada com Indicação IV --> L;
    Q7 -- Leve --> M;
    Q7 -- Moderada --> N;
    Q7 -- Grave --> O;
    Q9 -- Sinais HZO --> R;
    Q9 -- Sinais Ramsay Hunt --> S;
    Q9 -- Sinais SNC/Disseminado --> T;
    Q9 -- Sinais Sobreinfecção --> U;

    %% Breakpoints (Ilustrativo - não detalhado no texto)
    %% H --> BP1{Breakpoint: Aguardar Resultado Exame?};
    %% BP1 -- Sim --> WAIT[Aguardar];
    %% WAIT --> REAVAL[Reavaliação Pós-Exame];
    %% REAVAL --> J;
    %% BP1 -- Não --> J;

    %% Segurança
    Z[Passo 4: Checagem de Segurança - Ajuste Renal, DM, ICC, Anticoag.]

    K --> Z;
    L --> Z;
    M --> Z;
    N --> Z;
    O --> Z;
    P --> Z;
    U --> Z;