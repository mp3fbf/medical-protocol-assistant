# Dockerfile for Medical Protocol Assistant

# ---- Base Stage ----
# Use a specific Node.js version for consistency
FROM node:20-alpine AS base
LABEL authors="AI Implementation Agent"

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# ---- Dependencies Stage ----
FROM base AS deps
# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile --prod=false

# ---- Prisma Generate Stage (if needed separately, otherwise part of build) ----
# This stage ensures Prisma Client is generated before building the app.
# If your `pnpm build` script already handles `prisma generate`, this might be redundant
# but it's safer to have it explicit.
FROM deps AS prisma_generate
COPY . .
# Ensure Prisma Client is generated
# RUN pnpm prisma generate # Usually part of 'pnpm build' or 'postinstall' in package.json

# ---- Builder Stage ----
FROM deps AS builder
# Copy the rest of the application code
COPY . .
# Generate Prisma client (if not done in a separate stage or by build script)
# RUN pnpm prisma generate # Ensure this is run before build if needed
# Build the Next.js application
RUN pnpm build

# ---- Runner Stage ----
FROM base AS runner
# Set environment to production
ENV NODE_ENV production

# Copy built artifacts from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js # or .mjs
# If you have a standalone server file (e.g. server.js for custom server):
# COPY --from=builder /app/server.js ./server.js

# Install production dependencies only
# If your `pnpm build` or Vercel handles this, you might not need this pnpm install here.
# For a typical Vercel deployment, Vercel handles node_modules.
# This is more for if you run this Docker image directly on another platform.
# For Vercel, the .next/standalone output is often used.
# For simplicity with a generic Docker setup, we'll copy over all node_modules from 'deps'
# which includes devDependencies if not pruned. A more optimized approach might use `pnpm deploy`.
COPY --from=deps /app/node_modules ./node_modules


# Expose the port Next.js runs on
EXPOSE 3000

# Command to run the Next.js application
# This uses the start script defined in your package.json
CMD ["pnpm", "start"]