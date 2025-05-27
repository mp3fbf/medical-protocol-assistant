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
      // console.log("[AUTH DEBUG] Full request object (headers might be useful):", req.headers);

      // --- TEMPORARY MOCK FOR DEVELOPMENT NAVIGATION ---
      console.warn(
        "************************************************************************************",
      );
      console.warn(
        "** WARNING: Using MOCK USER for authentication in src/lib/auth/providers.ts! **",
      );
      console.warn(
        "** This is for development navigation ONLY. REMOVE for production/real login. **",
      );
      console.warn(
        "************************************************************************************",
      );

      const mockUser = {
        id: "mock-user-id-dev123", // This ID must match a user in your database (e.g., from seed)
        email: "dev-mock@example.com", // Using a fixed email for the mock user for clarity with seed
        name: "Usuário de Desenvolvimento Mock",
        role: "ADMIN" as UserRole, // Ensure this role exists in your UserRole enum
      };
      console.log(
        "[AUTH DEBUG] Returning mock user from `authorize`:",
        mockUser,
      );
      return mockUser;
      // --- END TEMPORARY MOCK ---

      /*
      // Original logic (to be restored and completed later):
      if (!credentials?.email || !credentials?.password) {
        console.log("Authorize: No credentials provided");
        return null;
      }

      const user = await validateUserCredentials(
        credentials.email,
        credentials.password,
      );

      if (user) {
        console.log("Authorize: User validated", user.email, user.role);
        // Return the user object that will be encoded in the JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Ensure role is part of the returned object
        };
      }
      console.log("Authorize: Invalid credentials for", credentials.email);
      // If you return null then an error will be displayed advising the user to check their details.
      return null;
      */
    },
  }),
  // Add other providers here if needed (e.g., Google, GitHub)
];
