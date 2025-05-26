# Medical Protocol Development Assistant

Ferramenta web para criação assistida por IA de protocolos médicos padronizados, gerando documentação estruturada (Word/ABNT com 13 seções) e fluxogramas visuais complexos para pronto-atendimentos da rede Sancta Maggiore/Prevent Senior.

## Project Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (https://pnpm.io/installation)
- Docker (for local PostgreSQL database)

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
    - `DATABASE_URL`: Your PostgreSQL connection string.
    - `NEXTAUTH_SECRET`: A secret for NextAuth (generate with `openssl rand -base64 32`).
    - `OPENAI_API_KEY`: Your OpenAI API key.
    - (Optionally) `DEEPRESEARCH_API_KEY` and AWS credentials if used.

4.  **Set up local PostgreSQL database (using Docker):**
    If you don't have a PostgreSQL instance, you can run one using Docker:
    ```bash
    docker run --name medical-protocols-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
    ```
    Ensure your `DATABASE_URL` in `.env.local` matches these credentials.
    Example: `DATABASE_URL="postgresql://postgres:password@localhost:5432/medical_protocols"` (you might need to create the `medical_protocols` database manually or let Prisma handle it).

5.  **Initialize Husky git hooks:**
    ```bash
    pnpm husky install
    ```
    This will set up pre-commit hooks for linting and formatting.

### Running the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

-   `pnpm dev`: Starts the development server.
-   `pnpm build`: Builds the application for production.
-   `pnpm start`: Starts the production server.
-   `pnpm lint`: Lints the codebase using ESLint.
-   `pnpm format`: Formats the codebase using Prettier.
-   `pnpm prisma:migrate:dev`: Runs database migrations for development.
-   `pnpm prisma:generate`: Generates Prisma Client.
-   `pnpm prisma:studio`: Opens Prisma Studio to view/edit data.

## Code Standards

-   **Formatting**: Prettier (auto-formatted on commit)
-   **Linting**: ESLint (auto-checked on commit)
-   **TypeScript**: Strict mode, no `any` types.
-   **Naming Conventions**:
    -   Components: `PascalCase`
    -   Functions/hooks: `camelCase`
    -   Constants: `UPPER_SNAKE_CASE`
    -   Files: `kebab-case`

## Project Structure

The project follows a standard Next.js App Router structure. Key directories:
- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: Reusable React components.
- `src/lib/`: Core libraries, utilities, AI clients, validators, generators.
- `src/server/`: Server-side logic, tRPC routers, database schema.
- `src/types/`: Global TypeScript type definitions.
- `prisma/`: Prisma schema and migration files.
- `public/`: Static assets (templates, data files).
- `tests/`: Unit, integration, and E2E tests.
```