import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

interface LoginCredentials {
  email: string
  password: string
}

function validateLoginCredentials(credentials: any): credentials is LoginCredentials {
  return (
    typeof credentials === 'object' &&
    credentials !== null &&
    typeof credentials.email === 'string' &&
    credentials.email.includes('@') &&
    typeof credentials.password === 'string' &&
    credentials.password.length >= 6
  )
}

// Simple hash function for development (use proper bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page on errors
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!validateLoginCredentials(credentials)) {
          return null
        }

        const { email, password } = credentials

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          return null
        }

        // For now, we'll assume users created via OAuth don't have passwords
        // In a real app, you'd want to handle this differently
        if (!user.password) {
          return null
        }

        const isPasswordValid = await comparePassword(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar || user.image || undefined,
          points: user.points,
          rating: user.rating,
          location: user.location || undefined,
          bio: user.bio || undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        // Fetch user data from database to get points
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { points: true, rating: true, location: true, bio: true }
        })
        if (dbUser) {
          token.points = dbUser.points
          token.rating = dbUser.rating
          token.location = dbUser.location
          token.bio = dbUser.bio
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        session.user.points = token.points as number
        session.user.rating = token.rating as number
        session.user.location = token.location as string
        session.user.bio = token.bio as string
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Set default values for new users
      await prisma.user.update({
        where: { id: user.id },
        data: {
          rating: 4.5,
          points: 100, // Give new users some starting points
          isActive: true,
        },
      })
    },
  },
}) 