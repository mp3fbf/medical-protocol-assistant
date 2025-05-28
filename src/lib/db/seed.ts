/**

Database Seeding Script
This script seeds the database with initial data, such as a default admin user
and a specific user for development/mock authentication.
Passwords for seeded users will be hashed.
*/
import { PrismaClient, UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import * as bcryptjs from "bcryptjs"; // Use bcryptjs
const prisma = new PrismaClient();
const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt

async function main() {
  console.log("Start seeding ...");

  // --- Seed Admin User (general admin) ---
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPlainPassword = "adminSecurePassword123"; // Choose a strong password
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const adminHashedPassword = bcryptjs.hashSync(
    adminPlainPassword,
    SALT_ROUNDS,
  );

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: adminEmail,
        name: "Admin User",
        role: UserRole.ADMIN,
        hashedPassword: adminHashedPassword, // Store hashed password
        updatedAt: new Date(),
      },
    });
    console.log(
      `Created admin user: ${adminUser.email} with ID: ${adminUser.id} (Password HASHED)`,
    );
  } else {
    // Optionally update existing admin's password if it's not set or needs updating
    if (
      !adminUser.hashedPassword ||
      !bcryptjs.compareSync(adminPlainPassword, adminUser.hashedPassword)
    ) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { hashedPassword: adminHashedPassword },
      });
      console.log(`Updated hashed password for admin user: ${adminUser.email}`);
    } else {
      console.log(
        `Admin user ${adminEmail} already exists with a valid hashed password.`,
      );
    }
  }

  // --- Seed Specific Mock User for Development/Testing ---
  const mockUserId = "mock-user-id-dev123";
  const mockUserEmail = "dev-mock@example.com";
  const mockUserPlainPassword = "password"; // The password you want to use for this dev user

  let developmentMockUser = await prisma.user.findUnique({
    where: { id: mockUserId },
  });

  const mockUserHashedPassword = bcryptjs.hashSync(
    mockUserPlainPassword,
    SALT_ROUNDS,
  );

  if (!developmentMockUser) {
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
    } else {
      developmentMockUser = await prisma.user.create({
        data: {
          id: mockUserId,
          email: mockUserEmail,
          name: "Usuário de Desenvolvimento",
          role: UserRole.ADMIN, // Or CREATOR, as appropriate for testing
          hashedPassword: mockUserHashedPassword, // Store HASHED password
          updatedAt: new Date(),
        },
      });
      console.log(
        `Created development mock user: ${developmentMockUser.email} with ID: ${developmentMockUser.id}. Password set (HASHED).`,
      );
    }
  } else {
    // Update existing mock user to ensure it has the correct hashed password and role
    let updateData: {
      hashedPassword?: string;
      role?: UserRole;
      name?: string;
    } = {};
    if (
      !developmentMockUser.hashedPassword ||
      !bcryptjs.compareSync(
        mockUserPlainPassword,
        developmentMockUser.hashedPassword,
      )
    ) {
      updateData.hashedPassword = mockUserHashedPassword;
      updateData.name = "Usuário de Desenvolvimento (Pwd Updated)";
    }
    if (developmentMockUser.role !== UserRole.ADMIN) {
      updateData.role = UserRole.ADMIN;
      updateData.name =
        updateData.name || "Usuário de Desenvolvimento (Role Updated)";
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: mockUserId },
        data: updateData,
      });
      console.log(
        `Updated development mock user: ${developmentMockUser.email}. Password/Role potentially updated (HASHED).`,
      );
    } else {
      console.log(
        `Development mock user ${developmentMockUser.email} with ID ${mockUserId} already exists with a valid hashed password and role.`,
      );
    }
  }

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
