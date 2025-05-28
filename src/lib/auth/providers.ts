/**
 * NextAuth Authentication Providers
 *
 * This file configures the authentication providers used by NextAuth.
 * Currently, it sets up a Credentials provider for email/password login.
 */
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUserCredentials } from "./actions";
import type { Provider } from "next-auth/providers/index";
import type { UserRole } from "@prisma/client"; // Or your defined UserRole type

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
    async authorize(credentials, req) {
      // Added req for more context if needed
      console.log(
        "[AUTH DEBUG] `authorize` function in CredentialsProvider called.",
      );
      console.log("[AUTH DEBUG] Received credentials:", credentials);

      // Validate credentials
      if (!credentials?.email || !credentials?.password) {
        console.log("[AUTH] No credentials provided");
        return null;
      }

      const user = await validateUserCredentials(
        credentials.email,
        credentials.password,
      );

      if (user) {
        console.log("[AUTH] User validated", user.email, user.role);
        // Return the user object that will be encoded in the JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Ensure role is part of the returned object
        };
      }
      console.log("[AUTH] Invalid credentials for", credentials.email);
      // If you return null then an error will be displayed advising the user to check their details.
      return null;
    },
  }),
  // Add other providers here if needed (e.g., Google, GitHub)
];
