/**
 * NextAuth Configuration Options
 *
 * This file defines the configuration for NextAuth, including providers,
 * session strategy, callbacks, and custom pages.
 */
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import { providers } from "./providers"; // Import configured providers

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt", // Using JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret used to sign JWTs
  pages: {
    signIn: "/login", // Custom login page
    error: "/auth/error", // Custom error page (e.g., for authentication errors)
    // signOut: '/auth/signout', // Custom signout page (optional)
    // verifyRequest: '/auth/verify-request', // (used for email/passwordless login)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave a comment if not yet implemented)
  },
  callbacks: {
    /**
     * The JWT callback is called when a new JWT is created or updated.
     * It's used to persist custom data (like role and id) in the token.
     */
    async jwt({ token, user, account: _account, profile: _profile }) {
      // Underscored unused params
      // Persist the user's id and role to the token right after signin
      if (user) {
        token.id = user.id;
        token.role = (user as NextAuthUser & { role: string }).role; // Cast to include custom role
      }
      // Add access_token to the token right after signin
      // if (_account?.access_token) {
      //   token.accessToken = _account.access_token
      // }
      return token;
    },
    /**
     * The session callback is called when a new session is created or updated.
     * It's used to pass custom data from the token to the client-side session object.
     */
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (token.id && token.role && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any; // Adjust type as per your UserRole enum
      }
      // if (token.accessToken) {
      //   session.accessToken = token.accessToken as string;
      // }
      return session;
    },
  },
  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
};
