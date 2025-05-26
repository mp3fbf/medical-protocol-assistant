/**
 * Database Seeding Script
 *
 * This script seeds the database with initial data, such as a default admin user.
 * It should be run manually or as part of a deployment process.
 *
 * To run this seed:
 * 1. Ensure your DATABASE_URL in .env is correctly set up.
 * 2. Run `npx prisma db seed`
 *
 * Note: You need to add a "seed" script to your package.json:
 * "prisma": {
 *   "seed": "tsx src/lib/db/seed.ts"
 * }
 * and install tsx: `pnpm add -D tsx`
 */
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Seed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPasswordPlaceholder = "adminpassword"; // In a real app, handle passwords securely (e.g., hash before storing)

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: adminEmail,
        name: "Admin User",
        role: UserRole.ADMIN,
        updatedAt: new Date(),
        // Note: Password hashing should be implemented in user creation logic, not directly in seed for plaintext.
        // For simplicity in seed, we are not hashing.
        // In a real application, you'd hash the password here or have a more secure setup.
      },
    });
    console.log(`Created admin user: ${adminUser.email}`);
    console.warn(
      `IMPORTANT: The admin user was created with a placeholder mechanism for password. Ensure proper password management in your application.`,
    );
  } else {
    console.log(`Admin user ${adminEmail} already exists.`);
  }

  // TODO: Add more seed data as needed (e.g., example protocols, other users)

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
