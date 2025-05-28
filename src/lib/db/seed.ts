/**
 * Database Seeding Script
 *
 * This script seeds the database with initial data, such as a default admin user
 * and a specific user for development/mock authentication.
 *
 * To run this seed:
 * 1. Ensure your DATABASE_URL in .env is correctly set up.
 * 2. Run `pnpm prisma db seed`
 *
 * Note: You need to add a "seed" script to your package.json:
 * "prisma": {
 *   "seed": "tsx src/lib/db/seed.ts"
 * }
 * and install tsx: `pnpm add -D tsx`
 */
// In seed.ts
import * as bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
const saltRounds = 10; // Or your preferred salt rounds
const DEV_MOCK_USER_PASSWORD_PLAIN = "password";
const hashedPassword = bcrypt.hashSync(
  DEV_MOCK_USER_PASSWORD_PLAIN,
  saltRounds,
);
// ...
// When creating user:
// hashedPassword: hashedPassword, // Store this instead of plain password

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Seed Admin User (general admin)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    // Hash password for admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    adminUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(), // General admin can have a random UUID
        email: adminEmail,
        name: "Admin User",
        password: adminPassword,
        role: UserRole.ADMIN,
        updatedAt: new Date(),
      },
    });
    console.log(
      `Created admin user: ${adminUser.email} with ID: ${adminUser.id}`,
    );
  } else {
    console.log(
      `Admin user ${adminEmail} already exists with ID: ${adminUser.id}.`,
    );
  }

  // Seed Specific Mock User for Development/Testing
  // This user's ID must match the ID used in the mock authorize function in src/lib/auth/providers.ts
  const mockUserId = "mock-user-id-dev123";
  const mockUserEmail = "dev-mock@example.com";

  let developmentMockUser = await prisma.user.findUnique({
    where: { id: mockUserId },
  });

  if (!developmentMockUser) {
    // Check if email is taken by another user before trying to create with this email
    const existingUserWithMockEmail = await prisma.user.findUnique({
      where: { email: mockUserEmail },
    });

    if (
      existingUserWithMockEmail &&
      existingUserWithMockEmail.id !== mockUserId
    ) {
      console.warn(
        `Email ${mockUserEmail} is already in use by user ${existingUserWithMockEmail.id}. Cannot create mock user ${mockUserId} with this email.`,
      );
    } else if (
      existingUserWithMockEmail &&
      existingUserWithMockEmail.id === mockUserId
    ) {
      // This case should ideally be caught by findUnique by ID, but as a safeguard.
      developmentMockUser = existingUserWithMockEmail;
      console.log(
        `Mock user ${mockUserEmail} with ID ${mockUserId} already exists.`,
      );
    } else {
      // WARNING: Using simple password "password" for development only!
      // NEVER use simple passwords in production
      const devPassword = await bcrypt.hash("password", 10);
      developmentMockUser = await prisma.user.create({
        data: {
          id: mockUserId, // Specific ID for mock authentication
          email: mockUserEmail,
          name: "Usuário de Desenvolvimento Mock",
          password: devPassword, // DEV ONLY: Simple password for local development
          role: UserRole.ADMIN, // Ensure this role matches what's used in the mock provider
          updatedAt: new Date(),
        },
      });
      console.log(
        `Created development mock user: ${developmentMockUser.email} with ID: ${developmentMockUser.id}`,
      );
      console.warn(
        `⚠️  DEV ONLY: Mock user created with password "password" - DO NOT use in production!`,
      );
    }
  } else {
    console.log(
      `Development mock user ${developmentMockUser.email} with ID ${mockUserId} already exists.`,
    );
    // Optionally update the role if it changed in mocks
    if (developmentMockUser.role !== UserRole.ADMIN) {
      await prisma.user.update({
        where: { id: mockUserId },
        data: {
          role: UserRole.ADMIN,
          name: "Usuário de Desenvolvimento Mock (Role Updated)",
        },
      });
      console.log(`Updated role for mock user ${mockUserId} to ADMIN.`);
    }

    // Update password if it's null (for existing users after migration)
    if (!developmentMockUser.password) {
      const devPassword = await bcrypt.hash("password", 10);
      await prisma.user.update({
        where: { id: mockUserId },
        data: {
          password: devPassword,
        },
      });
      console.log(`Updated password for existing mock user ${mockUserId}.`);
      console.warn(
        `⚠️  DEV ONLY: Mock user password updated to "password" - DO NOT use in production!`,
      );
    }
  }

  // TODO: Add more seed data as needed (e.g., example protocols)

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
