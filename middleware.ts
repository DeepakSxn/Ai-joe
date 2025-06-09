import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get("isAuthenticated")
  const isLoginPage = request.nextUrl.pathname === "/login"

  // If user is authenticated and trying to access login page
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/chat", request.url))
  }

  // Check if the request is for the analytics page
  if (request.nextUrl.pathname.startsWith("/analytics")) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === "/analytics/login") {
      return NextResponse.next()
    }

    // Check for analytics auth token
    const analyticsAuth = request.cookies.get("analyticsAuth")
    if (!analyticsAuth) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL("/analytics/login", request.url))
    }
  }

  // Check for normal authentication for chat routes
  if (request.nextUrl.pathname.startsWith("/chat")) {
    if (!isAuthenticated) {
      const response = NextResponse.redirect(new URL("/login", request.url))
      // Add cache control headers to prevent browser caching
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
      response.headers.set("Pragma", "no-cache")
      response.headers.set("Expires", "0")
      return response
    }
  }

  // For protected routes, add cache control headers
  if (!isLoginPage) {
    const response = NextResponse.next()
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/analytics/:path*",
    "/about",
    "/login"
  ],
} 