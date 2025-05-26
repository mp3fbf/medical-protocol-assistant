# Protocolo Dor Torácica – State Diagram

```mermaid
stateDiagram-v2
    [*] --> Entrada
    
    state Entrada {
        [*] --> Historia
        Historia --> ExameFisico
        ExameFisico --> Troponina
        Troponina --> ECG
        ECG --> [*]
    }
    
    Entrada --> Decisao
    
    state Decisao <<choice>>
    
    Decisao --> STEMI: Supra de ST
    Decisao --> NSTEMI: Sem supra + Troponina alta
    Decisao --> BaixoRisco: ECG normal + Troponina normal
    
    state STEMI {
        [*] --> ProtoInfarto
        ProtoInfarto --> Aspirina
        ProtoInfarto --> Cateterismo
        Aspirina --> ResultadoST
        Cateterismo --> ResultadoST
        ResultadoST --> [*]
    }
    
    state NSTEMI {
        [*] --> Heparina
        Heparina --> GRACE
        
        state GRACE <<choice>>
        GRACE --> CATPrecoce: GRACE > 140
        GRACE --> Observacao: GRACE ≤ 140
        
        Observacao --> NovaTroponina
        NovaTroponina --> Reavaliacao
        
        state Reavaliacao <<choice>>
        Reavaliacao --> CATPrecoce: Troponina alta
        Reavaliacao --> AltaAmb: Normal
        
        CATPrecoce --> [*]
        AltaAmb --> [*]
    }
    
    state BaixoRisco {
        [*] --> TIMI
        
        state TIMI <<choice>>
        TIMI --> AltaAmb: TIMI 0-1
        TIMI --> Observacao24h: TIMI ≥ 2
        
        AltaAmb --> [*]
        Observacao24h --> [*]
    }
    
    STEMI --> Fim
    NSTEMI --> Fim
    BaixoRisco --> Fim
    
    Fim --> [*]