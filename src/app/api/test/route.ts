import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  try {
    // Test environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Test database connection
    let dbStatus = "not tested";
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (error) {
      dbStatus = `error: ${error instanceof Error ? error.message : "unknown"}`;
    }

    return NextResponse.json({
      status: "ok",
      env: envCheck,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
