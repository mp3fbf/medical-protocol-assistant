# Guia de Deployment e Manutenção: Medical Protocol Assistant

Este documento fornece um guia para desenvolvedores e administradores sobre como implantar, configurar e manter a aplicação Medical Protocol Assistant.

## 1. Visão Geral da Arquitetura de Deployment

- **Frontend & API (Next.js):** Recomendado para deploy na **Vercel**.
- **Banco de Dados (PostgreSQL):** Recomendado utilizar um serviço gerenciado como **Supabase DB** ou AWS RDS.
- **Armazenamento de Arquivos (Documentos Gerados):** **Supabase Storage**.
- **Serviços de IA:** OpenAI API (requer chave).
- **(Opcional) DeepResearch API:** Se utilizado para pesquisa médica (requer chave).

## 2. Deployment na Vercel (Recomendado para Next.js)

A Vercel oferece uma integração otimizada para projetos Next.js, com CI/CD automático a partir do GitHub.

### 2.1. Configuração Inicial do Projeto Vercel

1.  **Conta Vercel:** Crie ou acesse sua conta em [vercel.com](https://vercel.com).
2.  **Novo Projeto:**
    - Clique em "Add New..." -> "Project".
    - Importe o repositório GitHub `medical-protocol-assistant`.
3.  **Configurações do Projeto:**
    - **Framework Preset:** Vercel deve detectar "Next.js".
    - **Build & Development Settings:**
      - **Install Command:** Verifique se está `pnpm install` (ou defina via Override). O arquivo `vercel.json` no repositório já especifica `pnpm install`.
      - **Build Command:** Verifique se está `pnpm prisma generate && pnpm build` (ou defina via Override). O `vercel.json` especifica isso.
      - **Output Directory:** `.next` (padrão para Next.js).
      - **Node.js Version:** Selecione `20.x` (ou a versão LTS mais recente compatível com o projeto).
    - **Root Directory:** Deixe em branco (se o projeto estiver na raiz do repositório).
4.  **Environment Variables (CRÍTICO):**
    - Vá para "Settings" -> "Environment Variables" no seu projeto Vercel.
    - Adicione todas as variáveis de ambiente necessárias (copiadas do seu `.env.local`, mas com valores de produção/preview):
      - `DATABASE_URL` (para seu Supabase DB ou outro PostgreSQL de produção/staging)
      - `NEXTAUTH_URL` (para produção, será seu domínio principal, ex: `https://meuprotocolo.vercel.app` ou `https://meusprotocolos.com`. Para previews, Vercel define automaticamente ou pode ser `https://${VERCEL_URL}`)
      - `NEXTAUTH_SECRET` (um segredo forte gerado com `openssl rand -base64 32`)
      - `OPENAI_API_KEY`
      - `OPENAI_ORG_ID` (opcional)
      - `SUPABASE_URL`
      - `SUPABASE_SERVICE_ROLE_KEY` (manter secreto!)
      - `SUPABASE_STORAGE_BUCKET_NAME` (ex: `protocol-documents`)
      - `LOG_LEVEL` (ex: `info` para produção)
    - Configure para os ambientes corretos (Production, Preview, Development).
5.  **Deploy:** Clique em "Deploy". Vercel irá buildar e implantar a partir do seu branch de produção (geralmente `main`).

### 2.2. CI/CD com GitHub Actions e Vercel

- O workflow `.github/workflows/deploy-vercel.yml` no repositório é configurado para rodar testes e linting.
- A Vercel, através da sua integração Git nativa, detectará pushes para os branches configurados (ex: `main` para produção, `develop` para preview) e iniciará o processo de build e deploy automaticamente.

## 3. Configuração do Ambiente de Desenvolvimento Local

Consulte a seção "Running Locally" no `README.md` principal para instruções detalhadas sobre como usar Docker Compose ou rodar o servidor de desenvolvimento Next.js diretamente.

**Pontos Chave para Local Dev:**

- Use o arquivo `.env.local` para suas variáveis de ambiente locais.
- Para o banco de dados com Docker Compose, `DATABASE_URL` pode ser `postgresql://postgres:password@db:5432/medical_protocols`.
- Para `NEXTAUTH_URL` localmente, use `http://localhost:3000`.

## 4. Gerenciamento do Banco de Dados (Prisma)

### 4.1. Migrations

- **Desenvolvimento Local:**
  ```bash
  pnpm prisma migrate dev --name sua-migration-name
  ```
- **Aplicando Migrations em Staging/Produção (Supabase/DB Gerenciado):**
  - Geralmente, as migrations são geradas localmente e então aplicadas ao banco de dados de staging/produção.
  - Comando: `pnpm prisma migrate deploy`
  - **Como rodar em produção:**
    - **Supabase:** Você pode usar o editor SQL do Supabase para aplicar as DDL geradas ou conectar uma ferramenta de migração ao seu banco Supabase.
    - **Vercel Build:** Se o seu `DATABASE_URL` em produção permitir acesso para DDL (o que é raro e não recomendado para o usuário do banco de dados da aplicação), teoricamente o `buildCommand` poderia incluir `migrate deploy`. **É mais seguro e comum aplicar migrações como um passo separado e controlado.**
    - **Recomendação:** Para Supabase, execute as migrações manualmente através do dashboard SQL ou usando o Supabase CLI em um ambiente seguro.

### 4.2. Geração do Prisma Client

- O Prisma Client é gerado automaticamente durante o `postinstall` (via `package.json`) e também no `buildCommand` em `vercel.json`. Isso garante que ele esteja atualizado tanto localmente quanto no ambiente de build da Vercel.
  ```bash
  pnpm prisma generate
  ```

## 5. Serviços Externos e Chaves de API

- **OpenAI API:** Requer uma `OPENAI_API_KEY`. Gerencie esta chave como um segredo.
- **Supabase:** Requer `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. A `SERVICE_ROLE_KEY` é altamente sensível e deve ser tratada como tal.
- **(Opcional) DeepResearch API:** Se integrado, requer sua própria chave.

Certifique-se de que estas chaves estão configuradas como Environment Variables no seu ambiente Vercel e **NÃO** comitadas no código.

## 6. Manutenção e Atualizações

- **Atualização de Dependências:**
  - Use `pnpm up -i -L` para atualizar dependências interativamente.
  - Dependabot está configurado (em `.github/dependabot.yml`) para sugerir atualizações de dependências (exceto Prisma, que é atualizado manualmente).
- **Monitoramento:**
  - **Vercel:** Utilize o dashboard da Vercel para monitorar deployments, logs da aplicação, funções serverless e analytics.
  - **Supabase:** Utilize o dashboard do Supabase para monitorar o uso do banco de dados e storage.
- **Backups:**
  - **Supabase:** Fornece backups automáticos para o banco de dados. Consulte a documentação do Supabase para detalhes e políticas de retenção.
  - **Supabase Storage:** Considere políticas de versionamento ou backup para arquivos críticos, se necessário.

## 7. Troubleshooting Comum em Deployments

- **Build Falha na Vercel:**
  - Verifique os logs de build na Vercel detalhadamente.
  - Certifique-se que todas as Environment Variables estão corretas.
  - Verifique se `pnpm prisma generate` está rodando antes de `pnpm build`.
  - Confirme a versão do Node.js nas configurações da Vercel.
- **Erros de `NEXTAUTH_URL`:** Garanta que `NEXTAUTH_URL` está corretamente configurado em todos os ambientes da Vercel para o URL público daquele ambiente.
- **Erros de Prisma Client:** "PrismaClientInitializationError" ou similar geralmente indica problemas de conexão com o banco (`DATABASE_URL`) ou que o Prisma Client não foi gerado corretamente para o ambiente (`pnpm prisma generate`).
- **Erros de Permissão (Supabase):** Verifique se as Row Level Security (RLS) policies no Supabase estão configuradas corretamente se você estiver acessando dados do lado do cliente ou com chaves diferentes da `service_role_key`.

Este guia deve ser atualizado conforme a aplicação evolui.
