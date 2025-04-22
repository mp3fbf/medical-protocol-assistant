```mermaid
flowchart TD
    %% ─────────────────────── INÍCIO ───────────────────────
    A([INÍCIO<br/>Acionamento do protocolo<br/>TVP PS]) --> B{"P1‑P3 SINAIS DE GRAVIDADE?<br/>(Instabilidade hemodinâmica OU<br/>Suspeita TEP grave OU<br/>Phlegmasia cerulea dolens)"}
    B -- "SIM" --> C[Emergência<br/>• Acionar Cirurgia Vascular/UTI<br/>• Heparina NF IV bólus + infusão<br/>• Considerar trombólise/trombectomia<br/>• Suporte avançado]
    C --> X1([TELA DE CONDUTA FINAL])
    B -- "NÃO" --> D{"P11 Escore Wells"}
    %% ───────────────── Wells ─────────────────
    D -- "≥ 2  (TVP provável)" --> E[Solicitar Doppler venoso imediato]
    D -- "≤ 1  (TVP improvável)" --> F[Dosar D‑dímero]
    %% ───────────────── D‑Dímero ─────────────────
    F --> G{"D‑dímero < cut‑off?"}
    G -- "SIM" --> H([TVP descartada<br/>Encerrar protocolo])
    G -- "NÃO" --> E
    %% ───────────────── Doppler ─────────────────
    E --> I{"Doppler realizado?"}
    I -- "NÃO" --> BP1((⬡ BREAKPOINT 1<br/>Aguardo Doppler))
    BP1 --> I
    I -- "SIM" --> J{"Resultado Doppler"}
    J -- "TVP +/Prox ou Distal" --> K[Iniciar Anticoagulação]
    K --> L{"Escolha do fármaco"}
    L -- "ClCr < 30 mL/min OU P14 = Sim" --> L1[Heparina NF IV]
    L -- "Outro + preferir SC" --> L2[Enoxaparina 1 mg/kg 12/12 h]
    L -- "Função renal OK + ambulatório" --> L3["Rivaroxabana 15 mg 12/12 h<br/>(21 d) -> 20 mg/d<br/>ou Apixabana 10 mg 12/12 h<br/>(7 d) -> 5 mg 12/12 h"]
    K --> M{"P14 Critérios de internação?"}
    M -- "SIM" --> N[Internação Clínica/UTI<br/>– continuar heparina EV<br/>– monitorar TTPa/INR<br/>– tratar comorbidades]
    N --> X1
    M -- "NÃO" --> O[Alta ambulatorial<br/>– 1ª dose HBPM/DOAC dada<br/>– Educação + Sinais alarme<br/>– Prescrições impressas]
    O --> P[Encaminhar:<br/>• Ambulatório Angiologia 1‑2 sem<br/>• Retorno Clínica Médica 7 d<br/>• Enfermagem domicílio se HBPM]
    P --> X1
    J -- "Doppler negativo" --> Q{"Alta suspeita permanece?"}
    Q -- "NÃO" --> H
    Q -- "SIM" --> R[Programar novo Doppler 5‑7 d<br/>± profilaxia HBPM]
    R --> BP1
    %% ───────────────── REAVALIAÇÃO ─────────────────
    BP2((⬡ BREAKPOINT 2<br/>Reavaliação/2ª rodada)):::break
    BP1 -. "Doppler controle" .-> S{"P15 Resultado controle"}
    S -- "TVP confirmada" --> K
    S -- "Sem trombo" --> H
    S -- "Inconclusivo" --> BP2
    BP2 -. "Conduta individualizada" .-> K
    %% ───────────────── CONDUTA FINAL ─────────────────
    X1([TELA DE CONDUTA FINAL])
    classDef break fill:#ffd966,stroke:#333,stroke-width:2px
    classDef conduta fill:#d9ead3,stroke:#333,stroke-width:2px
    class X1 conduta
