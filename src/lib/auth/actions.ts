/**
 * Authentication Actions
 *
 * This file contains server-side actions related to authentication,
 * such as validating user credentials.
 * It now exclusively uses hashed passwords.
 */
import { prisma } from "@/lib/db/client";
import type { User } from "@prisma/client";
import * as bcryptjs from "bcryptjs";

export async function validateUserCredentials(
  email?: string,
  password?: string,
): Promise<Pick<User, "id" | "email" | "name" | "role"> | null> {
  if (!email || !password) {
    console.log("[AUTH ACTION] No email or password provided.");
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

  if (!user.hashedPassword) {
    console.warn(
      `[AUTH ACTION] User ${email} does not have a hashed password set. Login denied.`,
    );
    return null;
  }

  const isValidPassword = bcryptjs.compareSync(password, user.hashedPassword);

  if (isValidPassword) {
    console.log(
      `[AUTH ACTION] User ${email} validated successfully with hashed password. Role: ${user.role}`,
    );
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
