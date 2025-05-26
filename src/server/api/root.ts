/**
 * Root tRPC Router
 *
 * This is the main tRPC router for the application.
 * It merges all other sub-routers (e.g., for protocols, users, AI).
 */
import { router, publicProcedure } from "./trpc";
import { protocolRouter } from "./routers/protocol";
import { userRouter } from "./routers/user";

export const appRouter = router({
  protocol: protocolRouter,
  user: userRouter,

  // Example health check endpoint (can be kept or removed)
  healthCheck: publicProcedure.query(({ ctx }) => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      isAuthenticated: !!ctx.session?.user,
    };
  }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;
