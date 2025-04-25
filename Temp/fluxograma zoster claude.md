```mermaid
flowchart TB
    %% Definição de estilos
    classDef triagem fill:#f9d5e5,stroke:#333,stroke-width:1px
    classDef anamnese fill:#eeeeee,stroke:#333,stroke-width:1px
    classDef exame fill:#d5f9e5,stroke:#333,stroke-width:1px
    classDef exames fill:#e5d5f9,stroke:#333,stroke-width:1px
    classDef conduta fill:#d5e5f9,stroke:#333,stroke-width:1px
    classDef breakpoint fill:#ffcc00,stroke:#333,stroke-width:1px
    classDef alarme fill:#ff6666,stroke:#333,stroke-width:1px
    classDef excecao fill:#ffaa00,stroke:#333,stroke-width:1px

    %% Início do protocolo
    START([Protocolo de Herpes Zoster<br>Pronto-Atendimento Geriátrico]) --> T1

    %% Bloco de Triagem
    subgraph TRIAGEM ["TRIAGEM"]
        T1{{"P1: Lesões vesiculares<br>unilaterais/dor neuropática?"}}:::triagem
        T2{{"P2: Intensidade da dor (0-10)"}}:::triagem
        T3{{"P3: Sinais de alarme presentes?"}}:::triagem
        T4[["P4: Sinais de alarme:<br>- Face/olhos (oftálmico)<br>- Orelha/paralisia facial (Ramsay Hunt)<br>- Múltiplos dermátomos/bilateral (disseminado)<br>- Sinais neurológicos<br>- Febre alta/toxemia"]]:::alarme
        T5{{"P5: Paciente imunossuprimido?"}}:::triagem
    end

    %% Bloco de Anamnese
    subgraph ANAMNESE ["ANAMNESE"]
        A1{{"P6: Tempo de evolução (dias)"}}:::anamnese
        A2{{"P7: Surgindo novas lesões?"}}:::anamnese
        A3{{"P8: Dor precedeu as lesões?"}}:::anamnese
        A4{{"P9: Comorbidades relevantes"}}:::anamnese
        A5{{"P10: Alergia a antivirais?"}}:::anamnese
        A6{{"P11: Episódios prévios de HZ?"}}:::anamnese
        A7{{"P12: Vacinação contra HZ?"}}:::anamnese
        A8[["COND1: Se evolução muito prolongada (>14d)<br>e sem lesões novas → NPH isolada"]]:::excecao
    end

    %% Bloco de Exame Físico
    subgraph EXAME ["EXAME FÍSICO"]
        E1{{"P13: Distribuição das lesões<br>(dermátomos acometidos)"}}:::exame
        E2{{"P14: Sinal de Hutchinson<br>(lesão na ponta do nariz)?"}}:::exame
        E3{{"P15: Déficit motor segmentar?"}}:::exame
        E4{{"P16: Sinais de meningite/encefalite?"}}:::exame
        E5{{"P17: Infecção bacteriana secundária?"}}:::exame
        E6[["COND2: Confirmação diagnóstica clínica:<br>Vesículas agrupadas em dermátomo<br>+ dor neuropática"]]:::exame
        E7[["COND3: Presença de complicações:<br>- Oftálmica<br>- Otológica<br>- Neurológica<br>- Disseminada<br>- Secundária"]]:::alarme
    end

    %% Bloco de Exames Complementares
    subgraph EXAMES ["EXAMES COMPLEMENTARES"]
        X1{{"P18: Necessita confirmação<br>diagnóstica laboratorial?"}}:::exames
        X2{{"P19: Suspeita de complicação<br>neurológica central?"}}:::exames
        X3[["Exames recomendados:<br>- PCR para VVZ (TUSS 40314405)<br>- Hemograma, função renal"]]:::exames
        X4[["Exames específicos:<br>- Punção lombar + PCR VVZ no LCR<br>- Avaliação especializada"]]:::exames
        X5[["BP1: Aguardar resultado<br>de exame ou<br>avaliação de especialista"]]:::breakpoint
    end

    %% Bloco de Conduta
    subgraph CONDUTA ["CONDUTA TERAPÊUTICA"]
        C1{{"P20: Critérios de internação<br>presentes?"}}:::conduta
        C2{{"P21: Critérios de<br>observação <24h?"}}:::conduta
        C3[["Critérios de internação:<br>- Imunossupressão grave<br>- HZ disseminado<br>- HZ oftálmico com acometimento ocular<br>- Comprometimento neurológico<br>- Dor intratável<br>- Complicações graves/atípicas"]]:::alarme
        C4[["Critérios de observação:<br>- Analgesia parenteral<br>- Avaliação especializada em breve<br>- Dúvida diagnóstica<br>- Condições clínicas borderline"]]:::conduta
        C5[["Conduta: Internação<br>Aciclovir EV 10mg/kg 8/8h<br>Analgesia potente<br>Isolamento/Cuidados específicos<br>Avaliação especializada"]]:::conduta
        C6[["Conduta: Observação<br>Iniciar antiviral VO<br>Analgesia EV até controle<br>Reavaliar em 12h"]]:::conduta
        C7[["Conduta: Ambulatorial<br>Antiviral: Valaciclovir 1g 8/8h VO 7d<br>ou Aciclovir 800mg 5x/dia VO 7d<br>Analgesia escalonada<br>Cuidados locais<br>Orientações"]]:::conduta
        C8[["BP2: Reavaliação<br>programada (48-72h)"]]:::breakpoint
    end

    %% Bloco de Reavaliação (Breakpoint 2)
    subgraph REAVAL ["REAVALIAÇÃO (BP2)"]
        R1{{"P22: Melhora adequada?"}}:::conduta
        R2{{"P23: Lesões cicatrizando?"}}:::conduta
        R3{{"P24: Dor persistente?"}}:::conduta
        R4[["Conduta final:<br>- Alta definitiva<br>- Ajuste terapêutico<br>- Encaminhamentos"]]:::conduta
        R5[["Seguimento se NPH:<br>Gabapentina, Pregabalina<br>Amitriptilina<br>Encaminhar: Clínica de Dor"]]:::conduta
    end

    %% Bloco de Exceções ao Protocolo
    subgraph EXCECAO ["EXCEÇÕES AO PROTOCOLO"]
        EX1[["NPH isolada<br>(sem zóster ativo)"]]:::excecao
        EX2[["Diagnóstico diferencial<br>confirmado"]]:::excecao
        EX3[["Tratamento prévio<br>completo"]]:::excecao
        EX4[["Perfil não geriátrico<br>(jovem sem fatores de risco)"]]:::excecao
        EX5[["Alergia a antivirais<br>(considerar Foscarnet)"]]:::excecao
    end

    %% Conexões entre blocos
    
    %% Conexões de Triagem
    T1 -- "Não" --> EX1
    T1 -- "Sim" --> T2
    T2 --> T3
    T3 -- "Não" --> T5
    T3 -- "Sim" --> T4
    T4 --> T5
    T5 --> A1

    %% Conexões de Anamnese
    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 -- "Sim" --> EX5
    A5 -- "Não" --> A6
    A6 --> A7
    A7 --> A8
    A8 -- "Se NPH isolada" --> EX1
    A8 -- "Continuar" --> E1

    %% Conexões de Exame
    E1 --> E2
    E2 --> E3
    E3 --> E4
    E4 --> E5
    E5 --> E6
    E6 -- "Diagnóstico confirmado" --> E7
    E6 -- "Diagnóstico incerto" --> X1
    E7 --> X1

    %% Conexões de Exames
    X1 -- "Sim" --> X3
    X1 -- "Não" --> X2
    X2 -- "Sim" --> X4
    X2 -- "Não" --> C1
    X3 --> X5
    X4 --> X5
    X5 -- "Após resultado" --> C1

    %% Conexões de Conduta
    C1 -- "Sim" --> C3
    C1 -- "Não" --> C2
    C2 -- "Sim" --> C4
    C2 -- "Não" --> C7
    C3 --> C5
    C4 --> C6
    C5 --> C8
    C6 --> C8
    C7 --> C8

    %% Conexões de Reavaliação
    C8 --> R1
    R1 -- "Sim" --> R2
    R1 -- "Não" --> C1
    R2 -- "Sim" --> R3
    R2 -- "Não" --> C7
    R3 -- "Sim (NPH)" --> R5
    R3 -- "Não" --> R4
    R4 --> FIM
    R5 --> FIM

    FIM([Alta final ou<br>continuidade ambulatorial])