import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function testConnection() {
  try {
    console.log("Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Connected to database");

    // Test user table
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible - ${userCount} users found`);

    // Test protocol table
    const protocolCount = await prisma.protocol.count();
    console.log(
      `✅ Protocol table accessible - ${protocolCount} protocols found`,
    );

    // Test with specific query that's failing
    const stats = await prisma.protocol.count({
      where: { status: { not: "ARCHIVED" } },
    });
    console.log(
      `✅ Protocol stats query successful - ${stats} non-archived protocols`,
    );
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
