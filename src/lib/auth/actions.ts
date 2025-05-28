/**
 * Authentication Actions
 *
 * This file contains server-side actions related to authentication,
 * such as validating user credentials.
 */
import { prisma } from "@/lib/db/client";
import type { User } from "@prisma/client";
import * as bcryptjs from "bcryptjs"; // Use bcryptjs

// --- WARNING: INSECURE PASSWORD HANDLING FOR DEVELOPMENT ONLY ---
// This password should match the one set in the seed script for the dev-mock user.
// In a real application, NEVER store or compare plain-text passwords.
// Implement proper password hashing (e.g., bcryptjs.hashSync) and comparison.
const MOCK_USER_PASSWORD = "password"; // Ensure this matches the seed script
const MOCK_USER_EMAIL = "dev-mock@example.com";
// --- END WARNING ---

export async function validateUserCredentials(
  email?: string,
  password?: string,
): Promise<Pick<User, "id" | "email" | "name" | "role"> | null> {
  if (!email || !password) {
    console.log("[AUTH ACTION] No credentials provided");
    return null;
  }

  console.log(`[AUTH ACTION] Validating credentials for: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`[AUTH ACTION] User with email ${email} not found.`);
    return null;
  }

  // Check if the user has a hashed password stored
  if (user.hashedPassword) {
    // Compare the provided password with the stored hashed password
    const isValidPassword = bcryptjs.compareSync(password, user.hashedPassword);
    if (isValidPassword) {
      console.log(
        `[AUTH ACTION] User ${email} validated with hashed password. Role: ${user.role}`,
      );
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  } else if (email === MOCK_USER_EMAIL && password === MOCK_USER_PASSWORD) {
    // --- TEMPORARY DEV LOGIC FOR SEEDED USER WITH PLAIN PASSWORD ---
    // This block is a fallback for the specific dev-mock user IF it doesn't have a hashed password.
    // It should be removed once all users, including seeded dev users, have hashed passwords.
    console.warn(
      `[AUTH ACTION] User ${email} validated with PLAIN TEXT dev password. THIS IS INSECURE and for fallback only. Please ensure this user is seeded with a hashed password. Role: ${user.role}`,
    );
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    // --- END TEMPORARY DEV LOGIC ---
  }

  console.log(
    `[AUTH ACTION] Invalid password or no hashed password found for ${email}.`,
  );
  return null;
}
