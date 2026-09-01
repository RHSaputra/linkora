import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
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

        const safeImage = (typeof user.image === "string" && !user.image.startsWith("data:") && user.image.length < 300)
          ? user.image
          : null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: safeImage,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        delete token.picture
        if (typeof user.image === "string" && !user.image.startsWith("data:") && user.image.length < 300) {
          token.image = user.image
        } else {
          token.image = null
        }
      }
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name
        delete token.picture
        if (session.image !== undefined) {
          if (typeof session.image === "string" && !session.image.startsWith("data:") && session.image.length < 300) {
            token.image = session.image
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
  trustHost: true,
})

