# Protocolo Herpes Zoster - Sequence Diagram (Linhas Retas)

```mermaid
sequenceDiagram
    autonumber
    participant P as 👤 Paciente
    participant M as 👨‍⚕️ Médico
    participant S as 💻 Sistema
    participant L as 🔬 Laboratório
    participant F as 💊 Farmácia
    
    Note over P,F: AVALIAÇÃO INICIAL
    P->>M: Apresenta sintomas de rash
    M->>S: Verifica Red Flags
    
    alt Red Flags presentes
        S-->>M: ⚠️ AÇÃO IMEDIATA
        M->>P: Tratamento emergencial
    else Sem Red Flags
        M->>P: Avalia sinais vitais
        
        Note over M,S: ANAMNESE
        M->>S: Rash < 72h?
        S-->>M: Confirmado
        M->>S: Localização do rash
        M->>P: Avalia dor (escala 0-10)
        M->>S: Verifica imunossupressão
        M->>S: Comorbidades associadas
        M->>S: Uso prévio de antiviral?
        
        Note over M,F: DECISÃO TERAPÊUTICA
        S->>M: Critérios para antiviral
        
        alt Antiviral indicado
            M->>S: Critério de internação?
            
            alt Internar
                M->>F: Aciclovir EV
                M->>P: Internação hospitalar
            else Ambulatorial
                M->>S: ClCr < 50?
                
                alt Função renal alterada
                    M->>F: Ajustar dose
                else Função normal
                    M->>F: Valaciclovir VO
                end
            end
        else Sem antiviral
            M->>P: Tratamento sintomático
        end
        
        Note over M,P: ANALGESIA
        M->>P: Escalonar analgesia
        
        alt Dor 1-3
            M->>F: Dipirona VO
        else Dor 4-7
            M->>F: Dipirona EV + Cetoprofeno
        else Dor 8-10
            M->>F: Tramadol/Morfina
        end
        
        M->>S: Prednisona indicada?
        
        alt Sim
            M->>F: Adicionar Prednisona
        else Não
            M->>P: Sem corticoide
        end
        
        Note over M,L: SEGUIMENTO
        M->>S: Necessita exames?
        
        opt Exames necessários
            M->>L: Solicitar exames
            L-->>M: Resultados
        end
        
        M->>S: Critério de internação?
        
        alt Internar
            M->>P: Internação
        else Alta
            M->>S: Agendar retorno
        end
        
        Note over M,P: REAVALIAÇÃO
        M->>P: Retorno agendado
        P->>M: Reavaliação
        M->>S: Melhora ≥ 50%?
        
        alt Melhora satisfatória
            M->>S: Encerrar protocolo
        else Sem melhora
            M->>P: Prolongar tratamento
        end
    end
```

---

## Vantagens do Sequence Diagram:
- ✅ **Linhas completamente retas** como na sua imagem
- ✅ **Layout organizado** em colunas
- ✅ **Fácil de seguir** o fluxo temporal
- ✅ **Mostra interações** entre diferentes participantes

## Comparação:
- **Flowchart**: Bom para mostrar decisões e caminhos alternativos
- **Sequence Diagram**: Perfeito para mostrar processo sequencial com linhas retas 