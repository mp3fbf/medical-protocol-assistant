# Guia do Usuário – Assistente de Desenvolvimento de Protocolos Médicos

## 1. Introdução

Bem-vindo ao Assistente de Desenvolvimento de Protocolos Médicos! Esta ferramenta foi projetada para auxiliar médicos coordenadores e o setor de qualidade na criação rápida e padronizada de protocolos médicos, utilizando inteligência artificial para gerar documentação estruturada (formato Word/ABNT com 13 seções) e fluxogramas visuais.

**Objetivo Principal:** Reduzir o tempo de criação de protocolos de semanas para dias, garantindo 100% de conformidade com o formato exigido, enquanto a precisão clínica final é ajustada por especialistas humanos.

## 2. Requisitos de Acesso

- **Navegador:** Um navegador web moderno para desktop (Google Chrome ou Microsoft Edge recomendados).
- **Acesso:** Credenciais de login fornecidas pela administração.

## 3. Acesso ao Sistema (Login)

1.  Acesse a URL da aplicação fornecida (ex: `https://medical-protocol-assistant.vercel.app`).
2.  Na página de login, insira seu e-mail e senha.
3.  Clique em "Entrar".

## 4. Painel Principal (Dashboard)

Após o login, você será direcionado ao Dashboard, que oferece:

- **Visão Geral:** Resumo dos protocolos existentes (total, em rascunho, em revisão, aprovados).
- **Ações Rápidas:**
  - **Novo Protocolo:** Inicia a criação de um novo protocolo.
  - **Ver Protocolos:** Leva à lista de todos os protocolos.

## 5. Criando um Novo Protocolo

1.  No Dashboard ou na página de listagem de protocolos, clique em "**Novo Protocolo**".
2.  Preencha o formulário inicial:
    - **Título do Protocolo:** Um título claro e descritivo (ex: "Protocolo de Manejo da Sepse Grave").
    - **Condição Médica Principal:** A condição médica principal que o protocolo aborda (ex: "Sepse Grave").
3.  Clique em "**Iniciar Criação do Protocolo**".
4.  Você será redirecionado para a interface de edição do novo protocolo.

**Modos de Geração (a ser detalhado conforme implementação):**

- **Modo Automático (Padrão):** A IA tentará gerar o conteúdo para todas as 13 seções com base na pesquisa inicial e na condição médica.
- **Modo Assistido (Seção por Seção):** [Detalhes futuros sobre como gerar/refinar seção por seção com assistência da IA].

## 6. Editando um Protocolo

A interface de edição do protocolo é dividida em:

- **Navegação de Seções (Esquerda):** Lista das 13 seções obrigatórias. Clique em uma seção para carregá-la no editor. Abaixo desta lista, há um painel para o relatório de validação.
- **Editor de Texto da Seção (Centro):** Exibe o conteúdo da seção selecionada. [Funcionalidades de edição de texto serão detalhadas aqui, incluindo assistência da IA para refinar ou gerar conteúdo para a seção atual].
- **Visualizador de Fluxograma (Direita):** Exibe o fluxograma correspondente ao protocolo. [Funcionalidades de zoom e navegação no fluxograma. Edição manual do fluxograma, se aplicável, será detalhada aqui].

**Ações Principais:**

- **Selecionar Seção:** Clique em uma seção na lista à esquerda.
- **Editar Conteúdo:** [Instruções detalhadas quando a edição de texto estiver implementada].
- **Assistência da IA para Seção:** [Instruções detalhadas para solicitar ajuda da IA na seção atual].
- **Salvar Alterações:** Clique no botão "Salvar Alterações" (localizado no cabeçalho da área de edição) para persistir seu trabalho. O sistema salva o protocolo como uma nova versão.

## 7. Funcionalidades da Inteligência Artificial (IA)

### 7.1. Pesquisa Médica (DeepResearch)

- **Como Usar:** Ao criar um novo protocolo ou em uma seção específica (dependendo da implementação), pode haver uma opção para "Pesquisar com IA" ou similar. Insira termos chave ou a condição médica.
- **O que Esperar:** A IA buscará em fontes como PubMed, SciELO e diretrizes abertas para extrair:
  - Critérios diagnósticos objetivos.
  - Considerações geriátricas.
  - Informações para embasar as seções do protocolo.
- Os resultados da pesquisa serão apresentados de forma estruturada para auxiliar na criação do conteúdo.

### 7.2. Geração de Conteúdo do Protocolo

- **Geração Completa:** No modo automático, a IA tenta preencher todas as 13 seções.
- **Geração por Seção:** No modo assistido, a IA pode ajudar a gerar ou refinar o conteúdo da seção atualmente selecionada.
- **Foco no Formato:** A IA é instruída a priorizar a estrutura correta e a completude das seções. A precisão clínica deve ser cuidadosamente revisada e ajustada por você.

## 8. Visualizador de Fluxograma

- O painel à direita exibe uma representação visual do fluxo lógico do protocolo.
- **Zoom e Pan:** Use os controles no fluxograma (ou mouse/trackpad) para ampliar e navegar.
- **Consistência:** O fluxograma é gerado com base no conteúdo textual do protocolo. [Detalhes sobre a sincronização texto-fluxograma].
- **Exportação:** Uma opção para exportar o fluxograma em formato vetorial (SVG) de alta qualidade estará disponível.

## 9. Validação do Protocolo

- **Como Usar:** No editor do protocolo, haverá um botão ou seção para "Validar Protocolo".
- **O que é Verificado:**
  - **Estrutura:** Presença e formatação correta das 13 seções.
  - **Completude:** Se todas as seções possuem conteúdo e se critérios objetivos estão definidos.
  - **Consistência Texto-Fluxograma:** Se as decisões e caminhos no texto estão refletidos no fluxograma.
  - **Medicamentos:** Verificação contra a lista de medicamentos CSV (formato, existência).
  - **Critérios Objetivos:** Alertas para termos vagos ou ambíguos.
- **Relatório de Validação:** O painel de validação (abaixo da lista de seções) exibirá os erros e avisos encontrados, permitindo navegação para a issue (quando implementado).

## 10. Exportando Documentos

1.  Com o protocolo finalizado e validado, procure pela opção "Exportar".
2.  **Formatos Disponíveis:**
    - **Word (.docx):** Documento formatado conforme o template ABNT da qualidade.
    - **PDF (.pdf):** Versão em PDF do documento Word.
    - **Fluxograma (SVG):** Imagem vetorial do fluxograma.
3.  Os arquivos serão preparados para download.

**Anexar no Jira:**
Após o download, os arquivos (especialmente o .docx) devem ser anexados manualmente à tarefa correspondente no Jira para o processo de validação clínica pelos chefes de especialidade.

## 11. Troubleshooting Básico / FAQ

- **IA demorando para responder:** Aguarde alguns instantes. Se persistir, tente novamente ou contate o suporte.
- **Erro ao salvar:** Verifique sua conexão com a internet. Tente salvar novamente.
- **Conteúdo da IA parece incorreto:** Lembre-se que a IA foca no formato. Ajustes clínicos são responsabilidade humana. Use as ferramentas de edição para corrigir.

[Outras FAQs serão adicionadas conforme o desenvolvimento]

---

Este guia será atualizado à medida que novas funcionalidades forem adicionadas.
