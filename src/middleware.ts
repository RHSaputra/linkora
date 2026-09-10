import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that are only accessible when NOT logged in
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]


const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : "linkora_dev_secret_only_local_environment_2026");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets entirely
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

  // Security headers helper
  const addSecurityHeaders = (res: NextResponse) => {
    res.headers.set("X-Frame-Options", "DENY")
    res.headers.set("X-Content-Type-Options", "nosniff")
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    res.headers.set("X-XSS-Protection", "1; mode=block")
    if (process.env.NODE_ENV === "production") {
      res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
    }
    res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    return res
  }

  // Block public access to email-preview in production
  if (pathname.startsWith("/email-preview") || pathname.startsWith("/api/email-preview")) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse(null, { status: 404 })
    }
  }

  // CSRF validation for mutating API requests
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/callback/")) {
    const method = request.method.toUpperCase()
    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      const origin = request.headers.get("origin")
      if (origin) {
        try {
          const originHost = new URL(origin).host
          const requestHost = request.headers.get("host")
          if (requestHost && originHost !== requestHost) {
            return addSecurityHeaders(
              NextResponse.json({ error: "Permintaan lintas domain (CSRF) ditolak" }, { status: 403 })
            )
          }
        } catch {
          return addSecurityHeaders(
            NextResponse.json({ error: "Origin header tidak valid" }, { status: 403 })
          )
        }
      }
    }
  }

  // For API routes: let route handlers check auth themselves, but attach security headers
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }

  // Page routes: check JWT for redirect logic
  let token = null
  try {
    token = await getToken({
      req: request,
      secret: authSecret,
    })
  } catch (_e) {
    token = null
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

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
