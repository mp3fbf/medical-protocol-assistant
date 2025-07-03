import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";

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

    // Test auth session
    let sessionStatus = "not tested";
    let sessionError = null;
    try {
      const session = await getServerSession(authOptions);
      sessionStatus = session ? "authenticated" : "no session";
    } catch (error) {
      sessionStatus = "error";
      sessionError = error instanceof Error ? error.message : "unknown error";
    }

    return NextResponse.json({
      status: "ok",
      env: envCheck,
      database: dbStatus,
      session: {
        status: sessionStatus,
        error: sessionError,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
