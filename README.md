# Medical Protocol Development Assistant

Ferramenta web para criação assistida por IA de protocolos médicos padronizados, gerando documentação estruturada (Word/ABNT com 13 seções) e fluxogramas visuais complexos para pronto-atendimentos da rede Sancta Maggiore/Prevent Senior.

## Project Setup

### Prerequisites

- Node.js (v20 or higher recommended)
- pnpm (https://pnpm.io/installation)
- Docker & Docker Compose (for local PostgreSQL database and running the app locally in a container)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd medical-protocol-assistant
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Copy the `.env.example` file to `.env.local` and update the values accordingly.

    ```bash
    cp .env.example .env.local
    ```

    You will need to provide:

    - `DATABASE_URL`: Your PostgreSQL connection string (Supabase or local Docker).
    - `NEXTAUTH_SECRET`: A secret for NextAuth (generate with `openssl rand -base64 32`).
    - `NEXTAUTH_URL`: **CRITICAL** - Must be set to `http://localhost:3000` for local development. This prevents "Invalid URL" errors during authentication.
    - `OPENAI_API_KEY`: Your OpenAI API key.
    - `OPENAI_ORG_ID` (Optional): Your OpenAI Organization ID.
    - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: If using Supabase for DB/Storage.
    - `SUPABASE_STORAGE_BUCKET_NAME`: e.g., `protocol-documents`.

    **Important Note about NEXTAUTH_URL:**

    - This variable is **required** for NextAuth to function properly in server-side contexts.
    - For local development: Always use `NEXTAUTH_URL="http://localhost:3000"`
    - If you see "Invalid URL" errors in the console, verify this variable is set correctly.
    - The app includes debug logging that will show the current value in server logs.

4.  **Initialize Husky git hooks:**
    ```bash
    pnpm husky install
    ```

## Running Locally

### Option 1: Using Docker Compose (Recommended for full stack)

This method runs the Next.js app and a PostgreSQL database in Docker containers.

1.  Ensure Docker and Docker Compose are installed and running.
2.  Make sure your `.env.local` file is populated, especially `DATABASE_URL` pointing to the Docker DB if you use that:
    `DATABASE_URL="postgresql://postgres:password@db:5432/medical_protocols"` (Note: `db` is the service name in `docker-compose.yml`, and port is `5432` _inside_ Docker network).
3.  Run:
    ```bash
    docker-compose up --build
    ```
    The application will be available at `http://localhost:3000`. The database will be on host port `54322` (or as configured in `docker-compose.yml`).

### Option 2: Running Next.js dev server directly

This method requires a separate PostgreSQL database instance (either local or remote, like Supabase).

1.  Ensure your `.env.local` has `DATABASE_URL` pointing to your accessible PostgreSQL instance.
2.  Run database migrations:
    ```bash
    pnpm prisma:migrate:dev
    ```
3.  Run the development server:
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:3000`.

## Available Scripts

- `pnpm dev`: Starts the Next.js development server.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the Next.js production server (after building).
- `pnpm lint`: Lints the codebase.
- `pnpm format`: Formats the codebase.
- `pnpm test`: Runs Vitest unit/integration tests.
- `pnpm test:coverage`: Runs Vitest tests with coverage.
- `pnpm test:e2e`: Runs Playwright E2E tests.
- `pnpm prisma:migrate:dev`: Runs database migrations (development).
- `pnpm prisma:generate`: Generates Prisma Client.
- `pnpm prisma:studio`: Opens Prisma Studio.
- `pnpm prisma:seed`: Seeds the database.

## Deployment to Vercel

This project is configured for easy deployment to [Vercel](https://vercel.com).

### Initial Setup on Vercel:

1.  **Create a Vercel Account**: If you don't have one, sign up at [vercel.com](https://vercel.com).
2.  **New Project**:
    - On your Vercel dashboard, click "Add New..." -> "Project".
    - Import your Git repository (e.g., from GitHub).
3.  **Configure Project**:
    - Vercel should auto-detect it as a Next.js project.
    - **Framework Preset**: Should be "Next.js".
    - **Build and Output Settings**:
      - The `vercel.json` file provides some defaults. Vercel typically uses `pnpm build` (or `next build`). Our `vercel.json` specifies `pnpm prisma generate && pnpm build`.
      - Output Directory: Should be `.next`.
    - **Install Command**: `pnpm install` (or Vercel might auto-detect pnpm if `pnpm-lock.yaml` is present). Our `vercel.json` sets this.
    - **Environment Variables**: This is crucial. Go to your Vercel project's "Settings" -> "Environment Variables". Add all the necessary variables from your `.env.local` (like `DATABASE_URL` for your Supabase DB, `NEXTAUTH_SECRET`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET_NAME`, etc.).
      - For `NEXTAUTH_URL`, Vercel automatically provides a production URL, but you can set it to your custom domain if you add one later.
4.  **Deploy**: Click "Deploy".

### Automated Deployments with GitHub Actions:

The `.github/workflows/deploy-vercel.yml` workflow handles automated deployments:

- Pushes to `main` branch deploy to **Production**.
- Pushes to `develop` branch deploy to **Preview**.
- Pull requests targeting `main` or `develop` will also get preview deployments and comments.

**To enable this GitHub Actions workflow for Vercel:**

1.  **Install Vercel CLI** (globally or as a dev dependency, though the workflow installs it too):
    ```bash
    pnpm add -g vercel
    # or for local use only in project: pnpm add --save-dev vercel
    ```
2.  **Login to Vercel CLI** (locally, one time):
    ```bash
    vercel login
    ```
3.  **Link your local project to Vercel project** (locally, one time, in the project root):
    ```bash
    vercel link
    ```
    This will create a `.vercel` directory (which should be in your `.gitignore`).
4.  **GitHub Secrets for Vercel Workflow**:
    Go to your GitHub repository "Settings" -> "Secrets and variables" -> "Actions" and add the following secrets:
    - `VERCEL_TOKEN`: Your Vercel Access Token. You can create one from your Vercel account settings -> Tokens.
    - `VERCEL_ORG_ID`: Your Vercel organization ID (from Vercel dashboard URL or project settings).
    - `VERCEL_PROJECT_ID`: The ID of your project on Vercel (from `.vercel/project.json` after linking, or Vercel dashboard).

Once these are set up, the GitHub Action workflow should handle deployments automatically.

## Code Standards & Project Structure

(Refer to previous sections of README)
