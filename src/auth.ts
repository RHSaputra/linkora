import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

import { rateLimit, clearRateLimit } from "@/lib/rate-limit"

const clean = (val?: string) => (val ? val.trim().replace(/^["']|["']$/g, "") : undefined)

const googleClientId = clean(process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID)
const googleClientSecret = clean(process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET)

import crypto from "crypto"

const rawAuthSecret = clean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
if (!rawAuthSecret && process.env.NODE_ENV === "production") {
  console.warn("[Security Warning] AUTH_SECRET is not set in environment. Generating ephemeral session secret.")
}
const ephemeralSecret =
  typeof globalThis !== "undefined" && (globalThis as any).__linkora_ephemeral_secret
    ? (globalThis as any).__linkora_ephemeral_secret
    : ((globalThis as any).__linkora_ephemeral_secret = crypto.randomBytes(32).toString("hex"))

const authSecret = rawAuthSecret || ephemeralSecret


const providers: any[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      const email = (credentials.email as string).toLowerCase().trim()
      const password = credentials.password as string

      // Rate limiting: max 5 failed attempts per 15 minutes per email
      const rateLimitKey = `login_fail_${email}`
      const limitCheck = await rateLimit(rateLimitKey, { limit: 5, windowMs: 15 * 60 * 1000 })
      if (!limitCheck.success) {
        console.warn(`[Security Alert] Rate limit exceeded for login attempts on: ${email}`)
        return null
      }

      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.password) {
        return null
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      )

      if (!isPasswordValid) {
        return null
      }

      // Clear failed rate limit on successful authentication
      clearRateLimit(rateLimitKey)

      let safeImage: string | null = null
      if (typeof user.image === "string" && user.image.length > 0) {
        if (user.image.startsWith("data:") || user.image.length >= 300) {
          safeImage = `/api/user/avatar?userId=${user.id}`
        } else {
          safeImage = user.image
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: safeImage,
      }
    }
  })
]


if (googleClientId && googleClientSecret) {
  providers.unshift(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: authSecret,
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        delete token.picture
        if (typeof user.image === "string" && user.image.length > 0) {
          if (user.image.startsWith("data:") || user.image.length >= 300) {
            token.image = `/api/user/avatar?userId=${user.id}`
          } else {
            token.image = user.image
          }
        } else {
          token.image = null
        }
      }
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name
        delete token.picture
        if (session.image !== undefined) {
          if (typeof session.image === "string" && session.image.length > 0) {
            if (session.image.startsWith("data:") || session.image.length >= 300) {
              const uId = (token.id as string) || (token.sub as string) || ""
              token.image = `/api/user/avatar?userId=${uId}&t=${Date.now()}`
            } else {
              token.image = session.image
            }
          } else {
            token.image = null
          }
        }
      }
      // Pastikan token.picture selalu dihapus agar NextAuth tidak menyimpan avatar/base64 besar ke dalam cookie JWT
      delete token.picture
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = ((token.id as string) || (token.sub as string)) || session.user.id
        if (token.name) session.user.name = token.name as string
        if (token.image) {
          session.user.image = token.image as string
        } else {
          session.user.image = null
        }
      }
      return session
    }
  },
  events: {
    async createUser({ user }) {
      if (user.email) {
        try {
          const { sendWelcomeEmail } = await import("@/lib/email/service")
          await sendWelcomeEmail({
            to: user.email,
            name: user.name,
            isGoogleAuth: true,
          })
        } catch (err) {
          console.error("[NextAuth createUser Welcome Email Error]:", err)
        }
      }
    }
  },
})

