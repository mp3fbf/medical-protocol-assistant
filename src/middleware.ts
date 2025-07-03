/**
 * Next.js Middleware for Authentication
 *
 * This middleware uses NextAuth to protect routes.
 * It checks if a user is authenticated and redirects them accordingly.
 * - Unauthenticated users trying to access protected routes are sent to /login.
 * - Authenticated users trying to access /login are sent to /dashboard.
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // If trying to access protected routes and not authenticated, redirect to login
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/protocols")) &&
    !token
  ) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname); // Pass original path for redirect after login
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login page but already authenticated, redirect to dashboard
  if (pathname.startsWith("/login") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - CSS files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|svg|templates|data|.*\\.css$).*)",
  ],
};
