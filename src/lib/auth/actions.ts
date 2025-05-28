/**
 * Authentication Actions
 *
 * This file contains server-side actions related to authentication,
 * such as validating user credentials.
 */
import { prisma } from "@/lib/db/client";
import type { User } from "@prisma/client";
import * as bcrypt from "bcryptjs"; // Changed to bcryptjs

// --- WARNING: INSECURE PASSWORD HANDLING FOR DEVELOPMENT ONLY ---
// This password should match the one set in the seed script for the dev-mock user.
// In a real application, NEVER store or compare plain-text passwords.
// Implement proper password hashing (e.g., bcryptjs.hashSync) and comparison.
const MOCK_USER_PASSWORD = "password";
const MOCK_USER_EMAIL = "dev-mock@example.com";
// --- END WARNING ---

export async function validateUserCredentials(
  email?: string,
  password?: string,
): Promise<Pick<User, "id" | "email" | "name" | "role"> | null> {
  if (!email || !password) {
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

  // --- PRODUCTION-READY (BUT HASHED PASSWORD NEEDED IN DB) ---
  // In a real app, user.hashedPassword would exist.
  // const isValidPassword = user.hashedPassword ? bcrypt.compareSync(password, user.hashedPassword) : false;
  // ---

  // --- TEMPORARY DEV LOGIC FOR SEEDED USER WITH PLAIN PASSWORD ---
  // This block should be replaced by the production-ready logic above once passwords are hashed.
  let isValidPassword = false;
  if (email === MOCK_USER_EMAIL && password === MOCK_USER_PASSWORD) {
    // This specific check is ONLY for the dev-mock user with a known plain-text password.
    isValidPassword = true;
    console.warn(
      `[AUTH ACTION] User ${email} validated with PLAIN TEXT dev password. THIS IS INSECURE. Role: ${user.role}`,
    );
  } else if (user.password) {
    // If other users have hashed passwords, attempt to compare.
    try {
      isValidPassword = bcrypt.compareSync(password, user.password);
    } catch (e) {
      console.error(
        "[AUTH ACTION] bcrypt.compareSync error (likely malformed hash for user):",
        email,
        e,
      );
      isValidPassword = false;
    }
  } else {
    // If user is not the dev-mock and has no hashed password, fail.
    console.warn(
      `[AUTH ACTION] User ${email} does not have a hashed password set and is not the dev-mock user. Denying login.`,
    );
    isValidPassword = false;
  }
  // --- END TEMPORARY DEV LOGIC ---

  if (isValidPassword) {
    console.log(`[AUTH ACTION] User ${email} validated. Role: ${user.role}`);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  console.log(`[AUTH ACTION] Invalid password for ${email}.`);
  return null;
}
