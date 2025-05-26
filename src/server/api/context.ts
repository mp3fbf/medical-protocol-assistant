/**
 * tRPC API Context Creation
 *
 * This file defines the context that will be available to all tRPC procedures.
 * It typically includes things like database connections, authentication status, etc.
 */
import { getServerSession } from "next-auth/next";
import type { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { prisma } from "@/lib/db/client";
import { authOptions } from "@/lib/auth/config";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  const session = await getServerSession(authOptions);

  return {
    session,
    db: prisma,
    ...opts, // Include req and resHeaders for fetch adapter
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
