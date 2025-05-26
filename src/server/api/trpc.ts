/**
 * tRPC API Server Configuration
 *
 * This is the core of your tRPC setup on the server.
 * It initializes tRPC, defines reusable procedure helpers (public and protected),
 * and sets up context creation.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import superjson from "superjson"; // For handling Date, Map, Set, etc. in API responses

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  /**
   * Transformer.
   * You can use Zod for parsing schemas elsewhere, but SuperJSON is good for E2E type safety.
   */
  transformer: superjson,
  /**
   * Error formatter.
   *
   * @see https://trpc.io/docs/error-formatting
   */
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Create a server-side caller
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Export reusable router and procedure helpers
 *
 * Merge Routers
 * @see https://trpc.io/docs/merging-routers
 *
 * Create an unprotected procedure
 * @see https://trpc.io/docs/v10/procedures
 **/
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware for checking if the user is authenticated.
 *
 * Reusable middleware to ensure
 * users are logged in to access specific procedures
 *
 * @see https://trpc.io/docs/v10/middlewares
 */
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
      db: ctx.db,
    },
  });
});

/**
 * Protected (authenticated user) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/v10/procedures
 */
export const protectedProcedure = t.procedure.use(isAuthenticated);
