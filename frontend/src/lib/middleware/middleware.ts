// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Optional: restrict roles
  // Example: prevent student from accessing admin pages
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/dashboard/admin") && token) {
    // decode token server-side to check role (optional)
    // redirect if role != admin
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // protect all dashboard routes
};
