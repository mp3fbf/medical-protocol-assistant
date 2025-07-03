/**
 * tRPC Router for User-related operations
 */
import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  /**
   * Retrieves the currently authenticated user's session details.
   */
  getSelf: protectedProcedure.query(({ ctx }) => {
    // ctx.session.user is guaranteed to be defined here due to protectedProcedure
    return ctx.session.user;
  }),

  // Future user management endpoints (e.g., for admins) can be added here.
  // listUsers: adminProcedure.input(...).query(...),
  // updateUserRole: adminProcedure.input(...).mutation(...),
});
