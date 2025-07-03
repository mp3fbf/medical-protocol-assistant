/**
 * NextAuth API Route Handler
 *
 * This file sets up the API route handler for NextAuth.
 * It exports GET and POST handlers that delegate to NextAuth,
 * using the configuration defined in `src/lib/auth/config.ts`.
 */
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
