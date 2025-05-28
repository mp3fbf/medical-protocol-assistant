/**
 * Authentication Actions
 *
 * This file contains server-side actions related to authentication,
 * such as validating user credentials.
 */
import { prisma } from "@/lib/db/client";
import type { User } from "@prisma/client"; // Using Prisma's User type
import * as bcrypt from "bcrypt";

// This is a placeholder. In a real application, you would:
// 1. Receive email and password.
// 2. Query the database for the user by email.
// 3. If user exists, compare the provided password with the stored hashed password.
// 4. Return the user object if credentials are valid, otherwise null.
// Ensure to handle password hashing and comparison securely (e.g., using bcrypt).

export async function validateUserCredentials(
  email?: string,
  password?: string,
): Promise<Omit<User, "password" | "emailVerified"> | null> {
  // Validate input
  if (!email || !password) {
    console.log("[AUTH] Missing email or password");
    return null;
  }

  try {
    // Query the database for the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`[AUTH] User with email ${email} not found.`);
      return null;
    }

    // Check if user has a password (might be null for users created before password field was added)
    if (!user.password) {
      console.log(`[AUTH] User ${email} has no password set.`);
      return null;
    }

    // Compare the provided password with the stored hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log(`[AUTH] Invalid password for user ${email}`);
      return null;
    }

    console.log(`[AUTH] User ${email} validated successfully.`);

    // Return user without sensitive fields
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, "password" | "emailVerified">;
  } catch (error) {
    console.error("[AUTH] Error validating credentials:", error);
    return null;
  }
}
