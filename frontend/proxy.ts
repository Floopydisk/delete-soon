import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/admin/login", "/api/auth"];

  // Allow requests to the API endpoints and public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check Next-Auth session
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check legacy token
  const legacyAuthToken = request.cookies.get("auth-token")?.value;

  // If protected admin route and not authenticated
  if (pathname.startsWith("/admin") && !session && !legacyAuthToken) {
    const loginUrl = new URL("/admin/login", request.url);
    // Add the intended destination as a query param for redirecting back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all admin routes
    "/admin/:path*",
    // Don't match API routes that are handled by their own auth
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
