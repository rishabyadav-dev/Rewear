import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      points: number
      rating: number
      location?: string
      bio?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
    points: number
    rating: number
    location?: string
    bio?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    picture?: string
    points: number
    rating: number
    location?: string
    bio?: string
  }
} 