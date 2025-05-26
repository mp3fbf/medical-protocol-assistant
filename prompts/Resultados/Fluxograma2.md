```mermaid
%%{init: {"flowchart": {"curve": "linear"}}}%%
flowchart TD
    %% Nós iniciais
    A0(("Início"))
    Q00{{"Red Flags?"}}
    Q01{{"Sinais Vitais Alterados?"}}
    ACT_RED[["AÇÃO IMEDIATA"]]
    END1(("FIM"))
    COLOR[/"AMARELO"/]
    Q1START(("Prosseguir"))
    
    %% Anamnese
    Q1{{"Rash < 72h?"}}
    Q2{{"Localização?"}}
    LOC1[/"Cabeça/Pescoço"/]
    LOC2[/"Tronco"/]
    LOC3[/"MMSS/MMII"/]
    Q3{{"Dor 0-10"}}
    PAIN[/"Registrar Escore"/]
    Q4{{"Imunossuprimido?"}}
    Q5{{"Comorbidades"}}
    Q6{{"Antiviral prévio?"}}
    
    %% Decisão antiviral
    DEC_AV{{"Critérios p/ Antiviral"}}
    NOAV[/"Sem Antiviral"/]
    ANTIV[/"Iniciar Antiviral"/]
    
    %% Via
    VIA{{"Internar?"}}
    ACIV_EV[/"Aciclovir EV"/]
    INTERN[/"Internação"/]
    EV_ORAL{{"ClCr < 50?"}}
    VALA[/"Valaciclovir"/]
    ADJUST[/"Ajustar Dose"/]
    
    %% Analgesia
    ANALG{{"Escalonar Dor"}}
    L1[/"Dipirona VO"/]
    L2[/"Dipirona EV + Cetoprofeno"/]
    L3[/"Tramadol/Morfina"/]
    
    %% Corticoide
    CORT{{"Prednisona?"}}
    PRED[/"Adicionar Prednisona"/]
    SKIP1["Sem corticoide"]
    
    %% Breakpoint 1
    BP1_CHECK{{"Necessita Exame/Parecer?"}}
    BP1[["Breakpoint 1"]]
    RES_BP1[/"Retorno ao Fluxo"/]
    
    %% Observação
    OBSERVE{{"Critério de Internação?"}}
    INTERN2[/"Internar"/]
    
    %% Breakpoint 2
    BP2_SET[["Agendar BP2"]]
    OUTCOND[/"Gerar Condutas"/]
    FLOW_END(("Fim Inicial"))
    BP2[["Breakpoint 2"]]
    
    %% Reavaliação
    REVAL{{"Melhora ≥ 50%?"}}
    CLOSE[/"Encerrar Protocolo"/]
    ESCAL[/"Prolongar Tratamento"/]
    END2(("Fim Definitivo"))
    
    %% Conexões
    A0 --> Q00
    Q00 -- "Sim" --> ACT_RED
    ACT_RED --> END1
    
    Q00 -- "Não" --> Q01
    Q01 -- "Sim" --> COLOR
    COLOR --> Q1START
    Q01 -- "Não" --> Q1START
    
    Q1START --> Q1
    Q1 --> Q2
    Q2 -->|"Cabeça"| LOC1
    Q2 -->|"Tronco"| LOC2
    Q2 -->|"MMSS/MMII"| LOC3
    LOC1 --> Q3
    LOC2 --> Q3
    LOC3 --> Q3
    
    Q3 --> PAIN
    PAIN --> Q4
    Q4 --> Q5
    Q5 --> Q6
    Q6 --> DEC_AV
    
    DEC_AV -- "Não" --> NOAV
    NOAV --> ANALG
    DEC_AV -- "Sim" --> ANTIV
    
    ANTIV --> VIA
    VIA -- "Sim" --> ACIV_EV
    ACIV_EV --> INTERN
    VIA -- "Não" --> EV_ORAL
    
    EV_ORAL -- "Não" --> VALA
    EV_ORAL -- "Sim" --> ADJUST
    VALA --> ANALG
    ADJUST --> ANALG
    INTERN --> ANALG
    
    ANALG -->|"1-3"| L1
    ANALG -->|"4-7"| L2
    ANALG -->|"8-10"| L3
    L1 --> CORT
    L2 --> CORT
    L3 --> CORT
    
    CORT -- "Sim" --> PRED
    CORT -- "Não" --> SKIP1
    PRED --> BP1_CHECK
    SKIP1 --> BP1_CHECK
    
    BP1_CHECK -- "Sim" --> BP1
    BP1 --> RES_BP1
    RES_BP1 --> OBSERVE
    BP1_CHECK -- "Não" --> OBSERVE
    
    OBSERVE -- "Sim" --> INTERN2
    INTERN2 --> BP2_SET
    OBSERVE -- "Não" --> BP2_SET
    
    BP2_SET --> OUTCOND
    OUTCOND --> FLOW_END
    FLOW_END --> BP2
    
    BP2 --> REVAL
    REVAL -- "Sim" --> CLOSE
    REVAL -- "Não" --> ESCAL
    CLOSE --> END2
    ESCAL --> END2
    
    %% Estilo
    classDef yellow fill:#FFF6BF,stroke:#555,color:#000;
    class COLOR yellow