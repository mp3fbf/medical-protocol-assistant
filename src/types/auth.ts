import type { DefaultSession, User as NextAuthUser } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
    accessToken?: string; // If using JWT strategy with access tokens
  }

  interface User extends NextAuthUser {
    role: UserRole;
    // Add other custom properties for the User object from your database
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends NextAuthJWT {
    id: string;
    role: UserRole;
    accessToken?: string;
    // Add other custom properties for the JWT token
  }
}
