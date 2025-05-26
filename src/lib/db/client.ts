/**
 * Prisma Client Configuration
 *
 * This module configures and exports a singleton instance of the Prisma Client.
 * It ensures that in development, a new Prisma Client is not created on every hot reload,
 * which could exhaust database connections. In production, it creates a single client instance.
 */
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
