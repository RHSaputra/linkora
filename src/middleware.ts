import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that are only accessible when NOT logged in
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

// Routes that are public
const publicRoutes = ["/", "/email-preview"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware entirely for auth API routes, email preview API, and static files
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/email-preview") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Security headers helper
  const addSecurityHeaders = (res: NextResponse) => {
    res.headers.set("X-Frame-Options", "DENY")
    res.headers.set("X-Content-Type-Options", "nosniff")
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    res.headers.set("X-XSS-Protection", "1; mode=block")
    return res
  }

  // For API routes: let route handlers check auth themselves
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }

  // Page routes: check JWT for redirect logic
  let token = null
  try {
    token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    })
  } catch (_e) {
    token = null
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // If logged in, redirect away from login/register to dashboard
  if (isAuthRoute && token) {
    const res = NextResponse.redirect(new URL("/dashboard", request.url))
    return addSecurityHeaders(res)
  }

  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|ico)$).*)"
  ],
}
