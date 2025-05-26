/**
 * Authentication Actions
 *
 * This file contains server-side actions related to authentication,
 * such as validating user credentials.
 */
import { prisma } from "@/lib/db/client";
import type { User } from "@prisma/client"; // Using Prisma's User type

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
  // Simulate database lookup and password validation
  if (!email || !password) {
    return null;
  }

  // IMPORTANT: NEVER log passwords in a real application
  // console.log(`Validating: ${email} / ${password}`);

  // For demonstration, we'll check against a mock user or a seeded user
  // In a real scenario, query Prisma:
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User with email ${email} not found.`);
    return null;
  }

  // IMPORTANT: Implement actual password hashing and comparison here
  // For this placeholder, we assume any password for an existing user is valid.
  // Example using bcrypt (install bcrypt: pnpm add bcrypt @types/bcrypt):
  // import bcrypt from 'bcrypt';
  // const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
  // if (!isValidPassword) {
  //   console.log("Invalid password");
  //   return null;
  // }

  console.log(`User ${email} validated (placeholder validation).`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ...userWithoutPassword } = user; // Omit password for security
  return userWithoutPassword as Omit<User, "password" | "emailVerified">;
}
