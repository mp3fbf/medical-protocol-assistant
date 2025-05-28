/**
 * NextAuth Authentication Providers
 *
 * This file configures the authentication providers used by NextAuth.
 * Currently, it sets up a Credentials provider for email/password login.
 */
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUserCredentials } from "./actions";
import type { Provider } from "next-auth/providers/index";
// import type { UserRole as _UserRole } from "@prisma/client"; // Marked as unused

export const providers: Provider[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "seuemail@example.com",
      },
      password: { label: "Senha", type: "password" },
    },
    async authorize(credentials, _req) {
      // _req marked as unused
      console.log(
        "[AUTH DEBUG] `authorize` function in CredentialsProvider called.",
      );
      console.log("[AUTH DEBUG] Received credentials:", credentials);

      if (!credentials?.email || !credentials?.password) {
        console.log("[AUTH DEBUG] Authorize: No credentials provided");
        return null;
      }

      const user = await validateUserCredentials(
        credentials.email,
        credentials.password,
      );

      if (user) {
        console.log(
          "[AUTH DEBUG] Authorize: User validated",
          user.email,
          user.role,
        );
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
      console.log(
        "[AUTH DEBUG] Authorize: Invalid credentials for",
        credentials.email,
      );
      return null;
    },
  }),
];
